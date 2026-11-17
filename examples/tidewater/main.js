// Tidewater: scroll storytelling with GSAP + ScrollTrigger and Lenis, loaded as plain script tags (no build step).
// Motion plan:
//   load    the headline rises line by line from behind a mask (SplitText); the tide line draws itself (DrawSVG)
//   scroll  1. the one-sentence paragraph "reads itself": words go from dim to full as they cross the screen
//           2. the harvest scene pins; your scroll position picks one of 48 pictures of a crystal growing
//           3. on wide screens the year pins and its cards travel sideways; on phones it is a normal swipe row
//           4. the tide curve draws as it comes into view, then the high-water dots pop in order
// gsap.matchMedia() owns every branch, so motion is set up and torn down when the screen or the setting changes.
// Reduced motion: nothing is pinned or scrubbed; the last picture of the crystal is shown and every line is drawn.
import { signal } from './kit/motion-core.js';
import { createSequence } from './kit/image-sequence.js';

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const FRAMES = 48;
const frameUrl = (i) => `assets/seq/crystal-${String(i).padStart(3, '0')}.webp`;

function start() {
  const { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Lenis } = window;
  if (!gsap || !ScrollTrigger) { signal('static'); return; }          // CDN blocked: the plain page is already complete
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)', wide: '(min-width: 861px)' }, (ctx) => {
    const { motion, wide } = ctx.conditions;

    // the crystal: the canvas takes over from the <img> in both modes; only what drives it differs
    const seqEl = $('.seq'), seq = createSequence($('canvas', seqEl), { count: FRAMES, src: frameUrl, fit: 'cover' });
    const steps = $$('.seq-steps li');
    seq.first.then(() => seqEl.classList.add('seq-live')).catch(() => {});
    const showStep = (p) => { const on = Math.min(2, Math.floor(p * 3)); steps.forEach((li, i) => { li.classList.toggle('is-on', i === on); li.style.setProperty('--o', motion ? (i === on ? 1 : 0.38) : 1); }); seqEl.style.setProperty('--p', p.toFixed(4)); };

    if (!motion) {
      seq.draw(1); seq.all.then(() => seq.draw(1));
      steps.forEach((li) => li.classList.add('is-on'));
      signal('reduced');
      return () => { seq.destroy(); seqEl.classList.remove('seq-live'); };
    }

    // smooth scroll, in step with ScrollTrigger: one clock for both
    const lenis = new Lenis({ anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

    // load: headline from behind a mask, then the tide line
    SplitText.create('h1', { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.2, stagger: 0.12, ease: 'power4.out', delay: 0.15 }) });
    gsap.from('.hero-place, .hero-sub', { opacity: 0, y: 14, duration: 0.8, stagger: 0.15, delay: 0.7, ease: 'power2.out' });
    gsap.from('.tideline path', { drawSVG: '0%', duration: 2.2, delay: 0.5, ease: 'power2.inOut' });
    gsap.to('.tideline', { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // 1. the paragraph reads itself
    const read = SplitText.create('[data-read]', { type: 'words', wordsClass: 'w' });
    gsap.fromTo(read.words, { '--w': 0.22 }, { '--w': 1, stagger: 0.5, ease: 'none', scrollTrigger: { trigger: '.read', start: 'top 72%', end: 'bottom 62%', scrub: true } });

    // 2. pinned scene: progress 0..1 picks the picture
    showStep(0);
    ScrollTrigger.create({ trigger: '.seq-pin', start: 'top top', end: '+=260%', pin: true, scrub: true, anticipatePin: 1,
      onUpdate: (st) => { seq.draw(st.progress); showStep(st.progress); } });

    // 3. the year: sideways on wide screens
    if (wide) {
      const year = $('.year'), track = $('.year-track');
      year.classList.add('year-wide');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.year-pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
      ctx.add(() => () => { year.classList.remove('year-wide'); gsap.set(track, { clearProps: 'transform' }); });
    }

    // 4. the tide chart draws once, then the dots
    gsap.timeline({ scrollTrigger: { trigger: '.tide figure', start: 'top 70%', once: true } })
      .from('.tide .curve', { drawSVG: '0%', duration: 2.4, ease: 'power1.inOut' })
      .from('.tide .marks circle', { scale: 0, duration: 0.5, stagger: 0.18, ease: 'back.out(2.5)' }, 0.5);

    signal('ready');
    return () => { gsap.ticker.remove(tick); lenis.destroy(); delete window.__lenis; seq.destroy(); seqEl.classList.remove('seq-live'); read.revert(); };
  });
}
// the GSAP script tags are deferred; module scripts run after them, but wait for the document to be parsed all the same
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
