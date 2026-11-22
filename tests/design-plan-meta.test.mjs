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


// ---- boundaries and single-cause failures: each case starts from the passing fixture and breaks exactly one thing ----
const copyOf = (kind, name) => { const dir = tmp(name); fs.cpSync(path.join(FIX, kind, 'pass'), dir, { recursive: true }); return dir; };
const editFile = (file, fn) => fs.writeFileSync(file, fn(fs.readFileSync(file, 'utf8')));
const editJson = (file, fn) => editFile(file, (t) => JSON.stringify(fn(JSON.parse(t))));
const byId = (rs, id, route) => rs.find((r) => r.id === id && (route === undefined || r.route === route));
const png = (w, h) => { const b = Buffer.alloc(33); Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b); b.writeUInt32BE(13, 8); b.write('IHDR', 12); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20); return b; };

test('check_plan: a loop of parents, a form without states, a route two hops from home, an unlisted image and a missing wireframe each have their own result', () => {
  const loop = copyOf('plan', 'plan-loop');
  editJson(path.join(loop, 'routes.json'), (d) => { d.routes[0].parent = 'contact'; return d; });
  assert.match(byId(planChecks(loop), 'plan.routes-valid').reason, /parents loop/);

  const nostates = copyOf('plan', 'plan-states');
  editJson(path.join(nostates, 'routes.json'), (d) => { d.routes[1].states = []; return d; });
  assert.equal(byId(planChecks(nostates), 'plan.states-declared').outcome, 'REVIEW');

  const deep = copyOf('plan', 'plan-deep');
  editJson(path.join(deep, 'routes.json'), (d) => { d.routes[1].links.push('faq'); d.routes.push({ id: 'faq', path: '/faq/', parent: 'contact', template: 'landing', title: 'Questions', links: ['home'] }); return d; });
  assert.equal(byId(planChecks(deep), 'plan.reachable').outcome, 'PASS', 'a route linked only from a page one hop from home is still reachable');

  const loose = copyOf('plan', 'plan-loose');
  fs.writeFileSync(path.join(loose, 'site', 'assets', 'extra.png'), png(10, 10));
  const l = byId(planChecks(loose), 'plan.assets-listed');
  assert.equal(l.outcome, 'REVIEW'); assert.match(l.reason, /extra\.png/);

  const nowire = copyOf('plan', 'plan-nowire');
  fs.rmSync(path.join(nowire, 'wireframes', 'form.html'));
  const w = byId(planChecks(nowire), 'plan.wireframes');
  assert.equal(w.outcome, 'FAIL'); assert.match(w.reason, /no wireframe for template "form"/);
});

test('check_meta: og:url must be present and equal the canonical; a relative canonical fails; an indexable page cannot carry noindex', () => {
  const home = (dir) => path.join(dir, 'site', 'index.html');
  const run = (edit, name) => { const dir = copyOf('meta', name); editFile(home(dir), edit); return metaChecks(dir); };
  const og = (rs) => byId(rs, 'meta.og', 'home');
  const differs = og(run((h) => h.replace('og:url" content="https://bakery.example/"', 'og:url" content="https://bakery.example/other/"'), 'meta-ogurl'));
  assert.equal(differs.outcome, 'FAIL'); assert.match(differs.reason, /og:url .* differs from the canonical/);
  const gone = og(run((h) => h.replace(/<meta property="og:url"[^>]*>\n/, ''), 'meta-ognourl'));
  assert.equal(gone.outcome, 'FAIL'); assert.match(gone.reason, /missing og:url/);
  const rel = byId(run((h) => h.replace('canonical" href="https://bakery.example/"', 'canonical" href="/"'), 'meta-rel'), 'meta.canonical', 'home');
  assert.equal(rel.outcome, 'FAIL'); assert.match(rel.reason, /not an absolute address/);
  const noOrigin = (href, name) => { const dir = copyOf('meta', name); editJson(path.join(dir, 'routes.json'), (d) => { delete d.site.origin; return d; }); editFile(home(dir), (h) => h.replace('canonical" href="https://bakery.example/"', `canonical" href="${href}"`)); return byId(metaChecks(dir), 'meta.canonical', 'home').outcome; };
  assert.deepEqual([noOrigin('/', 'meta-noorigin-rel'), noOrigin('https://bakery.example/', 'meta-noorigin-abs')], ['FAIL', 'PENDING'], 'without site.origin an absolute canonical cannot be compared, but a relative one is still wrong');
  const noidx = byId(run((h) => h.replace('</head>', '<meta name="robots" content="noindex"></head>'), 'meta-noindex'), 'meta.robots', 'home');
  assert.equal(noidx.outcome, 'FAIL'); assert.match(noidx.reason, /meant to be indexed but has noindex/);
});

test('check_meta: the length limits are exact (description 49/50/160/161 characters, title 9/10/70/71)', () => {
  const home = (dir) => path.join(dir, 'site', 'index.html');
  const withDesc = (n) => { const dir = copyOf('meta', `meta-d${n}`); editFile(home(dir), (h) => h.replace(/(name="description" content=")[^"]*/, `$1${'d'.repeat(n)}`)); return byId(metaChecks(dir), 'meta.description', 'home').outcome; };
  assert.deepEqual([49, 50, 160, 161].map(withDesc), ['FAIL', 'PASS', 'PASS', 'REVIEW']);
  const withTitle = (n) => { const dir = copyOf('meta', `meta-t${n}`); editFile(home(dir), (h) => h.replace(/<title>[^<]*/, `<title>${'t'.repeat(n)}`)); return byId(metaChecks(dir), 'meta.title', 'home').outcome; };
  assert.deepEqual([9, 10, 70, 71].map(withTitle), ['REVIEW', 'PASS', 'PASS', 'REVIEW']);
});

test('check_meta: a second page with the same description fails; the sitemap fails when it lists a noindex page; the og:image limits are exact (599x315 / 600x314 fail, 600x315 passes)', () => {
  const dup = copyOf('meta', 'meta-dup');
  const homeDesc = fs.readFileSync(path.join(dup, 'site', 'index.html'), 'utf8').match(/name="description" content="([^"]*)"/)[1];
  const contact = path.join(dup, 'site', 'contact', 'index.html');
  editFile(contact, (h) => h.replace(/(name="description" content=")[^"]*/, `$1${homeDesc}`));
  assert.ok(metaChecks(dup).some((r) => r.id === 'meta.description' && r.outcome === 'FAIL' && /same description/.test(r.reason)));

  const extra = copyOf('meta', 'meta-extra');
  editFile(path.join(extra, 'site', 'sitemap.xml'), (x) => x.replace('</urlset>', '  <url><loc>https://bakery.example/thanks/</loc></url>\n</urlset>'));
  const sm = byId(metaChecks(extra), 'meta.sitemap');
  assert.equal(sm.outcome, 'FAIL'); assert.match(sm.reason, /lists pages that should not be there: https:\/\/bakery\.example\/thanks\//);

  const sized = (w, h) => { const dir = copyOf('meta', `meta-img${w}x${h}`); fs.writeFileSync(path.join(dir, 'site', 'assets', 'og.png'), png(w, h)); return byId(metaChecks(dir), 'meta.og-image', 'home').outcome; };
  assert.deepEqual([sized(599, 315), sized(600, 314), sized(600, 315)], ['FAIL', 'FAIL', 'PASS']);
});
