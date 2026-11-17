#!/usr/bin/env node
// tests/browser/smoke.mjs: one real-browser test per stack. Each proves that the pattern the skill documents
// does the thing it claims, on the example that uses it:
//   node tests/browser/smoke.mjs            run them all
//   node tests/browser/smoke.mjs r3f rive   run some
// Needs Chrome and the network (the pages load their libraries from cdn.jsdelivr.net; the React Three Fiber test
// page loads from esm.sh). The rive test also downloads
// one MIT-licensed test file from the rive-wasm repository into a temporary folder; it is skipped when that fails.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, launchChrome, serveDir } from '../../skills/brief2motion/scripts/_common.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EX = (name) => path.join(ROOT, 'examples', name);
const KIT = path.join(ROOT, 'skills', 'brief2motion', 'kit');
const only = process.argv.slice(2);
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pw = await loadPlaywright();
const browser = await launchChrome(pw);

async function open(dir, { page: pg = '', reduced = false, viewport = { width: 1280, height: 800 } } = {}) {
  const srv = await serveDir(dir);
  const ctx = await browser.newContext({ viewport, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(srv.url + pg, { waitUntil: 'load' });
  await page.waitForFunction(() => document.documentElement.dataset.motion, null, { timeout: 20000 });
  return { page, errors, close: async () => { await ctx.close(); await srv.close(); } };
}
// how many pixels of a canvas differ from its top-left corner pixel: 0 means it is blank
const painted = (page, sel) => page.locator(sel).first().screenshot().then((buf) => page.evaluate(async (b64) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = new OffscreenCanvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, img.width, img.height).data; let n = 0;
  for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - d[0]) + Math.abs(d[i + 1] - d[1]) + Math.abs(d[i + 2] - d[2]) > 24) n++;
  return n;
}, buf.toString('base64')));
const scrollTo = (page, k) => page.evaluate((kk) => { const y = (document.documentElement.scrollHeight - innerHeight) * kk; if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo({ top: y, behavior: 'instant' }); }, k);

const tests = {
  // kinetic type: the heading is split into words, and a screen reader still gets the sentence
  async 'split-text'() {
    const t = await open(EX('relay'));
    const r = await t.page.evaluate(() => { const h = document.querySelector('.hero-title'); return { words: h.querySelectorAll('.word').length, hidden: h.querySelector('[aria-hidden="true"]') !== null, sr: h.firstElementChild.textContent }; });
    await t.close();
    return [r.words === 11 && r.hidden && r.sr === 'The 3 a.m. page goes to one person. The right one.' && t.errors.length === 0, `${r.words} words, visual copy aria-hidden=${r.hidden}, screen-reader text "${r.sr}", errors ${t.errors.length}`];
  },
  // Motion: the rota highlight follows the chosen day
  async motion() {
    const t = await open(EX('relay'));
    await t.page.locator('.rota').scrollIntoViewIfNeeded(); await sleep(500);
    const y0 = await t.page.$eval('.rota-highlight', (e) => e.getBoundingClientRect().top);
    await t.page.click('.rota-days button[data-day="4"]'); await sleep(900);
    const y1 = await t.page.$eval('.rota-highlight', (e) => e.getBoundingClientRect().top);
    const status = await t.page.$eval('.rota-status', (e) => e.textContent);
    await t.close();
    return [y1 - y0 > 100 && /Friday night: Wren/.test(status) && t.errors.length === 0, `highlight moved ${Math.round(y1 - y0)} px, status "${status}", errors ${t.errors.length}`];
  },
  // three.js: the stage draws, a colourway repaints it, reduced motion reports itself
  async three() {
    const t = await open(EX('halden-one')); await sleep(1200);
    const px = await painted(t.page, '.stage canvas');
    const before = await t.page.locator('.stage canvas').screenshot();
    await scrollTo(t.page, 0.7); await sleep(900);
    await t.page.click('.swatches button[data-colour="#cf4a17"]'); await sleep(900);
    const after = await t.page.locator('.stage canvas').screenshot();
    await t.close();
    const r = await open(EX('halden-one'), { reduced: true }); const state = await r.page.evaluate(() => document.documentElement.dataset.motion); await r.close();
    return [px > 20000 && !before.equals(after) && state === 'reduced' && t.errors.length === 0, `${px} painted pixels, repaint changed the canvas=${!before.equals(after)}, reduced state "${state}", errors ${t.errors.length}`];
  },
  // React Three Fiber + drei: the documented turntable component renders
  async r3f() {
    const t = await open(path.join(ROOT, 'tests', 'fixtures', 'r3f')); await sleep(1500);
    const px = await painted(t.page, 'canvas'); await t.close();
    return [px > 5000 && t.errors.length === 0, `${px} painted pixels, errors ${t.errors.length}${t.errors.length ? ': ' + t.errors[0].slice(0, 120) : ''}`];
  },
  // GSAP ScrollTrigger + image sequence: the picture on the canvas depends on the scroll position
  async 'scroll-sequence'() {
    const t = await open(EX('tidewater')); await sleep(1500);
    const pin = await t.page.evaluate(() => document.querySelector('.pin-spacer') !== null);
    const top = await t.page.evaluate(() => document.querySelector('.seq').getBoundingClientRect().top + scrollY);
    // bright pixels = salt cubes: few when the scene starts, many near its end
    const bright = (extra) => t.page.evaluate((y) => window.__lenis.scrollTo(y, { immediate: true, force: true }), top + extra).then(() => sleep(900)).then(() => t.page.evaluate(() => {
      const c = document.querySelector('.seq-media canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 200) n++;
      return n / (d.length / 4);
    }));
    const early = await bright(150), late = await bright(1900);
    await t.close();
    return [pin && early < 0.02 && late > 0.08 && t.errors.length === 0, `pinned=${pin}, share of salt-white pixels early ${(early * 100).toFixed(1)}%, late ${(late * 100).toFixed(1)}%, errors ${t.errors.length}`];
  },
  // View Transitions: a card click morphs its poster into the next page's hero, both ways
  async 'view-transitions'() {
    const srv = await serveDir(EX('halvorsen'));
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.addInitScript(() => { addEventListener('pagereveal', (e) => { e.viewTransition?.ready.then(() => { document.documentElement.dataset.vtParts = [...new Set(document.getAnimations().map((a) => a.effect?.pseudoElement).filter(Boolean))].join(' '); }); }); });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(srv.url, { waitUntil: 'load' }); await sleep(1000);
    await page.click('.card a[href="work/quay.html"]'); await page.waitForURL('**/work/quay.html'); await sleep(1000);
    const fwd = await page.evaluate(() => document.documentElement.dataset.vtParts || '');
    await page.goBack(); await sleep(1000);
    const back = await page.evaluate(() => document.documentElement.dataset.vtParts || '');
    const filtered = await page.evaluate(async () => { document.querySelector('[data-filter="Mono"]').click(); await new Promise((r) => setTimeout(r, 700)); return document.querySelectorAll('.card:not([hidden])').length; });
    await ctx.close(); await srv.close();
    const pair = (s) => s.includes('::view-transition-old(hero-media)') && s.includes('::view-transition-new(hero-media)');
    return [pair(fwd) && pair(back) && filtered === 1 && errors.length === 0, `poster morphs into the project=${pair(fwd)}, and back=${pair(back)}, filter leaves ${filtered} card, errors ${errors.length}`];
  },
  // SVG + D3 scales: the chart reaches the last year and its real value
  async 'data-story'() {
    const t = await open(EX('keeling'));
    await t.page.evaluate(() => document.querySelector('.step[data-step="3"]').scrollIntoView({ block: 'center', behavior: 'instant' })); await sleep(2600);
    const r = await t.page.evaluate(() => ({ year: document.querySelector('.readout-year').textContent, value: document.querySelector('.readout-value b').textContent, active: document.querySelector('.step.is-active')?.dataset.step, clip: Number(document.querySelector('#reveal rect').getAttribute('width')) }));
    await t.close();
    return [r.year === '2025' && r.value === '427.35' && r.active === '3' && r.clip > 690 && t.errors.length === 0, `readout ${r.year} ${r.value} ppm, active step ${r.active}, line revealed to x=${Math.round(r.clip)}, errors ${t.errors.length}`];
  },
  // Motion for React: keyboard reorder, and the shopping count follows a tick
  async 'motion-react'() {
    const t = await open(EX('mise')); await sleep(600);
    const names = () => t.page.$$eval('.row-name', (els) => els.map((e) => e.textContent));
    const first = (await names())[0];
    await t.page.focus('.row'); await t.page.keyboard.press('Space'); await t.page.keyboard.press('ArrowDown'); await t.page.keyboard.press('Space'); await sleep(700);
    const moved = (await names())[1] === first;
    await t.page.click('#tab-shop'); await sleep(600);
    const before = await t.page.$eval('.panel-head p', (e) => e.textContent);
    await t.page.click('.shop-item >> nth=0'); await sleep(900);
    const after = await t.page.$eval('.panel-head p', (e) => e.textContent), badge = await t.page.$eval('.badge', (e) => e.textContent);
    await t.close();
    return [moved && before === '16 left to buy' && after === '15 left to buy' && badge === '15' && t.errors.length === 0, `keyboard reorder moved the row=${moved}, "${before}" -> "${after}", badge ${badge}, errors ${t.errors.length}`];
  },
  // Lottie: the player mounts an SVG, plays while visible, and holds one frame with reduced motion
  async lottie() {
    const t = await open(EX('sprout'));
    await t.page.locator('.cards').scrollIntoViewIfNeeded(); await sleep(2500);
    const svgs = await t.page.$$eval('.lottie svg', (e) => e.length);
    const a = await t.page.locator('.lottie').nth(1).screenshot(); await sleep(500); const b = await t.page.locator('.lottie').nth(1).screenshot();
    await t.close();
    const r = await open(EX('sprout'), { reduced: true }); await r.page.locator('.cards').scrollIntoViewIfNeeded(); await sleep(2500);
    const c = await r.page.locator('.lottie').nth(1).screenshot(); await sleep(500); const d = await r.page.locator('.lottie').nth(1).screenshot();
    const rsvgs = await r.page.$$eval('.lottie svg', (e) => e.length); await r.close();
    return [svgs === 3 && !a.equals(b) && rsvgs === 3 && c.equals(d) && t.errors.length === 0, `${svgs} players mounted, playing=${!a.equals(b)}, reduced motion: ${rsvgs} mounted and still=${c.equals(d)}, errors ${t.errors.length}`];
  },
  // Rive: kit/players.js mountRive() draws a .riv file (downloaded for the test, never shipped)
  async rive() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b2m-rive-'));
    try {
      const res = await fetch('https://raw.githubusercontent.com/rive-app/rive-wasm/master/js/examples/_frameworks/parcel_example_canvas/ball.riv', { signal: AbortSignal.timeout(20000) });
      if (!res.ok) return ['skip', `could not download the test file (${res.status})`];
      fs.cpSync(path.join(ROOT, 'tests', 'fixtures', 'rive'), dir, { recursive: true }); fs.cpSync(KIT, path.join(dir, 'kit'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'test.riv'), Buffer.from(await res.arrayBuffer()));
    } catch (e) { return ['skip', `could not download the test file (${e.message})`]; }
    const t = await open(dir); await sleep(1500);
    const px = await painted(t.page, 'canvas'); await t.close(); fs.rmSync(dir, { recursive: true, force: true });
    return [px > 500 && t.errors.length === 0, `${px} painted pixels, errors ${t.errors.length}${t.errors.length ? ': ' + t.errors[0].slice(0, 120) : ''}`];
  },
  // the dust engine still reports its state the way every other page does
  async particles() {
    const t = await open(EX('copper-no-7')); await sleep(3500);
    const r = await t.page.evaluate(() => ({ state: document.documentElement.dataset.motion, mode: window.__motion?.stats?.mode, drawn: window.__motion?.stats?.drawn, total: window.__motion?.stats?.total }));
    await t.close();
    return [r.state === 'ready' && r.mode === 'webgl2' && r.drawn === r.total && r.total > 1000 && t.errors.length === 0, `state "${r.state}", mode ${r.mode}, ${r.drawn}/${r.total} dots, errors ${t.errors.length}`];
  },
};

for (const [name, fn] of Object.entries(tests)) {
  if (only.length && !only.includes(name)) continue;
  try {
    const [ok, detail] = await fn();
    results.push({ name, ok, detail });
    console.log(`${ok === 'skip' ? 'SKIP' : ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`);
  } catch (e) { results.push({ name, ok: false, detail: String(e.message || e) }); console.log(`FAIL  ${name}  (${String(e.message || e).split('\n')[0]})`); }
}
await browser.close();
const failed = results.filter((r) => r.ok === false).length, skipped = results.filter((r) => r.ok === 'skip').length;
console.log(`\n${results.length - failed - skipped} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed ? 1 : 0);
