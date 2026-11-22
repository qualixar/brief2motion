# Pinned scene, scrubbed by scroll

A tall section holds one scene on screen while scroll progress (0 to 1) drives it: a camera move, a reveal, a drawing, captions that arrive in order.

**Use when:** one idea needs 200 to 300% of a screen to unfold; a 3D object changing pose; a diagram assembling.
**Not when:** the content is a list of facts (use steps), the section would pin longer than about 300% of a screen, or the brief wants normal scrolling.
**Stack:** plain CSS sticky with the kit (`scrollScene`). GSAP ScrollTrigger (`pin: true, scrub: true`) when you need snapping, several scenes or sideways travel.
**Brief words:** pinned, sticky scene, scrub, scroll-driven, sequence plays as I scroll, scroll-linked.
**Study:** `web-references.md` sections 3 and 4; `stacks/scroll-story.md`.

## Sketch

```html
<section class="scene">                     <!-- height: 260vh -->
  <div class="stage">                       <!-- position: sticky; top: 0; height: 100svh -->
    <svg class="ring" viewBox="0 0 100 100" role="img" aria-label="A ring that fills as you scroll"><circle cx="50" cy="50" r="40" /></svg>
    <p class="cap cap-1">Start.</p><p class="cap cap-2">Halfway.</p><p class="cap cap-3">Done.</p>
  </div>
</section>
```

```css
.scene { height: 260vh; } .stage { position: sticky; top: 0; height: 100svh; display: grid; place-items: center; }
.ring circle { fill: none; stroke: currentColor; stroke-width: 6; stroke-dasharray: 251.3; stroke-dashoffset: calc(251.3 * (1 - var(--p, 1))); }
.cap { position: absolute; bottom: 12vh; opacity: 0; }
```

```js
import { signal, reducedMotion, scrollScene, slice } from './kit/motion-core.js';

const scene = document.querySelector('.scene'), caps = [...document.querySelectorAll('.cap')];
if (reducedMotion()) {
  scene.style.height = 'auto';                                    // no pinning: the finished scene, then the captions as plain text
  caps.forEach((c) => { c.style.position = 'static'; c.style.opacity = '1'; });
} else {
  scrollScene(scene, (p) => {                                     // p is also written to --p on the scene, so CSS can use it
    caps.forEach((c, i) => {
      const a = slice(p, i / 3, (i + 0.4) / 3), b = slice(p, (i + 0.7) / 3, (i + 1) / 3);   // fade in, then out (the last stays)
      c.style.opacity = String(i === caps.length - 1 ? a : a * (1 - b));
    });
  });
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

The default layout, before any script runs, shows the finished ring and the captions as normal text. The ring length 251.3 is the measured circumference `2 * pi * 40`: the SVG-draw rule (`stacks/svg-players.md`).

## Budget

Pin length 200 to 300% of a screen. Show progress inside the scene (a caption, a bar). Build, breathe, resolve: spread the scene over `slice(p, 0, .3)`, `slice(p, .3, .7)`, `slice(p, .7, 1)` (`motion-doctrine.md`, rule 4). Anything focusable inside must stay visible while pinned (WCAG 2.4.11). Use `100svh`, not `100vh`, so phone browser bars do not cut it.

## Reduced motion

Nothing pins and nothing scrubs: the scene is a normal block in its finished state.

## Checks

`check_site.mjs`: reduced-motion run (the page reports `reduced`, nothing animating, stillness at 0, 50 and 100% scroll, all text visible, `window.scrollTo` lands where asked); sideways scroll at 390 and 320 px; keyboard focus visible and on screen; phone p95 40 ms or less. By eye: shots at 0, 50 and 100% scroll show the three states.
