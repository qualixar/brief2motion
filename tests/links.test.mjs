// The link checker's parsing and verdicts, and the shape of the curated reference page (no network here:
// tests/run_checks.sh fetches the links when it is online).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractLinks, classify } from '../skills/brief2motion/scripts/check_links.mjs';

const REFS = fs.readFileSync(new URL('../skills/brief2motion/references/web-references.md', import.meta.url), 'utf8');

test('extractLinks: markdown links, angle links, bare links, brackets inside a path, no trailing punctuation, no duplicates', () => {
  const md = 'See [a](https://x.dev/a/) and [b](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), <https://y.dev/p>.\nBare https://z.dev/q, then [a again](https://x.dev/a/).';
  assert.deepEqual(extractLinks(md), ['https://x.dev/a/', 'https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/', 'https://y.dev/p', 'https://z.dev/q']);
  assert.deepEqual(extractLinks('no links, and a mailto: nobody@example.com'), []);
});
test('classify: 2xx ok, 403 and 429 are a bot check, everything else is dead', () => {
  assert.equal(classify(200), 'ok'); assert.equal(classify(204), 'ok');
  assert.equal(classify(403), 'challenge'); assert.equal(classify(429), 'challenge');
  for (const s of [301, 404, 410, 500, 525, 0]) assert.equal(classify(s), 'dead', String(s));
});
test('classify: a 403 is a bot check only when it shows the signs of one; a plain 403 is forbidden and counts like dead', () => {
  assert.equal(classify(403, { 'cf-mitigated': 'challenge', server: 'cloudflare' }, '<title>Just a moment...</title>'), 'challenge');
  assert.equal(classify(403, { server: 'cloudflare' }, 'Bad request'), 'challenge', 'a 403 from a bot-protection edge');
  assert.equal(classify(403, { server: 'nginx' }, '<title>Access denied</title>'), 'challenge');
  assert.equal(classify(403, { server: 'nginx' }, '<title>403 Forbidden</title>'), 'forbidden');
  assert.equal(classify(403, {}, ''), 'forbidden');
  assert.equal(classify(429, { server: 'nginx' }), 'challenge');
});
test('web-references.md: dated, sectioned, every row carries a link, terms and brief words', () => {
  assert.match(REFS, /22 Nov 2026/);
  assert.match(REFS, /Study, never copy/);
  const sections = [...REFS.matchAll(/^## (\d+)\. /gm)].map((m) => m[1]);
  assert.ok(sections.length >= 7, `sections: ${sections}`);
  const rows = REFS.split('\n').filter((l) => /^\| /.test(l) && !/^\|[- |]+\|$/.test(l) && !/^\| (Site|Link) \|/.test(l));
  assert.ok(rows.length >= 55, `rows: ${rows.length}`);
  for (const r of rows) {
    const cells = r.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
    assert.equal(cells.length, 4, `4 columns: ${r.slice(0, 80)}`);
    assert.ok(cells.every(Boolean) || cells[3] === '', `no empty cell but the last: ${r.slice(0, 80)}`);
    assert.match(cells[0], /https:\/\//, `a link in: ${r.slice(0, 80)}`);
  }
  assert.ok(extractLinks(REFS).length >= 120);
});
test('web-references.md uses no address that is known dead or retired', () => {
  for (const dead of ['onepagelove.com', 'godly.website', 'docs.rive.app', 'emilkowal.ski', 'lenis.darkroom.engineering']) assert.ok(!REFS.includes(`](https://${dead}`) && !REFS.includes(`](https://www.${dead}`), dead);
});
