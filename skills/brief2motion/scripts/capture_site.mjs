#!/usr/bin/env node
// capture_site.mjs: pictures of any brief2motion site, for a README, a report or a look at what you built.
//   node capture_site.mjs <site-dir | http://localhost:PORT/> --out media
//        [--page work/a.html] [--size 1280x800] [--frames 36] [--intro 0] [--phone] [--film] [--poster "css selector" file.png]
// Writes into --out:
//   shot-top.png, shot-25.png ... shot-100.png   the page at five scroll positions
//   phone-top.png, phone-50.png                  the same page on a 390 x 844 phone (with --phone)
//   frames/f-000.png ...                         a scroll-through, --frames pictures from top to bottom;
//                                                --intro N adds N seconds of the load animation first, at 10 pictures a second
//   sheet.png                                    those frames on one contact sheet (made in the browser, no other tool needed)
//   film.webp, film.mp4                          the frames as a short loop, when --film is given and ffmpeg is installed
// --poster photographs one element (for example the canvas) into a file: the still picture for no-WebGL visitors.
// One browser, one page at a time. It scrolls in steps, so it shows scroll-linked motion exactly and timed motion roughly.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadPlaywright, launchChrome, serveDir } from './_common.mjs';

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const VALUE = new Set(['--out', '--page', '--size', '--frames', '--intro']);
const positional = argv.filter((a, i) => !a.startsWith('--') && !VALUE.has(argv[i - 1]) && argv[i - 1] !== '--poster' && argv[i - 2] !== '--poster');
const site = positional[0];
const USAGE = 'usage: node capture_site.mjs <site-dir | http://localhost:PORT/> --out <dir> [--page p.html] [--size 1280x800] [--frames 36] [--intro 0] [--phone] [--film] [--poster "<selector>" <file.png>]';
if (flag('-h') || flag('--help')) { console.log(USAGE); process.exit(0); }
if (!site) { console.error(USAGE); process.exit(2); }
const isUrl = /^https?:\/\//i.test(site);
if (!isUrl && !fs.existsSync(path.join(path.resolve(site), 'index.html'))) { console.error(`no index.html in ${path.resolve(site)}`); process.exit(2); }
const outDir = path.resolve(opt('--out', 'media'));
const [W, H] = String(opt('--size', '1280x800')).split('x').map(Number);
const FRAMES = Math.max(0, Number(opt('--frames', 36))), INTRO = Math.max(0, Number(opt('--intro', 0)));
if (!W || !H || Number.isNaN(FRAMES) || Number.isNaN(INTRO)) { console.error('capture_site: --size needs WIDTHxHEIGHT, --frames and --intro need numbers'); process.exit(2); }
const pi = argv.indexOf('--poster'); const poster = pi >= 0 ? { sel: argv[pi + 1], file: argv[pi + 2] } : null;
if (poster && (!poster.sel || !poster.file)) { console.error('capture_site: --poster needs a selector and a file name'); process.exit(2); }
fs.mkdirSync(path.join(outDir, 'frames'), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const server = isUrl ? { url: site.endsWith('/') ? site : `${site}/`, close: async () => {} } : await serveDir(path.resolve(site));
const url = new URL(opt('--page', ''), server.url).href;
const pw = await loadPlaywright();
const browser = await launchChrome(pw);
let code = 0;
try {
  const open = async (viewport, mobile = false) => {
    const ctx = await browser.newContext({ viewport, ...(mobile ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}) });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    return { ctx, page };
  };
  const ready = (page) => page.waitForFunction(() => document.documentElement.dataset.motion, null, { timeout: 15000 }).catch(() => console.error('capture_site: the page never set <html data-motion>; capturing anyway'));
  const jump = (page, k) => page.evaluate((kk) => { const y = Math.max(0, document.documentElement.scrollHeight - innerHeight) * kk; if (window.__lenis?.scrollTo) window.__lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo({ top: y, behavior: 'instant' }); }, k);

  // ---- the film: the load animation in real time, then the scroll in equal steps ----
  let n = 0; const frameFile = () => path.join(outDir, 'frames', `f-${String(n++).padStart(3, '0')}.png`);
  {
    const { ctx, page } = await open({ width: W, height: H });
    for (const end = Date.now() + INTRO * 1000; Date.now() < end;) { const t0 = Date.now(); await page.screenshot({ path: frameFile() }); await sleep(Math.max(0, 100 - (Date.now() - t0))); }
    await ready(page); if (!INTRO) await sleep(1500);
    for (let i = 0; i < FRAMES; i++) { await jump(page, FRAMES === 1 ? 0 : i / (FRAMES - 1)); await sleep(220); await page.screenshot({ path: frameFile() }); }
    // ---- five stills ----
    for (const [k, name] of [[0, 'top'], [0.25, '25'], [0.5, '50'], [0.75, '75'], [1, '100']]) { await jump(page, k); await sleep(900); await page.screenshot({ path: path.join(outDir, `shot-${name}.png`) }); }
    if (poster) { await jump(page, 0); await sleep(900); await page.locator(poster.sel).first().screenshot({ path: path.resolve(poster.file) }); console.log(`poster: ${poster.file}`); }
    await ctx.close();
  }
  if (flag('--phone')) {
    const { ctx, page } = await open({ width: 390, height: 844 }, true); await ready(page); await sleep(1500);
    await page.screenshot({ path: path.join(outDir, 'phone-top.png') });
    await jump(page, 0.5); await sleep(900); await page.screenshot({ path: path.join(outDir, 'phone-50.png') });
    await ctx.close();
  }

  // ---- the contact sheet, drawn on a canvas in the browser ----
  if (n > 0) {
    const pick = Math.min(n, 12), cols = Math.min(pick, 4), rows = Math.ceil(pick / cols), tw = 480, th = Math.round(tw * H / W), gap = 8;
    const files = Array.from({ length: pick }, (_, i) => path.join(outDir, 'frames', `f-${String(Math.round(i * (n - 1) / Math.max(1, pick - 1))).padStart(3, '0')}.png`));
    const page = await browser.newPage({ viewport: { width: cols * (tw + gap) + gap, height: rows * (th + gap) + gap } });
    await page.setContent(`<body style="margin:0;background:#8a8a8a"><canvas id="c" width="${cols * (tw + gap) + gap}" height="${rows * (th + gap) + gap}"></canvas>`);
    await page.evaluate(async ({ imgs, cols, tw, th, gap }) => {
      const g = document.getElementById('c').getContext('2d'); g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, 1e5, 1e5);
      for (const [i, src] of imgs.entries()) { const im = new Image(); im.src = src; await im.decode(); g.drawImage(im, gap + (i % cols) * (tw + gap), gap + Math.floor(i / cols) * (th + gap), tw, th); }
    }, { imgs: files.map((f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`), cols, tw, th, gap });
    await page.locator('#c').screenshot({ path: path.join(outDir, 'sheet.png') });
    await page.close();
  }

  // ---- the loop, if asked for and ffmpeg is here ----
  // film.mp4 needs ffmpeg. film.webp needs an ffmpeg built with libwebp, or the img2webp tool from the WebP package.
  const made = [];
  if (flag('--film') && n > 1) {
    const frames = path.join(outDir, 'frames', 'f-%03d.png');
    const run = (cmd, args) => { try { execFileSync(cmd, args, { stdio: 'ignore' }); return true; } catch { return false; } };
    if (run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', frames, '-vf', `scale=${Math.min(W, 1280)}:-2:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '24', '-movflags', '+faststart', path.join(outDir, 'film.mp4')])) made.push('film.mp4');
    const webp = path.join(outDir, 'film.webp'), scale = `scale=${Math.min(W, 720)}:-2:flags=lanczos`;
    if (run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', frames, '-vf', scale, '-loop', '0', '-quality', '62', '-compression_level', '5', webp])) made.push('film.webp');
    else {
      const small = path.join(outDir, 'frames-small'); fs.mkdirSync(small, { recursive: true });
      if (run('ffmpeg', ['-y', '-loglevel', 'error', '-i', frames, '-vf', scale, path.join(small, 's-%03d.png')])) {
        const list = fs.readdirSync(small).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(small, f));
        if (run('img2webp', ['-loop', '0', '-lossy', '-q', '62', '-m', '5', '-d', '100', ...list, '-o', webp])) made.push('film.webp');
      }
      fs.rmSync(small, { recursive: true, force: true });
    }
    if (!made.length) console.error(`capture_site: could not make a film: ffmpeg is missing or failed. The frames are in ${path.join(outDir, 'frames')}.`);
    else if (!made.includes('film.webp')) console.error('capture_site: made film.mp4 only. For film.webp, install an ffmpeg with libwebp or the WebP tools (img2webp).');
  }
  console.log(`captured ${url}\n  ${n} frames, 5 stills${flag('--phone') ? ', 2 phone stills' : ''}, sheet.png${made.length ? ', ' + made.join(', ') : ''} in ${outDir}`);
} catch (e) { console.error('capture_site crashed:', (e && e.stack) || e); code = 2; } finally { await browser.close(); await server.close(); }
process.exit(code);
