// brief2motion: flight. A paper plane travels across the page along a path, leaving a fading trail.
// Our own drawing and code. MIT. Needs GSAP + MotionPathPlugin (+ ScrollTrigger when scroll-linked).
const PLANE = `
<svg viewBox="-30 -18 60 36" width="64" height="38" aria-hidden="true">
  <path d="M28 0 L-26 -15 L-12 0 L-26 15 Z" fill="var(--paper-2)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M28 0 L-12 0 L-18 8 Z" fill="var(--accent)" stroke="var(--ink)" stroke-width="1.2" stroke-linejoin="round"/>
</svg>`;

// path: SVG path in a 1000 x 600 box laid over the section. trigger: 'scroll' | 'time'
export function createFlight(section, cfg) {
  const { gsap } = window;
  gsap.registerPlugin(window.MotionPathPlugin);
  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  layer.setAttribute('viewBox', '0 0 1000 600');
  layer.setAttribute('preserveAspectRatio', 'none');
  layer.classList.add('flight-layer');
  layer.innerHTML = `<path class="trail" d="${cfg.path}" pathLength="1" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"/>`;
  section.appendChild(layer);

  const plane = document.createElement('div');
  plane.className = 'plane';
  plane.innerHTML = PLANE;
  section.appendChild(plane);

  const trail = layer.querySelector('.trail');
  // pathLength=1 makes the dash maths independent of how the layer is stretched (no leak at scroll 0)
  gsap.set(trail, { strokeDasharray: '1 1', strokeDashoffset: 1, opacity: 0.55 });

  const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: cfg.trigger === 'scroll' });
  gsap.set(plane, { opacity: 0 });
  tl.set(plane, { opacity: 1 }, 0);
  tl.to(plane, {
    motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true },
    duration: cfg.duration ?? 4,
  }, 0);
  tl.to(trail, { strokeDashoffset: 0, duration: cfg.duration ?? 4 }, 0);
  tl.to(trail, { opacity: 0, duration: 1 }, '>-0.4');
  if (cfg.trigger === 'time') tl.play();
  return tl;
}
