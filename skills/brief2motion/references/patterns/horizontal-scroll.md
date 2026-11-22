# Horizontal scroll section

Vertical scrolling pushes a row of panels sideways, then the page carries on down.

**Use when:** a timeline, a gallery or a set of case studies that suits a left-to-right order, on a wide screen.
**Not when:** on phones, with reduced motion, or when the content is something people compare or scan (a table, pricing). Never hijack the scroll direction without a way past it.
**Stack:** GSAP ScrollTrigger (`gsap`) on wide screens; a native swipe row everywhere else.
**Brief words:** horizontal scroll, sideways gallery, scroll sideways, timeline, carousel that pins.
**Study:** `web-references.md` sections 1 (GSAP gallery of sites) and 4 (ScrollTrigger); `stacks/gsap.md`.

## Sketch

```html
<section class="years" aria-label="Our years">
  <div class="track"><article>2021</article><article>2022</article><article>2023</article><article>2024</article></div>
</section>
```

```css
.track { display: flex; gap: 2rem; overflow-x: auto; scroll-snap-type: x mandatory; padding-inline: 5vw; }   /* the default: a native row */
.track article { flex: 0 0 min(80vw, 28rem); scroll-snap-align: start; min-height: 60svh; }
```

```js
import { signal } from './kit/motion-core.js';

function start() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) { signal('static'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 861px)' }, (ctx) => {
    if (!ctx.conditions.motion || !ctx.conditions.wide) { signal(ctx.conditions.motion ? 'ready' : 'reduced'); return; }   // native row
    const track = document.querySelector('.track');
    track.style.overflow = 'visible'; track.style.scrollSnapType = 'none';
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.years', start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    signal('ready');
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
```

GSAP reverts the inline styles it set when the condition stops matching, and the native row comes back. Pin a wrapper, not the element you move.

## Budget

Total sideways distance under about 4 screens of scroll. `scrub: 0.6` for a gliding catch-up. Animate `x` only. After images or fonts change widths, `ScrollTrigger.refresh()`. Panels must be reachable by keyboard: in the pinned version focus moves with Tab and the section scrolls; test it.

## Reduced motion and phones

A native swipe row with scroll snap: the same content, no pin, no hijack, keyboard scrollable (`tabindex="0"` on the track if it has no focusable children).

## Checks

`check_site.mjs`: sideways scroll at 1440, 390 and 320 px (the page itself must never scroll sideways; only the `.track` may); reduced-motion run; keyboard focus visible and on screen; phone p95 40 ms or less. By eye: shots at three scroll positions show different panels, and on the phone shot the row is swipeable.
