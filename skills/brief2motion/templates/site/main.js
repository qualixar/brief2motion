// brief2motion: wires assemble + flight + scroll from config.js. MIT.
import { cfg } from './config.js';
import { createAssemble, supportsWebGL2 } from './assemble.js';
import { createFlight } from './flight.js';

const root = document.documentElement;
for (const [k, v] of Object.entries(cfg.colors)) root.style.setProperty(`--${k}`, v);

async function start() {
  const hero = document.querySelector('#hero');
  const canvas = hero.querySelector('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showFallback = () => {
    const img = hero.querySelector('.fallback');
    if (img.dataset.src) img.src = img.dataset.src;   // only no-WebGL visitors download it
    hero.classList.add('no-webgl');
  };
  if (!supportsWebGL2()) {
    showFallback();
    window.__motion = { stats: { mode: 'fallback-image' } };
    return;
  }
  const scene = await createAssemble(canvas, { ...cfg.assemble, ink: cfg.colors.ink });
  if (reduced) { scene.progress = 1; return; }   // no plane, no scroll motion
  const flight = cfg.flight ? createFlight(document.querySelector(cfg.flight.section || '#hero'), cfg.flight) : null;

  const { gsap } = window;
  // ?play = hands-free timed run (for screen recording); otherwise scroll drives it when configured
  const play = new URLSearchParams(location.search).has('play');
  if (cfg.scroll && !play) {
    gsap.registerPlugin(window.ScrollTrigger);
    const lenis = new window.Lenis({ lerp: 0.09 });
    lenis.on('scroll', window.ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

    const st = { trigger: hero, start: 'top top', end: `+=${cfg.scroll.length ?? 250}%`, pin: true, scrub: 0.6 };
    const tl = gsap.timeline({ scrollTrigger: st });
    const holder = { p: 0, m: 0 };
    const apply = () => { scene.progress = holder.p; scene.morph = holder.m; };
    tl.to(holder, { p: 1, duration: 1, ease: 'none', onUpdate: apply });
    tl.to('.hero-copy', { opacity: 1, y: 0, duration: 0.3 }, 0.7);
    for (let k = 1; k < scene.count; k++) {
      tl.to(holder, { m: k, duration: 1, ease: 'none', onUpdate: apply }, '+=0.35');   // hold, then burst into the next
    }
    if (flight && cfg.flight.trigger === 'scroll') tl.add(flight.play(), cfg.flight.at ?? 0.4);
  } else {
    const holder = { p: 0, m: 0 };
    const apply = () => { scene.progress = holder.p; scene.morph = holder.m; };
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(holder, { p: 1, duration: cfg.assemble.seconds ?? 3.2, ease: 'power2.inOut', onUpdate: apply });
    tl.to('.hero-copy', { opacity: 1, y: 0, duration: 0.6 }, '-=0.6');
    if (flight) { flight.paused(false); tl.add(flight, '+=0.2'); }   // nested, so seeking tl also seeks the plane
    for (let k = 1; k < scene.count; k++) {
      tl.to(holder, { m: k, duration: 2.4, ease: 'power2.inOut', onUpdate: apply }, '+=1.4');
    }
    window.__timeline = tl;
  }
}

start().catch((err) => {
  console.error(err);
  const img = document.querySelector('#hero .fallback');
  if (img.dataset.src) img.src = img.dataset.src;
  document.querySelector('#hero').classList.add('no-webgl');
  window.__motion = { stats: { mode: 'error', error: String(err) } };
});
