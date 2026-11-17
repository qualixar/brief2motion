# Scroll storytelling

The page is a sequence and the scroll bar is its timeline: scenes pin, pictures scrub, charts redraw. The reader sets the pace, which is why it works for explaining things and why it fails when it takes control away.

Worked examples: `examples/tidewater/` (GSAP: pinned picture sequence, sideways gallery), `examples/halden-one/` (CSS sticky plus the kit: a 3D scene in four poses), `examples/keeling/` (step-triggered: a chart with five states), `examples/sprout/` (native CSS scroll-driven animation).

## Four ways to tie something to scroll

| Way | How | Use it for |
|---|---|---|
| Step-triggered | the section nearest a line on screen is "active"; switching runs a short transition | charts and diagrams with distinct states; the most robust |
| Scrubbed, CSS sticky | a tall section, a `position: sticky` child, and a 0 to 1 progress number (`scrollScene` in the kit) | one scene, no library, canvas or 3D |
| Scrubbed, GSAP ScrollTrigger | `pin: true, scrub: true` and a timeline | several scenes, snapping, sideways travel, complex choreography |
| Native CSS | `animation-timeline: view()` or `scroll()` | simple enhancements that can be absent |

Choose step-triggered when the content has states, and scrubbed when it has a continuous quantity (a camera move, a picture sequence, a line growing).

## Step-triggered (the scrollama idea, in ten lines)

```js
import { onScroll } from './kit/motion-core.js';
const steps = [...document.querySelectorAll('.step')];
onScroll((vh) => {
  const mark = vh * 0.55; let best = 0, bestD = Infinity;
  steps.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mark); if (d < bestD) { bestD = d; best = i; } });
  go(best);                                   // does nothing if the step has not changed
});
```

`go(step)` moves the graphic to that state with a short tween and cancels the one in flight, so scrolling back and forth always lands in the right state. With reduced motion it sets the state at once.

Layout: text in one column with each step about 80% of a screen tall; the graphic `position: sticky` in the other. On phones the graphic sticks to the top at about 40% of the screen height and the text scrolls under it, on a solid background.

## Scrubbed with CSS sticky

```html
<section class="scene">                       <!-- height: 520vh -->
  <div class="stage">...</div>                 <!-- position: sticky; top: 0; height: 100svh -->
  <div class="chapters">...</div>              <!-- sticky too, with margin-top: -100svh, so it lies over the stage -->
</section>
```
```js
scrollScene(document.querySelector('.scene'), (p) => { progress = p; setCaptions(p); });
```

Captions: give each a range and fade it in and out with `slice()`. In-page links cannot point at captions inside a sticky layer; put invisible anchor elements along the tall section instead:

```js
anchor.style.top = `calc(${midpoint} * (100% - 100vh))`;     // midpoint: the progress at which that caption is centred
```

The default layout, before any script runs, is the unpinned one: the stage as a normal block with a still picture, the captions as normal text below it. A class on `<html>` switches to the pinned layout only once the scene is running.

## Scrubbed with GSAP

See `gsap.md` for the code. The decisions:

- Pin length: 200 to 300% of a screen for one idea. Longer and people think the page is stuck.
- Show progress inside a pinned scene (a thin bar, or the active caption), so the reader knows scrolling is doing something.
- `scrub: true` for a picture sequence; `scrub: 0.5` for travel.
- Sideways sections only on wide screens with motion on; a native swipe row otherwise.

## Picture sequences

A run of numbered pictures drawn to a canvas, chosen by scroll progress. `kit/image-sequence.js` loads the first and last frame, then every eighth, fourth, second, then the rest, and always draws the nearest frame it has.

- 40 to 60 frames, about 960 px wide, WebP at quality 60 to 70: roughly 10 to 20 KB each. `examples/tidewater` has 48 frames in 686 KB.
- Frames come from the user's video (`ffmpeg -i in.mp4 -vf "fps=12,scale=960:-2" -c:v libwebp -q:v 65 seq/frame-%03d.webp`), from a 3D render, or from a script that draws them (`examples/tidewater/tools/make-frames.mjs`).
- Keep the last frame as an `<img>` in the HTML. It is the no-JavaScript picture, the reduced-motion picture, and the placeholder while frames load.

## Smooth scrolling

Lenis (MIT) smooths wheel input so scrubbed scenes do not step. It is optional. If you use it: run it on GSAP's ticker, expose it as `window.__lenis` for the checker, set `anchors: true`, mark nested scrollers with `data-lenis-prevent`, and never use it to change the scroll direction or speed. It stands down for reduced motion.

## Reduced motion

- Nothing is pinned for travel, nothing scrubs continuously.
- Step-triggered graphics still change state, at once.
- A scrubbed 3D scene becomes cuts between its poses (`examples/halden-one`).
- A picture sequence shows its last frame.
- A sideways gallery becomes a native row.

## Rules

- Scrolling scrolls. Do not hijack it, do not make one wheel tick equal one section, do not block the keyboard.
- The same content reads as a plain page with JavaScript off.
- One change per step, and text beside the graphic, not hidden behind an effect.
- A long pinned page makes Back and in-page links matter: test both.
- Parallax (layers moving at different speeds) adds little by itself and makes some people nauseous; a 2013 Purdue study found it did not improve the experience. Use it lightly or not at all.
