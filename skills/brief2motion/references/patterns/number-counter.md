# Number counter

A figure counts up to its real value when it scrolls into view.

**Use when:** one to four headline figures (customers served, hours saved, a measured result) that the brief supplies.
**Not when:** the number is invented, tiny (a count of 3), or part of a table; or there are more than four on the screen. Never count up a number you cannot source.
**Stack:** plain CSS and JavaScript with the kit (`vanilla`, `kit/counter.js`).
**Brief words:** count up, animated numbers, stats, figures, metrics that tick, odometer.
**Study:** `web-references.md` section 2 (Magic UI number ticker, for how it behaves only).

## Sketch

```html
<p class="stat"><span data-count data-to="1284" data-suffix=" ms">1,284 ms</span><br>median response</p>
```

```css
.stat [data-count] { font-size: clamp(2.4rem, 7vw, 5rem); font-variant-numeric: tabular-nums; }
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';
import { countUp } from './kit/counter.js';

document.querySelectorAll('[data-count]').forEach((el) => countUp(el, { duration: 1600 }));
signal(reducedMotion() ? 'reduced' : 'ready');
```

The real value is in the HTML from the start, so it is there with JavaScript off and for screen readers; only a visual twin counts. The kit uses fixed-width digits so the line does not wobble, ends on the exact text, and counts with an exponential ease-out (a long settle).

## Budget

1.2 to 2 s. One `requestAnimationFrame` loop per counter, stopped when it ends. Each counter has a source in the copy (REPORT.md lists it).
Accessibility: the final value is exposed to assistive technology; the moving copy is `aria-hidden`.

## Reduced motion

`countUp` returns at once: the final number is the only number.

## Checks

`check_site.mjs`: reduced-motion run (the final value is visible text); text contrast; JavaScript off still shows the figure; no sideways scroll at 320 px (a wide figure with a suffix wraps). By eye: the number at the end of the count equals the text in the brief.
