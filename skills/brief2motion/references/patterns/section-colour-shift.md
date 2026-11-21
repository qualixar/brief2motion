# Section colour shift

As the reader moves from chapter to chapter, the page background and text colours change to the chapter's own palette.

**Use when:** a story or a launch page with distinct chapters that each deserve a mood.
**Not when:** a utility page, long reading text (changing contrast while reading tires people), or more than about five chapters.
**Stack:** plain CSS and JavaScript with the kit (`vanilla`, `inView`).
**Brief words:** background changes as you scroll, colour shifts per section, chapters change colour, mood change.
**Study:** `web-references.md` section 3 (scroll-driven animations demos, `@property`).

## Sketch

```html
<section class="chapter" data-bg="#10151f" data-fg="#f1ede5"><h2>Night shift</h2><p>The quiet hours.</p></section>
<section class="chapter" data-bg="#f4efe6" data-fg="#1d1b18"><h2>Morning</h2><p>The handover.</p></section>
```

```css
body { background: var(--page-bg, #f4efe6); color: var(--page-fg, #1d1b18); }
@media (prefers-reduced-motion: no-preference) { body { transition: background-color .7s cubic-bezier(.45, 0, .55, 1), color .7s cubic-bezier(.45, 0, .55, 1); } }
.chapter { min-height: 90svh; }
```

```js
import { signal, reducedMotion, inView } from './kit/motion-core.js';

inView('.chapter', (el) => {                                       // the chapter that is at least 55% on screen sets the page palette
  document.documentElement.style.setProperty('--page-bg', el.dataset.bg);
  document.documentElement.style.setProperty('--page-fg', el.dataset.fg);
}, { once: false, amount: 0.55 });
signal(reducedMotion() ? 'reduced' : 'ready');
```

A slow dissolve says "drift with me" (`motion-doctrine.md`, rule 8). The colour pair of every chapter is checked for contrast before code, because the checker samples the page where it rests at the top.

## Budget

0.6 to 0.8 s per change, colours only; a background colour transition repaints the page but does not lay it out. At most five palettes. Every `data-bg`/`data-fg` pair passes 4.5:1 for body text, and the in-between blend never matters because the text colour changes together with the background.

## Reduced motion

The transition is declared only inside `no-preference`, so the colours switch at once: this is a cut, which is allowed. If a brief asks for no change at all, drop the script and use one palette.

## Checks

`check_site.mjs`: text contrast at the resting state (top of page); reduced-motion run. Contrast of later chapters is not measured while scrolled: capture screenshots at each chapter (`capture_site.mjs`) and test the pairs by hand or with the checker's contrast function (`scripts/_measure.mjs`).
