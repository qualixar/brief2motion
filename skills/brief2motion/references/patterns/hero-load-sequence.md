# Hero load sequence

The first screen sets itself in a short, ordered sequence: headline first, then the supporting line, the action and the product picture. Most pages need this one planned entrance and little else.

**Use when:** the brief says the hero should "animate in", "set itself", "feel alive on load", or a launch page needs a first impression.
**Not when:** the page must be readable at once (a pricing or docs page), or the sequence would delay the main action by more than about a second. Never put the hero behind a loader.
**Stack:** plain CSS and JavaScript with the kit (`vanilla`); GSAP if the sequence needs one timeline with the rest of the page.
**Brief words:** hero animation, animate in on load, headline reveals, sets itself, first impression, intro.
**Study:** `web-references.md` sections 1 (galleries: look at hero timing only) and 4 (GSAP, Motion).

## Sketch

```html
<header class="hero">
  <h1>The 3 a.m. page goes to one person.</h1>
  <p class="lede">An on-call rota that cannot be wrong.</p>
  <a class="cta" href="#start">Start free</a>
  <figure class="shot"><img src="assets/app.webp" width="1200" height="800" alt="The rota screen with tonight's on-call person highlighted"></figure>
</header>
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';
import { splitText } from './kit/split-text.js';
import { staggerIn } from './kit/reveal.js';

const OUT = 'cubic-bezier(.33, 1, .68, 1)';                    // power3.out: arrives, then settles
if (!reducedMotion()) {
  const { words } = splitText(document.querySelector('.hero h1'), { by: 'words' });
  staggerIn(words, { y: '0.5em', duration: 800, each: 55, delay: 150 });           // headline first, 0.15 s after load
  const rest = [...document.querySelectorAll('.hero .lede, .hero .cta, .hero .shot')];
  rest.forEach((el, i) => el.animate(
    [{ opacity: 0, transform: 'translate3d(0, 16px, 0)' }, { opacity: 1, transform: 'none' }],
    { duration: 700, delay: 650 + i * 130, easing: OUT, fill: 'backwards' }));       // then one by one, 130 ms apart
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

`fill: 'backwards'` holds the first keyframe during the delay, so nothing is hidden in the stylesheet: with JavaScript off the hero is simply there.

## Budget

Total sequence 1.2 s or less before the call to action is visible and usable. Stagger sums to about 0.5 s (`motion-doctrine.md`, rule 3). Animate `transform` and `opacity` only. The hero image has `width` and `height` so nothing shifts (CLS); it loads eagerly, never lazily.
Accessibility: `splitText` keeps the sentence readable as one string for screen readers. The call to action is focusable from the first frame.

## Reduced motion

No movement. The finished hero is on screen, and `signal('reduced')` says so. A fade of under 0.2 s is allowed but not needed.

## Checks

`check_site.mjs`: the page signals `ready` or `reduced`; the reduced-motion run requires nothing animating over 250 ms and every heading and paragraph visible; one `<h1>`; phone p95 frame time 40 ms or less while the sequence plays; no sideways scroll at 320 px. By eye in `check/shots/`: the hero screenshot shows the finished state with the headline, one action and the product.
