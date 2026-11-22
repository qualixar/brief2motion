// Site mode: a browser checker measures only real pages. A route with no file (the server answers 404) or a file that is
// not HTML must FAIL as page.loaded, never be measured as if its error text were a page. Wireframes are looked up the
// way check_plan accepts them (wireframes/index.html for a one-template site).
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { FIX, tmp, runChecker, outcomeOf, noBrowser } from './_design_helpers.mjs';

const MISSING = path.join(FIX, 'layout', 'missing');
const loaded = (r, route) => (r.results || []).filter((x) => x.id === 'page.loaded' && x.route === route);

test('check_layout: a route with no file and a route that is a text file both FAIL as page.loaded; the built page is still measured', (t) => {
  const r = runChecker('check_layout.mjs', [MISSING, '--widths', '1440', '--out', tmp('miss')]);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  assert.deepEqual(loaded(r, 'pricing').map((x) => x.outcome), ['FAIL']); assert.match(loaded(r, 'pricing')[0].reason, /\/pricing\/ answered 404/);
  assert.deepEqual(loaded(r, 'notes').map((x) => x.outcome), ['FAIL']); assert.match(loaded(r, 'notes')[0].reason, /not an HTML page \(text\/plain/);
  assert.equal(r.results.filter((x) => x.route === 'pricing' && x.id.startsWith('layout.')).length, 0, 'nothing is measured on a 404');
  assert.equal(outcomeOf(r.results, 'layout.overflow', (x) => x.route === 'home').length, 1, 'the page that exists is measured');
});
test('check_layout --wireframes: a template with no wireframe FAILs; a one-template site uses wireframes/index.html, as check_plan does', (t) => {
  const r = runChecker('check_layout.mjs', [MISSING, '--wireframes', '--widths', '390', '--out', tmp('miss-wf')]);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  assert.match(loaded(r, 'pricing')[0].reason, /\/pricing\.html answered 404/);
  const one = runChecker('check_layout.mjs', [path.join(FIX, 'layout', 'wf-index'), '--wireframes', '--widths', '390', '--out', tmp('wf-index')]);
  assert.equal(one.status, 0, JSON.stringify(one.results?.filter((x) => x.outcome !== 'PASS')));
  assert.equal(outcomeOf(one.results, 'page.loaded').length, 0);
  assert.match(one.results.find((x) => x.id === 'layout.overflow').reason, /no sideways scroll at 390 px/, 'the real wireframe (with a viewport tag) was measured');
  assert.equal(runChecker('check_plan.mjs', [path.join(FIX, 'layout', 'wf-index'), '--out', tmp('wf-plan')]).results.find((x) => x.id === 'plan.wireframes').outcome, 'PASS');
});
test('check_a11y and check_journeys: a missing page FAILs instead of being checked', (t) => {
  const a = runChecker('check_a11y.mjs', [MISSING, '--widths', '1440', '--out', tmp('miss-a11y')], { env: { BRIEF2MOTION_OFFLINE: '1', BRIEF2MOTION_AXE_CACHE: tmp('no-axe') } });
  if (noBrowser(t, a)) return;
  assert.equal(a.status, 1);
  assert.match(loaded(a, 'pricing')[0].reason, /answered 404/);
  const j = runChecker('check_journeys.mjs', [MISSING, '--out', tmp('miss-j')]);
  assert.equal(j.status, 1);
  assert.match(j.results.find((x) => x.id === 'journey.see-pricing').reason, /the start page did not load: \/pricing\/ answered 404/);
});

// The probes on cases a looser rule gets wrong: two slides left visible at the same spot (one line's box lies inside the
// other's, which is still a collision), menu links of 11 px (list items, not links in a sentence), a page 10 px too wide,
// a crossfade whose hidden slide is transparent through its container, and a card covered by one link on purpose.
test('check_layout probes: text painted on top of text, tiny menu links and a 10 px overflow all FAIL', (t) => {
  const r = runChecker('check_layout.mjs', [path.join(FIX, 'layout', 'probes-fail'), '--widths', '390,1440', '--out', tmp('probes-fail')]);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1);
  for (const w of [390, 1440]) {
    const at = (id) => r.results.find((x) => x.id === id && x.viewport === `${w}px`);
    assert.equal(at('layout.overlap').outcome, 'FAIL', `overlap ${w}`); assert.match(at('layout.overlap').reason, /text\/text: p\.slide/);
    assert.equal(at('layout.tap-targets').outcome, 'FAIL', `tap ${w}`); assert.match(at('layout.tap-targets').reason, /a\.tiny-nav "Docs"/);
    assert.match(at('layout.tap-targets').reason, /a\.nav-sentence "notes"/, 'inside a nav even a sentence link is a menu target');
    assert.match(at('layout.tap-targets').reason, /a\.tiny-foot "Terms"/, 'a list item holding only a link and a separator is not a sentence');
    assert.equal(at('layout.overflow').outcome, 'FAIL', `overflow ${w}`); assert.equal(at('layout.overflow').measured, 10);
  }
});
test('check_layout probes: a transparent crossfade slide and a card-wide link do not count as overlaps', (t) => {
  const r = runChecker('check_layout.mjs', [path.join(FIX, 'layout', 'probes-pass'), '--widths', '390,1440', '--out', tmp('probes-pass')]);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 0, JSON.stringify(r.results?.filter((x) => x.outcome !== 'PASS')));
});

// journeys.json mistakes that used to pass or crash: a journey with no expectation, one whose expectation was already true
// before its steps (it proves nothing), and a viewport name the checker does not know. A path#anchor expectation works.
test('check_journeys: no expectation FAILs, an expectation already true is a REVIEW, an unknown viewport FAILs alone, an anchor can be expected', (t) => {
  const r = runChecker('check_journeys.mjs', [path.join(FIX, 'journeys', 'vacuous'), '--out', tmp('vac')]);
  if (noBrowser(t, r)) return;
  assert.equal(r.status, 1, r.stderr.slice(0, 400));
  const j = (id, vp) => r.results.find((x) => x.id === `journey.${id}` && (!vp || x.viewport.startsWith(vp)));
  assert.equal(j('no-expect').outcome, 'FAIL'); assert.match(j('no-expect').reason, /no "expect"/);
  assert.equal(j('already-true').outcome, 'REVIEW'); assert.match(j('already-true').reason, /already true before the steps/);
  assert.equal(j('odd-viewport', 'tablet').outcome, 'FAIL'); assert.match(j('odd-viewport', 'tablet').reason, /unknown viewport "tablet" \(use phone or desktop\)/);
  assert.equal(j('odd-viewport', 'desktop').outcome, 'PASS', 'the other viewports still run');
  assert.equal(j('to-anchor').outcome, 'PASS', j('to-anchor').reason);
});
