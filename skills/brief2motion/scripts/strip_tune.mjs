#!/usr/bin/env node
// strip_tune.mjs: take the dev-only tuning panel out of a site before it ships.
//   node strip_tune.mjs <site-dir>            remove kit/tune.js and every tune:start ... tune:end block
//   node strip_tune.mjs <site-dir> --check    report what is left, change nothing; exit 1 if anything is
// A block is the text between /* tune:start */ and /* tune:end */ in a script or stylesheet, or between
// <!-- tune:start --> and <!-- tune:end --> in HTML. check_site.mjs runs the same search and fails a page that still has one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOCKS = [/[ \t]*\/\*\s*tune:start\s*\*\/[\s\S]*?\/\*\s*tune:end\s*\*\/[ \t]*\r?\n?/g, /[ \t]*<!--\s*tune:start\s*-->[\s\S]*?<!--\s*tune:end\s*-->[ \t]*\r?\n?/g];
const TEXT = /\.(js|mjs|html|css)$/i;
// a request for Tweakpane's code (a package name with a version, a .js file, an import), not the word in a credits line
const PANEL = /tweakpane@|tweakpane(\.min)?\.m?js\b|\/npm\/tweakpane\b|from\s*['"][^'"]*tweakpane|import\(\s*['"][^'"]*tweakpane/i;

// Pure, unit-tested: the text with every tune block removed.
export const stripTune = (text) => BLOCKS.reduce((t, rx) => t.replace(rx, ''), text);
export const hasTune = (text) => /tune:start/.test(text) || PANEL.test(text);

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.git') yield* walk(p); } else yield p;
  }
}

// Everything in a site folder that belongs to the dev panel: [{ file, why }]
export function findDevTools(dir) {
  const found = [];
  for (const f of walk(dir)) {
    const rel = path.relative(dir, f).split(path.sep).join('/');
    if (/(^|\/)kit\/tune\.js$/.test(rel)) found.push({ file: rel, why: 'the tuning panel file' });
    else if (TEXT.test(f) && hasTune(fs.readFileSync(f, 'utf8'))) found.push({ file: rel, why: 'a tune block or a Tweakpane reference' });
  }
  return found;
}

export function stripSite(dir) {
  const removed = [], edited = [];
  for (const { file } of findDevTools(dir)) {
    const full = path.join(dir, file);
    if (/(^|\/)kit\/tune\.js$/.test(file)) { fs.rmSync(full); removed.push(file); continue; }
    const before = fs.readFileSync(full, 'utf8'), after = stripTune(before);
    if (after !== before) { fs.writeFileSync(full, after); edited.push(file); }
  }
  return { removed, edited, left: findDevTools(dir) };
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2), dir = args.find((a) => !a.startsWith('--'));
  if (!dir || args.includes('--help') || args.includes('-h')) { console.log('usage: node strip_tune.mjs <site-dir> [--check]\n  Removes the dev-only tuning panel (kit/tune.js and tune:start ... tune:end blocks) before delivery.'); process.exit(args.includes('--help') || args.includes('-h') ? 0 : 2); }
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error(`strip_tune.mjs: ${dir} is not a folder`); process.exit(2); }
  if (args.includes('--check')) {
    const left = findDevTools(dir);
    for (const l of left) console.log(`${l.file}: ${l.why}`);
    console.log(left.length ? `${left.length} file(s) still carry the tuning panel` : 'no tuning panel in this site');
    process.exit(left.length ? 1 : 0);
  }
  const r = stripSite(dir);
  for (const f of r.removed) console.log(`removed ${f}`);
  for (const f of r.edited) console.log(`stripped ${f}`);
  if (r.left.length) { for (const l of r.left) console.error(`still there: ${l.file} (${l.why}). Remove it by hand.`); process.exit(1); }
  console.log(r.removed.length + r.edited.length ? 'tuning panel removed' : 'nothing to remove');
}
