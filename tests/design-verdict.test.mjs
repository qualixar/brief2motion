// Site mode: what a run means. PENDING is evidence that does not exist yet (a site not built, axe-core offline), so a
// run with PENDING checks is INCOMPLETE, never PASS; --strict exits 1 on it. Nothing checked is a FAIL. qa.json says the
// same, and marks records measured on an older build of the site as stale.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { FIX, tmp, runChecker } from './_design_helpers.mjs';
import { result, verdict, passes, writeQa, printResults, parseArgs, listOf } from '../skills/brief2motion/scripts/_design.mjs';

const capture = (fn) => { const lines = [], log = console.log; console.log = (...a) => lines.push(a.join(' ')); try { fn(); } finally { console.log = log; } return lines.join('\n'); };

test('verdict: FAIL beats everything, PENDING makes a run INCOMPLETE, strict turns REVIEW and PENDING into FAIL, nothing is FAIL', () => {
  const P = result('a', 'PASS'), R = result('b', 'REVIEW'), W = result('c', 'PENDING'), F = result('d', 'FAIL');
  assert.equal(verdict([P, R]), 'PASS');
  assert.equal(verdict([P, W]), 'INCOMPLETE');
  assert.equal(verdict([W]), 'INCOMPLETE');
  assert.equal(verdict([P, W, F]), 'FAIL');
  assert.equal(verdict([]), 'FAIL');
  assert.equal(verdict([P, W], { strict: true }), 'FAIL');
  assert.equal(verdict([P, R], { strict: true }), 'FAIL');
  assert.deepEqual([passes([P, W]), passes([P, W], { strict: true }), passes([W], { strict: true })], [true, false, false]);
});
test('printResults never prints PASS for a run with PENDING checks or with no checks, and always lists PENDING lines', () => {
  const out = capture(() => printResults('t', [result('a', 'PASS'), result('b', 'PENDING', { reason: 'axe offline' })], '', (r) => r.outcome === 'FAIL'));
  assert.match(out, /RESULT: INCOMPLETE {3}1 pass, 0 fail, 0 review, 1 pending/);
  assert.match(out, /PENDING b {2}\(axe offline\)/, 'a filter that hides PASS lines still shows PENDING');
  assert.match(out, /no evidence yet \(PENDING\), so this is not a pass\. --strict exits 1/);
  assert.doesNotMatch(out, /RESULT: PASS/);
  assert.match(capture(() => printResults('t', [])), /RESULT: FAIL .*\nNothing was checked/);
  assert.match(capture(() => printResults('t', [result('a', 'PASS')])), /RESULT: PASS/);
});
test('qa.json carries the verdict, whether it is complete, and marks records from an older build of the site as stale', () => {
  const dir = tmp('qa-v'), site = tmp('qa-site'), read = () => JSON.parse(fs.readFileSync(path.join(dir, 'qa.json'), 'utf8'));
  fs.writeFileSync(path.join(site, 'index.html'), '<p>one</p>');
  writeQa(dir, 'check_a11y', [result('a11y.axe', 'PENDING')], {}, { site });
  assert.deepEqual([read().verdict, read().pass, read().complete], ['INCOMPLETE', true, false]);
  writeQa(dir, 'check_a11y', [result('a11y.axe', 'PASS')], {}, { site });
  assert.deepEqual([read().verdict, read().complete, read().staleCheckers], ['PASS', true, []]);
  assert.ok(read().results.every((r) => r.when && r.siteHash), 'each record says when and on which build it was measured');
  fs.writeFileSync(path.join(site, 'index.html'), '<p>two, a new build</p>');
  writeQa(dir, 'check_meta', [result('meta.title', 'PASS')], {}, { site });
  const q = read();
  assert.equal(q.results.find((r) => r.checker === 'check_a11y').stale, true, 'the a11y PASS was measured on the old build');
  assert.deepEqual([q.verdict, q.complete, q.staleCheckers], ['INCOMPLETE', false, ['check_a11y']]);
  writeQa(dir, 'check_a11y', [result('a11y.axe', 'PASS')], {}, { site });
  assert.deepEqual([read().verdict, read().staleCheckers], ['PASS', []], 'running the checker again clears it');
});
test('arguments: --out=dir works, a value option with no value and an unusable width or theme are errors', () => {
  assert.deepEqual(parseArgs(['p', '--out=o'], { value: ['out'] }).opts, { out: 'o' });
  assert.throws(() => parseArgs(['p', '--out'], { value: ['out'] }), /--out needs a value/);
  assert.throws(() => parseArgs(['p', '--out', '--strict'], { value: ['out'], flags: ['strict'] }), /--out needs a value/);
  assert.throws(() => parseArgs(['p', '--strict=1'], { flags: ['strict'] }), /--strict takes no value/);
  assert.deepEqual(listOf('390, 1440', '1', 'widths'), [390, 1440]);
  assert.throws(() => listOf('0', '390', 'widths'), /pixel widths from 200 to 4000/);
  assert.throws(() => listOf('390px', '390', 'widths'), /not 390px/);
  assert.deepEqual(listOf(undefined, 'light', 'themes'), ['light']);
  assert.throws(() => listOf('light,dakr', 'light', 'themes'), /not dakr/);
});
test('check_meta on a project whose site is not built is INCOMPLETE, not PASS, and --strict exits 1', () => {
  const dir = tmp('unbuilt');
  fs.copyFileSync(path.join(FIX, 'meta', 'pass', 'routes.json'), path.join(dir, 'routes.json'));
  const r = runChecker('check_meta.mjs', [dir, '--out', tmp('unbuilt-out')], { json: false });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /RESULT: INCOMPLETE/); assert.doesNotMatch(r.stdout, /RESULT: PASS/);
  assert.equal(runChecker('check_meta.mjs', [dir, '--out', tmp('unbuilt-out'), '--strict'], { json: false }).status, 1);
});
test('a mistyped width is refused before any browser starts (exit 2), instead of an empty run', () => {
  const r = runChecker('check_layout.mjs', [path.join(FIX, 'layout', 'pass'), '--widths', '0', '--out', tmp('w0')], { json: false });
  assert.equal(r.status, 2); assert.match(r.stderr, /--widths takes pixel widths/);
});
