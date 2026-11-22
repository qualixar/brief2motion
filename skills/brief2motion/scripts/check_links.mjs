#!/usr/bin/env node
// check_links.mjs: is every link in a reference page still alive?
//   node check_links.mjs <file.md ...> [--json]
// Fetches each distinct http(s) link with a browser user agent, follows redirects, and sorts the answer into
//   ok         a 2xx page (the final address is shown when it moved)
//   challenge  403 or 429: a bot check that stops scripts but not people. Open it in a browser to be sure.
//   dead       404, 410, other 4xx/5xx, a timeout or a connection error: drop the link or replace it
// Exit 0 when nothing is dead, 1 when something is, 2 when the tool itself cannot run. Needs the network.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// Pure, unit-tested: every distinct http(s) address in markdown, in order. Handles one level of brackets in a
// path (gsap.matchMedia()/) and bare <https://...> links; drops trailing punctuation.
export function extractLinks(markdown) {
  const found = [];
  for (const m of markdown.matchAll(/\]\((https?:\/\/[^\s()]*(?:\([^\s()]*\)[^\s()]*)*)\)/g)) found.push(m[1]);
  for (const m of markdown.matchAll(/<(https?:\/\/[^\s>]+)>/g)) found.push(m[1]);
  for (const m of markdown.matchAll(/(?<![(<\w])(https?:\/\/[^\s()<>`|]+)/g)) found.push(m[1].replace(/[.,;:]+$/, ''));
  return [...new Set(found)];
}
// Pure, unit-tested: how an HTTP status counts.
export const classify = (status) => (status >= 200 && status < 300 ? 'ok' : status === 403 || status === 429 ? 'challenge' : 'dead');

async function probe(url, tries = 2) {
  let last = { url, status: 0, final: url, error: 'no attempt' };
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(25000), headers: { 'user-agent': UA, accept: 'text/html,*/*' } });
      await res.body?.cancel();
      last = { url, status: res.status, final: res.url, error: null };
      if (res.status < 500 && res.status !== 429) break;
    } catch (e) { last = { url, status: 0, final: url, error: String(e.cause?.code || e.message || e) }; }
  }
  return { ...last, verdict: last.error ? 'dead' : classify(last.status) };
}

export async function checkAll(urls, concurrency = 8) {
  const out = []; const queue = [...urls];
  await Promise.all(Array.from({ length: concurrency }, async () => { while (queue.length) out.push(await probe(queue.shift())); }));
  return urls.map((u) => out.find((o) => o.url === u));
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), files = args.filter((a) => !a.startsWith('--'));
  if (!files.length || args.includes('--help') || args.includes('-h')) { console.log('usage: node check_links.mjs <file.md ...> [--json]\n  Fetches every link in the files and reports ok, challenge (bot check) and dead.'); process.exit(args.includes('--help') || args.includes('-h') ? 0 : 2); }
  let text = '';
  try { text = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n'); } catch (e) { console.error(`check_links.mjs: ${e.message}`); process.exit(2); }
  const results = await checkAll(extractLinks(text));
  const count = (v) => results.filter((r) => r.verdict === v).length;
  if (args.includes('--json')) console.log(JSON.stringify({ checked: results.length, ok: count('ok'), challenge: count('challenge'), dead: count('dead'), results }, null, 2));
  else {
    for (const r of results.filter((x) => x.verdict !== 'ok')) console.log(`${r.verdict.toUpperCase().padEnd(9)} ${r.error || r.status}  ${r.url}`);
    console.log(`${results.length} links: ${count('ok')} ok, ${count('challenge')} bot-check, ${count('dead')} dead`);
  }
  process.exit(count('dead') ? 1 : 0);
}
