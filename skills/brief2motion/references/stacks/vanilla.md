# Plain CSS and JavaScript (the default)

Use this when nothing in the brief needs a library. It is the lightest stack, it has nothing to break, and with the kit it covers more than people expect: entrances, scroll-linked values, pinned scenes, counters, line drawing and picture sequences.

Worked examples: `examples/sprout/` (SVG drawing, native scroll-driven CSS), `examples/keeling/` (a pinned chart), `examples/halvorsen/` (page transitions).

## The kit

Copy the whole `kit/` folder into the site and import what you need. Every file is small, has no dependencies, and is covered by tests.

| File | What it gives you |
|---|---|
| `kit.css` | the accessibility floor: skip link, focus ring, `.sr-only`, the reduced-motion rule |
| `motion-core.js` | `reducedMotion()`, `signal()`, `frameLoop()`, `inView()`, `onScroll()`, `scrollScene()`, `scrollThrough()`, and the maths (`clamp`, `lerp`, `damp`, `ease`, `slice`) |
| `reveal.js` | `reveal()` and `staggerIn()` with the Web Animations API; content stays visible if the script never runs |
| `split-text.js` | `splitText()` into words, characters or lines, readable by screen readers |
| `counter.js` | `countUp()` for numbers that keep their real value in the DOM |
| `svg-draw.js` | `prepareDraw()`, `drawTo()`, `animateDraw()` for lines that draw themselves |
| `image-sequence.js` | `createSequence()` to scrub numbered pictures on a canvas |
| `view-transitions.js` | `transition()` and `sharedElementNav()` |
| `three-stage.js` | `createStage()` for three.js |
| `players.js` | `mountLottie()` and `mountRive()` |

Every page ends its setup with `signal('ready')`, `signal('reduced')` or `signal('static')`. The checker waits for it.

## Patterns

### A sequence on load (Web Animations API)

```js
import { reducedMotion, signal } from './kit/motion-core.js';
import { splitText } from './kit/split-text.js';
import { staggerIn } from './kit/reveal.js';

if (reducedMotion()) signal('reduced');
else {
  const { words } = splitText(document.querySelector('h1'), { by: 'words' });
  staggerIn(words, { duration: 800, each: 50 });           // returns Animation objects
  signal('ready');
}
```

`element.animate(keyframes, options)` runs off the main thread for `transform` and `opacity`, can be paused, reversed and awaited (`animation.finished`), and needs no library. Use `fill: 'backwards'` so the first keyframe applies during the delay, and avoid `fill: 'forwards'`: set the final style and let the animation end.

### A pinned scene with no library

Make the section tall and its child `position: sticky`. The kit turns scroll into a 0 to 1 number and writes it to `--p`, so CSS can do the rest.

```html
<section class="scene" style="height: 400vh">
  <div class="pin" style="position: sticky; top: 0; height: 100svh"> ... </div>
</section>
```

```js
import { scrollScene, slice } from './kit/motion-core.js';
scrollScene(document.querySelector('.scene'), (p) => {
  caption1.style.opacity = 1 - slice(p, 0.2, 0.3);          // gone by 30%
  caption2.style.opacity = Math.min(slice(p, 0.3, 0.4), 1 - slice(p, 0.6, 0.7));
});
```

```css
.bar { transform: scaleX(var(--p)); transform-origin: left; }
```

### Native scroll-driven animation (no script at all)

CSS can tie an animation to scroll position. `examples/sprout` fills its pots this way. Treat it as an enhancement: browsers without it show the end state.

```css
.water::after { transform: scaleY(var(--fill)); transform-origin: bottom; }             /* the finished state is the default */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .water::after { animation: fill linear both; animation-timeline: view(); animation-range: entry 20% cover 45%; }
    @keyframes fill { from { transform: scaleY(0); } }
  }
}
```

`view()` follows an element through the viewport; `scroll()` follows a scroller from top to bottom. `animation-range` picks the part of that journey. Give the animation `linear` timing: the scroll is the easing.

### Run something when it scrolls into view

```js
import { inView } from './kit/motion-core.js';
inView('.chart', (el) => draw(el), { amount: 0.5 });          // once, when half visible
```

### A loop that stops when nobody can see it

```js
import { frameLoop, damp } from './kit/motion-core.js';
let x = 0, target = 0;
const stop = frameLoop((dt) => { x = damp(x, target, 10, dt); el.style.transform = `translateX(${x}px)`; }, { target: el });
```

`damp` gives the same feel at 60 Hz and 120 Hz. A plain `x += (target - x) * 0.1` does not.

## Rules

- Hide things for an entrance from JavaScript, never in the stylesheet (`reveal.js` shows how).
- One `onScroll` subscriber list for the page; do not add your own `scroll` listeners.
- CSS transitions for hover and state changes; the Web Animations API for sequences; a frame loop only for things that follow the pointer or need physics.
- If you find yourself writing a timeline with more than six steps or scroll-linked scenes with snapping, move to `gsap.md`.
