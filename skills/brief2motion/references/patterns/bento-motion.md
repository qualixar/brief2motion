# Bento grid with motion

An asymmetric grid of cards of different sizes; the cards come in as a group, and each lifts slightly on hover.

**Use when:** a features overview with five to nine items of unequal weight, a product summary, a dashboard-style section.
**Not when:** the items are equal (use a plain grid), the content is a long list, or every card has a different animation.
**Stack:** plain CSS and JavaScript with the kit (`vanilla`, `reveal`).
**Brief words:** bento, bento grid, feature grid, cards of different sizes, tiles.
**Study:** `web-references.md` section 2 (Magic UI bento grid, Aceternity); `references/styles/bento.md` for the look.

## Sketch

```html
<section class="bento" aria-label="What it does">
  <article class="tile wide"><h3>Rota</h3><p>Who is on call, always right.</p></article>
  <article class="tile"><h3>Alerts</h3><p>One message, one person.</p></article>
  <article class="tile tall"><h3>History</h3><p>Every handover logged.</p></article>
  <article class="tile"><h3>Calendar sync</h3><p>Works with the tools you have.</p></article>
</section>
```

```css
.bento { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: minmax(9rem, auto); gap: 16px; }
.tile { border-radius: 20px; padding: 24px; }
.tile.wide { grid-column: span 2; } .tile.tall { grid-row: span 2; }
@media (max-width: 860px) { .bento { grid-template-columns: minmax(0, 1fr); } .tile.wide, .tile.tall { grid-column: auto; grid-row: auto; } }
@media (prefers-reduced-motion: no-preference) {
  .tile { transition: transform .35s cubic-bezier(.33, 1, .68, 1), box-shadow .35s cubic-bezier(.33, 1, .68, 1); }
  .tile:hover { transform: translateY(-4px); }
}
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';
import { reveal } from './kit/reveal.js';

const grid = document.querySelector('.bento');
reveal([...grid.children], { group: grid, y: 20, duration: 700, stagger: 60, amount: 0.15 });   // one group, in order, when the grid shows
signal(reducedMotion() ? 'reduced' : 'ready');
```

The grid is complete HTML and CSS; `reveal` hides tiles only once it is running and not under reduced motion.

## Budget

One group reveal (stagger sums to under 0.5 s for up to eight tiles: use `stagger: 60`), hover lift 4 px, transform only. Do not blur or shadow-animate large areas. Tiles that are links need 24 px tap targets and a visible focus ring.

## Reduced motion

`reveal` returns at once: all tiles visible. The hover lift is declared only inside `no-preference`.

## Checks

`check_site.mjs`: sideways scroll at 390 and 320 px (the one-column fallback); reduced-motion run (all text visible); tap targets; focus ring on interactive tiles; phone p95. By eye: the grid reads in a sensible order on a phone.
