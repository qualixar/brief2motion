// brief2motion kit: reveal.js. MIT. Uses the Web Animations API, no library.
// Content is visible by default. It is only hidden once this script is running and the visitor has not asked for
// reduced motion, so a page with JavaScript off, or a script that failed, never ends up with invisible text.
// Use it for one or two moments on a page. A fade on every block is the commonest sign of a generated site.
import { inView, reducedMotion } from './motion-core.js';

export function reveal(targets, { y = 24, duration = 700, stagger = 70, easing = 'cubic-bezier(.2,.7,.2,1)', amount = 0.2, group = null } = {}) {
  const els = typeof targets === 'string' ? [...document.querySelectorAll(targets)] : [targets].flat();
  if (reducedMotion() || !('animate' in Element.prototype)) return () => {};
  const from = { opacity: 0, transform: `translate3d(0,${y}px,0)` };
  els.forEach((el) => { el.style.opacity = '0'; });
  const show = (el, delay = 0) => {
    const a = el.animate([from, { opacity: 1, transform: 'none' }], { duration, delay, easing, fill: 'backwards' });
    el.style.opacity = '';
    return a;
  };
  if (group) {   // children of one container come in together, in order, when the container shows
    return inView(group, () => els.forEach((el, i) => show(el, i * stagger)), { amount });
  }
  return inView(els, (el) => show(el), { amount });
}

// Stagger a set of pieces (the words or chars from splitText) in, once.
export function staggerIn(pieces, { y = '0.6em', duration = 800, each = 45, delay = 0, easing = 'cubic-bezier(.2,.8,.2,1)', rotate = 0 } = {}) {
  if (reducedMotion() || !pieces.length || !pieces[0].animate) return [];
  return pieces.map((el, i) => el.animate(
    [{ opacity: 0, transform: `translate3d(0,${y},0) rotate(${rotate}deg)` }, { opacity: 1, transform: 'none' }],
    { duration, delay: delay + i * each, easing, fill: 'backwards' }));
}
