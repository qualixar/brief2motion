// brief2motion kit: players.js. MIT. Loads lottie-web or the Rive runtime from the CDN only when needed.
// Both players are heavier than the animation files they play, so they are imported when the first animation
// comes near the screen, they play only while visible, and with reduced motion they show one still frame.
import { inView, reducedMotion } from './motion-core.js';

export const CDN = {
  lottie: 'https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/esm/lottie_light.min.js',   // SVG renderer only, no expressions
  rive: 'https://cdn.jsdelivr.net/npm/@rive-app/canvas-lite@2.51.0/+esm',
};
let lottieLib = null, riveLib = null;
const loadLottie = () => (lottieLib ||= import(CDN.lottie).then((m) => m.default || m));
const loadRive = () => (riveLib ||= import(CDN.rive).then((m) => (m.Rive ? m : m.default)));   // the CDN build exports the runtime as its default

// mountLottie(el, { path: 'anim.json' } or { animationData }, { loop, stillFrame })
// el should have a fixed aspect-ratio in CSS so the page does not jump when the animation arrives.
export function mountLottie(el, source, { loop = true, stillFrame = null, margin = '200px' } = {}) {
  let anim = null, dead = false;
  const stop = inView(el, async () => {
    if (anim || dead) { anim?.play(); return; }
    const lottie = await loadLottie(); if (dead) return;
    anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: false, ...source,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: true } });
    anim.addEventListener('DOMLoaded', () => {
      el.querySelector('svg')?.setAttribute('aria-hidden', 'true');   // the element's own aria-label or nearby text describes it
      if (reducedMotion()) anim.goToAndStop(stillFrame ?? Math.floor(anim.totalFrames - 1), true);
      else anim.play();
    });
  }, { leave: () => { if (!reducedMotion()) anim?.pause(); }, once: false, amount: 0.1, margin });
  return { get anim() { return anim; }, destroy() { dead = true; stop(); anim?.destroy(); } };
}

// mountRive(canvas, { src: 'file.riv', stateMachines: 'State Machine 1' })
export function mountRive(canvas, { src, stateMachines = undefined, artboard = undefined, margin = '200px' } = {}) {
  let r = null, dead = false;
  const stop = inView(canvas, async () => {
    if (r || dead) { if (!reducedMotion()) r?.play(); return; }
    const rive = await loadRive(); if (dead) return;
    r = new rive.Rive({ src, canvas, artboard, stateMachines, autoplay: !reducedMotion(),
      onLoad: () => { r.resizeDrawingSurfaceToCanvas(); if (reducedMotion()) r.drawFrame?.(); } });
  }, { leave: () => r?.pause(), once: false, amount: 0.1, margin });
  const onResize = () => r?.resizeDrawingSurfaceToCanvas();
  addEventListener('resize', onResize, { passive: true });
  return { get rive() { return r; }, destroy() { dead = true; stop(); removeEventListener('resize', onResize); r?.cleanup(); } };
}
