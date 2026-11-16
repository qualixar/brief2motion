#!/usr/bin/env node
// capture_frames.mjs: deterministic scroll-through of a brief2motion site to numbered PNGs.
//   node capture_frames.mjs <site-dir> <frames-dir> --seconds 12 --fps 60 --size 1920x1080
// Frame i sets the scroll position to max*i/(N-1), waits two rAFs, and screenshots. Scrub smoothing is
// collapsed (gsap global timeScale) so each frame shows exactly its scroll position, not a lagging one.
// Pages with nothing to scroll (timed hero) are driven by seeking gsap's global timeline instead.
import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright, launchChrome, serveDir } from './_common.mjs';

const a = process.argv.slice(2);
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const [site, outDir] = a.filter((x, i) => !x.startsWith('--') && !String(a[i - 1] || '').startsWith('--'));
if (!site || !outDir) { console.error('usage: capture_frames.mjs <site-dir> <frames-dir> [--seconds 12] [--fps 60] [--size 1920x1080]'); process.exit(2); }
const seconds = Number(opt('--seconds', 12)), fps = Number(opt('--fps', 60));
const [W, H] = opt('--size', '1920x1080').split('x').map(Number);
// default: the hands-free ?play timeline, seeked frame by frame (deterministic). --mode scroll = scroll-through.
const mode = opt('--mode', 'play');
const N = Math.max(2, Math.round(seconds * fps));
fs.mkdirSync(outDir, { recursive: true });

const server = await serveDir(site);
const pw = await loadPlaywright();
const browser = await launchChrome(pw);
let code = 0;
try {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto(mode === 'play' ? `${server.url}?play` : server.url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.__motion?.stats && (window.__motion.stats.frames >= 30 || window.__motion.stats.mode !== 'webgl2'), null, { timeout: 60000 });
  const info = await page.evaluate(() => {
    // Capture only the pinned hero scene: past the pin's end the page scrolls the hero away,
    // which in a video reads as the subject drifting up and out of frame.
    let max = document.documentElement.scrollHeight - innerHeight;
    const triggers = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    const pinEnd = Math.max(0, ...triggers.filter((t) => t.pin).map((t) => t.end));
    if (pinEnd > 0) max = Math.min(max, pinEnd);
    const mode = window.__motion.stats.mode;
    if (window.gsap) window.gsap.globalTimeline.timeScale(100); // collapse ScrollTrigger scrub smoothing
    return { max, mode };
  });
  const timeDriven = mode === 'play' || info.max < 50;
  let total = 0;
  if (timeDriven) {
    total = await page.evaluate(() => { const g = window.gsap.globalTimeline; g.timeScale(1); const tl = window.__timeline; if (tl) { tl.pause(); return Math.min(tl.duration() + 1.2, 60); } g.pause(); return Math.min(g.duration(), 60); });
    console.error(`capture: seeking the play timeline over ${total.toFixed(1)} s (frames are spread over --seconds)`);
  }
  console.error(`capture: ${N} frames, mode=${info.mode}, scrollable=${info.max}px, ${W}x${H}`);
  const pad = String(N).length < 4 ? 4 : String(N).length;
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1);
    await page.evaluate(({ k2, td, tot, max }) => {
      if (td) (window.__timeline || window.gsap.globalTimeline).time(tot * k2, false);
      else if (window.__lenis) window.__lenis.scrollTo(Math.round(max * k2), { immediate: true, force: true });
      else window.scrollTo(0, Math.round(max * k2));
    }, { k2: k, td: timeDriven, tot: total, max: info.max });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.screenshot({ path: path.join(outDir, `${String(i + 1).padStart(pad, '0')}.png`) });
    if (i % 60 === 0) console.error(`  frame ${i + 1}/${N}`);
  }
  console.error('capture: done');
} catch (e) { console.error('capture failed:', e && e.stack || e); code = 1; }
finally { await browser.close(); await server.close(); }
process.exit(code);
