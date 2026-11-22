// The README and the pages in docs/: every relative link and image points at a file that exists, every #anchor points
// at a heading that exists, and docs/motion-patterns.md matches the pattern recipes it is generated from.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPatterns, render, slug } from '../docs/build_motion_patterns.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['README.md', ...fs.readdirSync(path.join(ROOT, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`)];

// Links written as markdown [text](target) or as HTML src="" / href="", outside fenced code blocks.
export function links(md) {
  const text = md.replace(/^```[\s\S]*?^```/gm, '');
  const out = [];
  for (const m of text.matchAll(/\]\(([^)\s]+(?:\([^)\s]*\))?[^)\s]*)\)/g)) out.push(m[1]);
  for (const m of text.matchAll(/\b(?:src|href)="([^"]+)"/g)) out.push(m[1]);
  return out;
}

// GitHub's heading anchors, with -1, -2 for repeats, plus explicit id="" anchors.
export function anchors(md) {
  const seen = new Map();
  const out = new Set();
  const text = md.replace(/^```[\s\S]*?^```/gm, '');
  for (const m of text.matchAll(/^#{1,6} (.+)$/gm)) {
    const base = slug(m[1].replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim());
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    out.add(n ? `${base}-${n}` : base);
  }
  for (const m of text.matchAll(/<h[1-6][^>]*\bid="([^"]+)"/g)) out.add(m[1]);
  return out;
}

test('links() and anchors() read markdown and HTML, and skip code blocks', () => {
  assert.deepEqual(links('[a](x.md) <img src="y.png"> <a href="#z">\n```\n[no](skip.md)\n```'), ['x.md', 'y.png', '#z']);
  assert.deepEqual([...anchors('# Site mode: a whole site\n## FAQ\n## FAQ\n<h2 id="watch-it">W</h2>')], ['site-mode-a-whole-site', 'faq', 'faq-1', 'watch-it']);
});

for (const page of PAGES) {
  test(`${page}: every relative link and image resolves, every anchor exists`, () => {
    const md = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const missing = [];
    for (const raw of links(md)) {
      if (/^(https?:|mailto:)/.test(raw)) continue;
      const [file, hash] = raw.split('#');
      const target = file ? path.resolve(path.dirname(path.join(ROOT, page)), decodeURI(file)) : path.join(ROOT, page);
      if (!fs.existsSync(target)) { missing.push(`${raw} (no such file)`); continue; }
      if (hash && target.endsWith('.md') && !anchors(fs.readFileSync(target, 'utf8')).has(hash)) missing.push(`${raw} (no such heading)`);
    }
    assert.deepEqual(missing, []);
  });
}

test('docs/motion-patterns.md is generated from the current pattern recipes', () => {
  const patterns = readPatterns();
  const pages = fs.readdirSync(path.join(ROOT, 'skills/brief2motion/references/patterns')).filter((f) => f.endsWith('.md') && f !== 'README.md');
  assert.equal(patterns.length, pages.length, 'every recipe is in the index the generator reads');
  for (const p of patterns) for (const k of ['title', 'what', 'use', 'not', 'reduced']) assert.ok(p[k], `${p.id} has ${k}`);
  assert.equal(fs.readFileSync(path.join(ROOT, 'docs/motion-patterns.md'), 'utf8'), render(patterns), 'run: node docs/build_motion_patterns.mjs');
});

test('the README counts match the repository', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const patterns = readPatterns().length;
  const styles = JSON.parse(fs.readFileSync(path.join(ROOT, 'skills/brief2motion/references/styles.json'), 'utf8'));
  const styleCount = (Array.isArray(styles) ? styles : styles.styles).length;
  const examples = fs.readdirSync(path.join(ROOT, 'examples'), { withFileTypes: true }).filter((e) => e.isDirectory()).length;
  assert.ok(readme.includes(`${patterns} motion patterns`), `README says ${patterns} motion patterns`);
  assert.ok(readme.includes(`${styleCount} visual styles`), `README says ${styleCount} visual styles`);
  assert.ok(/\bten complete sites\b/.test(readme) && examples === 10, `README says ten examples, the repo has ${examples}`);
  for (const d of fs.readdirSync(path.join(ROOT, 'examples'))) assert.ok(readme.includes(`examples/${d}/`), `README links examples/${d}/`);
});
