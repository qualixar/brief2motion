// brief2motion kit: svg-draw.js. MIT. No dependencies.
// "Draw" an SVG line: the stroke grows from its start to its end. Works on <path>, <line>, <polyline>, <circle>...
// Each shape gets pathLength="1", so a dash of length 1 covers it whatever its real length, and progress 0..1
// maps straight onto stroke-dashoffset. No measuring, no layout work, and it scales with the SVG.
import { reducedMotion } from './motion-core.js';

export function prepareDraw(shapes) {
  const els = typeof shapes === 'string' ? [...document.querySelectorAll(shapes)] : [shapes].flat();
  for (const el of els) {
    el.setAttribute('pathLength', '1');
    el.style.strokeDasharray = '1';
    el.style.strokeDashoffset = reducedMotion() ? '0' : '1';
  }
  return els;
}
// Set how much of the line is drawn, 0..1 (drive this from scroll progress).
export const drawTo = (el, p) => { el.style.strokeDashoffset = String(1 - Math.min(1, Math.max(0, p))); };

// Play the draw once, shape after shape. Returns the Animation objects.
export function animateDraw(els, { duration = 1200, stagger = 150, delay = 0, easing = 'cubic-bezier(.6,0,.2,1)' } = {}) {
  if (reducedMotion()) { els.forEach((el) => drawTo(el, 1)); return []; }
  return els.map((el, i) => {
    const a = el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay: delay + i * stagger, easing, fill: 'both' });
    a.finished.then(() => { drawTo(el, 1); a.cancel(); }).catch(() => {});
    return a;
  });
}
