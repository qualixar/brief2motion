// brief2motion kit: svg-draw.js. MIT. No dependencies.
// "Draw" an SVG line: the stroke grows from its start to its end. Works on <path>, <line>, <polyline>, <circle>...
// THE RULE (one rule, here and in brief2mp4): measure the real length with getTotalLength(), set stroke-dasharray to
// it and move stroke-dashoffset from that length to 0. Never pathLength="1": in a frame-seeked render (brief2mp4's
// HyperFrames) it did not draw progressively, and with vector-effect: non-scaling-stroke it draws the wrong amount
// in Chrome. Never put non-scaling-stroke on a line you draw: the dash then runs in screen pixels, not in the
// drawing's units. Lengths are in the SVG's own user units, so scaling the SVG evenly keeps the draw correct.
import { reducedMotion } from './motion-core.js';

const lengths = new WeakMap();

// Pure, unit-tested. The dash offset that shows `p` (0..1) of a line `len` long.
export const dashOffset = (len, p) => len * (1 - Math.min(1, Math.max(0, Number.isFinite(p) ? p : 0)));

// The measured length, or 0 when it cannot be measured (the shape is not rendered, or is not a geometry element).
function measure(el) {
  try { const len = el.getTotalLength(); return Number.isFinite(len) && len > 0 ? len : 0; } catch { return 0; }
}

export function prepareDraw(shapes) {
  const els = typeof shapes === 'string' ? [...document.querySelectorAll(shapes)] : [shapes].flat();
  for (const el of els) {
    const len = measure(el);
    lengths.set(el, len);
    if (!len) continue;                              // unmeasurable: leave the line fully drawn rather than invisible
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(reducedMotion() ? 0 : len);
  }
  return els;
}
// Set how much of the line is drawn, 0..1 (drive this from scroll progress).
export const drawTo = (el, p) => { const len = lengths.get(el); if (len) el.style.strokeDashoffset = String(dashOffset(len, p)); };

// Play the draw once, shape after shape. Returns the Animation objects.
export function animateDraw(els, { duration = 1200, stagger = 150, delay = 0, easing = 'cubic-bezier(.6,0,.2,1)' } = {}) {
  if (reducedMotion()) { els.forEach((el) => drawTo(el, 1)); return []; }
  return els.filter((el) => lengths.get(el)).map((el, i) => {
    const len = lengths.get(el);
    const a = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration, delay: delay + i * stagger, easing, fill: 'both' });
    a.finished.then(() => { drawTo(el, 1); a.cancel(); }).catch(() => {});
    return a;
  });
}
