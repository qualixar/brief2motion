# SVG line drawing

A line, an outline or a chart curve draws itself from start to end, once or tied to scroll.

**Use when:** a signature underline, a route or timeline, a hand-drawn diagram, a chart line. The line is the story.
**Not when:** the shape is a filled icon, or many small lines draw at once (it reads as noise).
**Stack:** SVG with the kit (`svg`, `kit/svg-draw.js`); GSAP's DrawSVG if the page already uses GSAP.
**Brief words:** line draws itself, draw on, outline animation, handwriting, route draws, chart line grows.
**Study:** `web-references.md` sections 3 (`offset-path`) and 4 (GSAP DrawSVG); `stacks/svg-players.md`.

## The rule (the same in brief2mp4)

Measure the real length with `getTotalLength()`, set `stroke-dasharray` to it, and move `stroke-dashoffset` from that length to 0. Do not use `pathLength="1"` (it fails in frame-by-frame renders and, with `non-scaling-stroke`, draws the wrong amount in Chrome). Do not put `vector-effect: non-scaling-stroke` on a line you draw. `motion-doctrine.md` rule 9.

## Sketch

```html
<svg class="route" viewBox="0 0 600 200" role="img" aria-label="Route from the harbour to the lighthouse">
  <path class="stroke" d="M20 160 C 160 20, 300 200, 580 40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
</svg>
```

```js
import { signal, reducedMotion, scrollThrough, slice } from './kit/motion-core.js';
import { prepareDraw, animateDraw, drawTo } from './kit/svg-draw.js';

const [line] = prepareDraw('.route .stroke');                     // measures it; with reduced motion it is already fully drawn
const svg = document.querySelector('.route');
if (!reducedMotion()) {
  // once, when it comes into view:
  //   inView(svg, () => animateDraw([line], { duration: 1400 }))
  // or tied to the scroll position:
  scrollThrough(svg, (p) => drawTo(line, slice(p, 0.2, 0.7)));
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

For a chart, reveal by value rather than by length: widen a `<clipPath>` rectangle to `x(value)`, because a dash offset reveals by length along the line, which is not the same as by year (`stacks/svg-players.md`).

## Budget

One to three lines; 1.2 to 2.4 s with a long-tail ease (`cubic-bezier(.6, 0, .2, 1)` or `power1.inOut` for a calm draw). Dash properties repaint the stroke, not the layout: fine for a few paths, not for hundreds. Measure again only if the path's `d` changes. The SVG has a text alternative (`role="img"` and `aria-label`, plus a caption or table for a chart).

## Reduced motion

`prepareDraw` leaves the offset at 0: the whole line is there. `animateDraw` returns no animations.

## Checks

`check_site.mjs`: reduced-motion run (the picture holds still, the line is fully visible); sideways scroll; console errors 0. By eye: the screenshot at the end of the scroll shows the whole line, and nothing is drawn as a dot at the start.
