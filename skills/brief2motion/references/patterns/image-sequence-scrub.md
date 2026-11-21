# Image sequence scrubbed by scroll

A run of numbered pictures draws to a canvas, and scroll picks the frame: the "video that follows your scroll" effect, for a product turning, a flower opening, a render flying through.

**Use when:** the brief has a rendered or filmed object whose motion the reader should control.
**Not when:** the motion is simple enough to do with CSS, the frames would exceed the page weight budget, or the effect has no story.
**Stack:** plain CSS sticky with the kit (`createSequence`, `scrollScene`), or GSAP ScrollTrigger with the same helper (`examples/tidewater/`).
**Brief words:** image sequence, frame sequence, scrub a video with scroll, product spins as I scroll, apple-style scroll animation.
**Study:** `web-references.md` sections 3 and 4; `stacks/scroll-story.md` ("Picture sequences").

## Sketch

```html
<section class="seq-scene">                 <!-- height: 300vh -->
  <div class="seq-stage">                   <!-- position: sticky; top: 0; height: 100svh -->
    <img class="seq-still" src="assets/seq/crystal-047.webp" width="960" height="540" alt="A crystal, fully formed">
    <canvas class="seq-canvas" aria-hidden="true"></canvas>
  </div>
</section>
```

```js
import { signal, reducedMotion, scrollScene } from './kit/motion-core.js';
import { createSequence } from './kit/image-sequence.js';

const scene = document.querySelector('.seq-scene'), canvas = scene.querySelector('canvas');
const seq = createSequence(canvas, { count: 48, src: (i) => `assets/seq/crystal-${String(i).padStart(3, '0')}.webp` });
seq.first.then(() => document.documentElement.classList.add('has-seq'));        // CSS swaps the still for the canvas
if (reducedMotion()) seq.draw(1);                                                 // the last frame, no scrubbing
else scrollScene(scene, (p) => seq.draw(p));
signal(reducedMotion() ? 'reduced' : 'ready');
```

The kit loads the first and last frame, then every eighth, fourth, second and the rest, and always draws the nearest frame it has, so the canvas is never blank. The `<img>` of the last frame is the no-JavaScript picture, the reduced-motion picture and the placeholder while frames load.

## Budget

40 to 60 frames, about 960 px wide, WebP at quality 60 to 70: 10 to 20 KB each, under 1 MiB in all, inside the 1.5 MiB page budget. Pixel ratio capped at 2. Make frames with `ffmpeg -i in.mp4 -vf "fps=12,scale=960:-2" -c:v libwebp -q:v 65 seq/frame-%03d.webp`. Never swap `<img src>` per frame.

## Reduced motion

The canvas shows the last frame and nothing scrubs. The page needs no pin.

## Checks

`check_site.mjs`: page weight per page 1.5 MiB or less; reduced-motion run (holds still at three scroll positions); phone p95 40 ms or less; no sideways scroll; `alt` on the still. By eye: the screenshot at 0% scroll shows the first frame, not a blank canvas.
