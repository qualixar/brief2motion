#!/usr/bin/env node
// check_journeys.mjs: can a visitor finish the task the site exists for? Runs journeys.json in real Chrome.
//   node check_journeys.mjs <project-dir> [--site <dir>] [--out check] [--strict] [--json]
// journeys.json:
//   { "journeys": [ { "id": "start-trial", "task": "T3", "start": "home",
//       "viewports": ["phone", "desktop"],              (default both: phone is 390x844 with touch, desktop 1440x900)
//       "integration": "fixture",                        (optional: the last step ends at a fixture, not a live service)
//       "steps": [ { "click": { "role": "link", "name": "Start free trial" } }, { "fill": { "label": "Work email" }, "value": "ada@example.test" } ],
//       "expect": [ { "url": "/start/" }, { "role": "status", "contains": "..." } ] } ] }     ("url": "/#when" also checks the anchor)
// Steps and expectations use role, accessible name, label or visible text (see _steps.mjs), the way a person finds things.
//   journey.<id>              the steps ran and the expectation came true                                      FAIL otherwise
//                             (FAIL with no "expect" or an unknown viewport name; REVIEW when the expectation was
//                             already true before the steps, which then prove nothing)
//   journey.<id>.console      no console error or uncaught exception during the journey                          FAIL otherwise
//   journey.<id>.integration  PENDING when the journey ends at a fixture: the interaction passed, the real service is not proven
// A screenshot of where each journey ended is kept in <out>/shots/.
// The run's verdict (_design.mjs verdict): FAIL on any FAIL or when nothing was checked (exit 1); INCOMPLETE when
// something is PENDING (no evidence yet), never printed as PASS (exit 0, 1 with --strict); PASS otherwise (exit 0, 1 with
// --strict when anything needs REVIEW). Exit 2 when the tool cannot run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSite, newPage } from './_common.mjs';
import { parseArgs, loadRoutes, loadJson, projectFiles, result, writeQa, passes, printResults } from './_design.mjs';
import { runSteps, checkExpect, ready, loadPage } from './_steps.mjs';

export const VIEWPORTS = { phone: { width: 390, height: 844, mobile: true }, desktop: { width: 1440, height: 900, mobile: false } };

export async function runJourney(browser, base, j, routes, vpName, shotsDir, version) {
  const route = routes.find((r) => r.id === j.start);
  const vp = VIEWPORTS[vpName];
  if (!vp) return [result(`journey.${j.id}`, 'FAIL', { route: j.start, viewport: String(vpName), browser: `Chrome ${version}`, reason: `unknown viewport "${vpName}" (use ${Object.keys(VIEWPORTS).join(' or ')})` })];
  const at = { route: j.start, state: null, viewport: `${vpName} ${vp.width}px`, browser: `Chrome ${version}`, input: vp.mobile ? 'touch' : 'keyboard' };
  if (!route) return [result(`journey.${j.id}`, 'FAIL', { ...at, reason: `start route "${j.start}" is not in routes.json` })];
  if (![].concat(j.expect || []).length) return [result(`journey.${j.id}`, 'FAIL', { ...at, reason: 'the journey has no "expect": without an outcome to check it proves nothing' })];
  const { ctx, page, errors } = await newPage(browser, { viewport: { width: vp.width, height: vp.height }, mobile: vp.mobile });
  const out = [];
  try {
    const load = await loadPage(page, new URL(route.path, base).href);
    if (!load.ok) { out.push(result(`journey.${j.id}`, 'FAIL', { ...at, reason: `the start page did not load: ${load.error}` })); return out; }
    await ready(page, { ms: 400 });
    // an outcome that is already there before any step was taken does not show the steps lead to it
    const before = (j.steps || []).length ? await checkExpect(page, j.expect, { timeout: 250 }) : { ok: false };
    const run = await runSteps(page, j.steps || []);
    let ok = run.ok, why = run.error;
    if (ok) { const ex = await checkExpect(page, j.expect); ok = ex.ok; why = ex.reason; }
    const vacuous = ok && before.ok;
    const shot = path.join(shotsDir, `journey-${j.id}-${vpName}.png`);
    await page.screenshot({ path: shot }).catch(() => {});
    const evidence = path.basename(shotsDir) + '/' + path.basename(shot);
    out.push(result(`journey.${j.id}`, vacuous ? 'REVIEW' : ok ? 'PASS' : 'FAIL', { ...at, evidence, measured: (j.steps || []).length, reason: vacuous ? 'the expected outcome was already true before the steps ran, so it does not show they work: expect something only the steps can cause (a path, a status message)' : ok ? `${(j.steps || []).length} steps done and the expected outcome appeared${j.task ? ` (task ${j.task})` : ''}` : why }));
    out.push(result(`journey.${j.id}.console`, errors.length ? 'FAIL' : 'PASS', { ...at, measured: errors.length, reason: errors.length ? errors.slice(0, 2).join(' || ').slice(0, 200) : 'no console errors' }));
    if (ok && j.integration === 'fixture') out.push(result(`journey.${j.id}.integration`, 'PENDING', { ...at, reason: 'the journey ends at a fixture; the real service is not proven. Connect it and run again.' }));
  } finally { await ctx.close(); }
  return out;
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const USAGE = 'usage: node check_journeys.mjs <project-dir> [--site <dir>] [--out <dir>] [--strict] [--json]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['site', 'out'], flags: ['strict', 'json'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  const f = projectFiles(args.pos[0], args.opts.site);
  let doc, js;
  try { doc = loadRoutes(f.routes); js = loadJson(f.journeys, 'journeys.json'); } catch (e) { console.error(`check_journeys: ${e.message}`); process.exit(2); }
  if (!Array.isArray(js.journeys) || !js.journeys.length) { console.error('check_journeys: journeys.json needs a non-empty "journeys" array'); process.exit(2); }
  if (!f.siteBuilt) { console.error(`check_journeys: no site folder at ${f.site}`); process.exit(2); }
  const outDir = path.resolve(args.opts.out || f.out), shots = path.join(outDir, 'shots');
  fs.mkdirSync(shots, { recursive: true });
  const session = await openSite(f.site);
  const results = [];
  let code = 0;
  try {
    for (const j of js.journeys) for (const vpName of j.viewports || ['phone', 'desktop']) results.push(...await runJourney(session.browser, session.base, j, doc.routes, vpName, shots, session.version));
  } catch (e) { console.error('check_journeys crashed:', (e && e.stack) || e); code = 2; } finally { await session.close(); }
  if (code === 2) process.exit(2);
  writeQa(outDir, 'check_journeys', results, { browser: `Chrome ${session.version}` }, { site: f.site });
  if (args.flags.has('json')) console.log(JSON.stringify(results, null, 2));
  else printResults('brief2motion journeys', results, `${js.journeys.length} journeys`, null, { strict: args.flags.has('strict') });
  process.exit(passes(results, { strict: args.flags.has('strict') }) ? 0 : 1);
}
