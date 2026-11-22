// Site mode, the checkers that need no browser, on inputs that used to give a wrong answer: robots.txt groups, encoded and
// non-ASCII link paths, a sitemap with no origin, routes.json fields of the wrong type and an og:image with a query string.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FIX, tmp, runChecker } from './_design_helpers.mjs';
import { metaChecks, robotsBlocksAll } from '../skills/brief2motion/scripts/check_meta.mjs';
import { planChecks } from '../skills/brief2motion/scripts/check_plan.mjs';
import { loadRoutes } from '../skills/brief2motion/scripts/_design.mjs';

const copy = (fixture, name) => { const d = tmp(name); fs.cpSync(path.join(FIX, ...fixture), d, { recursive: true }); return d; };
const one = (rs, id) => rs.find((x) => x.id === id);

test('robots.txt: only the group for every crawler (*) decides; blocking one named crawler is fine', () => {
  assert.equal(robotsBlocksAll('User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n'), false);
  assert.equal(robotsBlocksAll('User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /\n\nUser-agent: *\nDisallow: /private/\n'), false);
  assert.equal(robotsBlocksAll('User-agent: *\nDisallow: /\n'), true);
  assert.equal(robotsBlocksAll('User-agent: Googlebot\nUser-agent: *\nDisallow: /   # closed\n'), true, 'a group can name several agents, comments are ignored');
  assert.equal(robotsBlocksAll('user-agent:*\r\ndisallow:/\r\n'), true, 'case and CRLF do not matter');
  assert.equal(robotsBlocksAll('User-agent: *\nDisallow:\n'), false, 'an empty Disallow allows everything');
  assert.equal(robotsBlocksAll('User-agent: *\nDisallow: /\nAllow: /\n'), false, 'Allow: / reopens the site for the same agent');
  const d = copy(['meta', 'pass'], 'robots');
  fs.writeFileSync(path.join(d, 'site', 'robots.txt'), 'User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n');
  assert.equal(one(metaChecks(d), 'meta.robots-txt').outcome, 'PASS');
});
test('og:image with a query string or fragment is read from its file, not from a name with "?v=2" in it', () => {
  const d = copy(['meta', 'pass'], 'ogq');
  for (const f of ['index.html', 'contact/index.html', 'thanks/index.html']) {
    const p = path.join(d, 'site', f);
    if (fs.existsSync(p)) fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace('https://bakery.example/assets/og.png"', 'https://bakery.example/assets/og.png?v=2#x"'));
  }
  assert.equal(one(metaChecks(d), 'meta.og-image').outcome, 'PASS', one(metaChecks(d), 'meta.og-image').reason);
});
test('a sitemap with relative addresses FAILs, and build_sitemap refuses to write one without site.origin', () => {
  const d = copy(['meta', 'pass'], 'smrel');
  fs.writeFileSync(path.join(d, 'site', 'sitemap.xml'), '<?xml version="1.0"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>/</loc></url>\n  <url><loc>/contact/</loc></url>\n</urlset>\n');
  const r = JSON.parse(fs.readFileSync(path.join(d, 'routes.json'), 'utf8')); delete r.site.origin; fs.writeFileSync(path.join(d, 'routes.json'), JSON.stringify(r));
  const sm = one(metaChecks(d), 'meta.sitemap');
  assert.equal(sm.outcome, 'FAIL'); assert.match(sm.reason, /not absolute/);
  const b = runChecker('build_sitemap.mjs', [d], { json: false });
  assert.equal(b.status, 2); assert.match(b.stderr, /needs "site": \{ "origin"/);
  assert.equal(runChecker('build_sitemap.mjs', [d, '--no-xml'], { json: false }).status, 0, 'SITEMAP.md alone needs no origin');
});
test('check_plan: links to encoded and non-ASCII paths that exist in the site are not reported as leading nowhere', () => {
  const d = copy(['plan', 'pass'], 'enc');
  fs.mkdirSync(path.join(d, 'site', 'menu files'), { recursive: true }); fs.writeFileSync(path.join(d, 'site', 'menu files', 'list.pdf'), '%PDF-1.4');
  fs.mkdirSync(path.join(d, 'site', 'über'), { recursive: true }); fs.writeFileSync(path.join(d, 'site', 'über', 'index.html'), '<p>über</p>');
  const home = path.join(d, 'site', 'index.html');
  fs.writeFileSync(home, fs.readFileSync(home, 'utf8').replace('</body>', '<a href="/menu%20files/list.pdf">menu</a> <a href="/menu files/list.pdf">menu</a> <a href="/über/">über</a> <a href="/nope/">nope</a></body>'));
  const lb = one(planChecks(d), 'plan.links-built');
  assert.doesNotMatch(lb.reason, /menu|über|%C3/);
  assert.match(lb.reason, /link \/nope\/ leads nowhere/, 'a link that really leads nowhere is still found');
});
test('routes.json fields of the wrong type are refused with a message, not a stack trace', () => {
  const d = copy(['meta', 'pass'], 'types'), file = path.join(d, 'routes.json');
  const r = JSON.parse(fs.readFileSync(file, 'utf8'));
  const bad = (mut, re) => { const c = structuredClone(r); mut(c); fs.writeFileSync(file, JSON.stringify(c)); assert.throws(() => loadRoutes(file), re); };
  bad((c) => { c.routes[0].links = 'pricing'; }, /routes\.json: route "home": "links" must be a list of route ids/);
  bad((c) => { c.routes[0].path = 3; }, /route "home": "path" must be a string/);
  bad((c) => { c.routes[0].states = {}; }, /"states" must be a list/);
  bad((c) => { c.routes[0].indexable = 'no'; }, /"indexable" must be true or false/);
  bad((c) => { c.routes[0].primaryAction = 'Order'; }, /"primaryAction" must be an object with a "label"/);
  bad((c) => { c.routes[1] = 'contact'; }, /routes\.json: route 2 must be an object/);
  const c = structuredClone(r); c.routes[0].links = 'contact'; fs.writeFileSync(file, JSON.stringify(c));
  const s = runChecker('build_sitemap.mjs', [d], { json: false });
  assert.equal(s.status, 2); assert.match(s.stderr, /"links" must be a list/); assert.doesNotMatch(s.stderr, /TypeError|at file:/);
});
test('check_plan FAILs a built site that still carries the dev-only tuning panel', () => {
  const d = copy(['plan', 'pass'], 'tune');
  assert.equal(one(planChecks(d), 'plan.dev-panel').outcome, 'PASS');
  fs.mkdirSync(path.join(d, 'site', 'kit'), { recursive: true }); fs.writeFileSync(path.join(d, 'site', 'kit', 'tune.js'), 'export const tune = () => {};');
  const r = one(planChecks(d), 'plan.dev-panel');
  assert.equal(r.outcome, 'FAIL'); assert.match(r.reason, /kit\/tune\.js .*strip_tune\.mjs/);
});
