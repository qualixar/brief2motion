// Site mode, the checkers that drive Chrome: check_layout, check_a11y, check_journeys. Each runs from the command line on its
// passing fixture (must exit 0) and on its failing one (must exit 1 and name the defects it was built to find). When no
// browser can start the checker exits 2 and says so; the test is then skipped. Any other exit 2 is a crash and fails the test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FIX, tmp, runChecker, outcomeOf, noBrowser } from './_design_helpers.mjs';
import { AXE, loadAxe } from '../skills/brief2motion/scripts/check_a11y.mjs';

const run = (script, fixture, extra = [], env = {}) => runChecker(script, [path.join(FIX, ...fixture), '--out', tmp('out'), ...extra], { env });

test('the harness skips only when no browser could start; a checker that crashes fails the test', () => {
  const skipped = [];
  const t = { skip: (m) => skipped.push(m) };
  assert.equal(noBrowser(t, { status: 0, stderr: '' }), false);
  assert.equal(noBrowser(t, { status: 1, stderr: '' }), false);
  assert.equal(noBrowser(t, { status: 2, stderr: 'Could not start a browser. Tried, in order:\n  Google Chrome: not found' }), true);
  assert.equal(noBrowser(t, { status: 2, stderr: 'Could not install playwright-core. Run by hand:' }), true);
  assert.equal(skipped.length, 2);
  assert.throws(() => noBrowser(t, { status: 2, stderr: 'check_layout crashed: TypeError: x is not a function' }), /crashed:\ncheck_layout crashed: TypeError/);
});
test('check_layout: the passing page has no failure and nothing to review', (t) => {
  const r = run('check_layout.mjs', ['layout', 'pass']);
  if (noBrowser(t, r)) return;
  assert.ok(r.results, `no JSON on stdout (exit ${r.status}); stdout starts ${JSON.stringify(r.stdout.slice(0, 400))}; stderr ${JSON.stringify(r.stderr.slice(0, 400))}`);
  assert.equal(r.status, 0, JSON.stringify(r.results?.filter((x) => x.outcome !== 'PASS')));
  assert.equal(r.results.filter((x) => x.outcome !== 'PASS').length, 0, JSON.stringify(r.results.filter((x) => x.outcome !== 'PASS')));
  for (const id of ['layout.overflow', 'layout.text-clipped', 'layout.overlap', 'layout.tap-targets', 'layout.line-length', 'layout.focus']) assert.equal(outcomeOf(r.results, id).length, 4, `${id} ran at four widths`);
});
test('check_layout: the failing page fails overflow, clipping, overlap, tap targets and focus, and sends the long line to review', (t) => {
  const r = run('check_layout.mjs', ['layout', 'fail']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  const only = (id, w) => outcomeOf(r.results, id, (x) => x.viewport === `${w}px`)[0];
  assert.equal(only('layout.overflow', 390), 'FAIL');
  assert.equal(only('layout.overflow', 1440), 'PASS', 'the 900 px block fits a desktop');
  for (const id of ['layout.text-clipped', 'layout.overlap', 'layout.tap-targets', 'layout.focus']) for (const w of [320, 390, 768, 1440]) assert.equal(only(id, w), 'FAIL', `${id} at ${w}`);
  assert.equal(only('layout.line-length', 1440), 'REVIEW');
  assert.equal(only('layout.line-length', 320), 'PASS', 'short lines are fine on a phone');
  const why = (id) => r.results.find((x) => x.id === id && x.outcome === 'FAIL').reason;
  assert.match(why('layout.overflow'), /div\.wide/); assert.match(why('layout.text-clipped'), /div\.cut/); assert.match(why('layout.overlap'), /p\.a.*p\.b|p\.b.*p\.a/);
  assert.match(why('layout.tap-targets'), /button\.tiny/); assert.match(why('layout.focus'), /covered by div\.bar \(fixed\)/);
});
test('check_layout --wireframes runs on the wireframe pages and keeps shots at 390 and 1440', (t) => {
  const out = tmp('wf');
  const r = runChecker('check_layout.mjs', [path.join(FIX, 'plan', 'pass'), '--wireframes', '--out', out, '--widths', '390,1440']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 0, JSON.stringify(r.results.filter((x) => x.outcome === 'FAIL')));
  assert.deepEqual([...new Set(r.results.map((x) => x.route))].sort(), ['form', 'landing']);
  for (const f of ['landing-390.png', 'landing-1440.png', 'form-390.png']) assert.ok(fs.statSync(path.join(out, 'shots', f)).size > 500, f);
});

test('check_a11y: the passing page has no violation and its primary action is reached by Tab', (t) => {
  const r = run('check_a11y.mjs', ['a11y', 'pass']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 0, JSON.stringify(r.results.filter((x) => x.outcome !== 'PASS')));
  assert.deepEqual(outcomeOf(r.results, 'a11y.keyboard-primary'), ['PASS', 'PASS']);
  if (outcomeOf(r.results, 'a11y.axe').includes('PENDING')) return t.diagnostic('axe-core could not be loaded (offline): axe assertions skipped');
  assert.deepEqual(outcomeOf(r.results, 'a11y.axe'), ['PASS', 'PASS']);
});
test('check_a11y: the failing page fails axe rules (image alt, button name, label, contrast) and the keyboard walk', (t) => {
  const r = run('check_a11y.mjs', ['a11y', 'fail']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  assert.deepEqual(outcomeOf(r.results, 'a11y.keyboard-primary'), ['FAIL', 'FAIL'], 'tabindex=-1 puts the primary action out of reach');
  if (outcomeOf(r.results, 'a11y.axe').includes('PENDING')) return t.diagnostic('axe-core could not be loaded (offline): axe assertions skipped');
  for (const id of ['image-alt', 'button-name', 'label', 'color-contrast']) assert.deepEqual(outcomeOf(r.results, `a11y.axe.${id}`), ['FAIL', 'FAIL'], id);
  assert.deepEqual(outcomeOf(r.results, 'a11y.axe'), ['FAIL', 'FAIL'], 'the per-page summary fails too, so a report that shows only summaries still shows the failure');
});
test('check_a11y offline: the axe results are PENDING with a message, the keyboard walk still runs, and nothing is blamed on the page', (t) => {
  const r = run('check_a11y.mjs', ['a11y', 'pass'], [], { BRIEF2MOTION_OFFLINE: '1', BRIEF2MOTION_AXE_CACHE: tmp('empty') });
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 0);
  assert.deepEqual(outcomeOf(r.results, 'a11y.axe'), ['PENDING', 'PENDING']);
  assert.match(r.results.find((x) => x.id === 'a11y.axe').reason, /axe-core not run: BRIEF2MOTION_OFFLINE is set/);
  assert.match(r.stderr, /axe-core skipped: .*keyboard walk still runs/);
  assert.deepEqual(outcomeOf(r.results, 'a11y.keyboard-primary'), ['PASS', 'PASS']);
});

test('loadAxe verifies the pinned hash before it uses or keeps a file', async () => {
  const body = Buffer.from('window.axe = {};');
  const good = { ...AXE, integrity: `sha384-${(await import('node:crypto')).createHash('sha384').update(body).digest('base64')}` };
  const ok = async () => ({ ok: true, status: 200, arrayBuffer: async () => body });
  const dir = tmp('axe');
  const first = await loadAxe({ fetchImpl: ok, cacheDir: dir, pin: good });
  assert.deepEqual([first.ok, first.from, first.source], [true, 'cdn.jsdelivr.net', 'window.axe = {};']);
  const second = await loadAxe({ fetchImpl: async () => { throw new Error('network is down'); }, cacheDir: dir, pin: good });
  assert.deepEqual([second.ok, second.from], [true, 'cache']);
  const tampered = tmp('axe-bad');
  const evil = async () => ({ ok: true, status: 200, arrayBuffer: async () => Buffer.from('window.axe = { evil: 1 };') });
  const bad = await loadAxe({ fetchImpl: evil, cacheDir: tampered, pin: good });
  assert.equal(bad.ok, false); assert.match(bad.reason, /does not match its pinned integrity hash/);
  assert.equal(fs.existsSync(path.join(tampered, 'axe.min.js')), false, 'a file that fails the hash is not kept');
  fs.mkdirSync(tampered, { recursive: true }); fs.writeFileSync(path.join(tampered, 'axe.min.js'), 'window.axe = { cachedButChanged: 1 };');
  assert.equal((await loadAxe({ fetchImpl: ok, cacheDir: tampered, pin: good })).from, 'cdn.jsdelivr.net', 'a cached file with the wrong hash is replaced, not trusted');
  const offline = await loadAxe({ fetchImpl: async () => { throw new Error('getaddrinfo ENOTFOUND'); }, cacheDir: tmp('axe-none'), pin: good });
  assert.equal(offline.ok, false); assert.match(offline.reason, /could not download axe-core 4\.14\.1 from cdn\.jsdelivr\.net.*offline\?/);
  const http = await loadAxe({ fetchImpl: async () => ({ ok: false, status: 503 }), cacheDir: tmp('axe-503'), pin: good });
  assert.match(http.reason, /answered 503/);
});
test('the pinned axe-core is MPL-2.0 version 4.14.1, loaded from jsDelivr with a SHA-384 hash', () => {
  assert.equal(AXE.version, '4.14.1');
  assert.match(AXE.url, /^https:\/\/cdn\.jsdelivr\.net\/npm\/axe-core@4\.14\.1\/axe\.min\.js$/);
  assert.match(AXE.integrity, /^sha384-[A-Za-z0-9+/]{64}$/);
});

test('check_journeys: the passing journey completes on a phone and a desktop, and the fixture is left PENDING for the real service', (t) => {
  const r = run('check_journeys.mjs', ['journeys', 'pass']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 0, JSON.stringify(r.results.filter((x) => x.outcome === 'FAIL')));
  assert.deepEqual(outcomeOf(r.results, 'journey.start-trial'), ['PASS', 'PASS']);
  assert.deepEqual(outcomeOf(r.results, 'journey.start-trial.console'), ['PASS', 'PASS']);
  assert.deepEqual(outcomeOf(r.results, 'journey.start-trial.integration'), ['PENDING', 'PENDING']);
});
test('check_journeys: a broken submit and a missing link both fail, and the console error is reported', (t) => {
  const r = run('check_journeys.mjs', ['journeys', 'fail']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  assert.deepEqual(outcomeOf(r.results, 'journey.broken-submit'), ['FAIL', 'FAIL']);
  assert.match(r.results.find((x) => x.id === 'journey.broken-submit').reason, /expected status/);
  assert.deepEqual(outcomeOf(r.results, 'journey.broken-submit.console'), ['FAIL', 'FAIL']);
  assert.match(r.results.find((x) => x.id === 'journey.broken-submit.console').reason, /nothingDefinedHere is not defined/);
  assert.deepEqual(outcomeOf(r.results, 'journey.missing-link'), ['FAIL', 'FAIL']);
  assert.match(r.results.find((x) => x.id === 'journey.missing-link').reason, /step 1 \(click link "Begin your free trial"\)/);
  assert.equal(outcomeOf(r.results, 'journey.broken-submit.integration').length, 0, 'a journey that failed does not claim an integration is pending');
});
