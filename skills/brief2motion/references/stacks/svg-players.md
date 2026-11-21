# SVG animation, Lottie and Rive

Three ways to move illustration. SVG in code is the lightest and the easiest to keep sharp. Lottie plays an animation a designer exported from After Effects. Rive plays an interactive animation with states, made in the Rive editor.

Worked examples: `examples/sprout/` (an SVG plant that draws and grows, three Lottie icons), `examples/keeling/` (an SVG chart with D3 scales), `examples/tidewater/` (a tide chart drawn with GSAP's DrawSVG). Rive is tested by `tests/browser/smoke.mjs` against a file it downloads; no `.riv` file ships in this repository.

## SVG

### A line that draws itself

One rule, the same in brief2mp4: measure the real length with `getTotalLength()`, set `stroke-dasharray` to it, and move `stroke-dashoffset` from that length to 0. `kit/svg-draw.js` does exactly this.

```js
import { prepareDraw, animateDraw, drawTo } from './kit/svg-draw.js';
const lines = prepareDraw('.stem, .leaf-vein');                 // measures each shape, dash = its length, offset = length (0 with reduced motion)
animateDraw(lines, { duration: 1500, stagger: 150 });           // play once, one after another
drawTo(lines[0], progress);                                     // or drive it from scroll, 0 to 1
```

Two things not to do. Do not use `pathLength="1"`: it draws in a live browser, but in a frame-by-frame render (brief2mp4's HyperFrames) it did not draw progressively, and with `vector-effect: non-scaling-stroke` Chrome draws the wrong amount (measured, 22 Nov 2026). Do not put `vector-effect: non-scaling-stroke` on a line you draw: the dash then runs in screen pixels, so the length you measured is wrong. Keep the SVG's aspect ratio (the default `preserveAspectRatio`) and the stroke scales evenly with the drawing; lengths are in the SVG's own units, so no re-measuring is needed after a resize. Measure again only if the path's `d` changes. The one exception is the dust engine's flight trail in `templates/site/flight.js`, which sits in a non-uniformly stretched layer and stays byte-identical.

### Shapes that grow from a point

The overshoot below (`1.4` in the curve) is a playful exception for a plant that grows; a serious page uses a plain `cubic-bezier(.33, 1, .68, 1)` (`motion-doctrine.md`, rule 1).

```css
.leaf { transform-box: view-box; transform-origin: 210px 360px; }    /* the point where the leaf meets the stem, in viewBox units */
```
```js
leaf.animate([{ transform: 'scale(0) rotate(-25deg)', opacity: 0 }, { transform: 'scale(1.08) rotate(3deg)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }],
  { duration: 700, delay: 500 + i * 190, easing: 'cubic-bezier(.3, 1.4, .5, 1)', fill: 'backwards' });
```

`transform-box` decides what `transform-origin` is measured from: `view-box` for coordinates in the drawing, `fill-box` for the shape's own centre and edges.

### Motion along a path

```css
.dot { offset-path: path("M110 130 C 240 130, 330 130, 520 130"); offset-distance: 0%; }
```
Animate `offset-distance` from 0% to 100% with CSS, the Web Animations API or Motion. GSAP's MotionPathPlugin does the same with more control (auto-rotation, starting part-way).

### Morphing

Two paths with the same commands in the same order can be interpolated point by point. For shapes that do not match, GSAP's MorphSVGPlugin (free) or the `flubber` library (MIT) work out the in-between. Keep morphs short.

### Charts

Write the SVG yourself and use D3 only for the maths: `d3-scale` for scales and `d3-shape` for the `d` attribute of a line or area (both ISC).

```js
const x = scaleLinear().domain([1959, 2025]).range([56, 692]);
const y = scaleLinear().domain([300, 440]).range([476, 24]);
path.setAttribute('d', line().x((d) => x(d[0])).y((d) => y(d[1])).curve(curveMonotoneX)(data));
```

To reveal a line up to an exact value, widen a `<clipPath>` rectangle to `x(year)`. A dash offset would reveal by length along the line, which is not the same as by year.

A chart needs a text alternative: `role="img"` with an `aria-label` that states the finding, a caption with the source, and the numbers in a table (`examples/keeling` puts the table in a `<details>`).

### Filters

`feTurbulence` makes noise for grain and hand-drawn wobble, `feDisplacementMap` bends an image by that noise, `feColorMatrix` and `feComponentTransfer` recolour, `feGaussianBlur` with `feColorMatrix` makes gooey blobs. They run on the CPU in most browsers: use them on small areas, or draw them once into a tile (`references/styles/grain.md`). Do not animate a large filter.

## Lottie

A Lottie file is JSON that describes vector layers and keyframes. `kit/players.js` loads the player from the CDN only when the first animation is near the screen, plays it only while it is visible, and shows one still frame with reduced motion.

```html
<div class="lottie" data-lottie="assets/water.json" role="img" aria-label="Animation: a drop of water falls and ripples spread."></div>
```
```css
.lottie { width: 96px; aspect-ratio: 1; }                        /* reserve the box so nothing jumps when it arrives */
```
```js
import { mountLottie } from './kit/players.js';
for (const el of document.querySelectorAll('[data-lottie]'))
  mountLottie(el, { path: el.dataset.lottie }, { loop: true, stillFrame: 22 });
```

- The kit uses `lottie_light`, the SVG-only build of lottie-web (MIT), about 365 KB before compression. It does not run After Effects expressions.
- dotLottie (`@lottiefiles/dotlottie-web`, MIT) is a newer player that draws to a canvas with WebAssembly and reads compressed `.lottie` files, with theming and state machines. Use it when the files are `.lottie` or large.
- Where files come from: the user's designer, or a library whose licence allows the use. Check each file's licence and credit it. The three icons in `examples/sprout` were written by a script in that folder (`tools/make-lottie.py`), which is practical for simple icons and shows the format.
- A Lottie that is only an icon changing state is often better as 20 lines of SVG and CSS.

## Rive

Rive animations are interactive: a state machine inside the file reacts to inputs you set from the page.

```html
<canvas id="hero" width="500" height="500" aria-label="What the animation shows."></canvas>
```
```js
import { mountRive } from './kit/players.js';
const player = mountRive(document.getElementById('hero'), { src: 'assets/hero.riv', stateMachines: 'State Machine 1' });
// later: player.rive.stateMachineInputs('State Machine 1').find((i) => i.name === 'hover').value = true;
```

- The kit loads `@rive-app/canvas-lite` (MIT), the smaller runtime without Rive's text and audio engines. Use `@rive-app/canvas` if the file has text runs, or `@rive-app/webgl2` for the full renderer.
- Name the state machine: the runtime warns when it has to guess.
- Call `resizeDrawingSurfaceToCanvas()` after load and on resize (the kit does), or the picture is soft on high-density screens.
- Call `cleanup()` when the element goes away: the runtime holds WebAssembly memory.
- The `.riv` file has to come from the user or from a source whose licence allows the use.

## Choosing between them

| The brief has | Use |
|---|---|
| lines, simple shapes, icons, a chart | SVG with the kit, or GSAP for long sequences |
| a finished animation exported from After Effects | Lottie |
| a character or control that reacts to input with several states | Rive |
| a looping illustration heavier than about 200 KB as Lottie | a short muted video, with a poster |

## Rules

- Reserve the box: `aspect-ratio` on the container, or `width` and `height` on the canvas.
- Decorative: `aria-hidden="true"`. Meaningful: `role="img"` and an `aria-label`.
- Loops play only while on screen, and hold a chosen still frame with reduced motion.
- A looping illustration that plays by itself for more than 5 seconds needs to stop for reduced motion, or have a pause control (WCAG 2.2.2).
