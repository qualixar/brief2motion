// Every site-mode script answers --help with exit 0 (the CLI contract the other scripts keep).
import test from 'node:test';
import assert from 'node:assert/strict';
import { runChecker } from './_design_helpers.mjs';

test('every site-mode script answers --help with exit 0', () => {
  for (const s of ['build_tokens', 'build_sitemap', 'check_plan', 'check_meta', 'check_layout', 'check_a11y', 'check_journeys']) assert.equal(runChecker(`${s}.mjs`, ['--help'], { json: false }).status, 0, s);
});
