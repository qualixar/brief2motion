#!/usr/bin/env node
// check_layout.mjs: does the page hold together at the widths people use? Real Chrome, shared session code.
//   node check_layout.mjs <project-dir> [--site <dir>] [--out check] [--widths 320,390,768,1440] [--wireframes] [--strict] [--json]
// Every route (and every state routes.json declares) is loaded fresh at each width. Checks, each with its own outcome:
//   layout.overflow       no sideways scroll (the page is no wider than the screen)                         FAIL
//   layout.text-clipped   no line of text cut off by an ancestor that hides overflow                         FAIL (ellipsis truncation: REVIEW)
//   layout.overlap        text and actions do not collide (more than 1 px on both axes; containment is fine)  FAIL
//   layout.tap-targets    links, buttons and fields at least 24 x 24 px                                      FAIL (primary action under 44 px on a phone: REVIEW)
//   layout.line-length    body text runs 45 to 75 characters a line (the short end is only judged from 768)  REVIEW
//   layout.focus          Tab through the first 20 stops: none entirely covered or off screen                FAIL (partly covered: REVIEW)
// With --wireframes the pages are wireframes/<template>.html, results go to wireframes/qa.json and full-page shots to
// wireframes/shots/ at 390 and 1440. Otherwise shots go to <out>/shots/. Exit 0 when nothing FAILs, 1 on a FAIL, 2 if it cannot run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openSite, newPage } from './_common.mjs';
import { parseArgs, loadRoutes, projectFiles, targets, result, writeQa, passes, printResults } from './_design.mjs';
import { LAYOUT_PROBE, TAP_PROBE, CLIP_PROBE, OVERLAP_PROBE, MEASURE_PROBE, FOCUS_PROBE } from './_probes.mjs';
import { openTarget } from './_steps.mjs';
import { typicalLineLength } from './_measure.mjs';

export const SIZES = { 320: 640, 390: 844, 768: 1024, 1440: 900 };
const MIN_TAP = 24, PREFER_TAP = 44, MEASURE = { lo: 45, hi: 75 }, MAX_TABS = 20;

export async function layoutOne(page, route, w) {
  const R = [];
  const mobile = w <= 390, at = { route: route.id, viewport: `${w}px`, input: mobile ? 'touch' : 'keyboard' };
  const add = (id, outcome, f) => R.push(result(id, outcome, { ...at, ...f }));
  const top = async () => { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(120); };

  const here = await page.evaluate(LAYOUT_PROBE);
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await page.waitForTimeout(200);
  const there = await page.evaluate(LAYOUT_PROBE); await top();
  const worst = there.over > here.over ? there : here;
  add('layout.overflow', worst.over > 1 ? 'FAIL' : 'PASS', { measured: Math.max(0, Math.round(worst.over)), threshold: 1, reason: worst.over > 1 ? `the page is ${Math.round(worst.over)} px wider than the screen: ${worst.offenders.join('; ') || 'offender not found'}` : `no sideways scroll at ${worst.vw} px` });

  const clip = await page.evaluate(CLIP_PROBE);
  add('layout.text-clipped', clip.clipped.length ? 'FAIL' : clip.truncated.length ? 'REVIEW' : 'PASS', { measured: clip.clipped.length, reason: clip.clipped.length ? `text cut off: ${clip.clipped.slice(0, 4).join('; ')}` : clip.truncated.length ? `cut with an ellipsis, check the full text can be read: ${clip.truncated.slice(0, 3).join('; ')}` : 'no text is cut off' });

  const hits = await page.evaluate(OVERLAP_PROBE, 1);
  add('layout.overlap', hits.length ? 'FAIL' : 'PASS', { measured: hits.length, threshold: '1 px on both axes', reason: hits.length ? hits.slice(0, 3).map((h) => `${h.kinds}: ${h.a} and ${h.b} overlap ${h.w}x${h.h} px`).join('; ') : 'no text or action overlaps another' });

  const small = await page.evaluate(TAP_PROBE, MIN_TAP);
  let primary = null;
  if (route.primaryAction) {
    const loc = page.getByRole(route.primaryAction.role || 'link', { name: route.primaryAction.label, exact: true }).first();
    const box = (await loc.count()) ? await loc.boundingBox({ timeout: 2000 }).catch(() => null) : null;
    if (box) primary = Math.round(Math.min(box.width, box.height));
  }
  const soft = mobile && primary !== null && primary < PREFER_TAP;
  add('layout.tap-targets', small.length ? 'FAIL' : soft ? 'REVIEW' : 'PASS', { measured: primary ?? small.length, threshold: `${MIN_TAP} px minimum, ${PREFER_TAP} preferred for the primary action`, reason: small.length ? `under ${MIN_TAP} px: ${small.slice(0, 4).join('; ')}` : soft ? `the primary action "${route.primaryAction.label}" is ${primary} px tall; ${PREFER_TAP} is easier to hit on a phone` : `every target is at least ${MIN_TAP} px${primary !== null ? `; primary action ${primary} px` : ''}` });

  const paras = await page.evaluate(MEASURE_PROBE), odd = [];
  for (const p of paras) { const n = typicalLineLength(p.counts); if (n !== null && (n > MEASURE.hi || (w >= 768 && n < MEASURE.lo))) odd.push(`${p.name} ${n} characters`); }
  add('layout.line-length', odd.length ? 'REVIEW' : 'PASS', { measured: odd.length, threshold: `${MEASURE.lo}-${MEASURE.hi} characters`, reason: odd.length ? `outside the band: ${odd.slice(0, 3).join('; ')}` : `${paras.filter((p) => typicalLineLength(p.counts) !== null).length} paragraphs judged, all in the band${w < 768 ? ' (short lines are fine on a phone)' : ''}` });

  const bad = [], partly = []; let stops = 0;
  await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  const seen = new Set();
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press('Tab');
    let f = null;
    for (let tries = 0, last = null; tries < 12; tries++) {   // wait for the scroll Tab caused to stop
      await page.waitForTimeout(50);
      f = await page.evaluate(FOCUS_PROBE);
      const key = f ? `${f.idx}:${await page.evaluate(() => scrollY)}` : null;
      if (key === last) break;
      last = key;
    }
    if (!f || seen.has(f.idx)) break;   // Tab left the page, or wrapped back to where it started
    seen.add(f.idx); stops++;
    if (!f.onScreen) bad.push(`${f.label} is off screen`);
    else if (f.covered === f.samples) bad.push(`${f.label} is covered by ${f.by}`);
    else if (f.covered > 0) partly.push(`${f.label} is partly covered by ${f.by}`);
  }
  add('layout.focus', bad.length ? 'FAIL' : partly.length ? 'REVIEW' : stops === 0 ? 'REVIEW' : 'PASS', { measured: stops, reason: bad.length ? bad.slice(0, 3).join('; ') : partly.length ? partly.slice(0, 3).join('; ') : stops === 0 ? 'Tab reached nothing' : `${stops} stops, none hidden behind other content` });
  return R;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const USAGE = 'usage: node check_layout.mjs <project-dir> [--site <dir>] [--out <dir>] [--widths 320,390,768,1440] [--wireframes] [--all] [--strict] [--json]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['site', 'out', 'widths'], flags: ['strict', 'json', 'wireframes', 'all'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  const wf = args.flags.has('wireframes'), f = projectFiles(args.pos[0], wf ? path.join(path.resolve(args.pos[0]), 'wireframes') : args.opts.site);
  const widths = (args.opts.widths || Object.keys(SIZES).join(',')).split(',').map(Number).filter(Boolean);
  let doc;
  try { doc = loadRoutes(f.routes); } catch (e) { console.error(`check_layout: ${e.message}`); process.exit(2); }
  if (!f.siteBuilt) { console.error(`check_layout: no ${wf ? 'wireframes' : 'site'} folder at ${f.site}`); process.exit(2); }
  const outDir = path.resolve(args.opts.out || (wf ? f.wireframes : f.out)), shots = path.join(outDir, 'shots');
  fs.mkdirSync(shots, { recursive: true });
  // wireframes: one page per template, named after it; the first route of a template stands for it
  const list = wf ? [...new Map(doc.routes.map((r) => [r.template, r])).entries()].map(([t, r]) => ({ route: { ...r, id: t }, state: null, path: `/${t}.html`, id: t, label: t })) : targets(doc.routes);
  const session = await openSite(f.site);
  const results = [];
  let code = 0;
  try {
    for (const w of widths) {
      for (const t of list) {
        const { ctx, page } = await newPage(session.browser, { viewport: { width: w, height: SIZES[w] || 900 }, mobile: w <= 390 });
        try {
          const r = await openTarget(page, session.base, t, { waitMotion: !wf });
          const at = { route: t.route.id, state: t.state?.id ?? null, viewport: `${w}px`, browser: `Chrome ${session.version}` };
          if (!r.ok) { results.push(result('state.reached', 'FAIL', { ...at, reason: r.error })); continue; }
          const shot = path.join(shots, `${t.id}-${w}.png`);
          if (w === 390 || w === 1440) await page.screenshot({ path: shot, fullPage: true });
          for (const x of await layoutOne(page, t.route, w)) results.push({ ...x, ...at, input: x.input, evidence: w === 390 || w === 1440 ? path.relative(outDir, shot) : null });
        } finally { await ctx.close(); }
      }
    }
  } catch (e) { console.error('check_layout crashed:', (e && e.stack) || e); code = 2; } finally { await session.close(); }
  if (code === 2) process.exit(2);
  writeQa(outDir, 'check_layout', results, { browser: `Chrome ${session.version}` });
  if (args.flags.has('json')) console.log(JSON.stringify(results, null, 2));
  else printResults(`brief2motion layout check${wf ? ' (wireframes)' : ''}`, results, `${doc.routes.length} routes, widths ${widths.join(', ')}${args.flags.has('all') ? '' : '  (PASS lines hidden; --all shows them)'}`, args.flags.has('all') ? null : (r) => r.outcome !== 'PASS');
  process.exit(passes(results, { strict: args.flags.has('strict') }) ? 0 : 1);
}
