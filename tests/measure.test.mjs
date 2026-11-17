// The arithmetic behind check_site.mjs, and the style system's own rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { percentile, parseColor, blend, luminance, contrastRatio, verdict } from '../skills/brief2motion/scripts/_measure.mjs';
import { hoistKeyframes, scopedCss } from '../skills/brief2motion/scripts/build_styles.mjs';

const REF = new URL('../skills/brief2motion/references/', import.meta.url);
const styles = JSON.parse(fs.readFileSync(new URL('styles.json', REF), 'utf8'));

test('percentile', () => {
  assert.equal(percentile([5, 1, 3, 2, 4], 0.5), 3);
  assert.equal(percentile([16.7, 16.7, 16.7, 50], 0.95), 50);
  assert.ok(Number.isNaN(percentile([], 0.95)));
});
test('parseColor reads the forms browsers report', () => {
  assert.deepEqual(parseColor('rgb(255, 0, 60)'), { r: 255, g: 0, b: 60, a: 1 });
  assert.deepEqual(parseColor('rgba(13, 18, 48, 0.5)'), { r: 13, g: 18, b: 48, a: 0.5 });
  assert.deepEqual(parseColor('rgb(13 18 48 / 50%)'), { r: 13, g: 18, b: 48, a: 0.5 });
  assert.deepEqual(parseColor('#fff'), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(parseColor('#11223380'), { r: 17, g: 34, b: 51, a: 128 / 255 });
  assert.deepEqual(parseColor('color(srgb 1 0.5 0 / 0.5)'), { r: 255, g: 127.5, b: 0, a: 0.5 });
  assert.equal(parseColor('oklch(60% 0.2 30)'), null);
  assert.equal(parseColor(''), null);
});
test('contrast ratio matches WCAG reference values', () => {
  const black = { r: 0, g: 0, b: 0 }, white = { r: 255, g: 255, b: 255 };
  assert.equal(Math.round(contrastRatio(black, white) * 100) / 100, 21);
  assert.equal(contrastRatio(white, white), 1);
  assert.equal(Math.round(contrastRatio(parseColor('#767676'), white) * 100) / 100, 4.54);   // the lightest grey that passes AA on white
  assert.ok(luminance(white) > luminance(black));
});
test('a see-through colour is blended before it is measured', () => {
  const half = blend({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 });
  assert.deepEqual(half, { r: 127.5, g: 127.5, b: 127.5, a: 1 });
  assert.ok(contrastRatio(half, { r: 255, g: 255, b: 255 }) < 4.5);
});
test('a report passes only with checks, all of them passing', () => {
  assert.equal(verdict([]), false);
  assert.equal(verdict([{ pass: true }, { pass: true }]), true);
  assert.equal(verdict([{ pass: true }, { pass: false }]), false);
  assert.equal(verdict([{ pass: 'yes' }]), false);
});

test('hoistKeyframes lifts @keyframes out of a nested rule and leaves the rest', () => {
  const { body, frames } = hoistKeyframes('.a { color: red; }\n@media (x) { .b { animation: k 1s; }\n  @keyframes k { 0% { opacity: 0; } 100% { opacity: 1; } } }\n.c { top: 0; }');
  assert.equal(frames.length, 1);
  assert.match(frames[0], /^@keyframes k \{ 0% \{ opacity: 0; \} 100% \{ opacity: 1; \} \}$/);
  assert.ok(!body.includes('@keyframes') && body.includes('.c { top: 0; }') && body.includes('.b { animation: k 1s; }'));
});
test('every style has facts, sources and, where it has a specimen, complete tokens and CSS', () => {
  assert.ok(styles.styles.length >= 28);
  const ids = new Set();
  for (const s of styles.styles) {
    assert.ok(!ids.has(s.id), `${s.id} is unique`); ids.add(s.id);
    assert.ok(s.what.length > 40 && s.motion.length > 20, `${s.id} is described`);
    assert.ok(s.rules.length >= 3 && s.a11y.length >= 2 && s.choose.length && s.avoid.length && s.keywords.length >= 3, `${s.id} has rules, accessibility notes, uses and keywords`);
    assert.ok(s.sources.length >= 1 && s.sources.every((u) => /^https:\/\//.test(u)), `${s.id} has a source`);
    if (s.specimen) {
      for (const t of ['bg', 'surface', 'fg', 'muted', 'accent', 'accentFg', 'border', 'radius', 'shadow', 'fontDisplay', 'fontText', 'weightDisplay', 'tracking']) assert.ok(s.tokens[t] !== undefined, `${s.id} has token ${t}`);
      const css = scopedCss(s);
      assert.ok(css.startsWith(`.stage[data-style="${s.id}"] {`));
      assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, `${s.id} CSS braces balance`);
      assert.ok(!/@keyframes[^]*\.stage\[data-style/.test(css.split('\n}')[0]), `${s.id} keyframes are outside the rule`);
      assert.ok(!/https?:\/\/(?!www\.w3\.org\/2000\/svg)/.test(fs.readFileSync(new URL(`styles/${s.id}.css`, REF), 'utf8')), `${s.id} CSS loads nothing from the network`);
    } else assert.ok(fs.existsSync(new URL(`../../../examples/${s.example}/index.html`, REF)), `${s.id} points at a real example`);
  }
});
test('no style on the list is one that research found to be unreal', () => {
  for (const n of styles.notReal) assert.ok(!styles.styles.some((s) => s.name.toLowerCase().includes(n.name.toLowerCase())));
});
test('the generated style pages and the atlas are current', () => {
  const out = execFileSync('node', [new URL('../skills/brief2motion/scripts/build_styles.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' });
  assert.match(out, /generated files are current/);
});
