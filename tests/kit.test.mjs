// The parts of the kit with no browser in them: the maths, the text segmenting, the picture-sequence planning
// and the number formatting. (The parts that need a page are covered by tests/browser/smoke.mjs.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, lerp, invLerp, mapRange, damp, ease, sceneProgress, viewProgress, slice } from '../skills/brief2motion/kit/motion-core.js';
import { segment, groupLines } from '../skills/brief2motion/kit/split-text.js';
import { loadOrder, nearestLoaded, frameAt, fitRect } from '../skills/brief2motion/kit/image-sequence.js';
import { valueAt, formatNumber } from '../skills/brief2motion/kit/counter.js';

test('clamp, lerp, invLerp, mapRange', () => {
  assert.equal(clamp(1.4), 1); assert.equal(clamp(-2), 0); assert.equal(clamp(7, 0, 10), 7);
  assert.equal(lerp(10, 20, 0.25), 12.5);
  assert.equal(invLerp(10, 20, 15), 0.5); assert.equal(invLerp(3, 3, 3), 0);
  assert.equal(mapRange(5, 0, 10, 100, 200), 150); assert.equal(mapRange(50, 0, 10, 100, 200), 200);
});
test('damp is frame-rate independent: two half steps equal one whole step', () => {
  const one = damp(0, 100, 8, 1 / 30);
  const two = damp(damp(0, 100, 8, 1 / 60), 100, 8, 1 / 60);
  assert.ok(Math.abs(one - two) < 1e-9);
  assert.equal(damp(5, 5, 8, 0.016), 5);
});
test('every easing starts at 0 and ends at 1', () => {
  for (const [name, fn] of Object.entries(ease)) { assert.ok(Math.abs(fn(0)) < 1e-9, name); assert.ok(Math.abs(fn(1) - 1) < 1e-9, name); }
  assert.ok(ease.outBack(0.7) > 1, 'outBack overshoots');
});
test('sceneProgress: a pinned scene runs from its top meeting the screen top to its bottom meeting the screen bottom', () => {
  assert.equal(sceneProgress(200, 3000, 800), 0);       // not reached yet
  assert.equal(sceneProgress(0, 3000, 800), 0);
  assert.equal(sceneProgress(-1100, 3000, 800), 0.5);
  assert.equal(sceneProgress(-2200, 3000, 800), 1);
  assert.equal(sceneProgress(-5000, 3000, 800), 1);
  assert.equal(sceneProgress(100, 600, 800), 0);        // a scene shorter than the screen cannot scrub
  assert.equal(sceneProgress(-10, 600, 800), 1);
});
test('viewProgress and slice', () => {
  assert.equal(viewProgress(800, 400, 800), 0); assert.equal(viewProgress(-400, 400, 800), 1); assert.equal(viewProgress(200, 400, 800), 0.5);
  assert.equal(slice(0.1, 0.2, 0.5), 0); assert.ok(Math.abs(slice(0.35, 0.2, 0.5) - 0.5) < 1e-9); assert.equal(slice(0.9, 0.2, 0.5), 1);
});
test('segment: words, whitespace collapsed, emoji and accents kept whole', () => {
  const parts = segment('  The 3 a.m.\n page  goes ');
  assert.deepEqual(parts.map((p) => p.word), ['The', '3', 'a.m.', 'page', 'goes']);
  assert.deepEqual(segment('Tomás 👩‍🚀')[0].chars.length, 5);
  assert.equal(segment('Tomás 👩‍🚀')[1].chars.length, 1);
  assert.deepEqual(segment(''), []);
});
test('groupLines: words are grouped by their top edge', () => {
  assert.deepEqual(groupLines([10, 10, 11, 60, 60, 110]), [[0, 1, 2], [3, 4], [5]]);
  assert.deepEqual(groupLines([]), []);
});
test('loadOrder: every frame exactly once, first and last frames first, coarse before fine', () => {
  const order = loadOrder(48);
  assert.equal(order.length, 48); assert.equal(new Set(order).size, 48);
  assert.deepEqual(order.slice(0, 2), [0, 47]);
  assert.ok(order.indexOf(8) < order.indexOf(4) && order.indexOf(4) < order.indexOf(2) && order.indexOf(2) < order.indexOf(1));
  assert.deepEqual(loadOrder(1), [0]);
});
test('nearestLoaded: the closest frame that has arrived', () => {
  const loaded = new Set([0, 8, 16]);
  assert.equal(nearestLoaded(9, loaded, 48), 8); assert.equal(nearestLoaded(12, loaded, 48), 8); assert.equal(nearestLoaded(13, loaded, 48), 16);
  assert.equal(nearestLoaded(40, loaded, 48), 16); assert.equal(nearestLoaded(3, new Set(), 48), -1);
  assert.equal(nearestLoaded(2, [true, false, false, true], 4), 3);
});
test('frameAt and fitRect', () => {
  assert.equal(frameAt(0, 48), 0); assert.equal(frameAt(1, 48), 47); assert.equal(frameAt(0.5, 48), 24); assert.equal(frameAt(7, 48), 47);
  assert.deepEqual(fitRect(960, 600, 480, 600, 'cover'), { x: -240, y: 0, w: 960, h: 600 });
  assert.deepEqual(fitRect(960, 600, 480, 600, 'contain'), { x: 0, y: 150, w: 480, h: 300 });
});
test('counter: value over time and its text', () => {
  assert.equal(valueAt(0, 100, 0), 0); assert.equal(valueAt(0, 100, 1), 100); assert.equal(valueAt(0, 100, 5), 100);
  assert.ok(valueAt(0, 100, 0.5) > 90, 'outExpo is fast at first');
  assert.equal(formatNumber(1234.5, { decimals: 1, suffix: ' ppm' }), '1,234.5 ppm');
  assert.equal(formatNumber(35.2, { decimals: 1, suffix: '%' }), '35.2%');
  assert.equal(formatNumber(7, { prefix: '$' }), '$7');
});
