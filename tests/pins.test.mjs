// One version of each pinned library, everywhere. The release pins GSAP 3.15.1 and three.js 0.187.0 (r187), the same
// as brief2mp4, so a site filmed through it behaves the same. Any other version number written next to those names
// in text, code or JSON fails here, so a stale pin cannot hide in a reference page, a doctor script or an example.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PINS = { gsap: '3.15.1', three: '0.187.0', threeR: 'r187' };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SELF = fileURLToPath(import.meta.url);   // its own examples of wrong versions are not findings
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const TEXT = /\.(md|mjs|js|json|html|css|sh|py|txt|yml|yaml)$/;

function* files(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* files(p);
    else if (p !== SELF && TEXT.test(e.name) && fs.statSync(p).size < 2_000_000) yield p;
  }
}

// Every way this repo writes a version next to a library name.
function findPins(text) {
  const out = [];
  const add = (lib, ver, index) => out.push({ lib, ver, line: text.slice(0, index).split('\n').length });
  for (const m of text.matchAll(/gsap@(\d+\.\d+\.\d+)/g)) add('gsap', m[1], m.index);
  for (const m of text.matchAll(/\bGSAP v?(\d+\.\d+\.\d+)/g)) add('gsap', m[1], m.index);
  for (const m of text.matchAll(/\bthree@(\d+\.\d+\.\d+)/g)) add('three', m[1], m.index);
  for (const m of text.matchAll(/\bthree\.js v?(0\.\d+\.\d+)\b/gi)) add('three', m[1], m.index);
  for (const m of text.matchAll(/\bthree(?:\.js)? (r\d{3})\b/gi)) add('threeR', m[1].toLowerCase(), m.index);
  return out;
}

test('findPins sees every spelling the repo uses', () => {
  const hits = findPins('gsap@3.14.0 and GSAP 3.13.2 and three@0.170.0 and three.js 0.160.1 and three.js r170');
  assert.deepEqual(hits.map((h) => `${h.lib}:${h.ver}`), ['gsap:3.14.0', 'gsap:3.13.2', 'three:0.170.0', 'three:0.160.1', 'threeR:r170']);
  assert.deepEqual(findPins('gsap@3.15.1, three@0.187.0, three.js r187').map((h) => h.ver), ['3.15.1', '0.187.0', 'r187']);
});

test('GSAP 3.15.1 and three.js 0.187.0 (r187) everywhere in the repo', () => {
  const wrong = [];
  let seen = 0;
  for (const f of files(ROOT)) {
    for (const h of findPins(fs.readFileSync(f, 'utf8'))) {
      seen++;
      if (h.ver !== PINS[h.lib]) wrong.push(`${path.relative(ROOT, f)}:${h.line} ${h.lib} ${h.ver}`);
    }
  }
  assert.ok(seen >= 20, `expected to find the pins written down in many places, found ${seen}`);
  assert.deepEqual(wrong, [], 'stale pins');
});
