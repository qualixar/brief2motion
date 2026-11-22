// Site mode: design tokens and the sitemap builders. The passing token file builds; each failing file is rejected for its own reason.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FIX, tmp, runChecker } from './_design_helpers.mjs';
import { loadRoutes } from '../skills/brief2motion/scripts/_design.mjs';
import { buildTokens, flatten, resolve, cssValue } from '../skills/brief2motion/scripts/build_tokens.mjs';
import { sitemapMd, sitemapXml } from '../skills/brief2motion/scripts/build_sitemap.mjs';

const read = (...p) => fs.readFileSync(path.join(FIX, ...p), 'utf8');
const json = (...p) => JSON.parse(read(...p));

// ---- design tokens ----
test('tokens: the passing file builds CSS with primitives, light roles, and a dark theme as aliases', () => {
  const b = buildTokens(json('tokens', 'pass.json'));
  assert.deepEqual(b.errors, []);
  assert.deepEqual(b.themes, ['light', 'dark']);
  assert.match(b.css, /--color-paper: #faf7f0;/);
  assert.match(b.css, /--color-canvas: var\(--color-paper\);/);
  assert.match(b.css, /@media \(prefers-color-scheme: dark\)[\s\S]*--color-canvas: var\(--color-night\);/);
  assert.match(b.css, /:root\[data-theme="dark"\]/);
  assert.match(b.css, /--font-family-body: Inter, system-ui, sans-serif;/);
  assert.match(b.css, /--motion-ease-out: cubic-bezier\(0\.2, 0\.8, 0\.2, 1\);/);
  assert.equal(b.pairs.length, 8);
  assert.ok(b.pairs.every((p) => p.pass));
  assert.equal(buildTokens(json('tokens', 'pass.json')).css, b.css, 'same input, same bytes');
});
test('tokens: a reference to nothing is rejected', () => {
  const b = buildTokens(json('tokens', 'fail-missing-ref.json'));
  assert.ok(b.errors.some((e) => e.kind === 'missing-ref' && /ink-darkest/.test(e.message)), JSON.stringify(b.errors));
});
test('tokens: aliases that run in a circle are rejected, once', () => {
  const b = buildTokens(json('tokens', 'fail-cycle.json'));
  const cycles = b.errors.filter((e) => e.kind === 'cycle');
  assert.equal(cycles.length, 1);
  assert.match(cycles[0].message, /violet.*violet-light.*violet/);
});
test('tokens: a pair below WCAG AA fails, and the thresholds are exact', () => {
  const b = buildTokens(json('tokens', 'fail-contrast.json'));
  assert.ok(b.errors.some((e) => e.kind === 'contrast' && /text-soft/.test(e.message)), JSON.stringify(b.errors));
  const mk = (grey) => { const d = json('tokens', 'pass.json'); d.primitive.color.paper.$value = '#ffffff'; d.primitive.color['ink-soft'].$value = grey; return buildTokens(d); };
  assert.equal(mk('#767676').errors.length, 0, '#767676 on white is 4.54:1 and passes AA');
  assert.ok(mk('#777777').errors.some((e) => e.kind === 'contrast' && /4\.47:1/.test(e.message)), '#777777 on white is 4.478:1 and fails: the threshold is not rounded');
});
test('tokens: a theme that forgets a role is rejected', () => {
  assert.ok(buildTokens(json('tokens', 'fail-theme.json')).errors.some((e) => e.kind === 'theme-mismatch' && /text-soft/.test(e.message)));
});
test('tokens: no declared pairs means nothing was measured, which is an error, and a pair cannot ask for less than AA', () => {
  const d = json('tokens', 'pass.json'); delete d.$extensions;
  assert.ok(buildTokens(d).errors.some((e) => /declare the text\/background pairs/.test(e.message)));
  const e = json('tokens', 'pass.json'); e.$extensions.brief2motion.pairs[0].kind = 'decorative';
  assert.ok(buildTokens(e).errors.some((x) => /kind must be text, large or ui/.test(x.message)));
});
test('tokens: flatten, resolve and cssValue on small inputs', () => {
  const { map } = flatten({ a: { $type: 'color', x: { $value: '#fff' }, y: { $value: '{a.x}' } }, b: { $value: 3 } });
  assert.deepEqual([...map.keys()], ['a.x', 'a.y', 'b']);
  assert.equal(resolve(map, 'a.y', []).value, '#fff');
  assert.equal(resolve(map, 'a.y', []).type, 'color');
  assert.equal(cssValue({ value: 1.5, unit: 'rem' }, 'dimension'), '1.5rem');
  assert.equal(cssValue(['Source Serif', 'serif'], 'fontFamily'), '"Source Serif", serif');
  assert.throws(() => cssValue({ r: 1 }, 'color'), /cannot write an object/);
});
test('build_tokens CLI: writes the CSS, --check notices drift, exit codes follow the verdict', () => {
  const dir = tmp('tok'), out = path.join(dir, 'site', 'tokens.css');
  const run = (...a) => runChecker('build_tokens.mjs', a, { json: false });
  const pass = path.join(FIX, 'tokens', 'pass.json');
  assert.equal(run(pass, '--out', out).status, 0);
  assert.equal(fs.existsSync(out), true);
  assert.equal(run(pass, '--out', out, '--check').status, 0);
  fs.appendFileSync(out, '/* edited by hand */\n');
  assert.equal(run(pass, '--out', out, '--check').status, 1, 'a hand-edited file is out of date');
  for (const f of ['fail-missing-ref', 'fail-cycle', 'fail-contrast', 'fail-theme']) assert.equal(run(path.join(FIX, 'tokens', `${f}.json`), '--out', path.join(dir, `${f}.css`)).status, 1, f);
  assert.equal(fs.existsSync(path.join(dir, 'fail-cycle.css')), false, 'a failing file writes no CSS');
  assert.equal(run('nope.json').status, 2);
});

// ---- the sitemap ----
test('sitemap: the markdown shows the route tree and the xml lists only indexable routes', () => {
  const doc = loadRoutes(path.join(FIX, 'meta', 'pass', 'routes.json'));
  const md = sitemapMd(doc);
  assert.match(md, /Generated from routes\.json/);
  assert.match(md, /^- \*\*Fixture Bakery\*\* `\/` \(home, landing\)/m);
  assert.match(md, /^ {2}- \*\*Order\*\* `\/contact\/`/m);
  assert.match(md, /^ {4}- \*\*Thanks\*\* `\/thanks\/` \(thanks, page, not indexed\)/m);
  const xml = sitemapXml(doc);
  assert.match(xml, /<loc>https:\/\/bakery\.example\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/bakery\.example\/contact\/<\/loc>/);
  assert.doesNotMatch(xml, /thanks/);
});
test('build_sitemap CLI writes both files and --check notices a stale one', () => {
  const dir = tmp('sm'); fs.cpSync(path.join(FIX, 'meta', 'pass'), dir, { recursive: true });
  const run = (...a) => runChecker('build_sitemap.mjs', [dir, ...a], { json: false });
  assert.equal(run('--check').status, 1, 'nothing written yet');
  assert.equal(run().status, 0);
  assert.equal(run('--check').status, 0);
  assert.equal(fs.readFileSync(path.join(dir, 'site', 'sitemap.xml'), 'utf8').includes('thanks'), false);
  fs.appendFileSync(path.join(dir, 'SITEMAP.md'), 'hand edit\n');
  assert.equal(run('--check').status, 1);
});

