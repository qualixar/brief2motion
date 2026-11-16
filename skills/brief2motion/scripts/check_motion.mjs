#!/usr/bin/env node
// check_motion.mjs: serve a brief2motion site and measure it in real Chrome.
//   node check_motion.mjs <site-dir> [--out <dir>] [--json] [--make-fallback]
// Exit 0 only if every budget passes. Exit 1 if a budget fails. Exit 2 if the tool itself cannot run.
import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright, launchChrome, serveDir, inkPixels } from './_common.mjs';

const BUDGET = { desktopP95: 20, mobileP95: 40, localBytes: 1.5 * 1024 * 1024, consoleErrors: 0 };

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const site = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
if (!site || flag('-h') || flag('--help')) {
  console.error('usage: node check_motion.mjs <site-dir> [--out <dir>] [--json] [--make-fallback]'); process.exit(site ? 0 : 2);
}
const siteDir = path.resolve(site);
if (!fs.existsSync(path.join(siteDir, 'index.html'))) { console.error(`no index.html in ${siteDir}`); process.exit(2); }
const outDir = path.resolve(opt('--out') || path.join(siteDir, 'check-out'));
const JSON_ONLY = flag('--json'), MAKE_FB = flag('--make-fallback');
fs.mkdirSync(path.join(outDir, 'shots'), { recursive: true });
const log = (...a) => { if (!JSON_ONLY) console.error(...a); };

const checks = []; // { name, pass, detail }
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
const pct = (arr, q) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : NaN; };
const r1 = (n) => Math.round(n * 10) / 10;

// Injected before page scripts: our own rAF sampler, independent of the page's stats.times.
const SAMPLER = `
  window.__raf = { times: [], on: false, last: 0 };
  (function loop(t) { const r = window.__raf; if (r.on && r.last) r.times.push(t - r.last); r.last = t; requestAnimationFrame(loop); })(0);
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const twoRaf = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

function attachWatchers(page, cdp, acc, origin) {
  page.on('console', (m) => { if (m.type() === 'error') acc.errors.push(`${m.text()}${m.location().url ? ' @ ' + m.location().url : ''}`); });
  page.on('pageerror', (e) => acc.errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => acc.errors.push(`requestfailed: ${r.url()} (${r.failure()?.errorText})`));
  const urls = new Map();
  cdp.on('Network.responseReceived', (e) => urls.set(e.requestId, e.response.url));
  cdp.on('Network.loadingFinished', (e) => {
    const u = urls.get(e.requestId); if (!u) return;
    const local = u.startsWith(origin);
    acc[local ? 'localBytes' : 'cdnBytes'] += e.encodedDataLength;
    (local ? acc.localFiles : acc.cdnFiles).push([u.replace(origin, ''), e.encodedDataLength]);
  });
}

async function waitForFrames(page, n, timeout) {
  await page.waitForFunction((k) => { const m = window.__motion; return m && m.stats && (m.stats.frames >= k || ['fallback-image', 'error', 'reduced-motion'].includes(m.stats.mode)); }, n, { timeout });
}

const jump = (page, y) => page.evaluate((yy) => { if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo(0, yy); }, y);
const maxScroll = (page) => page.evaluate(() => document.documentElement.scrollHeight - innerHeight);

async function scrollThrough(page, seconds) {
  await page.evaluate(() => { window.__raf.times = []; window.__raf.on = true; });
  await page.evaluate((dur) => new Promise((done) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (window.__lenis) {
      window.__lenis.scrollTo(max, { duration: dur, easing: (t) => t, force: true, onComplete: () => setTimeout(done, 300) });
      setTimeout(done, dur * 1000 + 1500);
    } else {
      const t0 = performance.now();
      (function step(t) { const k = Math.min(1, (t - t0) / (dur * 1000)); scrollTo(0, max * k); k < 1 ? requestAnimationFrame(step) : done(); })(t0);
    }
  }), seconds);
  return page.evaluate(() => { window.__raf.on = false; return window.__raf.times; });
}

async function profile(browser, base, name, ctxOpts, { throttle = 1, budgetP95, outDir, wantShots = true } = {}) {
  const ctx = await browser.newContext(ctxOpts);
  await ctx.addInitScript(SAMPLER);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const acc = { errors: [], localBytes: 0, cdnBytes: 0, localFiles: [], cdnFiles: [] };
  attachWatchers(page, cdp, acc, new URL(base).origin);
  if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  await page.goto(base, { waitUntil: 'load', timeout: 60000 });
  const res = { name, ok: true };
  try { await waitForFrames(page, 120, 60000); } catch { res.ok = false; res.note = 'timed out waiting for stats.frames >= 120'; }
  await sleep(500);
  const m0 = await page.evaluate(() => ({ mode: window.__motion?.stats?.mode, frames: window.__motion?.stats?.frames, lenis: !!window.__lenis }));
  res.mode = m0.mode; res.lenis = m0.lenis; res.framesBeforeScroll = m0.frames;
  const max = await maxScroll(page); res.scrollable = max;
  const times = await scrollThrough(page, 5);
  res.rafSamples = times.length;
  const med = pct(times, 0.5);
  res.fps = r1(1000 / med); res.medianMs = r1(med); res.p95Ms = r1(pct(times, 0.95)); res.maxMs = r1(Math.max(...times));
  const st = await page.evaluate(() => { const s = window.__motion?.stats || {}; return { drawn: s.drawn, total: s.total, shed: s.shed, frames: s.frames, mode: s.mode }; });
  Object.assign(res, st);
  res.budgetP95 = budgetP95; res.p95Pass = res.p95Ms <= budgetP95;
  if (wantShots) {
    res.shots = [];
    for (const f of [0, 25, 50, 75, 100]) {
      await jump(page, Math.round(max * f / 100));
      await sleep(1100); await twoRaf(page);
      const file = path.join(outDir, 'shots', `${name}-${String(f).padStart(2, '0')}.png`);
      await page.screenshot({ path: file }); res.shots.push(path.relative(outDir, file));
    }
  }
  res.consoleErrors = acc.errors; res.weight = { localBytes: acc.localBytes, cdnBytes: acc.cdnBytes, localFiles: acc.localFiles, cdnFiles: acc.cdnFiles };
  return { res, page, ctx, max };
}

// Find the first scroll position where uProgress reaches 1 (so the 2nd target has barely started to morph),
// screenshot #hero there. Coarse sweep, then bisection, because the morph begins right after assembly ends.
async function makeFallback(page, max, siteDir, outDir) {
  await page.addStyleTag({ content: '.hero-copy,.flight-layer,.plane{visibility:hidden!important}' });
  const at = async (f) => {
    await jump(page, Math.round(max * f));
    let prev = -1, cur = -1;
    for (let i = 0; i < 14; i++) { await sleep(250); cur = await page.evaluate(() => window.__motion.uniforms.uProgress.value); if (Math.abs(cur - prev) < 1e-5) break; prev = cur; }
    return { p: cur, m: await page.evaluate(() => window.__motion.uniforms.uMorph.value) };
  };
  let lo = 0, hi = null;
  for (let f = 0.1; f <= 1.0001; f += 0.1) { const r = await at(f); if (r.p >= 0.999) { hi = f; break; } lo = f; }
  if (hi === null) return { ok: false, error: 'uProgress never reached 1 while scrolling the whole page' };
  let best = await at(hi);
  for (let i = 0; i < 8 && hi - lo > 0.002; i++) {
    const mid = (lo + hi) / 2, r = await at(mid);
    if (r.p >= 0.999) { hi = mid; best = r; } else lo = mid;
  }
  const end = await at(hi);
  await twoRaf(page);
  const dest = path.join(siteDir, 'assets', 'fallback.png');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await page.locator('#hero').screenshot({ path: dest });
  const ink = inkPixels(fs.readFileSync(dest));
  return { ok: ink.dark > 500 && end.p >= 0.999 && end.m <= 0.05, path: dest, atScrollFraction: Math.round(hi * 1000) / 1000, uProgress: end.p, uMorph: end.m, ink };
}

const server = await serveDir(siteDir);
const base = server.url;
const pw = await loadPlaywright();
const report = { site: siteDir, when: new Date().toISOString(), budgets: BUDGET, chrome: null, runs: {} };
let exitCode = 1;
try {
  // a) desktop
  log('desktop 1440x900 ...');
  const browser = await launchChrome(pw);
  report.chrome = browser.version();
  const d = await profile(browser, base, 'desktop', { viewport: { width: 1440, height: 900 } }, { budgetP95: BUDGET.desktopP95, outDir });
  report.runs.desktop = d.res;
  if (MAKE_FB) {
    log('making fallback.png ...');
    report.fallbackMade = await makeFallback(d.page, d.max, siteDir, outDir);
    check('fallback.png generated (--make-fallback)', report.fallbackMade.ok, report.fallbackMade.ok ? `${report.fallbackMade.path} (${report.fallbackMade.ink?.dark} ink px, scroll ${report.fallbackMade.atScrollFraction}, uProgress=${report.fallbackMade.uProgress}, uMorph=${report.fallbackMade.uMorph})` : report.fallbackMade.error || 'screenshot had no ink');
  }
  await d.ctx.close();

  // b) mobile
  log('mobile 390x844 @3x, CPU 4x ...');
  const mob = await profile(browser, base, 'mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, { throttle: 4, budgetP95: BUDGET.mobileP95, outDir });
  report.runs.mobile = mob.res; await mob.ctx.close();

  // c) reduced motion
  log('reduced motion ...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errs = []; page.on('console', (m) => m.type() === 'error' && errs.push(m.text())); page.on('pageerror', (e) => errs.push(e.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__motion?.stats?.mode, null, { timeout: 30000 }).catch(() => {});
    await sleep(1200);
    const info = await page.evaluate(() => ({ mode: window.__motion?.stats?.mode, p: window.__motion?.uniforms?.uProgress?.value }));
    const file = path.join(outDir, 'shots', 'reduced.png'); await page.screenshot({ path: file });
    const ink = inkPixels(fs.readFileSync(file));
    report.runs.reduced = { ...info, ink: ink.dark, shot: 'shots/reduced.png' };
    check('reduced motion', info.mode === 'reduced-motion' && info.p === 1 && ink.dark > 500, `mode=${info.mode}, uProgress=${info.p}, ink px=${ink.dark}`);
    await ctx.close();
  }
  await browser.close();

  // d) WebGL disabled
  log('WebGL disabled ...');
  {
    const b2 = await launchChrome(pw, ['--disable-webgl', '--disable-3d-apis']);
    const ctx = await b2.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: 'load' });
    await sleep(1500);
    const info = await page.evaluate(() => {
      const hero = document.querySelector('#hero'), img = hero?.querySelector('.fallback');
      const cs = img && getComputedStyle(img), r = img?.getBoundingClientRect();
      return { noWebgl: !!hero?.classList.contains('no-webgl'), mode: window.__motion?.stats?.mode, naturalWidth: img?.naturalWidth ?? 0,
        visible: !!img && cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 };
    });
    const onDisk = fs.existsSync(path.join(siteDir, 'assets', 'fallback.png'));
    const file = path.join(outDir, 'shots', 'no-webgl.png'); await page.screenshot({ path: file });
    report.runs.noWebgl = { ...info, fallbackOnDisk: onDisk, shot: 'shots/no-webgl.png' };
    const ok = info.noWebgl && info.visible && info.naturalWidth > 0;
    let detail = `hero.no-webgl=${info.noWebgl}, mode=${info.mode}, img visible=${info.visible}, naturalWidth=${info.naturalWidth}`;
    if (!onDisk || info.naturalWidth === 0) detail += ' | assets/fallback.png is missing: run check_motion with --make-fallback';
    check('WebGL disabled shows fallback', ok, detail);
    await ctx.close(); await b2.close();
  }

  // budgets
  const dr = report.runs.desktop, mr = report.runs.mobile;
  for (const [label, r, b] of [['desktop', dr, BUDGET.desktopP95], ['mobile', mr, BUDGET.mobileP95]]) {
    check(`${label} mode is webgl2`, r.mode === 'webgl2', `mode=${r.mode}`);
    check(`${label} frames reached 120`, r.ok, r.note || `frames=${r.frames}`);
    check(`${label} p95 frame <= ${b} ms`, r.p95Ms <= b, `p95=${r.p95Ms} ms, median=${r.medianMs} ms (${r.fps} fps), max=${r.maxMs} ms, drawn ${r.drawn}/${r.total}, shed ${r.shed}`);
  }
  const lw = dr.weight.localBytes;
  check('local page weight <= 1.5 MB', lw <= BUDGET.localBytes, `local ${(lw / 1048576).toFixed(2)} MB, CDN ${(dr.weight.cdnBytes / 1048576).toFixed(2)} MB (desktop run)`);
  const errs = [...dr.consoleErrors, ...mr.consoleErrors];
  report.consoleErrors = { desktop: dr.consoleErrors, mobile: mr.consoleErrors };
  check('console errors = 0', errs.length === 0, errs.length ? `${errs.length}: ${[...new Set(errs)].join(' || ')}` : 'none');

  report.checks = checks; report.pass = checks.every((c) => c.pass);
  fs.writeFileSync(path.join(outDir, 'motion-report.json'), JSON.stringify(report, null, 2));
  if (JSON_ONLY) console.log(JSON.stringify(report, null, 2));
  else {
    const row = (r) => `${r.name.padEnd(8)} ${String(r.mode).padEnd(12)} fps ${String(r.fps).padStart(5)}  p95 ${String(r.p95Ms).padStart(5)} ms  drawn ${r.drawn}/${r.total}  shed ${r.shed}  local ${(r.weight.localBytes / 1024).toFixed(0)} KB  cdn ${(r.weight.cdnBytes / 1024).toFixed(0)} KB`;
    console.log(`\nbrief2motion check  ${siteDir}\nChrome ${report.chrome}\n`);
    console.log(row(dr)); console.log(row(mr)); console.log('');
    for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}  (${c.detail})`);
    console.log(`\nRESULT: ${report.pass ? 'PASS' : 'FAIL'}   report: ${path.join(outDir, 'motion-report.json')}   shots: ${path.join(outDir, 'shots')}`);
  }
  exitCode = report.pass ? 0 : 1;
} catch (e) {
  console.error('check_motion crashed:', e && e.stack || e); exitCode = 2;
} finally { await server.close(); }
process.exit(exitCode);
