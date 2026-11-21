// Site mode, the static checkers: check_plan and check_meta. Each has a passing fixture and a failing one in
// tests/fixtures/design-checks/; every test below proves the checker accepts the first and fails the second for the reason it exists.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FIX, tmp, runChecker } from './_design_helpers.mjs';
import { planChecks } from '../skills/brief2motion/scripts/check_plan.mjs';
import { metaChecks } from '../skills/brief2motion/scripts/check_meta.mjs';

// ---- check_plan ----
const planOf = (name) => planChecks(path.join(FIX, 'plan', name));
test('check_plan: the passing plan passes every check', () => {
  const rs = planOf('pass');
  assert.equal(rs.filter((r) => r.outcome !== 'PASS').length, 0, JSON.stringify(rs.filter((r) => r.outcome !== 'PASS')));
  assert.ok(rs.length >= 11);
});
test('check_plan: the failing plan fails each check for its own reason', () => {
  const rs = planOf('fail'), by = (id) => rs.find((r) => r.id === id);
  const want = { 'plan.routes-valid': /duplicate path \/contact\/.*parent "ghost"/, 'plan.reachable': /no link leads to: about, archive/, 'plan.tasks-mapped': /T3: route home has no action "subscribe"/,
    'plan.content-routes': /no "## <route id>" section for: about/, 'plan.claims-sourced': /C3: no source.*C4: drafted proof/, 'plan.claims-resolve': /cites C9/,
    'plan.assets-rights': /missing author, licence, alt/, 'plan.wireframes': /primary action "Order a loaf" of home is not a link or button/, 'plan.links-built': /declares a link to contact but index\.html has none/ };
  for (const [id, rx] of Object.entries(want)) { assert.equal(by(id).outcome, 'FAIL', id); assert.match(by(id).reason, rx, id); }
  assert.match(by('plan.links-built').reason, /link \/nowhere\/ leads nowhere/);
});
test('check_plan: a claim marked DRAFTED that holds a figure goes to review, a missing site or wireframes is pending', () => {
  const dir = tmp('plan'); fs.cpSync(path.join(FIX, 'plan', 'pass'), dir, { recursive: true });
  fs.appendFileSync(path.join(dir, 'CONTENT.md'), '| C5 | home | 40 loaves a day | DRAFTED |\n');
  assert.equal(planChecks(dir).find((r) => r.id === 'plan.claims-sourced').outcome, 'REVIEW');
  fs.rmSync(path.join(dir, 'site'), { recursive: true }); fs.rmSync(path.join(dir, 'wireframes'), { recursive: true });
  const rs = planChecks(dir);
  assert.equal(rs.find((r) => r.id === 'plan.links-built').outcome, 'PENDING');
  assert.equal(rs.find((r) => r.id === 'plan.wireframes').outcome, 'PENDING');
});
test('check_plan CLI: exit 0 for the passing plan and 1 for the failing one, and qa.json is written', () => {
  const out = tmp('planqa');
  assert.equal(runChecker('check_plan.mjs', [path.join(FIX, 'plan', 'pass'), '--out', out]).status, 0);
  const bad = runChecker('check_plan.mjs', [path.join(FIX, 'plan', 'fail'), '--out', out]);
  assert.equal(bad.status, 1);
  assert.ok(bad.results.some((r) => r.outcome === 'FAIL'));
  assert.equal(JSON.parse(fs.readFileSync(path.join(out, 'qa.json'), 'utf8')).pass, false);
  assert.equal(runChecker('check_plan.mjs', [path.join(FIX, 'plan', 'nothing-here')]).status, 2);
});

// ---- check_meta ----
test('check_meta: the passing site passes, including a sitemap that leaves out the noindex page', () => {
  const rs = metaChecks(path.join(FIX, 'meta', 'pass'));
  assert.equal(rs.filter((r) => r.outcome !== 'PASS').length, 0, JSON.stringify(rs.filter((r) => r.outcome !== 'PASS')));
  assert.ok(rs.some((r) => r.id === 'meta.og-image' && r.measured === '1200x630'));
});
test('check_meta: the failing site fails each check for its own reason', () => {
  const rs = metaChecks(path.join(FIX, 'meta', 'fail')), has = (id, route, rx, outcome = 'FAIL') => assert.ok(rs.some((r) => r.id === id && r.route === route && r.outcome === outcome && rx.test(r.reason)), `${id} ${route}: ${JSON.stringify(rs.filter((r) => r.id === id && r.route === route))}`);
  has('meta.title', 'home', /same title/); has('meta.description', 'home', /0 characters/); has('meta.canonical', 'home', /no <link rel="canonical">/);
  has('meta.og-image', 'home', /not an absolute address/); has('meta.canonical', 'contact', /is not https:\/\/bakery\.example\/contact\//);
  has('meta.og', 'contact', /missing og:type/); has('meta.og-image', 'contact', /300x300 is under 600x315/); has('meta.robots', 'thanks', /no <meta name="robots"/);
  has('meta.og', 'home', /no og:description/, 'REVIEW');
  const site = (id) => rs.find((r) => r.id === id);
  assert.equal(site('meta.robots-txt').outcome, 'FAIL');
  assert.match(site('meta.sitemap').reason, /missing https:\/\/bakery\.example\/contact\/.*thanks/);
});
test('check_meta: one page needs no sitemap; an unbuilt site is pending; an image on another host is pending', () => {
  const dir = tmp('meta'); fs.cpSync(path.join(FIX, 'meta', 'pass'), dir, { recursive: true });
  const r = JSON.parse(fs.readFileSync(path.join(dir, 'routes.json'), 'utf8')); r.routes = [r.routes[0]]; fs.writeFileSync(path.join(dir, 'routes.json'), JSON.stringify(r));
  fs.rmSync(path.join(dir, 'site', 'sitemap.xml'));
  assert.equal(metaChecks(dir).find((x) => x.id === 'meta.sitemap').outcome, 'PASS');
  const html = path.join(dir, 'site', 'index.html');
  fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('https://bakery.example/assets/og.png', 'https://cdn.other.example/og.png'));
  assert.equal(metaChecks(dir).find((x) => x.id === 'meta.og-image').outcome, 'PENDING');
  fs.rmSync(path.join(dir, 'site'), { recursive: true });
  assert.equal(metaChecks(dir)[0].outcome, 'PENDING');
});
test('check_meta CLI: exit codes follow the verdict', () => {
  const out = tmp('metaqa');
  assert.equal(runChecker('check_meta.mjs', [path.join(FIX, 'meta', 'pass'), '--out', out]).status, 0);
  assert.equal(runChecker('check_meta.mjs', [path.join(FIX, 'meta', 'fail'), '--out', out]).status, 1);
  assert.equal(runChecker('check_meta.mjs', [path.join(FIX, 'meta', 'pass'), '--out', out, '--strict']).status, 0);
});

