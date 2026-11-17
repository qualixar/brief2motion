#!/usr/bin/env node
// check_site.mjs: measure any brief2motion site in real Chrome, whatever stack it uses.
//   node check_site.mjs <site-dir | http://localhost:PORT/> [--out <dir>] [--pages a.html,b.html] [--json] [--no-perf]
// What it checks, on every page listed (index.html always):
//   frame rate    desktop 1440x900 and an emulated phone (390x844, touch, CPU slowed 4x): p95 frame time while idle and scrolling
//   layout        no sideways scroll at 1440, 390 and 320 px wide, at every scroll stop; tap targets at least 24 px
//   reduced       with prefers-reduced-motion: the page says so, nothing keeps animating, the canvas holds still,
//                 every heading and paragraph is visible, and normal scrolling still works
//   no WebGL      the headline is readable and a still stands in for every WebGL canvas
//   no JavaScript something readable is on the page
//   console       no errors in any run; requests only to the page itself and cdn.jsdelivr.net
//   weight        files served from the project, per page: 1.5 MiB or less
//   basics        one <h1>, lang, title, description, viewport, alt text, text contrast (WCAG AA), visible focus ring
// The page must set <html data-motion="ready | reduced | static"> when its motion is set up (kit/motion-core.js signal()).
// Exit 0 only if every check passes. 1 if a check fails. 2 if the tool itself cannot run.
// --no-perf skips the frame-time budgets (for CI machines with no GPU, where the numbers mean nothing).
import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright, launchChrome, serveDir, HERE } from './_common.mjs';
import { percentile, contrastRatio, parseColor, blend, verdict } from './_measure.mjs';

export const BUDGET = { desktopP95: 20, mobileP95: 40, localBytes: 1.5 * 1024 * 1024, tapTarget: 24, contrast: 4.5, contrastLarge: 3 };
const MIB = 1024 * 1024;
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 }, small: { width: 320, height: 640 } };

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const valueFlags = new Set(['--out', '--pages']);
const site = argv.find((a, i) => !a.startsWith('--') && !valueFlags.has(argv[i - 1]));
const USAGE = 'usage: node check_site.mjs <site-dir | http://localhost:PORT/> [--out <dir>] [--pages a.html,b.html] [--json] [--no-perf]';
if (flag('-h') || flag('--help')) { console.log(USAGE); process.exit(0); }
if (!site) { console.error(USAGE); process.exit(2); }
const isUrl = /^https?:\/\//i.test(site);
const siteDir = isUrl ? null : path.resolve(site);
if (!isUrl && !fs.existsSync(path.join(siteDir, 'index.html'))) { console.error(`no index.html in ${siteDir}`); process.exit(2); }
const outDir = path.resolve(opt('--out') || (isUrl ? 'check' : path.join(path.dirname(siteDir), 'check')));
const JSON_ONLY = flag('--json'), PERF = !flag('--no-perf');
const pages = ['index.html', ...(opt('--pages') || '').split(',').map((s) => s.trim()).filter(Boolean)];
fs.mkdirSync(path.join(outDir, 'shots'), { recursive: true });
const log = (...a) => { if (!JSON_ONLY) console.error(...a); };

const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
const r1 = (n) => Math.round(n * 10) / 10;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (p) => p.replace(/\.html$/, '').replace(/[^a-z0-9]+/gi, '-');

const SAMPLER = `
  window.__raf = { times: [], on: false, last: 0 };
  (function loop(t) { const r = window.__raf; if (r.on && r.last) r.times.push(t - r.last); r.last = t; requestAnimationFrame(loop); })(0);
`;

function watch(page, cdp, acc, origin) {
  page.on('console', (m) => { if (m.type() === 'error') acc.errors.push(`${m.text()}${m.location().url ? ' @ ' + m.location().url.replace(origin, '') : ''}`); });
  page.on('pageerror', (e) => acc.errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => { const why = r.failure()?.errorText || ''; if (!/ERR_ABORTED/.test(why)) acc.errors.push(`requestfailed: ${r.url().replace(origin, '')} (${why})`); });
  if (!cdp) return;
  const urls = new Map();
  cdp.on('Network.responseReceived', (e) => urls.set(e.requestId, e.response.url));
  cdp.on('Network.loadingFinished', (e) => {
    const u = urls.get(e.requestId); if (!u || u.startsWith('data:') || u.startsWith('blob:')) return;
    const local = u.startsWith(origin);
    acc[local ? 'localBytes' : 'cdnBytes'] += e.encodedDataLength;
    if (!local) { try { acc.hosts.add(new URL(u).host); } catch { /* not a URL */ } }
  });
}
const newAcc = () => ({ errors: [], localBytes: 0, cdnBytes: 0, hosts: new Set() });

const waitReady = (page, ms = 20000) => page.waitForFunction(() => document.documentElement.dataset.motion, null, { timeout: ms }).then(() => true).catch(() => false);
const motionState = (page) => page.evaluate(() => document.documentElement.dataset.motion || null);
const maxScroll = (page) => page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
const jump = (page, y) => page.evaluate((yy) => { if (window.__lenis?.scrollTo) window.__lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo({ top: yy, behavior: 'instant' }); }, y);
const settle = async (page, ms = 350) => { await sleep(ms); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); };

// frame times for 2 s of idle at the top, then a 6 s scroll to the bottom at constant speed
async function sampleFrames(page) {
  await page.evaluate(() => { window.__raf.times = []; window.__raf.on = true; });
  await sleep(2000);
  await page.evaluate((dur) => new Promise((done) => {
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    if (window.__lenis?.scrollTo) {
      window.__lenis.scrollTo(max, { duration: dur, easing: (t) => t, force: true, onComplete: () => setTimeout(done, 300) });
      setTimeout(done, dur * 1000 + 1500);
    } else {
      const t0 = performance.now();
      (function step(t) { const k = Math.min(1, (t - t0) / (dur * 1000)); window.scrollTo({ top: max * k, behavior: 'instant' }); k < 1 ? requestAnimationFrame(step) : setTimeout(done, 300); })(t0);
    }
  }), 6);
  return page.evaluate(() => { window.__raf.on = false; return window.__raf.times; });
}

// runs in the page: layout facts at the current scroll position
const LAYOUT_PROBE = () => {
  const vw = document.documentElement.clientWidth;
  const over = document.documentElement.scrollWidth - vw;
  const offenders = [];
  if (over > 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed') {
        let clipped = false;
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const o = getComputedStyle(n).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { clipped = true; break; } }
        if (!clipped) offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''} right=${Math.round(r.right)}`);
      }
      if (offenders.length >= 4) break;
    }
  }
  return { vw, over, offenders };
};

const TAP_PROBE = (min) => {
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])')) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
    if (el.classList.contains('skip-link')) continue;                       // off screen until focused
    if (el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, figcaption, small, dd, td')) continue;   // links inside a sentence are exempt (WCAG 2.5.8)
    if (Math.min(r.width, r.height) < min - 0.5) small.push(`${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  return small;
};

const BASICS_PROBE = () => {
  const d = document, meta = (n) => d.querySelector(`meta[name="${n}"]`)?.getAttribute('content') || '';
  return {
    h1: d.querySelectorAll('h1').length, lang: d.documentElement.lang || '', title: d.title || '', description: meta('description'), viewport: meta('viewport'),
    imgsNoAlt: [...d.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).map((i) => (i.getAttribute('src') || '').split('/').pop()).slice(0, 5),
    skip: !!d.querySelector('.skip-link, a[href="#main"], a[href="#content"]'), main: !!d.querySelector('main'),
    webglCanvases: d.querySelectorAll('canvas[data-webgl]').length,
  };
};

// runs in the page: every text-bearing element in view -> its colours, size and how visible it is
const TEXT_PROBE = () => {
  const out = []; const vh = innerHeight, vw = innerWidth;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (el.closest('[aria-hidden="true"], noscript, script, style, svg, .sr-only, .skip-link, [data-check-skip]')) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.display === 'none' || r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
    if (cs.clipPath && /inset\(50%\)/.test(cs.clipPath)) continue;
    // background: every colour layer from the text outwards, until a solid one. A see-through panel is only as
    // dark or light as what is behind it, so the layers are blended later; a picture or gradient in the stack
    // means there is no single colour to measure.
    let opacity = 1, hidden = cs.visibility === 'hidden', unknownBg = false, solid = false; const layers = [];
    for (let a = el; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      opacity *= Number(s.opacity);
      if (solid || unknownBg) continue;
      if (s.backgroundImage && s.backgroundImage !== 'none') { unknownBg = true; continue; }
      if (s.backdropFilter && s.backdropFilter !== 'none') { unknownBg = true; continue; }
      const c = s.backgroundColor;
      if (!c || /rgba?\(0, 0, 0, 0\)|transparent/.test(c)) continue;
      layers.push(c);
      const m = c.match(/rgba?\(([^)]+)\)/); const parts = m ? m[1].split(/[\s,/]+/).filter(Boolean) : [];
      if (parts.length < 4 || parseFloat(parts[3]) >= 1) solid = true;
    }
    const bg = layers.length ? layers : null;
    // text drawn over a picture, video or canvas has no single background colour: not measured here, look at the screenshots
    const under = document.elementsFromPoint(Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), Math.min(vh - 1, Math.max(0, r.top + r.height / 2)));
    const overMedia = under.some((u) => u !== el && !el.contains(u) && /^(CANVAS|IMG|VIDEO|PICTURE|svg)$/.test(u.tagName) && getComputedStyle(u).visibility !== 'hidden' && Number(getComputedStyle(u).opacity) > 0.05);
    out.push({
      tag: el.tagName.toLowerCase(), cls: el.classList[0] || '', text: n.nodeValue.trim().slice(0, 40),
      color: cs.color, bg, unknownBg: unknownBg || overMedia, opacity: Math.round(opacity * 100) / 100, hidden,
      size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight) || 400, block: /^(H[1-6]|P|LI|BLOCKQUOTE|FIGCAPTION|DT|DD|TD|TH)$/.test(el.tagName),
    });
  }
  return out;
};

async function eachStop(page, fn, { stops = 6 } = {}) {
  const max = await maxScroll(page); const out = [];
  const n = max <= 0 ? 1 : stops;
  for (let i = 0; i < n; i++) { await jump(page, n === 1 ? 0 : Math.round(max * i / (n - 1))); await settle(page, 300); out.push(await fn(i)); }
  return out;
}

async function openPage(browser, url, origin, { viewport, mobile = false, throttle = 1, reduced = false, js = true }) {
  const ctx = await browser.newContext({ viewport, ...(mobile ? { deviceScaleFactor: 3, isMobile: true, hasTouch: true } : {}), javaScriptEnabled: js, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(SAMPLER);
  const page = await ctx.newPage();
  const acc = newAcc(); let cdp = null;
  if (js) { cdp = await ctx.newCDPSession(page); await cdp.send('Network.enable'); if (throttle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
  watch(page, cdp, acc, origin);
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  return { ctx, page, acc };
}

const server = isUrl ? { url: site.endsWith('/') ? site : `${site}/`, close: async () => {} } : await serveDir(siteDir);
const base = server.url, origin = new URL(base).origin;
const pw = await loadPlaywright();
const report = { tool: 'check_site', site: isUrl ? origin : path.basename(siteDir), when: new Date().toISOString(), budgets: BUDGET, perfMeasured: PERF, chrome: null, pages: {} };
let exitCode = 1;
try {
  const browser = await launchChrome(pw);
  report.chrome = browser.version();
  const hosts = new Set(); const allErrors = {};

  for (const pg of pages) {
    const url = new URL(pg, base).href, tag = slug(pg), P = (pages.length > 1 ? `[${pg}] ` : '');
    const rep = report.pages[pg] = {};
    log(`${pg}: desktop ...`);

    // ---- desktop: ready signal, frames, layout, basics, focus ----
    {
      const { ctx, page, acc } = await openPage(browser, url, origin, { viewport: VIEWPORTS.desktop });
      const ready = await waitReady(page);
      rep.state = await motionState(page);
      check(`${P}page signals its motion state`, ready, ready ? `<html data-motion="${rep.state}">` : 'never set <html data-motion>: call signal() from kit/motion-core.js when motion is set up');
      await settle(page, 600);
      if (PERF) {
        const times = await sampleFrames(page);
        rep.desktop = { samples: times.length, medianMs: r1(percentile(times, 0.5)), p95Ms: r1(percentile(times, 0.95)), maxMs: r1(Math.max(...times)), fps: r1(1000 / percentile(times, 0.5)) };
        check(`${P}desktop p95 frame <= ${BUDGET.desktopP95} ms`, rep.desktop.p95Ms <= BUDGET.desktopP95, `p95=${rep.desktop.p95Ms} ms, median=${rep.desktop.medianMs} ms (${rep.desktop.fps} fps), max=${rep.desktop.maxMs} ms, ${times.length} frames`);
      }
      rep.shots = [];
      const lay = await eachStop(page, async (i) => {
        const f = path.join(outDir, 'shots', `${tag}-desktop-${i}.png`); await page.screenshot({ path: f }); rep.shots.push(path.relative(outDir, f));
        return page.evaluate(LAYOUT_PROBE);
      });
      const worst = lay.reduce((a, b) => (b.over > a.over ? b : a));
      check(`${P}desktop: no sideways scroll`, worst.over <= 1, worst.over <= 1 ? `${lay.length} scroll stops at ${worst.vw} px` : `page is ${worst.over} px wider than the screen: ${worst.offenders.join('; ') || 'offender not found'}`);

      const b = rep.basics = await page.evaluate(BASICS_PROBE);
      check(`${P}one <h1>`, b.h1 === 1, `${b.h1} found`);
      check(`${P}<html lang> set`, b.lang.length >= 2, b.lang || 'missing');
      check(`${P}real <title> and description`, b.title.length >= 10 && b.description.length >= 50, `title ${b.title.length} chars, description ${b.description.length} chars (need 10 and 50)`);
      check(`${P}viewport meta allows zoom`, /width=device-width/.test(b.viewport) && !/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(b.viewport), b.viewport || 'missing');
      check(`${P}every <img> has alt`, b.imgsNoAlt.length === 0, b.imgsNoAlt.length ? `missing on ${b.imgsNoAlt.join(', ')}` : 'ok');
      check(`${P}<main> landmark and a skip link`, b.main && b.skip, `main=${b.main}, skip link=${b.skip}`);

      // keyboard: Tab through the first stops; each one must be on screen with a visible focus ring
      await jump(page, 0); await settle(page, 200);
      const focus = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        // the browser scrolls the focused element into view; with smooth scrolling that takes a moment
        await page.waitForFunction(() => { const el = document.activeElement; if (!el || el === document.body) return true; const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }, null, { timeout: 1500 }).catch(() => {});
        await sleep(120);
        const f = await page.evaluate(() => {
          const el = document.activeElement; if (!el || el === document.body) return null;
          const cs = getComputedStyle(el), r = el.getBoundingClientRect();
          const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1) || (cs.boxShadow && cs.boxShadow !== 'none');
          return { what: `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20)}"`, ring: !!ring,
            onScreen: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width > 0 };
        });
        if (f) focus.push(f);
      }
      rep.focus = focus;
      const badFocus = focus.filter((f) => !f.ring || !f.onScreen);
      check(`${P}keyboard focus is visible`, focus.length > 0 && badFocus.length === 0, focus.length === 0 ? 'Tab reached nothing' : badFocus.length ? badFocus.map((f) => `${f.what}${f.ring ? '' : ' no ring'}${f.onScreen ? '' : ' off screen'}`).join('; ') : `${focus.length} stops, all ringed and on screen`);
      rep.weightDesktop = { localBytes: acc.localBytes, cdnBytes: acc.cdnBytes };
      check(`${P}desktop page weight <= 1.5 MiB`, acc.localBytes <= BUDGET.localBytes, `local ${(acc.localBytes / MIB).toFixed(2)} MiB, CDN ${(acc.cdnBytes / MIB).toFixed(2)} MiB`);
      acc.hosts.forEach((h) => hosts.add(h)); allErrors[`${pg} desktop`] = acc.errors;
      await ctx.close();
    }

    // ---- phone: frames, layout, tap targets ----
    log(`${pg}: phone ...`);
    {
      const { ctx, page, acc } = await openPage(browser, url, origin, { viewport: VIEWPORTS.phone, mobile: true, throttle: PERF ? 4 : 1 });
      await waitReady(page); await settle(page, 600);
      if (PERF) {
        const times = await sampleFrames(page);
        rep.phone = { samples: times.length, medianMs: r1(percentile(times, 0.5)), p95Ms: r1(percentile(times, 0.95)), maxMs: r1(Math.max(...times)), fps: r1(1000 / percentile(times, 0.5)) };
        check(`${P}phone p95 frame <= ${BUDGET.mobileP95} ms`, rep.phone.p95Ms <= BUDGET.mobileP95, `p95=${rep.phone.p95Ms} ms, median=${rep.phone.medianMs} ms (${rep.phone.fps} fps), max=${rep.phone.maxMs} ms, ${times.length} frames`);
      }
      const taps = new Set();
      const lay = await eachStop(page, async (i) => {
        if (i % 2 === 0) { const f = path.join(outDir, 'shots', `${tag}-phone-${i}.png`); await page.screenshot({ path: f }); rep.shots.push(path.relative(outDir, f)); }
        (await page.evaluate(TAP_PROBE, BUDGET.tapTarget)).forEach((t) => taps.add(t));
        return page.evaluate(LAYOUT_PROBE);
      });
      const worst = lay.reduce((a, b) => (b.over > a.over ? b : a));
      check(`${P}phone: no sideways scroll`, worst.over <= 1, worst.over <= 1 ? `${lay.length} scroll stops at ${worst.vw} px` : `page is ${worst.over} px wider than the screen: ${worst.offenders.join('; ') || 'offender not found'}`);
      check(`${P}phone: tap targets >= ${BUDGET.tapTarget} px`, taps.size === 0, taps.size ? [...taps].slice(0, 6).join('; ') : 'ok');
      rep.weightPhone = { localBytes: acc.localBytes, cdnBytes: acc.cdnBytes };
      check(`${P}phone page weight <= 1.5 MiB`, acc.localBytes <= BUDGET.localBytes, `local ${(acc.localBytes / MIB).toFixed(2)} MiB, CDN ${(acc.cdnBytes / MIB).toFixed(2)} MiB`);
      acc.hosts.forEach((h) => hosts.add(h)); allErrors[`${pg} phone`] = acc.errors;
      // the narrowest phones still in use
      // loaded fresh at that width, as such a phone would: an emulated phone that is resized after loading keeps
      // reporting its old width to scripts whenever the old layout is wider than the new screen
      await page.setViewportSize(VIEWPORTS.small); await page.reload({ waitUntil: 'load' }); await waitReady(page); await settle(page, 700);
      const lay2 = await eachStop(page, () => page.evaluate(LAYOUT_PROBE), { stops: 4 });
      const w2 = lay2.reduce((a, b) => (b.over > a.over ? b : a));
      check(`${P}320 px wide: no sideways scroll`, w2.over <= 1, w2.over <= 1 ? `${lay2.length} scroll stops` : `page is ${w2.over} px wider than the screen: ${w2.offenders.join('; ') || 'offender not found'}`);
      await ctx.close();
    }

    // ---- reduced motion ----
    log(`${pg}: reduced motion ...`);
    {
      const { ctx, page, acc } = await openPage(browser, url, origin, { viewport: VIEWPORTS.desktop, reduced: true });
      await waitReady(page); await settle(page, 1500);
      const state = await motionState(page);
      check(`${P}reduced motion: page says so`, state === 'reduced' || state === 'static', `<html data-motion="${state}"> (want "reduced")`);
      const running = await page.evaluate(() => document.getAnimations().filter((a) => {
        if (a.playState !== 'running') return false;
        const t = a.effect?.getComputedTiming?.() || {};
        return t.iterations === Infinity || (Number(t.duration) || 0) > 250;
      }).map((a) => `${a.animationName || a.transitionProperty || a.id || 'script animation'} on ${a.effect?.target?.tagName?.toLowerCase() || '?'}.${a.effect?.target?.classList?.[0] || ''}`).slice(0, 6));
      check(`${P}reduced motion: nothing keeps animating`, running.length === 0, running.length ? running.join('; ') : 'no running animation longer than 250 ms');
      const max = await maxScroll(page);
      let still = true; const where = [];
      for (const k of [0, 0.5, 1]) {
        await jump(page, Math.round(max * k)); await settle(page, 500);
        // a picture that is still arriving is not motion: wait for the images on screen before comparing
        await page.waitForFunction(() => [...document.images].every((im) => { const r = im.getBoundingClientRect(); return r.bottom < 0 || r.top > innerHeight || r.width === 0 || im.complete; }), null, { timeout: 5000 }).catch(() => {});
        await settle(page, 300);
        const a = await page.screenshot(); await sleep(700); const b = await page.screenshot();
        if (!a.equals(b)) { still = false; where.push(`${Math.round(k * 100)}%`); }
        if (k === 0) fs.writeFileSync(path.join(outDir, 'shots', `${tag}-reduced.png`), b);
      }
      check(`${P}reduced motion: the picture holds still`, still, still ? 'two screenshots 0.7 s apart match at 0%, 50% and 100% scroll' : `pixels changed at ${where.join(', ')} scroll`);
      // every heading and paragraph visible; contrast measured here, where nothing is mid-fade
      // A pinned scene may show its captions one at a time, so text is judged over the whole scroll: every heading
      // and paragraph must be fully visible at some stop (stops are half a screen apart).
      const best = new Map(), low = new Set(); let measured = 0, skipped = 0;
      const stops = Math.min(60, Math.max(8, Math.ceil(max / (VIEWPORTS.desktop.height / 2)) + 1));
      await eachStop(page, async () => {
        for (const t of await page.evaluate(TEXT_PROBE)) {
          if (t.block) { const key = `${t.tag}.${t.cls} "${t.text}"`; best.set(key, Math.max(best.get(key) ?? 0, t.hidden ? 0 : t.opacity)); }
          if (t.hidden) continue;
          if (t.unknownBg || t.opacity < 0.99) { skipped++; continue; }
          // blend the background layers from the page (white) up to the one nearest the text
          let bgc = { r: 255, g: 255, b: 255, a: 1 }, bad = false;
          for (const layer of [...(t.bg || [])].reverse()) { const c = parseColor(layer); if (!c) { bad = true; break; } bgc = blend(c, bgc); }
          const fg = parseColor(t.color); if (!fg || bad) { skipped++; continue; }
          const ratio = contrastRatio(blend(fg, bgc), bgc); measured++;
          const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700);
          if (ratio < (large ? BUDGET.contrastLarge : BUDGET.contrast) - 0.05) low.add(`${t.tag}.${t.cls} "${t.text}" ${ratio.toFixed(2)}:1 (${t.color} on ${(t.bg || ['white']).join(' over ')})`);
        }
      }, { stops });
      const dim = [...best].filter(([, o]) => o < 0.99).map(([k, o]) => `${k} best opacity ${o}`);
      rep.contrast = { measured, notMeasured: skipped, failures: [...low] };
      check(`${P}reduced motion: all text visible`, dim.length === 0, dim.length ? dim.slice(0, 5).join('; ') : `${best.size} headings and paragraphs, each fully visible at some point of the scroll (${stops} stops)`);
      check(`${P}text contrast meets WCAG AA`, low.size === 0, low.size ? [...low].slice(0, 5).join('; ') : `${measured} text runs measured, ${skipped} over pictures or canvas not measured (look at the screenshots)`);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await settle(page, 200);
      const want = Math.min(400, max);
      const got = await page.evaluate(async (y) => { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 250)); return Math.round(scrollY); }, want);
      check(`${P}reduced motion: normal scrolling works`, Math.abs(got - want) <= 2, `asked for ${want}px, page is at ${got}px`);
      allErrors[`${pg} reduced`] = acc.errors;
      await ctx.close();
    }

    // ---- JavaScript off ----
    log(`${pg}: JavaScript off ...`);
    {
      const { ctx, page } = await openPage(browser, url, origin, { viewport: VIEWPORTS.desktop, js: false });
      await sleep(400);
      await page.screenshot({ path: path.join(outDir, 'shots', `${tag}-nojs.png`) });
      const body = await page.locator('body').innerText().catch(() => '');
      const h1 = await page.locator('h1').first().isVisible().catch(() => false);
      rep.noJs = { h1Visible: h1, visibleChars: body.trim().length };
      check(`${P}JavaScript off: the page still reads`, body.trim().length >= 80, h1 ? `headline visible, ${body.trim().length} characters of text` : `${body.trim().length} characters of text${body.trim().length >= 80 ? ' (from <noscript>; the content itself needs JavaScript)' : ': add the content to the HTML or a <noscript> message'}`);
      await ctx.close();
    }
  }
  await browser.close();

  // ---- WebGL off (index only): a separate browser, started without WebGL ----
  log('WebGL off ...');
  {
    const b2 = await launchChrome(pw, ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis']);
    const { ctx, page, acc } = await openPage(b2, base, origin, { viewport: VIEWPORTS.desktop });
    await waitReady(page); await settle(page, 1200);
    const info = await page.evaluate(() => {
      const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el), r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5 && r.width > 8 && r.height > 8; };
      const h1 = document.querySelector('h1'); let op = 1; for (let n = h1; n; n = n.parentElement) op *= Number(getComputedStyle(n).opacity);
      return { state: document.documentElement.dataset.motion || null, webgl: document.querySelectorAll('canvas[data-webgl]').length,
        fallbacks: [...document.querySelectorAll('[data-fallback]')].filter(vis).length, h1: !!h1 && vis(h1) && op > 0.98 };
    });
    await page.screenshot({ path: path.join(outDir, 'shots', 'index-no-webgl.png') });
    report.noWebgl = info;
    check('WebGL off: headline readable', info.h1, `h1 visible=${info.h1}, state=${info.state}`);
    check('WebGL off: a still stands in for each WebGL canvas', info.webgl === 0 || info.fallbacks >= 1, info.webgl === 0 ? 'the page has no canvas[data-webgl]' : `${info.webgl} WebGL canvas, ${info.fallbacks} visible [data-fallback]`);
    allErrors['index.html no-webgl'] = acc.errors;
    await ctx.close(); await b2.close();
  }

  report.thirdPartyHosts = [...hosts];
  check('third-party requests only to cdn.jsdelivr.net', [...hosts].every((h) => h === 'cdn.jsdelivr.net'), hosts.size ? [...hosts].join(', ') : 'none');
  report.consoleErrors = allErrors;
  const flat = Object.entries(allErrors).flatMap(([k, v]) => v.map((e) => `${k}: ${e}`));
  check('console errors = 0 (every run)', flat.length === 0, flat.length ? `${flat.length}: ${[...new Set(flat)].slice(0, 6).join(' || ')}` : `none in ${Object.keys(allErrors).length} runs`);

  report.checks = checks; report.pass = verdict(checks);
  fs.writeFileSync(path.join(outDir, 'site-report.json'), JSON.stringify(report, null, 2));
  if (JSON_ONLY) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`\nbrief2motion site check  ${siteDir || base}\nChrome ${report.chrome}${PERF ? '' : '   (frame-time budgets skipped: --no-perf)'}\n`);
    for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}  (${c.detail})`);
    console.log(`\nRESULT: ${report.pass ? 'PASS' : 'FAIL'}   ${checks.filter((c) => c.pass).length}/${checks.length} checks   report: ${path.join(outDir, 'site-report.json')}   shots: ${path.join(outDir, 'shots')}`);
    if (siteDir) console.log(`Preview the page:  python3 ${path.join(HERE, 'serve.py')} ${siteDir}`);
  }
  exitCode = report.pass ? 0 : 1;
} catch (e) {
  console.error('check_site crashed:', (e && e.stack) || e); exitCode = 2;
} finally { await server.close(); }
process.exit(exitCode);
