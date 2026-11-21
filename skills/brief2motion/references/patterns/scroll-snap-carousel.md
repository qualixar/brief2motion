# Scroll-snap carousel

A row of cards swipes sideways and each one snaps into place; buttons move it for people with a mouse or keyboard.

**Use when:** testimonials the user supplies, products, case studies, steps: anything with three to ten similar items in a row.
**Not when:** the items need to be compared side by side, or the row hides the only call to action. Never auto-advance.
**Stack:** CSS only for the row, a few lines of JavaScript for the buttons (`vanilla`).
**Brief words:** carousel, slider, swipe row, snap scroll, gallery row, testimonials slider.
**Study:** `web-references.md` section 3 (`scroll-snap-type`, `overscroll-behavior`).

## Sketch

```html
<section class="carousel" aria-label="Case studies">
  <div class="row" tabindex="0" role="region" aria-label="Case studies, scroll sideways">
    <article>Quay</article><article>Ember</article><article>Moth</article><article>Ledger</article>
  </div>
  <button type="button" data-dir="-1">Previous</button> <button type="button" data-dir="1">Next</button>
</section>
```

```css
.row { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scroll-padding-inline: 5vw; padding-inline: 5vw; }
.row article { flex: 0 0 min(80vw, 24rem); scroll-snap-align: start; }
@media (prefers-reduced-motion: no-preference) { .row { scroll-behavior: smooth; } }
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';

const row = document.querySelector('.row');
document.querySelectorAll('.carousel button[data-dir]').forEach((b) => b.addEventListener('click', () => {
  const card = row.querySelector('article');
  row.scrollBy({ left: Number(b.dataset.dir) * (card.getBoundingClientRect().width + 16), behavior: reducedMotion() ? 'auto' : 'smooth' });
}));
signal(reducedMotion() ? 'reduced' : 'ready');
```

The row is a normal scroll container: it works by touch, wheel, trackpad and keyboard (focus it and use the arrow keys). Buttons are for people who cannot swipe.

## Budget

No script runs on scroll. The page itself never scrolls sideways; only `.row` does. Buttons are real buttons of 44 px. No auto-advance, no looping.

## Reduced motion

`scroll-behavior: smooth` is declared only in `no-preference`, and the buttons use `behavior: 'auto'`: jumps, not glides.

## Checks

`check_site.mjs`: sideways scroll at 1440, 390 and 320 px (the page must not scroll sideways, only `.row`); tap targets 24 px or more; keyboard focus visible on `.row` and buttons; reduced-motion run. By eye: the first card is fully visible at load.
