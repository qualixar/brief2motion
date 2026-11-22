// Site mode, the browser checkers on the exact edges of their rules (found by planting bugs in the checkers one at a time and keeping every case a test did not catch):
// a target 24 px square passes and 23 px fails, a 40 px primary action is a review on a phone only, text cut in half fails,
// partly covered focus is a review, a tool-undecidable contrast is a review, the 40th Tab stop still counts, and so on.
// Each test runs a checker from the command line on a small fixture and skips itself when no browser can start.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { FIX, SCRIPTS, tmp, runChecker, outcomeOf, noBrowser } from './_design_helpers.mjs';

const run = (script, fixture, extra = []) => runChecker(script, [path.join(FIX, ...fixture), '--out', tmp('edge'), ...extra]);
const at = (r, id, w) => (r.results || []).find((x) => x.id === id && x.viewport === `${w}px`);
const WIDTHS = [320, 390, 768, 1440];

test('check_layout edge: 24 px targets pass, a sentence link is exempt, a 40 px primary action is a review on phones only', (t) => {
  const r = run('check_layout.mjs', ['layout', 'edge']);
  if (noBrowser(t, r)) return;
  assert.ok(r.results, r.stderr.slice(0, 300));
  assert.deepEqual(WIDTHS.map((w) => at(r, 'layout.tap-targets', w).outcome), ['REVIEW', 'REVIEW', 'PASS', 'PASS'], JSON.stringify(WIDTHS.map((w) => at(r, 'layout.tap-targets', w).reason)));
  assert.match(at(r, 'layout.tap-targets', 390).reason, /primary action "Go ahead" is 40 px tall; 44 is easier/);
  assert.equal(at(r, 'layout.tap-targets', 390).input, 'touch'); assert.equal(at(r, 'layout.tap-targets', 768).input, 'keyboard');
});
test('check_layout edge: a 23 px target fails and names itself; text cut in half fails; focus that can never be on screen fails', (t) => {
  const r = run('check_layout.mjs', ['layout', 'edge-fail']);
  if (noBrowser(t, r)) return;
  assert.ok(r.results, r.stderr.slice(0, 300));
  for (const w of WIDTHS) {
    assert.equal(at(r, 'layout.tap-targets', w).outcome, 'FAIL', `tap ${w}`); assert.match(at(r, 'layout.tap-targets', w).reason, /button\.small23 .* 23x23/);
    assert.equal(at(r, 'layout.text-clipped', w).outcome, 'FAIL', `clip ${w}`); assert.match(at(r, 'layout.text-clipped', w).reason, /div\.half .*50% cut off/);
    assert.equal(at(r, 'layout.focus', w).outcome, 'FAIL', `focus ${w}`); assert.match(at(r, 'layout.focus', w).reason, /a\.away .* is off screen/);
  }
});
test('check_layout edge: touching boxes and text inside a box do not overlap; partly covered focus and cut-with-ellipsis go to review', (t) => {
  const r = run('check_layout.mjs', ['layout', 'edge']);
  if (noBrowser(t, r)) return;
  assert.ok(r.results, r.stderr.slice(0, 300));
  for (const w of WIDTHS) {
    assert.equal(at(r, 'layout.overlap', w).outcome, 'PASS', `overlap ${w}: ${at(r, 'layout.overlap', w).reason}`);
    assert.equal(at(r, 'layout.focus', w).outcome, 'REVIEW', `focus ${w}`); assert.match(at(r, 'layout.focus', w).reason, /a\.partial .* partly covered by div\.bar/);
    assert.equal(at(r, 'layout.text-clipped', w).outcome, 'REVIEW', `clip ${w}: ${at(r, 'layout.text-clipped', w).reason}`); assert.match(at(r, 'layout.text-clipped', w).reason, /ellipsis/);
  }
});
test('check_layout edge: a block that becomes 3000 px wide once the page is scrolled is found at the bottom of the page', (t) => {
  const r = run('check_layout.mjs', ['layout', 'edge-late']);
  if (noBrowser(t, r)) return;
  assert.ok(r.results, r.stderr.slice(0, 300));
  assert.deepEqual(WIDTHS.map((w) => at(r, 'layout.overflow', w).outcome), ['FAIL', 'FAIL', 'FAIL', 'FAIL']);
});
test('check_layout edge: a column of 24 characters is a review from 768 px up and fine on a phone', (t) => {
  const r = run('check_layout.mjs', ['layout', 'edge']);
  if (noBrowser(t, r)) return;
  assert.deepEqual(WIDTHS.map((w) => at(r, 'layout.line-length', w).outcome), ['PASS', 'PASS', 'REVIEW', 'REVIEW']);
});

test('check_a11y edge: the 40th Tab stop is reached but is a review; text over a picture is a review, not a failure; a missing primary action fails', (t) => {
  const r = run('check_a11y.mjs', ['a11y', 'edge']);
  if (noBrowser(t, r)) return;
  assert.ok(r.results, r.stderr.slice(0, 300));
  const key = (route) => (r.results || []).filter((x) => x.id === 'a11y.keyboard-primary' && x.route === route);
  assert.deepEqual(key('home').map((x) => [x.outcome, x.measured]), [['REVIEW', 40], ['REVIEW', 40]], 'found on stop 40 (the limit), past 25 stops: a review');
  assert.deepEqual(key('missing').map((x) => x.outcome), ['FAIL', 'FAIL']);
  assert.match(key('missing')[0].reason, /no link named "Buy now" on the page/);
  if (outcomeOf(r.results, 'a11y.axe').includes('PENDING')) return t.diagnostic('axe-core could not be loaded (offline): axe assertions skipped');
  assert.deepEqual(outcomeOf(r.results, 'a11y.axe.color-contrast', (x) => x.route === 'home'), ['REVIEW', 'REVIEW']);
  assert.deepEqual(outcomeOf(r.results, 'a11y.axe', (x) => x.route === 'home'), ['PASS', 'PASS'], 'an undecidable rule does not fail the page');
});

test('check_journeys edge: a live journey is not left pending, an unknown start route and a missing button fail, and each result names its viewport and input', (t) => {
  const r = run('check_journeys.mjs', ['journeys', 'edge']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  const live = r.results.find((x) => x.id === 'journey.live-run');
  assert.equal(live.outcome, 'PASS', live.reason);
  assert.equal(live.viewport, 'phone 390px'); assert.equal(live.input, 'touch');
  assert.equal(outcomeOf(r.results, 'journey.live-run.integration').length, 0, 'only "integration": "fixture" leaves the real service pending');
  const ghost = r.results.find((x) => x.id === 'journey.no-such-start');
  assert.equal(ghost.outcome, 'FAIL'); assert.match(ghost.reason, /start route "ghost" is not in routes\.json/);
  assert.equal(ghost.viewport, 'desktop 1440px'); assert.equal(ghost.input, 'keyboard');
  assert.equal(r.results.find((x) => x.id === 'journey.missing-button').outcome, 'FAIL');
});

// A correct page that a naive checker calls broken: a screen-reader copy hidden with inline styles (no .sr-only class),
// an intended ellipsis, a sideways scroller inside a parent that hides overflow, a fade-in headline and a smooth scroll to
// a far-down button. Nothing may FAIL; the ellipsis goes to REVIEW.
test('check_layout and check_a11y: the tricky but correct page does not fail', (t) => {
  const r = run('check_layout.mjs', ['layout', 'tricky']);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 0, JSON.stringify(r.results?.filter((x) => x.outcome === 'FAIL')));
  assert.deepEqual([...new Set(outcomeOf(r.results, 'layout.text-clipped'))], ['REVIEW'], 'the ellipsis is reviewed, not failed');
  const a = run('check_a11y.mjs', ['layout', 'tricky']);
  assert.equal(a.status, 0, JSON.stringify(a.results?.filter((x) => x.outcome === 'FAIL')));
});

// The checkers run when started through a symlinked path (skills are often installed as links). Before the fix the
// main-module test compared a symlinked path with the real one, so the script did nothing and exited 0.
test('a checker started through a symlink still runs and still fails a failing page', (t) => {
  const link = path.join(tmp('link'), 'scripts');
  fs.symlinkSync(SCRIPTS, link);
  const r = runChecker(path.join(link, 'check_layout.mjs'), [path.join(FIX, 'layout', 'fail'), '--out', tmp('edge')]);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1, 'the failing page must fail when the checker is reached through a link');
  assert.ok(r.results?.length > 0);
});
