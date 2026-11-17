# GSAP, ScrollTrigger and Lenis

Use this for choreography: several things moving in a set order, scenes pinned and scrubbed by scroll, sideways galleries, text that splits and sets. Since 2025 all of GSAP is free, the former bonus plugins included (SplitText, DrawSVG, MorphSVG, Flip, ScrollSmoother). It is free under GSAP's own "no charge" licence, not an open-source one: load it from the CDN or npm, do not copy its files into a repository. `licences.md` has the terms.

Worked example: `examples/tidewater/` (pinned image sequence, sideways gallery, SplitText, DrawSVG, Lenis). The dust template (`templates/site/`) uses it for its scroll scene too.

## Loading (no build step)

Script tags with pinned versions and integrity hashes. `defer` keeps them out of the way of the first paint; a module script runs after them.

```html
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/gsap.min.js" integrity="sha384-3vCAhD+a3BOliP3QqjQINn6ZWiZxoqu0WFxX5ZQZgqekDZuSb1mJBrrLMmu94H8f" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/ScrollTrigger.min.js" integrity="sha384-H2WL1iy/jKQQ7MTHU2hskZKNHTYWWD/KgKE1vCNnaWY8An2ESTh23KN/fTp8XS3j" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/SplitText.min.js" integrity="sha384-e98MX/fxZrUXA/6T+aCptryLfHgR2FpEmWxDbbPloHT0Qg79dEXKdLJ/iwD2lzxs" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/DrawSVGPlugin.min.js" integrity="sha384-fynVx3iMchteqKcx/rkUAX8fWugxllTPhisYGTDw03tf1trspBGOvlurai60MD4A" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/gsap@3.15.1/dist/MotionPathPlugin.min.js" integrity="sha384-0PduWGnsKRJBzpu9A/sXL5KEIA1ukwvw/hQ0ygysO756Lfz8NyWKvPuWuwVjdJFX" crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.min.js" integrity="sha384-R18XzqnxvVLEF+BYfhpmDx30v7eP83fAckyfoRzK7/Uf6nGqufcmsk0eAKo7S3RU" crossorigin="anonymous"></script>
```

Load only the plugins the page uses. If you change a version, compute the new hash: `curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A`. In a bundled project: `npm i gsap lenis`, `import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'`, and `@gsap/react`'s `useGSAP()` in React.

## The frame every page uses

`gsap.matchMedia()` owns every branch. Motion is created only inside it, and GSAP reverts all of it when a condition stops matching, which covers reduced motion and breakpoints in one place.

```js
import { signal } from './kit/motion-core.js';

function start() {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  if (!gsap || !ScrollTrigger) { signal('static'); return; }          // CDN blocked: the plain page is complete
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 861px)' }, (ctx) => {
    const { motion, wide } = ctx.conditions;
    if (!motion) { showFinishedState(); signal('reduced'); return; }

    // smooth scroll on the same clock as ScrollTrigger
    const lenis = new Lenis({ anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;                                            // the checker scrolls through it

    // ... timelines and ScrollTriggers here ...

    signal('ready');
    return () => { gsap.ticker.remove(tick); lenis.destroy(); delete window.__lenis; };   // GSAP reverts its own work
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
```

## Patterns (all from `examples/tidewater/main.js`)

### A headline that rises line by line from behind a mask

```js
SplitText.create('h1', { type: 'lines', mask: 'lines', autoSplit: true,
  onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.2, stagger: 0.12, ease: 'power4.out' }) });
```

`autoSplit` re-splits when fonts load or the width changes; returning the animation from `onSplit` lets GSAP rebuild it. SplitText adds an `aria-label` and hides the pieces from assistive technology by default.

### Text that reads itself as it crosses the screen

```js
const read = SplitText.create('[data-read]', { type: 'words', wordsClass: 'w' });
gsap.fromTo(read.words, { '--w': 0.22 }, { '--w': 1, stagger: 0.5, ease: 'none',
  scrollTrigger: { trigger: '.read', start: 'top 72%', end: 'bottom 62%', scrub: true } });
```
```css
.read .w { opacity: var(--w, 1); }      /* default 1: readable with no script and with reduced motion */
```

### A pinned scene that scrubs a picture sequence

```js
import { createSequence } from './kit/image-sequence.js';
const seq = createSequence(canvas, { count: 48, src: (i) => `assets/seq/crystal-${String(i).padStart(3, '0')}.webp` });
ScrollTrigger.create({ trigger: '.seq-pin', start: 'top top', end: '+=260%', pin: true, scrub: true, anticipatePin: 1,
  onUpdate: (st) => seq.draw(st.progress) });
```

With reduced motion: `seq.draw(1)` and no ScrollTrigger. Keep an `<img>` of the last frame in the HTML for no-JavaScript visitors and swap to the canvas once the first frame has loaded.

### A sideways gallery, pinned on wide screens only

```js
if (wide) {
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, { x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.year-pin', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
}
```

On phones, and with reduced motion, leave it as a native row: `overflow-x: auto; scroll-snap-type: x mandatory`. Function-based values with `invalidateOnRefresh` recompute after a resize.

### A line that draws once, then dots that pop

```js
gsap.timeline({ scrollTrigger: { trigger: '.tide figure', start: 'top 70%', once: true } })
  .from('.curve', { drawSVG: '0%', duration: 2.4, ease: 'power1.inOut' })
  .from('.marks circle', { scale: 0, duration: 0.5, stagger: 0.18, ease: 'back.out(2.5)' }, 0.5);
```

### Layout changes (Flip)

Record the state, change the DOM, then animate from the old state: `const state = Flip.getState(items); reorder(); Flip.from(state, { duration: 0.6, ease: 'power2.inOut', stagger: 0.03 });`. For page-level changes, the View Transitions API (`view-transitions.md`) does the same job with less code.

## Lenis options worth knowing

`anchors: true` makes in-page links scroll smoothly (they do nothing otherwise while Lenis is running). `autoRaf: true` runs its own loop when you are not using GSAP's ticker. Put `data-lenis-prevent` on any element that must scroll by itself (a modal, a code block). `lenis.scrollTo(target, { immediate: true })` jumps. `respectReducedMotion` is on by default.

## Rules

- `scrub: true` for things that must stay locked to the scroll (a sequence, a progress bar); `scrub: 0.5` adds half a second of catch-up for things that should glide.
- Pin a wrapper, not the element you are transforming.
- Animate `x`, `y`, `scale`, `rotation`, `autoAlpha`. Not `top`, `left`, `width`.
- `ease: 'none'` for scrubbed tweens; the scroll is the easing.
- Create ScrollTriggers in page order, or call `ScrollTrigger.sort()`; pinning changes the positions of everything below.
- After images or fonts change the layout, call `ScrollTrigger.refresh()`.
- An emulated phone that is resized after loading can keep a stale pin width. Test narrow widths with a fresh load, as the checker does.
