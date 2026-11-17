// brief2motion kit: motion-core.js. MIT. No dependencies.
// The small set of helpers every example uses: the reduced-motion switch, the ready signal the checker
// waits for, frame loops that stop when nobody can see them, and scroll progress without a library.
// The maths at the top has no DOM in it, so it is unit-tested in Node (tests/kit.test.mjs).

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (a === b ? 0 : (v - a) / (b - a));
export const mapRange = (v, inA, inB, outA, outB) => lerp(outA, outB, clamp(invLerp(inA, inB, v)));
// Frame-rate independent smoothing: the same feel at 60 Hz and 120 Hz. lambda is "how fast" (8 is gentle, 20 is snappy).
export const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));
export const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - (1 - t) ** 3,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outExpo: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  outBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
};
// Progress of a tall "scene" element through the viewport: 0 when its top meets the top of the screen,
// 1 when its bottom meets the bottom. This is the number a sticky (pinned) scene is driven by.
export const sceneProgress = (top, height, viewport) => (height <= viewport ? (top <= 0 ? 1 : 0) : clamp(-top / (height - viewport)));
// Progress of an element crossing the viewport: 0 as its top enters at the bottom edge, 1 as its bottom leaves at the top.
export const viewProgress = (top, height, viewport) => clamp((viewport - top) / (viewport + height));
// A sub-range of a 0..1 progress, itself 0..1. slice(p, 0.2, 0.5) runs while p goes from 0.2 to 0.5.
export const slice = (p, from, to) => clamp(invLerp(from, to, p));

/* ---- browser side ---- */

const mq = () => (typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null);
export const reducedMotion = () => !!mq()?.matches;
// Calls fn(true|false) now and again whenever the visitor flips the setting while the page is open.
export function onReducedMotion(fn) {
  const m = mq(); if (!m) { fn(false); return () => {}; }
  const h = () => fn(m.matches);
  h(); m.addEventListener('change', h);
  return () => m.removeEventListener('change', h);
}

// The page tells the world what state its motion is in: <html data-motion="ready | reduced | static">.
// "ready": motion is running. "reduced": the visitor asked for less motion and got the finished, still page.
// "static": something the motion needs is missing (WebGL, a blocked CDN) and the page fell back to a still.
// check_site.mjs waits for this attribute; CSS can style on it too.
export function signal(state) {
  document.documentElement.dataset.motion = state;
  document.dispatchEvent(new CustomEvent('b2m:motion', { detail: state }));
}

export const hasWebGL = (kind = 'webgl2') => { try { return !!document.createElement('canvas').getContext(kind); } catch { return false; } };

// A requestAnimationFrame loop that only runs while it can be seen: it stops when the tab is hidden and,
// if you pass `target`, while that element is off screen. fn(dt, t) gets seconds. dt is capped at 100 ms so a
// tab that was asleep does not jump. Returns stop().
export function frameLoop(fn, { target = null, margin = '100px' } = {}) {
  let raf = 0, last = 0, visible = !target, alive = true;
  const tick = (now) => {
    raf = 0; if (!alive) return;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60; last = now;
    fn(dt, now / 1000);
    queue();
  };
  const queue = () => { if (alive && !raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
  const pause = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };
  const onVis = () => (document.hidden ? pause() : queue());
  document.addEventListener('visibilitychange', onVis);
  let io = null;
  if (target && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? queue() : pause(); }, { rootMargin: margin });
    io.observe(target);
  } else visible = true;
  queue();
  return () => { alive = false; pause(); io?.disconnect(); document.removeEventListener('visibilitychange', onVis); };
}

// Run enter(el) when an element scrolls into view (and leave(el) when it goes, if given). once: stop watching after the first time.
export function inView(targets, enter, { leave = null, once = true, amount = 0.25, margin = '0px' } = {}) {
  const els = typeof targets === 'string' ? [...document.querySelectorAll(targets)] : [targets].flat();
  if (!('IntersectionObserver' in window)) { els.forEach((el) => enter(el)); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { enter(e.target); if (once) io.unobserve(e.target); }
      else if (leave) leave(e.target);
    }
  }, { threshold: amount, rootMargin: margin });
  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

// One shared, passive scroll + resize listener for the whole page. Every subscriber is called at most once per
// frame with fresh measurements. Reading layout here and writing styles in the callback keeps the two apart.
const subs = new Set(); let pending = 0, bound = false;
const flush = () => { pending = 0; const vh = innerHeight; for (const s of subs) s(vh); };
const poke = () => { if (!pending) pending = requestAnimationFrame(flush); };
export function onScroll(fn) {
  subs.add(fn);
  if (!bound) { bound = true; addEventListener('scroll', poke, { passive: true }); addEventListener('resize', poke, { passive: true }); }
  poke();
  return () => subs.delete(fn);
}

// Drive a pinned scene: `el` is a tall section with a position: sticky child. fn(progress 0..1) is called on scroll,
// and the same number is written to the CSS variable --p on the element, so plain CSS can use it: opacity: var(--p).
export function scrollScene(el, fn = null) {
  let lastP = -1;
  return onScroll((vh) => {
    const r = el.getBoundingClientRect();
    const p = sceneProgress(r.top, r.height, vh);
    if (p === lastP) return; lastP = p;
    el.style.setProperty('--p', p.toFixed(4));
    fn?.(p);
  });
}

// Same idea for an element that simply passes through the screen (no pin): fn(progress 0..1), written to --v.
export function scrollThrough(el, fn = null) {
  let lastP = -1;
  return onScroll((vh) => {
    const r = el.getBoundingClientRect();
    const p = viewProgress(r.top, r.height, vh);
    if (p === lastP) return; lastP = p;
    el.style.setProperty('--v', p.toFixed(4));
    fn?.(p);
  });
}
