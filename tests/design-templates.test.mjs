// The site-mode template files and the larkspur example are not just text: they pass the checkers they are written for.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, tmp, runChecker } from './_design_helpers.mjs';

const TPL = path.join(ROOT, 'skills', 'brief2motion', 'templates', 'site-mode');
const LK = path.join(ROOT, 'examples', 'larkspur');
const files = (dir) => fs.readdirSync(dir, { recursive: true }).filter((f) => fs.statSync(path.join(dir, f)).isFile());

test('the template folder has one file for each stage, filled in, with no placeholder left', () => {
  for (const f of ['README.md', 'DISCOVERY.md', 'CONTENT.md', 'routes.json', 'SITEMAP.md', 'ASSETS.json', 'DESIGN.md', 'MOTION.md', 'tokens.json', 'journeys.json', 'wireframes/landing.html']) assert.ok(fs.existsSync(path.join(TPL, f)), f);
  for (const f of files(TPL)) {
    const text = fs.readFileSync(path.join(TPL, f), 'utf8');
    assert.doesNotMatch(text, /\{\{|lorem ipsum|\bTODO\b|\bTBD\b/i, `${f} has a placeholder`);
    assert.ok(text.split('\n').length < 400, `${f} is under 400 lines`);
  }
});
test('the template project passes the plan check (the site is not built, so that part is pending), its tokens build and its sitemap is current', () => {
  const plan = runChecker('check_plan.mjs', [TPL, '--out', tmp('tpl')]);
  assert.equal(plan.status, 0);
  assert.deepEqual(plan.results.filter((r) => r.outcome !== 'PASS').map((r) => `${r.id}:${r.outcome}`), ['plan.links-built:PENDING']);
  assert.equal(runChecker('build_tokens.mjs', [path.join(TPL, 'tokens.json'), '--out', path.join(tmp('tpl-tok'), 'tokens.css')], { json: false }).status, 0);
  assert.equal(runChecker('build_sitemap.mjs', [TPL, '--check', '--no-xml'], { json: false }).status, 0);
});
test('the template wireframe passes the layout check at four widths', (t) => {
  const r = runChecker('check_layout.mjs', [TPL, '--wireframes', '--out', tmp('tpl-wf')]);
  if (r.status === 2) return t.skip('no browser could start');
  assert.equal(r.status, 0, JSON.stringify(r.results.filter((x) => x.outcome !== 'PASS')));
  assert.equal(r.results.filter((x) => x.outcome !== 'PASS').length, 0);
});

test('the larkspur example is clearly fictional and invents no proof', () => {
  const content = fs.readFileSync(path.join(LK, 'CONTENT.md'), 'utf8');
  const pages = ['index.html', 'pricing/index.html', 'start/index.html'].map((f) => fs.readFileSync(path.join(LK, 'site', f), 'utf8'));
  for (const html of pages) assert.match(html, /made-up product/i, 'every page says the product is made up');
  const all = pages.join('\n') + content;
  assert.doesNotMatch(all, /testimonial|trusted by|\d+ stars|customers? (say|love)|as seen (in|on)|award[- ]winning/i, 'no invented proof');
  assert.match(fs.readFileSync(path.join(LK, 'BRIEF.md'), 'utf8'), /No customers, no logos, no reviews/);
});
test('the larkspur example carries every stage file and the unchanged kit', () => {
  for (const f of ['BRIEF.md', 'DISCOVERY.md', 'CONTENT.md', 'routes.json', 'SITEMAP.md', 'wireframes/landing.html', 'wireframes/pricing.html', 'wireframes/form.html', 'tokens.json', 'DESIGN.md', 'SPEC.md', 'MOTION.md', 'ASSETS.json', 'journeys.json', 'qa.json', 'site-report.json', 'README.md', 'REPORT.md', 'site/tokens.css', 'site/sitemap.xml', 'site/robots.txt', 'site/assets/og.png']) assert.ok(fs.existsSync(path.join(LK, f)), f);
  const kit = path.join(ROOT, 'skills', 'brief2motion', 'kit');
  for (const f of fs.readdirSync(kit).filter((x) => x !== 'tune.js')) assert.equal(fs.readFileSync(path.join(LK, 'site', 'kit', f), 'utf8'), fs.readFileSync(path.join(kit, f), 'utf8'), `kit/${f} is unchanged`);
  assert.equal(fs.existsSync(path.join(LK, 'site', 'kit', 'tune.js')), false);
});
test('the larkspur reports are passing records of real runs', () => {
  const qa = JSON.parse(fs.readFileSync(path.join(LK, 'qa.json'), 'utf8'));
  assert.equal(qa.pass, true); assert.equal(qa.summary.FAIL, 0);
  const checkers = new Set(qa.results.map((r) => r.checker));
  for (const c of ['build_tokens', 'check_plan', 'check_layout', 'check_a11y', 'check_journeys', 'check_meta']) assert.ok(checkers.has(c), c);
  assert.equal(qa.environment.axe, '4.14.1');
  assert.ok(qa.results.some((r) => r.id === 'a11y.axe' && r.measured > 10 && r.theme === 'dark'), 'axe ran in the dark theme');
  assert.ok(qa.results.some((r) => r.id === 'journey.start-trial.integration' && r.outcome === 'PENDING'), 'the fixture sign-up is PENDING, not PASS');
  const site = JSON.parse(fs.readFileSync(path.join(LK, 'site-report.json'), 'utf8'));
  assert.equal(site.pass, true); assert.ok(site.checks.every((c) => c.pass)); assert.deepEqual(Object.keys(site.pages), ['index.html', 'pricing/index.html', 'start/index.html']);
});
test('the larkspur plan, meta and journeys run clean from the command line', (t) => {
  assert.equal(runChecker('check_plan.mjs', [LK, '--out', tmp('lk')]).status, 0);
  assert.equal(runChecker('check_meta.mjs', [LK, '--out', tmp('lk')]).status, 0);
  const j = runChecker('check_journeys.mjs', [LK, '--out', tmp('lk')]);
  if (j.status === 2) return t.skip('no browser could start');
  assert.equal(j.status, 0, JSON.stringify(j.results.filter((x) => x.outcome === 'FAIL')));
});
