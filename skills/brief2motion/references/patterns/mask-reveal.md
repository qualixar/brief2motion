# Mask reveal

A picture or panel is uncovered by a moving edge (a wipe), while the picture inside settles from slightly larger.

**Use when:** hero or gallery images, project covers, a section that needs a deliberate "uncover" beat.
**Not when:** every image on the page, or images that carry information the reader needs at once (a chart, a screenshot of the product being explained).
**Stack:** plain CSS and the Web Animations API (`vanilla`); GSAP if it joins a timeline.
**Brief words:** image reveal, wipe, curtain, mask, uncover, clip reveal, cinematic reveal.
**Study:** `web-references.md` section 3 (`clip-path`, `mask-image`).

## Sketch

```html
<figure class="reveal-img"><img src="assets/cover.webp" width="1600" height="1000" alt="The Halden harbour at dawn"></figure>
```

```css
.reveal-img { overflow: hidden; border-radius: 8px; }
.reveal-img img { display: block; width: 100%; height: auto; }
```

```js
import { signal, reducedMotion, inView } from './kit/motion-core.js';

const OUT = 'cubic-bezier(.25, 1, .5, 1)';                      // power4.out
if (!reducedMotion()) {
  inView('.reveal-img', (fig) => {
    fig.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 1100, easing: OUT, fill: 'backwards' });
    fig.firstElementChild.animate([{ transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 1400, easing: OUT, fill: 'backwards' });
  }, { amount: 0.3 });
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

The wipe is a `clip-path` animation on the wrapper and the zoom is a transform on the image: two cheap properties, no layout. With `fill: 'backwards'` the figure is clipped only during the animation, so a failed script leaves the picture visible.

## Budget

1 to 1.4 s per image, wipe shorter than the settle. At most three on screen at once. Animate `clip-path` and `transform` only. Images have `width` and `height`; an image above the fold must not be lazy-loaded.
Accessibility: the `alt` is on the image from the start, not added after the reveal.

## Reduced motion

No animation is created; the full image is on screen.

## Checks

`check_site.mjs`: reduced-motion run (nothing animating, picture still, text visible); every `<img>` has `alt`; page weight 1.5 MiB or less; phone p95 40 ms or less. By eye: no frame of the reveal shows a hard edge on a different image.
