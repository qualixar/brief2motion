# Parallax depth

Layers move at different speeds as the page scrolls, which gives a flat page a sense of depth.

**Use when:** one hero or one divider, lightly, where the brief asks for "depth" or "layers".
**Not when:** the whole page, text layers, or large travel. A 2013 study found parallax did not improve the experience, and it makes some people feel ill. Skip it if the brief is not specific.
**Stack:** CSS scroll-driven animation with a kit fallback (`vanilla`).
**Brief words:** parallax, depth, layers move at different speeds, floating layers, depth scroll.
**Study:** `web-references.md` section 3 (scroll-driven animations demos).

## Sketch

```html
<div class="depth" aria-hidden="true"><div class="layer back"></div><div class="layer mid"></div></div>
```

```css
.depth { position: relative; height: 70svh; overflow: clip; }
.layer { position: absolute; inset: -10% 0; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .back { animation: drift-back linear both; animation-timeline: view(); }
    .mid { animation: drift-mid linear both; animation-timeline: view(); }
  }
}
@keyframes drift-back { from { transform: translate3d(0, -6%, 0); } to { transform: translate3d(0, 6%, 0); } }
@keyframes drift-mid { from { transform: translate3d(0, -14%, 0); } to { transform: translate3d(0, 14%, 0); } }
```

```js
import { signal, reducedMotion, scrollThrough } from './kit/motion-core.js';

// Browsers without animation-timeline get the same drift from one shared scroll listener.
if (!reducedMotion() && !CSS.supports('animation-timeline: view()')) {
  const depth = document.querySelector('.depth');
  scrollThrough(depth, (p) => {
    depth.querySelector('.back').style.transform = `translate3d(0, ${(p - 0.5) * 12}%, 0)`;
    depth.querySelector('.mid').style.transform = `translate3d(0, ${(p - 0.5) * 28}%, 0)`;
  });
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

## Budget

Total travel under about 15% of the block height; at most two or three layers; decoration only (`aria-hidden`), never text. Transform only. Clip with `overflow: clip` so layers never cause sideways scroll.

## Reduced motion

No drift at all: the layers sit at their rest position (the CSS is only declared inside `no-preference`, the script returns).

## Checks

`check_site.mjs`: reduced-motion run (the picture holds still at three scroll positions); sideways scroll at 390 and 320 px; phone p95 40 ms or less. By eye: layers never reveal an empty edge during the scroll (screenshots at 0, 50 and 100%).
