#!/usr/bin/env node
// make-frames.mjs: draws the image sequence for this example (a salt crystal growing, cube by cube) and saves it
// as numbered WebP files in assets/seq/. The pictures are drawn by this script on a 2D canvas in headless Chrome:
// no photographs, no model, nothing downloaded. Run from the repo root:
//   node examples/tidewater/tools/make-frames.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, launchChrome } from '../../../skills/brief2motion/scripts/_common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', 'seq');
const COUNT = 48, W = 960, H = 600, QUALITY = 0.62;

const pw = await loadPlaywright();
const browser = await launchChrome(pw);
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<canvas id="c" width="${W}" height="${H}"></canvas>`);
const frames = await page.evaluate(({ COUNT, W, H, QUALITY }) => {
  const g = document.getElementById('c').getContext('2d');
  // a repeatable random number per cell, so every run draws the same crystal
  const hash = (x, y, z) => { let n = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) / 4294967295; };
  const N = 11, LAYERS = 7, cells = [];
  for (let z = 0; z < LAYERS; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const cx = x - (N - 1) / 2, cy = y - (N - 1) / 2;
    const ring = Math.max(Math.abs(cx), Math.abs(cy));           // square rings: salt grows as a hopper, edges first
    const limit = (N - 1) / 2 - z * 0.72;                        // each layer is a smaller square: a stepped pyramid
    const hollow = z > 0 && ring < limit - 1.6 - z * 0.2;        // the middle of each upper layer stays empty
    if (ring > limit || hollow) continue;
    cells.push({ x, y, z, when: z * 0.13 + ring * 0.035 + hash(x, y, z) * 0.16 });
  }
  const tMax = Math.max(...cells.map((c) => c.when));
  cells.forEach((c) => { c.when /= tMax; });
  cells.sort((a, b) => (a.z - b.z) || ((a.x + a.y) - (b.x + b.y)));   // painter's order: bottom layers first, far cubes first
  const out = [];
  for (let f = 0; f < COUNT; f++) {
    const t = f / (COUNT - 1), grow = t * 1.02;
    const s = 30 * (1.32 - 0.3 * t);                             // the camera eases back as the crystal grows
    const ox = W / 2, oy = H * 0.6 + 34 * t;
    // brine: deep slate, with a few still ripples
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#111b25'); bg.addColorStop(1, '#22313f');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(190,205,220,.10)'; g.lineWidth = 1.2;
    for (let r = 1; r <= 7; r++) { g.beginPath(); g.ellipse(ox, oy + 8, r * 62 * (0.9 + t * 0.25), r * 31 * (0.9 + t * 0.25), 0, 0, 7); g.stroke(); }
    const iso = (x, y, z) => [ox + (x - y) * s, oy + (x + y) * s * 0.5 - z * s];
    for (const c of cells) {
      const age = (grow - c.when) / 0.09; if (age <= 0) continue;
      const k = Math.min(1, age), x = c.x - (N - 1) / 2, y = c.y - (N - 1) / 2, z = c.z, h = k;   // a new cube rises to full height
      const quad = (pts, fill) => { g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fillStyle = fill; g.fill(); g.strokeStyle = 'rgba(17,27,37,.28)'; g.lineWidth = 0.8; g.stroke(); };
      const shade = hash(c.x, c.y, c.z + 7) * 10;
      quad([iso(x, y + 1, z + h), iso(x + 1, y + 1, z + h), iso(x + 1, y + 1, z), iso(x, y + 1, z)], `rgb(${150 + shade},${166 + shade},${182 + shade})`);
      quad([iso(x + 1, y, z + h), iso(x + 1, y + 1, z + h), iso(x + 1, y + 1, z), iso(x + 1, y, z)], `rgb(${190 + shade},${201 + shade},${212 + shade})`);
      quad([iso(x, y, z + h), iso(x + 1, y, z + h), iso(x + 1, y + 1, z + h), iso(x, y + 1, z + h)], `rgb(${238 + shade},${236 + shade},${230 + shade})`);
    }
    out.push(document.getElementById('c').toDataURL('image/webp', QUALITY).split(',')[1]);
  }
  return out;
}, { COUNT, W, H, QUALITY });
await browser.close();
fs.mkdirSync(OUT, { recursive: true });
let total = 0;
frames.forEach((b64, i) => { const buf = Buffer.from(b64, 'base64'); total += buf.length; fs.writeFileSync(path.join(OUT, `crystal-${String(i).padStart(3, '0')}.webp`), buf); });
console.log(`${frames.length} frames, ${W}x${H}, ${(total / 1024).toFixed(0)} KB in ${path.relative(process.cwd(), OUT)}`);
