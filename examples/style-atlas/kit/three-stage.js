// brief2motion kit: three-stage.js. MIT. Needs three.js (passed in, so the page chooses the version).
// The parts of a three.js page that are the same every time and easy to get wrong: a renderer that fails
// softly, a pixel ratio cap, resizing from the canvas's own box, a loop that stops when hidden or off screen,
// one still frame for reduced motion, context-loss recovery and a real dispose().
import { frameLoop, reducedMotion } from './motion-core.js';

export function createStage(THREE, canvas, { fov = 35, near = 0.1, far = 100, dprCap = 2, alpha = true, antialias = true, toneMapping = true } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha, antialias, powerPreference: 'high-performance' });
  } catch (err) { return null; }                           // no WebGL: the caller shows its still image
  renderer.setClearAlpha(alpha ? 0 : 1);
  if (toneMapping) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace; }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, near, far);
  const still = reducedMotion();
  let update = null, stop = null, dirty = true, lost = false, w = 0, h = 0;

  const resize = () => {
    const cw = canvas.clientWidth, ch = canvas.clientHeight; if (!cw || !ch) return;
    const dpr = Math.min(dprCap, devicePixelRatio || 1);
    if (cw === w && ch === h && renderer.getPixelRatio() === dpr) return;
    w = cw; h = ch;
    renderer.setPixelRatio(dpr); renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch; camera.updateProjectionMatrix();
    dirty = true; if (still) render(0, 0);
  };
  const render = (dt, t) => { if (lost) return; update?.(dt, t); renderer.render(scene, camera); dirty = false; };
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  const onLost = (e) => { e.preventDefault(); lost = true; };
  const onRestored = () => { lost = false; dirty = true; if (still) render(0, 0); };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  return {
    THREE, renderer, scene, camera, still,
    get size() { return { w, h }; },
    // start(fn): fn(dt, t) runs before every frame. With reduced motion it runs once, at t = 0, and the frame is held.
    start(fn) { update = fn; resize(); if (still) render(0, 0); else stop = frameLoop(render, { target: canvas }); },
    // draw one frame now (after you changed something while reduced motion holds the loop still)
    invalidate() { if (still) render(0, 0); else dirty = true; },
    destroy() {
      stop?.(); ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored);
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        for (const m of [o.material].flat().filter(Boolean)) { for (const v of Object.values(m)) v?.isTexture && v.dispose(); m.dispose?.(); }
      });
      scene.environment?.dispose?.(); renderer.dispose();
    },
  };
}
