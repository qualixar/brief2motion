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
