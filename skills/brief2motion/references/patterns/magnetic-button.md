# Magnetic button

A button leans a few pixels toward the pointer while the pointer is over it, then settles back when it leaves.

**Use when:** one primary call to action on a pointer device, where the brief wants a tactile, playful feel.
**Not when:** on touch screens, with reduced motion, on every link, or on small tap targets that would slip away from the finger. It must never make a control hard to hit.
**Stack:** plain JavaScript with the kit (`vanilla`: `damp`, `frameLoop`).
**Brief words:** magnetic button, button follows the cursor, sticky button, pulls toward the mouse.
**Study:** `web-references.md` section 2 (Motion-Primitives and Aceternity, for the feel only) and 4 (GSAP `quickTo`).

## Sketch

```html
<a class="btn" href="#start">Start free</a>
```

```css
.btn { display: inline-block; padding: 14px 24px; min-height: 44px; }
```

```js
import { signal, reducedMotion, damp, frameLoop } from './kit/motion-core.js';

const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const btn = document.querySelector('.btn');
if (fine && !reducedMotion()) {
  const to = { x: 0, y: 0 }, at = { x: 0, y: 0 }, PULL = 0.22, MAX = 10;                // never more than 10 px
  const clampPx = (v) => Math.max(-MAX, Math.min(MAX, v));
  btn.addEventListener('pointermove', (e) => {
    const r = btn.getBoundingClientRect();
    to.x = clampPx((e.clientX - (r.left + r.width / 2)) * PULL); to.y = clampPx((e.clientY - (r.top + r.height / 2)) * PULL);
  });
  btn.addEventListener('pointerleave', () => { to.x = 0; to.y = 0; });
  frameLoop((dt) => {
    at.x = damp(at.x, to.x, 14, dt); at.y = damp(at.y, to.y, 14, dt);
    btn.style.transform = `translate3d(${at.x.toFixed(2)}px, ${at.y.toFixed(2)}px, 0)`;
  }, { target: btn });                                                                   // runs only while the button is on screen
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

The pull is measured from the button's centre, not the pointer, so the target cannot run away from the pointer. The pointer events attach to the button itself, so the effect never starts from far away and never moves the button out from under the pointer. `damp` gives the same feel at 60 and 120 Hz.

## Budget

Maximum displacement 10 px. One transform write per frame, on one element. Tap target 44 px high (24 px is the hard floor). The loop stops off screen.
Accessibility: keyboard focus shows the normal focus ring; focus does not move the button.

## Reduced motion and touch

Not created. The button is a plain button.

## Checks

`check_site.mjs`: tap targets 24 px or more on the phone run; keyboard focus ring visible; reduced-motion run (no running animation; picture holds still); console errors 0. The effect itself cannot be measured by the checker: look at it with a mouse, and confirm the button can still be clicked at its edges.
