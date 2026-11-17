// brief2motion: wires assemble + flight + scroll from config.js. MIT.
// The page text renders first, from config.js alone. three.js (assemble.js) loads after that, so a blocked CDN
// or a runtime error leaves a readable page with the still image, never a blank one.
import { cfg } from './config.js';
import { validateConfig } from './validate.js';
import { renderPage, revealOnScroll, sequenceCaptions } from './page.js';
import { createFlight } from './flight.js';

const root = document.documentElement;
for (const [k, v] of Object.entries(cfg.colors)) root.style.setProperty(`--${k}`, v);
const teardown = [renderPage(cfg)];   // nav, hero copy, sections, footer: all from config.js

const webgl2 = () => { try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; } };

function showFallback(mode, error) {
  const hero = document.querySelector('#hero');
  const img = hero.querySelector('.fallback');
  if (img.dataset.src) img.src = img.dataset.src;   // only no-WebGL visitors download it
  hero.classList.add('no-webgl');
  window.__motion = { stats: { mode, ...(error ? { error: String(error) } : {}) } };
}

// Scroll-linked run: a pinned hero; scrolling drives the burst between shapes and the plane.
function scrollRun(gsap, scene, flight, hero) {
  gsap.registerPlugin(window.ScrollTrigger);
  const lenis = new window.Lenis({ lerp: 0.09, anchors: true });
  lenis.on('scroll', window.ScrollTrigger.update);
  const tick = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis;

  const holder = { p: 0, m: 0 };
  const apply = () => { scene.progress = holder.p; scene.morph = holder.m; };
  // assembleOnLoad: the first screen is never blank; the dust forms on its own, and scrolling drives the rest
  const onLoad = cfg.assemble.assembleOnLoad !== false;
  const seconds = cfg.assemble.seconds ?? 3.2;
  const intro = [];
  if (onLoad) {
    intro.push(gsap.to(holder, { p: 1, duration: seconds, ease: 'power2.inOut', delay: 0.3, onUpdate: apply }));
    intro.push(gsap.to('.hero-copy', { opacity: 1, y: 0, duration: 0.7, delay: 0.6 }));   // words first, dust forms beside them
  }
  const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: `+=${cfg.scroll.length ?? 250}%`, pin: true, scrub: 0.6 } });
  if (!onLoad) {
    tl.to(holder, { p: 1, duration: 1, ease: 'none', onUpdate: apply });
    tl.to('.hero-copy', { opacity: 1, y: 0, duration: 0.3 }, 0.7);
  } else {
    tl.to({}, { duration: 0.8 });   // a short hold before the burst, so the formed shape is seen
  }
  for (let k = 1; k < scene.count; k++) {
    // each shape holds for most of the scroll and the burst is quick, so viewers see formed shapes, not clouds
    tl.to(holder, { m: k, duration: 0.7, ease: 'power2.inOut', onUpdate: apply }, '+=1');
  }
  tl.to({}, { duration: 1 });   // the last shape holds before the page moves on
  if (flight && cfg.flight.trigger === 'scroll') tl.add(flight.play(), cfg.flight.at ?? 0.4);
  revealOnScroll();
  return () => { tl.kill(); intro.forEach((t) => t.kill()); gsap.ticker.remove(tick); lenis.destroy(); window.ScrollTrigger.getAll().forEach((t) => t.kill()); };
}

// Timed run (no scroll, or ?play): the dust forms, the plane flies, each next shape follows.
function timedRun(gsap, scene, flight) {
  const holder = { p: 0, m: 0 };
  const apply = () => { scene.progress = holder.p; scene.morph = holder.m; };
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(holder, { p: 1, duration: cfg.assemble.seconds ?? 3.2, ease: 'power2.inOut', onUpdate: apply });
  tl.to('.hero-copy', { opacity: 1, y: 0, duration: 0.6 }, '-=0.6');
  if (flight) { flight.paused(false); tl.add(flight, '+=0.2'); }   // nested, so seeking tl also seeks the plane
  for (let k = 1; k < scene.count; k++) tl.to(holder, { m: k, duration: 2.4, ease: 'power2.inOut', onUpdate: apply }, '+=1.4');
  window.__timeline = tl;
  revealOnScroll();
  return () => tl.kill();
}

async function start() {
  validateConfig(cfg);
  const hero = document.querySelector('#hero');
  if (!webgl2()) { showFallback('fallback-image'); return; }
  const { createAssemble } = await import('./assemble.js');   // three.js loads here, after the page text is on screen
  const scene = await createAssemble(hero.querySelector('canvas'), { ...cfg.assemble, ink: cfg.colors.ink });
  teardown.push(() => scene.destroy());
  window.__motion.destroy = () => teardown.splice(0).reverse().forEach((f) => f());
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { scene.progress = 1; return; }   // no plane, no scroll motion

  teardown.push(sequenceCaptions(hero, cfg.assemble.captions));
  const flight = cfg.flight ? createFlight(document.querySelector(cfg.flight.section || '#hero'), cfg.flight) : null;
  const { gsap } = window;
  // ?play = hands-free timed run (for screen recording); otherwise scroll drives it when configured
  const play = new URLSearchParams(location.search).has('play');
  teardown.push(cfg.scroll && !play ? scrollRun(gsap, scene, flight, hero) : timedRun(gsap, scene, flight));
}

start().catch((err) => {
  console.error(err);
  window.__motion?.destroy?.();   // stop anything half-started before showing the still image
  showFallback('error', err);
});
