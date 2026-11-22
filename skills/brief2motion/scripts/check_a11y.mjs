#!/usr/bin/env node
// check_a11y.mjs: automated accessibility checks plus a keyboard walk, on every route and declared state.
//   node check_a11y.mjs <project-dir> [--site <dir>] [--out check] [--widths 390,1440] [--themes light,dark] [--strict] [--json]
// axe-core (Deque Systems, MPL-2.0, https://github.com/dequelabs/axe-core) is fetched at CHECK TIME from cdn.jsdelivr.net at a
// pinned version, verified against a SHA-384 integrity hash, kept in the checker's cache folder and injected into the page the
// checker opens (evaluated through the DevTools protocol, so a strict Content-Security-Policy on the page does not block it).
// The site under test never carries it and never requests it. Offline with nothing cached: the axe results are
// PENDING with a message saying so, and the keyboard walk still runs.
//   a11y.axe.<rule>       a WCAG 2.0 to 2.2 A or AA rule that failed (FAIL), or that axe could not decide (REVIEW, for example
//                         contrast over a picture); one result per rule, route, state and width
//   a11y.axe              summary: how many rules passed
//   a11y.keyboard-primary Tab from the top of the page reaches the route's primary action (routes.json primaryAction) (FAIL if
//                         it cannot be reached or does not exist; REVIEW past 25 stops)
// Automation covers part of WCAG. A screen-reader pass and a person's judgement are still needed; the report says so.
// The run's verdict (_design.mjs verdict): FAIL on any FAIL or when nothing was checked (exit 1); INCOMPLETE when
// something is PENDING (no evidence yet), never printed as PASS (exit 0, 1 with --strict); PASS otherwise (exit 0, 1 with
// --strict when anything needs REVIEW). Exit 2 when the tool cannot run.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { openSite, newPage, DEPS } from './_common.mjs';
import { parseArgs, loadRoutes, projectFiles, targets, listOf, result, writeQa, passes, printResults } from './_design.mjs';
import { openTarget } from './_steps.mjs';

export const AXE = {
  version: '4.14.1',
  url: 'https://cdn.jsdelivr.net/npm/axe-core@4.14.1/axe.min.js',
  integrity: 'sha384-xt1SFg49QaDwsyt0Xfs2XAyBtYPClXl3X2q5OOLeGAUmq9jZTYIMdztpF99WdhiH',
  tags: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
};
const sri = (buf) => `sha384-${crypto.createHash('sha384').update(buf).digest('base64')}`;

// Gets axe.min.js: from the cache if its hash still matches, else from the CDN (hash checked before it is kept).
// Returns { ok: true, source } or { ok: false, reason }. `fetchImpl` and `cacheDir` exist so tests can run offline.
export async function loadAxe({ fetchImpl = fetch, cacheDir = process.env.BRIEF2MOTION_AXE_CACHE || path.join(DEPS, 'axe-core', AXE.version), pin = AXE } = {}) {
  const file = path.join(cacheDir, 'axe.min.js');
  try { const buf = fs.readFileSync(file); if (sri(buf) === pin.integrity) return { ok: true, source: buf.toString('utf8'), from: 'cache' }; } catch { /* not cached */ }
  if (process.env.BRIEF2MOTION_OFFLINE) return { ok: false, reason: 'BRIEF2MOTION_OFFLINE is set and axe-core is not cached' };
  let buf;
  try {
    const res = await fetchImpl(pin.url, { signal: AbortSignal.timeout(25000) });
    if (!res.ok) return { ok: false, reason: `cdn.jsdelivr.net answered ${res.status} for axe-core ${pin.version}` };
    buf = Buffer.from(await res.arrayBuffer());
  } catch (e) { return { ok: false, reason: `could not download axe-core ${pin.version} from cdn.jsdelivr.net (${String(e.message || e).slice(0, 80)}); offline?` }; }
  if (sri(buf) !== pin.integrity) return { ok: false, reason: `axe-core ${pin.version} from the CDN does not match its pinned integrity hash; not used` };
  try { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(file, buf); } catch { /* cache is optional */ }
  return { ok: true, source: buf.toString('utf8'), from: 'cdn.jsdelivr.net' };
}

const nodesText = (v) => `${v.help} (${v.impact || 'n/a'}, ${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}: ${v.nodes.slice(0, 2).map((n) => String(n.target[0] ?? '').slice(0, 60)).join(', ')})`;

// Tab from the top of the page until the primary action has focus.
export async function tabToPrimary(page, action, max = 40) {
  const loc = page.getByRole(action.role || 'link', { name: action.label, exact: true }).first();
  if (!(await loc.count())) return { found: false, stops: 0, why: `no ${action.role || 'link'} named "${action.label}" on the page` };
  const handle = await loc.elementHandle({ timeout: 2000 });
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  for (let i = 1; i <= max; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate((el) => document.activeElement === el, handle)) return { found: true, stops: i, why: '' };
    if (await page.evaluate(() => document.activeElement === document.body)) return { found: false, stops: i, why: `Tab left the page after ${i} stops without reaching it` };
  }
  return { found: false, stops: max, why: `not reached in ${max} Tab stops` };
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const USAGE = 'usage: node check_a11y.mjs <project-dir> [--site <dir>] [--out <dir>] [--widths 390,1440] [--themes light,dark] [--strict] [--json]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['site', 'out', 'widths', 'themes'], flags: ['strict', 'json'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  const f = projectFiles(args.pos[0], args.opts.site);
  let doc, themes, widths;
  try { themes = listOf(args.opts.themes, 'light', 'themes'); widths = listOf(args.opts.widths, '390,1440', 'widths'); doc = loadRoutes(f.routes); } catch (e) { console.error(`check_a11y: ${e.message}`); process.exit(2); }
  if (!f.siteBuilt) { console.error(`check_a11y: no site folder at ${f.site}`); process.exit(2); }
  const axe = await loadAxe();
  if (!axe.ok) console.error(`check_a11y: axe-core skipped: ${axe.reason}. The keyboard walk still runs; run again with a network connection for the axe results.`);
  const session = await openSite(f.site);
  const results = [];
  let code = 0;
  try {
    for (const theme of themes) for (const t of targets(doc.routes)) {
      for (const w of widths) {
        const { ctx, page } = await newPage(session.browser, { viewport: { width: w, height: w < 600 ? 844 : 900 }, mobile: w <= 390, dark: theme === 'dark' });
        const at = { route: t.route.id, state: t.state?.id ?? null, viewport: `${w}px`, browser: `Chrome ${session.version}`, input: 'keyboard', theme };
        try {
          const r = await openTarget(page, session.base, t);
          if (!r.ok) { results.push(result(r.loaded ? 'state.reached' : 'page.loaded', 'FAIL', { ...at, reason: r.error })); continue; }
          if (!axe.ok) results.push(result('a11y.axe', 'PENDING', { ...at, reason: `axe-core not run: ${axe.reason}` }));
          else {
            // Evaluated through the DevTools protocol, not as a <script> tag: a page whose Content-Security-Policy forbids
            // inline scripts would block the tag. The page's own policy stays in force for its own code. The source is the
            // file whose SHA-384 loadAxe checked.
            await page.evaluate(axe.source);
            const run = await page.evaluate((tags) => axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations', 'incomplete', 'passes'] }), AXE.tags);
            for (const v of run.violations) results.push(result(`a11y.axe.${v.id}`, 'FAIL', { ...at, measured: v.nodes.length, threshold: v.tags.filter((x) => /^wcag\d/.test(x)).join(' ') || v.tags[0], evidence: v.nodes[0]?.target?.[0] ?? null, reason: nodesText(v) }));
            for (const v of run.incomplete) results.push(result(`a11y.axe.${v.id}`, 'REVIEW', { ...at, measured: v.nodes.length, threshold: v.tags.filter((x) => /^wcag\d/.test(x)).join(' ') || v.tags[0], evidence: v.nodes[0]?.target?.[0] ?? null, reason: `axe could not decide: ${nodesText(v)}` }));
            results.push(result('a11y.axe', run.violations.length ? 'FAIL' : 'PASS', { ...at, measured: run.passes.length, reason: `axe-core ${AXE.version}: ${run.passes.length} rules passed, ${run.violations.length} violations, ${run.incomplete.length} need a person` }));
          }
          if (!t.state && t.route.primaryAction) {
            const k = await tabToPrimary(page, t.route.primaryAction);
            results.push(result('a11y.keyboard-primary', !k.found ? 'FAIL' : k.stops > 25 ? 'REVIEW' : 'PASS', { ...at, measured: k.stops, threshold: 25, reason: k.found ? `"${t.route.primaryAction.label}" has focus after ${k.stops} Tab stops` : k.why }));
          }
        } finally { await ctx.close(); }
      }
    }
  } catch (e) { console.error('check_a11y crashed:', (e && e.stack) || e); code = 2; } finally { await session.close(); }
  if (code === 2) process.exit(2);
  const outDir = path.resolve(args.opts.out || f.out);
  writeQa(outDir, 'check_a11y', results, { browser: `Chrome ${session.version}`, axe: axe.ok ? AXE.version : 'not run' }, { site: f.site });
  if (args.flags.has('json')) console.log(JSON.stringify(results, null, 2));
  else {
    printResults('brief2motion accessibility check', results, `axe-core ${axe.ok ? AXE.version : '(not run)'}, widths ${widths.join(', ')}, themes ${themes.join(', ')}  (PASS lines hidden)`, (r) => r.outcome !== 'PASS', { strict: args.flags.has('strict') });
    console.log('Automated checks cover part of WCAG 2.2. Keyboard use by a person and a screen reader pass are still needed.');
  }
  process.exit(passes(results, { strict: args.flags.has('strict') }) ? 0 : 1);
}
