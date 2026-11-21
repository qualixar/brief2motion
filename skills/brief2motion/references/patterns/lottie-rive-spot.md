# Lottie or Rive animation spot

A small designer-made animation (an icon, an illustration, an interactive mascot) plays where it is needed and nowhere else.

**Use when:** the user supplies a Lottie JSON or a `.riv` file, or the brief names After Effects, Lottie or Rive.
**Not when:** nothing is supplied and the motion is simple (draw it in SVG with the kit), the file is large, or the licence of the file is unknown.
**Stack:** the kit's players (`players`): lottie-web (SVG renderer, light build) or the Rive runtime, both loaded only when the element is near the screen.
**Brief words:** Lottie, Rive, After Effects animation, animated icon, interactive illustration, mascot, state machine.
**Study:** `web-references.md` section 4 (Lottie, dotLottie, Rive); `stacks/svg-players.md`; `examples/sprout/`.

## Sketch

```html
<div class="icon-anim" role="img" aria-label="A water drop falling into a pot" data-lottie="assets/water.json" style="aspect-ratio: 1; width: 120px"></div>
<canvas class="mascot" width="400" height="400" aria-label="The Fern mascot, waving"></canvas>
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';
import { mountLottie, mountRive } from './kit/players.js';

for (const el of document.querySelectorAll('[data-lottie]')) {
  mountLottie(el, { path: el.dataset.lottie }, { loop: true, stillFrame: 22 });       // reduced motion: this frame, paused
}
const mascot = document.querySelector('.mascot');
if (mascot) mountRive(mascot, { src: 'assets/fern.riv', stateMachines: 'State Machine 1' });
signal(reducedMotion() ? 'reduced' : 'ready');
```

The players are imported when the first animation nears the screen, play only while visible, and pause when they leave. The element has a fixed `aspect-ratio`, so nothing jumps when the animation arrives. The Lottie SVG is `aria-hidden`; the element's own `aria-label` describes it.

## Budget

Each player is heavier than a small animation file; use one player library per page and only for files a designer made. Animation JSON under about 100 KB. A looping animation plays only while visible. Anything that loops for more than 5 seconds needs a pause control or a short loop count (WCAG 2.2.2). Pick a `stillFrame` that reads as a finished picture.
Licence: the file's licence is its own; record it in `CREDITS.md`.

## Reduced motion

Lottie loads paused on `stillFrame`; Rive draws one frame. Neither loops.

## Checks

`check_site.mjs`: reduced-motion run (the player holds still); third-party hosts only `cdn.jsdelivr.net` (the players are loaded from there); console errors 0; page weight. By eye: the still frame is a good picture.
