// Site mode, shared helpers: geometry, outcomes and qa.json, arguments, markdown tables, route files and the HTML reader.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FIX, tmp } from './_design_helpers.mjs';
import { overlap, overlapsBeyond, contains, imageSize, typicalLineLength } from '../skills/brief2motion/scripts/_measure.mjs';
import { result, summarize, passes, writeQa, parseArgs, mdTable, mdSections, routeFile, targets, loadRoutes, homeOf } from '../skills/brief2motion/scripts/_design.mjs';
import { attrs, tags, textOf, metaContent, hrefs } from '../skills/brief2motion/scripts/_html.mjs';

// ---- geometry and file facts ----
test('overlap counts both axes, and a shared edge or a corner graze is not an overlap', () => {
  const a = { left: 0, top: 0, right: 100, bottom: 20 };
  assert.deepEqual(overlap(a, { left: 90, top: 10, right: 200, bottom: 40 }), { w: 10, h: 10 });
  assert.equal(overlapsBeyond(a, { left: 90, top: 10, right: 200, bottom: 40 }), true);
  assert.equal(overlapsBeyond(a, { left: 100, top: 0, right: 200, bottom: 20 }), false);   // touching edges
  assert.equal(overlapsBeyond(a, { left: 99.5, top: 19.5, right: 200, bottom: 40 }), false);   // under 1 px
  assert.equal(overlapsBeyond(a, { left: 98, top: 18, right: 200, bottom: 40 }, 1), true);
  assert.equal(overlapsBeyond(a, { left: 200, top: 0, right: 300, bottom: 20 }), false);
});
test('contains treats a box inside another as layout', () => {
  const outer = { left: 0, top: 0, right: 100, bottom: 50 };
  assert.equal(contains(outer, { left: 10, top: 10, right: 90, bottom: 40 }), true);
  assert.equal(contains(outer, { left: 10, top: 10, right: 101, bottom: 40 }), false);
  assert.equal(contains(outer, { left: 10, top: 10, right: 100.4, bottom: 40 }), true);   // within the tolerance
});
test('imageSize reads PNG, GIF, JPEG and WebP headers, and refuses other bytes', () => {
  assert.deepEqual(imageSize(fs.readFileSync(path.join(FIX, 'meta', 'pass', 'site', 'assets', 'og.png'))), { type: 'png', w: 1200, h: 630 });
  const gif = Buffer.alloc(30); gif.write('GIF89a'); gif.writeUInt16LE(64, 6); gif.writeUInt16LE(32, 8);
  assert.deepEqual(imageSize(gif), { type: 'gif', w: 64, h: 32 });
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0xff, 0xc0, 0, 11, 8, 2, 0x76, 4, 0xb0, 1, 1, 0x11, 0, 0, 0, 0]);
  assert.deepEqual(imageSize(jpeg), { type: 'jpeg', w: 1200, h: 630 });
  const webp = Buffer.alloc(40); webp.write('RIFF', 0); webp.write('WEBP', 8); webp.write('VP8X', 12); webp.writeUIntLE(1199, 24, 3); webp.writeUIntLE(629, 27, 3);
  assert.deepEqual(imageSize(webp), { type: 'webp', w: 1200, h: 630 });
  assert.equal(imageSize(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>')), null);
  assert.equal(imageSize(null), null);
});
test('typicalLineLength is the median of the full lines and needs three lines', () => {
  assert.equal(typicalLineLength([60, 62, 20]), 62);   // the upper median of the two full lines
  assert.equal(typicalLineLength([40, 90, 70, 15]), 70);
  assert.equal(typicalLineLength([60, 20]), null);
  assert.equal(typicalLineLength(null), null);
});

// ---- outcomes, qa.json, arguments, markdown ----
test('a result must use one of the four outcomes', () => {
  assert.throws(() => result('x', 'WARN'), /outcome must be one of/);
  assert.equal(result('x', 'PASS', { route: 'home' }).route, 'home');
});
test('summaries and the ship decision: FAIL blocks, REVIEW blocks only in strict mode, nothing is not a pass', () => {
  const rs = [result('a', 'PASS'), result('b', 'REVIEW'), result('c', 'PENDING')];
  assert.deepEqual(summarize(rs), { PASS: 1, FAIL: 0, REVIEW: 1, PENDING: 1 });
  assert.equal(passes(rs), true);
  assert.equal(passes(rs, { strict: true }), false);
  assert.equal(passes([...rs, result('d', 'FAIL')]), false);
  assert.equal(passes([]), false);
});
test('writeQa keeps other checkers results and replaces the same checker', () => {
  const dir = tmp('qa');
  writeQa(dir, 'one', [result('a', 'PASS')]);
  writeQa(dir, 'two', [result('b', 'FAIL')]);
  writeQa(dir, 'one', [result('a2', 'PASS'), result('a3', 'REVIEW')], { browser: 'Chrome 1' });
  const qa = JSON.parse(fs.readFileSync(path.join(dir, 'qa.json'), 'utf8'));
  assert.deepEqual(qa.results.map((r) => `${r.checker}:${r.id}`), ['two:b', 'one:a2', 'one:a3']);
  assert.deepEqual(qa.summary, { PASS: 1, FAIL: 1, REVIEW: 1, PENDING: 0 });
  assert.equal(qa.pass, false);
  assert.equal(qa.environment.browser, 'Chrome 1');
});
test('parseArgs separates values, flags and positionals, and refuses unknown options', () => {
  const a = parseArgs(['proj', '--out', 'o', '--strict'], { value: ['out'], flags: ['strict'] });
  assert.deepEqual([a.pos, a.opts, [...a.flags]], [['proj'], { out: 'o' }, ['strict']]);
  assert.throws(() => parseArgs(['--nope'], {}), /unknown option --nope/);
  assert.equal(parseArgs(['--help']).flags.has('help'), true);
});
test('mdTable reads the first table under a heading; mdSections keys sections by their first word', () => {
  const md = '# T\n\n## Tasks\n\n| ID | Route |\n|----|-------|\n| T1 | `home` |\n| T2 | pricing |\n\n## Other\n| A |\n|---|\n| x |\n';
  assert.deepEqual(mdTable(md, /^tasks/i), [{ id: 'T1', route: 'home' }, { id: 'T2', route: 'pricing' }]);
  assert.equal(mdTable(md, /^nothing/i), null);
  assert.deepEqual(Object.keys(mdSections('## home\nx\n## Claims\ny')), ['home', 'claims']);
});
test('routeFile finds the file that serves a path', () => {
  const site = path.join(FIX, 'plan', 'pass', 'site');
  assert.equal(path.relative(site, routeFile(site, '/')), 'index.html');
  assert.equal(path.relative(site, routeFile(site, '/contact/')), path.join('contact', 'index.html'));
  assert.equal(path.relative(site, routeFile(site, '/contact')), path.join('contact', 'index.html'));
  assert.equal(routeFile(site, '/nothing/'), null);
});
test('targets lists each route and each declared state; loadRoutes rejects an empty plan', () => {
  const { routes } = loadRoutes(path.join(FIX, 'plan', 'pass', 'routes.json'));
  assert.deepEqual(targets(routes).map((t) => t.label), ['home', 'contact', 'contact:error']);
  assert.equal(homeOf(routes).id, 'home');
  const dir = tmp('routes'); fs.writeFileSync(path.join(dir, 'routes.json'), '{"routes":[]}');
  assert.throws(() => loadRoutes(path.join(dir, 'routes.json')), /non-empty "routes"/);
  fs.writeFileSync(path.join(dir, 'routes.json'), '{nope');
  assert.throws(() => loadRoutes(path.join(dir, 'routes.json')), /not valid JSON/);
});

// ---- the small HTML reader ----
test('the HTML reader finds attributes, tags, titles and meta content', () => {
  assert.deepEqual(attrs(' href="/a" data-x=\'y\' hidden rel=next'), { href: '/a', 'data-x': 'y', hidden: '', rel: 'next' });
  const html = '<!-- <title>old</title> --><title> Hello  <b>there</b> </title><meta name="Description" content="d"><meta property="og:image" content="/i.png"><a href="/x">x</a><A HREF=/y>y</A>';
  assert.equal(textOf(html, 'title'), 'Hello there');
  assert.equal(metaContent(html, 'description'), 'd');
  assert.equal(metaContent(html, 'og:image'), '/i.png');
  assert.equal(metaContent(html, 'og:title'), null);
  assert.deepEqual(hrefs(html), ['/x', '/y']);
  assert.equal(tags(html, 'meta').length, 2);
});

