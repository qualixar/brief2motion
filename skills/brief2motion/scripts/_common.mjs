// brief2motion shared helpers: load playwright-core (pinned, installed on demand), start a browser and serve a folder.
import os from 'node:os';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
// helper downloads live in the user's cache, never inside the plugin folder (plugin caches may be
// read-only, and a node_modules there would ship stray files such as other tools' SKILL.md)
export const DEPS = process.env.BRIEF2MOTION_DEPS || path.join(os.homedir(), '.cache', 'brief2motion', 'deps');
export const PW_VERSION = '1.65.1';

// How to start npm with no shell in between, so no folder name (one with a space, & or ^ in it) is ever parsed by one.
// On Windows npm is a .cmd file, which only a shell can start; Node's own copy of npm (node_modules/npm/bin/npm-cli.js
// next to node.exe) is started with node instead. Only when that file is missing does it fall back to npm.cmd in a shell.
export function npmCommand({ platform = process.platform, execPath = process.execPath, exists = fs.existsSync } = {}) {
  if (platform !== 'win32') return { cmd: 'npm', pre: [], shell: false };
  const cli = path.win32.join(path.win32.dirname(execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  return exists(cli) ? { cmd: execPath, pre: [cli], shell: false } : { cmd: 'npm.cmd', pre: [], shell: true };
}

// Is the package folder a complete install of this version? (its package.json says so and its entry file exists)
export function installed(dir, version) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version === version && fs.existsSync(path.join(dir, 'index.mjs')); } catch { return false; }
}
// Moves a finished install from `fresh` to `target`. A target that is already a complete install of `version` (another
// checker got there first) is kept and the fresh copy dropped, so a running checker never loses files under it. A target
// that is the wrong version or broken (a half-copied folder, a missing entry file) is moved aside and deleted, so it can
// never block the install for good. Leftover folders from earlier runs are swept up.
export function placeInstall(fresh, target, version) {
  const parent = path.dirname(target), base = path.basename(target);
  if (!installed(target, version) && fs.existsSync(target)) {
    const aside = `${target}.old-${process.pid}-${Date.now()}`;
    try { fs.renameSync(target, aside); } catch { /* another checker moved it */ }
  }
  try { if (!fs.existsSync(target)) fs.renameSync(fresh, target); } catch { /* another checker placed its copy first */ }
  for (const e of fs.readdirSync(parent)) if (e.startsWith(`${base}.old-`)) fs.rmSync(path.join(parent, e), { recursive: true, force: true });
}

export async function loadPlaywright() {
  // Only the pinned copy in DEPS is used: a stray playwright-core from some parent folder could be any version.
  const entry = path.join(DEPS, 'node_modules', 'playwright-core', 'index.mjs');
  let have = null;
  try { have = JSON.parse(fs.readFileSync(path.join(DEPS, 'node_modules', 'playwright-core', 'package.json'), 'utf8')).version; } catch { /* not installed */ }
  if (have !== PW_VERSION || !fs.existsSync(entry)) {
    console.error(`playwright-core ${PW_VERSION} is not installed${have ? ` (found ${have})` : ''}. Installing it into ${DEPS} (one time, about 14 MB on disk; install scripts are not run).`);
    // Install into a private staging folder, then move the finished package into place with one rename. Two checkers
    // started at once on a fresh machine then never see a half-written install: the first rename wins and the other
    // uses it. playwright-core has no dependencies, so its folder is the whole install.
    const stage = path.join(DEPS, `.stage-${process.pid}-${Date.now()}`);
    const target = path.join(DEPS, 'node_modules', 'playwright-core');
    try {
      fs.mkdirSync(path.join(DEPS, 'node_modules'), { recursive: true });
      const npm = npmCommand(), prefix = npm.shell ? `"${stage}"` : stage;   // only the fallback goes through a shell
      execFileSync(npm.cmd, [...npm.pre, 'i', '--no-save', '--no-audit', '--no-fund', '--ignore-scripts', '--prefix', prefix, `playwright-core@${PW_VERSION}`],
        { stdio: ['ignore', process.stderr, 'inherit'], shell: npm.shell });
      placeInstall(path.join(stage, 'node_modules', 'playwright-core'), target, PW_VERSION);
      fs.rmSync(stage, { recursive: true, force: true });
      if (!fs.existsSync(entry)) throw new Error('playwright-core is not in place after install');
    } catch (e) {
      fs.rmSync(stage, { recursive: true, force: true });
      console.error(`Could not install playwright-core. Run by hand:\n  npm i --no-save --ignore-scripts --prefix "${DEPS}" playwright-core@${PW_VERSION}`);
      process.exit(2);
    }
  }
  return await import(pathToFileURL(entry).href);
}

// Browsers found on PATH by name (no `which` needed, so it works on Windows too).
function onPath(names) {
  const exts = process.platform === 'win32' ? ['.exe', '.cmd', ''] : [''];
  const found = [];
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    for (const n of names) for (const x of exts) {
      const f = path.join(dir, n + x);
      try { if (fs.statSync(f).isFile()) found.push(f); } catch { /* not here */ }
    }
  }
  return found;
}

// Start a Chromium-family browser. Order: BRIEF2MOTION_CHROME (a path), Google Chrome, chromium /
// google-chrome on PATH, then the Chromium that `npx playwright@PW_VERSION install chromium` downloads.
export async function launchChrome(pw, args = []) {
  const tries = [];
  if (process.env.BRIEF2MOTION_CHROME) tries.push({ label: `BRIEF2MOTION_CHROME=${process.env.BRIEF2MOTION_CHROME}`, opts: { executablePath: process.env.BRIEF2MOTION_CHROME } });
  tries.push({ label: 'Google Chrome', opts: { channel: 'chrome' } });
  for (const f of onPath(['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable'])) tries.push({ label: f, opts: { executablePath: f } });
  tries.push({ label: "Playwright's own Chromium", opts: {} });
  const why = [];
  for (const t of tries) {
    try {
      const b = await pw.chromium.launch({ headless: true, args, ...t.opts });
      if (process.env.BRIEF2MOTION_VERBOSE) console.error(`browser: ${t.label}`);
      return b;
    } catch (e) { why.push(`  ${t.label}: ${String(e.message || e).split('\n')[0]}`); }
  }
  console.error('Could not start a browser. Tried, in order:\n' + why.join('\n'));
  console.error(`Fix: install Google Chrome (https://www.google.com/chrome), or run: npx playwright@${PW_VERSION} install chromium`);
  console.error('You can also point BRIEF2MOTION_CHROME at any Chrome or Chromium executable.');
  process.exit(2);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8',
};

// Static server on a free localhost port. Returns { url, close }.
// Only files inside the folder are served: a path that climbs out ("/../", encoded or not) and a symlink that points out
// are refused with 403. A malformed %-escape is a 400.
export function serveDir(dir, port = 0) {
  const root = path.resolve(dir), realRoot = fs.realpathSync(root);
  const within = (f, r) => f === r || f.startsWith(r + path.sep);
  const server = http.createServer((req, res) => {
    try {
      if (req.url === '/favicon.ico') { res.writeHead(204).end(); return; } // the checker's own server has no favicon; not a page error
      let p;
      try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400, { 'content-type': 'text/plain' }).end('bad request'); return; }
      let file = path.resolve(root, '.' + p);
      if (!within(file, root)) { res.writeHead(403).end('forbidden'); return; }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file)) { res.writeHead(404, { 'content-type': 'text/plain' }).end('not found'); return; }
      if (!within(fs.realpathSync(file), realRoot)) { res.writeHead(403).end('forbidden'); return; }
      const body = fs.readFileSync(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'content-length': body.length, 'cache-control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(500, { 'content-type': 'text/plain' }).end('server error'); }
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);   // for example EADDRINUSE: the caller can try another port
    server.listen(port, '127.0.0.1', () => {
      const { port: p } = server.address();
      ok({ url: `http://127.0.0.1:${p}/`, origin: `http://127.0.0.1:${p}`, port: p, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

// Minimal PNG reader (8-bit, non-interlaced RGB/RGBA/gray), enough to count ink pixels in a screenshot.
export function inkPixels(buf, darkBelow = 120) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8, w = 0, h = 0, depth = 0, ctype = 0, inter = 0; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; inter = data[12]; }
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (depth !== 8 || inter !== 0 || ![0, 2, 6].includes(ctype)) throw new Error('unsupported PNG layout');
  const bpp = ctype === 6 ? 4 : ctype === 2 ? 3 : 1;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp; const cur = Buffer.alloc(stride); let prev = Buffer.alloc(stride); let dark = 0;
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (ft === 1) v += a; else if (ft === 2) v += b; else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = x * bpp; const l = bpp === 1 ? cur[o] : 0.2126 * cur[o] + 0.7152 * cur[o + 1] + 0.0722 * cur[o + 2];
      if (l < darkBelow && (bpp !== 4 || cur[o + 3] > 128)) dark++;
    }
    cur.copy(prev);
  }
  return { w, h, dark };
}

// ---- a browser session for the site-mode checkers (check_layout, check_a11y, check_journeys) ----

// Serve a folder (or take a URL), load playwright-core and start Chrome. Returns { base, origin, browser, version, close }.
// Exits 2 when the browser cannot start, like every other tool here (launchChrome).
export async function openSite(site, { chromeArgs = [] } = {}) {
  const isUrl = /^https?:\/\//i.test(site);
  const server = isUrl ? { url: site.endsWith('/') ? site : `${site}/`, close: async () => {} } : await serveDir(path.resolve(site));
  const pw = await loadPlaywright();
  const browser = await launchChrome(pw, chromeArgs);
  const base = server.url;
  return { base, origin: new URL(base).origin, browser, version: browser.version(), close: async () => { await browser.close(); await server.close(); } };
}

// A fresh page in its own context, as a visitor would have it: a viewport, touch for a phone, reduced motion or a dark
// colour scheme on request. Console errors and uncaught exceptions are collected in `errors`.
export async function newPage(browser, { viewport, mobile = false, reduced = false, dark = false, js = true } = {}) {
  const ctx = await browser.newContext({
    viewport, javaScriptEnabled: js, reducedMotion: reduced ? 'reduce' : 'no-preference', colorScheme: dark ? 'dark' : 'light',
    ...(mobile ? { deviceScaleFactor: 2, isMobile: true, hasTouch: true } : {}),
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return { ctx, page, errors };
}
