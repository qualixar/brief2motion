#!/usr/bin/env node
// check_motion.mjs: serve a brief2motion site and measure it in real Chrome.
//   node check_motion.mjs <site-dir | http://localhost:PORT/> [--out <dir>] [--json] [--make-fallback]
// A folder is served on a private port for the run. A URL (for example the one serve.py prints) is checked as it is;
// --make-fallback needs a folder, because it writes assets/fallback.png into it.
// Exit 0 only if every budget passes. Exit 1 if a budget fails. Exit 2 if the tool itself cannot run.
// The phone run is an emulated phone: this machine's GPU with the CPU slowed 4x and a 390 x 844 touch screen.
// On a machine with no GPU (a basic VM or CI box) the frame numbers say nothing about real phones or desktops.
import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright, launchChrome, serveDir, inkPixels, HERE } from './_common.mjs';

const BUDGET = { desktopP95: 20, mobileP95: 40, localBytes: 1.5 * 1024 * 1024, consoleErrors: 0, mobileKeepShare: 0.6 };
const MIB = 1024 * 1024;
// everything the page draws on top of the canvas: hidden when we photograph the canvas alone
const HIDE_UI = '.hero-copy,.nav,.flight-layer,.plane,.seq-card,.skip{visibility:hidden!important}';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const site = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
if (!site || flag('-h') || flag('--help')) {
  const usage = 'usage: node check_motion.mjs <site-dir | http://localhost:PORT/> [--out <dir>] [--json] [--make-fallback]';
  if (flag('-h') || flag('--help')) { console.log(usage); process.exit(0); }
  console.error(usage); process.exit(2);
}
const isUrl = /^https?:\/\//i.test(site);
const siteDir = isUrl ? null : path.resolve(site);
if (!isUrl && !fs.existsSync(path.join(siteDir, 'index.html'))) { console.error(`no index.html in ${siteDir}`); process.exit(2); }
if (isUrl && flag('--make-fallback')) { console.error('--make-fallback needs a site folder, not a URL (it writes assets/fallback.png into the folder)'); process.exit(2); }
// screenshots and the report go next to the site folder, never inside it, so they are not deployed with the site
const outDir = path.resolve(opt('--out') || (isUrl ? 'check' : path.join(path.dirname(siteDir), 'check')));
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
    const u = urls.get(e.requestId); if (!u || u.startsWith('data:')) return;
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
  const st = await page.evaluate(() => { const s = window.__motion?.stats || {}; return { drawn: s.drawn, minDrawn: s.minDrawn, total: s.total, shed: s.shed, restored: s.restored, frames: s.frames, mode: s.mode }; });
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

// The no-WebGL picture: the first shape, fully formed, photographed from the canvas alone (no nav, no headline).
// No searching for a scroll position: stop every timeline, set the finished state directly, draw one frame.
async function makeFallback(page, siteDir) {
  await jump(page, 0);
  await sleep(1500);                                   // let the scroll scrub settle at the top
  await page.evaluate(() => { window.gsap?.globalTimeline.pause(); });
  const state = await page.evaluate(() => {
    const m = window.__motion;
    if (!m?.showFinished) return null;
    m.showFinished();
    return { progress: m.uniforms.uProgress.value, from: m.uniforms.uFrom.value, to: m.uniforms.uTo.value, mix: m.uniforms.uMix.value, drawn: m.stats.drawn, total: m.stats.total };
  });
  if (!state) return { ok: false, error: 'the page did not expose window.__motion.showFinished (is assemble.js the template version?)' };
  await page.addStyleTag({ content: HIDE_UI });
  await twoRaf(page);
  const dest = path.join(siteDir, 'assets', 'fallback.png');
  const rel = 'assets/fallback.png';   // reports are committed and shared: no absolute paths in them
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await page.locator('#hero canvas').screenshot({ path: dest });
  const ink = inkPixels(fs.readFileSync(dest));
  if (ink.dark <= 500) return { ok: false, path: rel, ink, state, error: `the canvas photo has only ${ink.dark} dark pixels: the shape did not draw (WebGL blocked, or the image failed to load)` };
  if (state.drawn !== state.total) return { ok: false, path: rel, ink, state, error: `only ${state.drawn} of ${state.total} dots were drawn: the page was shedding dots, so the picture is thin` };
  return { ok: true, path: rel, ink, state };
}

// Text that is really readable: on screen, and not faded out by itself or any parent.
const readable = (page, sel) => page.evaluate((q) => {
  const el = document.querySelector(q);
  if (!el) return { found: false, visible: false, opacity: 0 };
  let op = 1;
  for (let n = el; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
  const cs = getComputedStyle(el), r = el.getBoundingClientRect();
  return { found: true, opacity: Math.round(op * 100) / 100, visible: cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0 && r.height > 0 };
}, sel);

const server = isUrl ? { url: site.endsWith('/') ? site : `${site}/`, close: async () => {} } : await serveDir(siteDir);
const base = server.url;
const pw = await loadPlaywright();
const report = { site: isUrl ? new URL(base).origin : path.basename(siteDir), when: new Date().toISOString(), budgets: BUDGET, chrome: null, runs: {} };
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
    report.fallbackMade = await makeFallback(d.page, siteDir);
    check('fallback.png generated (--make-fallback)', report.fallbackMade.ok, report.fallbackMade.ok ? `${report.fallbackMade.path} (canvas only, ${report.fallbackMade.ink.dark} ink px, shape ${report.fallbackMade.state.from}, ${report.fallbackMade.state.drawn}/${report.fallbackMade.state.total} dots)` : report.fallbackMade.error);
  }
  await d.ctx.close();

  // b) mobile
  log('mobile 390x844 @3x, CPU 4x ...');
  const mob = await profile(browser, base, 'mobile', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, { throttle: 4, budgetP95: BUDGET.mobileP95, outDir });
  report.runs.mobile = mob.res; await mob.ctx.close();

  // c) reduced motion: the finished shape must be on the canvas, survive a resize, and the headline must be readable
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
    const head = await readable(page, '#hero h1');
    const full = path.join(outDir, 'shots', 'reduced.png'); await page.screenshot({ path: full });
    // the canvas alone: the headline and nav are text too, so a blank canvas must not pass on their ink
    await page.addStyleTag({ content: HIDE_UI });
    const canvasInk = async () => { const f = path.join(outDir, 'shots', 'reduced-canvas.png'); await page.locator('#hero canvas').screenshot({ path: f }); return inkPixels(fs.readFileSync(f)).dark; };
    const inkBefore = await canvasInk();
    await page.setViewportSize({ width: 1200, height: 800 });   // a resize clears a canvas that is not redrawn
    await sleep(700); await twoRaf(page);
    const inkAfter = await canvasInk();
    report.runs.reduced = { ...info, canvasInk: inkBefore, canvasInkAfterResize: inkAfter, headline: head, shot: 'shots/reduced.png', consoleErrors: errs };
    check('reduced motion: finished shape on the canvas', info.mode === 'reduced-motion' && info.p === 1 && inkBefore > 500, `mode=${info.mode}, uProgress=${info.p}, canvas ink px=${inkBefore}`);
    check('reduced motion: shape survives a resize', inkAfter > 500, `canvas ink px after resize=${inkAfter}`);
    check('reduced motion: headline readable', head.found && head.visible && head.opacity === 1, `h1 found=${head.found}, visible=${head.visible}, opacity=${head.opacity}`);
    await ctx.close();
  }
  await browser.close();

  // d) WebGL disabled: the still image shows AND the words are readable over it
  log('WebGL disabled ...');
  {
    const b2 = await launchChrome(pw, ['--disable-webgl', '--disable-3d-apis']);
    const ctx = await b2.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errs = []; page.on('console', (m) => m.type() === 'error' && errs.push(m.text())); page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(base, { waitUntil: 'load' });
    await sleep(1500);
    const info = await page.evaluate(() => {
      const hero = document.querySelector('#hero'), img = hero?.querySelector('.fallback');
      const cs = img && getComputedStyle(img), r = img?.getBoundingClientRect();
      return { noWebgl: !!hero?.classList.contains('no-webgl'), mode: window.__motion?.stats?.mode, naturalWidth: img?.naturalWidth ?? 0,
        visible: !!img && cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 };
    });
    const head = await readable(page, '#hero h1');
    const nav = await page.evaluate(() => document.querySelectorAll('.nav').length);
    const onDisk = isUrl ? info.naturalWidth > 0 : fs.existsSync(path.join(siteDir, 'assets', 'fallback.png'));
    const file = path.join(outDir, 'shots', 'no-webgl.png'); await page.screenshot({ path: file });
    report.runs.noWebgl = { ...info, headline: head, fallbackOnDisk: onDisk, shot: 'shots/no-webgl.png', consoleErrors: errs };
    const ok = info.noWebgl && info.visible && info.naturalWidth > 0;
    let detail = `hero.no-webgl=${info.noWebgl}, mode=${info.mode}, img visible=${info.visible}, naturalWidth=${info.naturalWidth}`;
    if (!onDisk || info.naturalWidth === 0) detail += ' | assets/fallback.png is missing: run check_motion with --make-fallback';
    check('WebGL disabled shows fallback', ok, detail);
    check('WebGL disabled: headline readable', head.found && head.visible && head.opacity === 1 && nav === 1, `h1 found=${head.found}, visible=${head.visible}, opacity=${head.opacity}, nav bars=${nav}`);
    await ctx.close(); await b2.close();
  }

  // budgets
  const dr = report.runs.desktop, mr = report.runs.mobile;
  for (const [label, r, b] of [['desktop', dr, BUDGET.desktopP95], ['mobile', mr, BUDGET.mobileP95]]) {
    check(`${label} mode is webgl2`, r.mode === 'webgl2', `mode=${r.mode}`);
    check(`${label} frames reached 120`, r.ok, r.note || `frames=${r.frames}`);
    check(`${label} p95 frame <= ${b} ms`, r.p95Ms <= b, `p95=${r.p95Ms} ms, median=${r.medianMs} ms (${r.fps} fps), max=${r.maxMs} ms`);
  }
  // a page can reach its frame budget by quietly dropping most of its dots; that is not a pass
  check('desktop draws every dot (shed = 0)', dr.shed === 0 && dr.minDrawn === dr.total, `drawn ${dr.drawn}/${dr.total}, lowest ${dr.minDrawn}, shed events ${dr.shed}, restored ${dr.restored}`);
  check(`mobile keeps at least ${BUDGET.mobileKeepShare * 100}% of its dots`, mr.minDrawn >= mr.total * BUDGET.mobileKeepShare, `drawn ${mr.drawn}/${mr.total}, lowest ${mr.minDrawn} (${Math.round(100 * mr.minDrawn / mr.total)}%), shed events ${mr.shed}, restored ${mr.restored}`);
  for (const r of [dr, mr]) {
    check(`${r.name} page weight <= 1.5 MiB`, r.weight.localBytes <= BUDGET.localBytes, `local ${(r.weight.localBytes / MIB).toFixed(2)} MiB, CDN ${(r.weight.cdnBytes / MIB).toFixed(2)} MiB`);
  }
  const hosts = [...new Set([...dr.weight.cdnFiles, ...mr.weight.cdnFiles].map(([u]) => { try { return new URL(u).host; } catch { return u; } }))];
  report.thirdPartyHosts = hosts;
  check('third-party requests only to cdn.jsdelivr.net', hosts.every((h) => h === 'cdn.jsdelivr.net'), hosts.length ? hosts.join(', ') : 'none');
  const errsAll = [...dr.consoleErrors, ...mr.consoleErrors, ...report.runs.reduced.consoleErrors, ...report.runs.noWebgl.consoleErrors];
  report.consoleErrors = { desktop: dr.consoleErrors, mobile: mr.consoleErrors, reduced: report.runs.reduced.consoleErrors, noWebgl: report.runs.noWebgl.consoleErrors };
  check('console errors = 0 (all four runs)', errsAll.length === 0, errsAll.length ? `${errsAll.length}: ${[...new Set(errsAll)].join(' || ')}` : 'none');

  // not a pass/fail item: reminders an agent should act on
  report.warnings = [];
  const read = async (f) => (isUrl ? (await fetch(new URL(f, base))).text() : fs.readFileSync(path.join(siteDir, f), 'utf8'));
  const html = await read('index.html');
  if (/<title>\s*Your brand\b/i.test(html) || /<title>\s*brief2motion\s*<\/title>/i.test(html)) report.warnings.push('index.html still has the template <title>: write the real one (link previews and crawlers read it)');
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html) || /One or two plain sentences/.test(html)) report.warnings.push('index.html has no real <meta name="description">');
  if (/\bYour brand\b|Your headline goes here/.test(await read('config.js'))) report.warnings.push('config.js still contains the template placeholder text');

  report.checks = checks; report.pass = checks.every((c) => c.pass);
  fs.writeFileSync(path.join(outDir, 'motion-report.json'), JSON.stringify(report, null, 2));
  if (JSON_ONLY) console.log(JSON.stringify(report, null, 2));
  else {
    const row = (r) => `${r.name.padEnd(8)} ${String(r.mode).padEnd(12)} fps ${String(r.fps).padStart(5)}  p95 ${String(r.p95Ms).padStart(5)} ms  drawn ${r.drawn}/${r.total}  shed ${r.shed}  local ${(r.weight.localBytes / 1024).toFixed(0)} KB  cdn ${(r.weight.cdnBytes / 1024).toFixed(0)} KB`;
    console.log(`\nbrief2motion check  ${siteDir || base}\nChrome ${report.chrome}\n`);
    console.log(row(dr)); console.log(row(mr)); console.log('');
    for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}  (${c.detail})`);
    for (const w of report.warnings) console.log(`WARN  ${w}`);
    console.log(`\nRESULT: ${report.pass ? 'PASS' : 'FAIL'}   report: ${path.join(outDir, 'motion-report.json')}   shots: ${path.join(outDir, 'shots')}`);
    if (siteDir) console.log(`Preview the page:  python3 ${path.join(HERE, 'serve.py')} ${siteDir}   (or: node ${path.join(HERE, 'serve.mjs')} ${siteDir})`);
  }
  exitCode = report.pass ? 0 : 1;
} catch (e) {
  console.error('check_motion crashed:', e && e.stack || e); exitCode = 2;
} finally { await server.close(); }
process.exit(exitCode);
