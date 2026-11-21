# Cursor follower

A soft dot or ring trails the pointer with a little lag, and grows over links.

**Use when:** an expressive portfolio or an agency page, on desktop, where the brief asks for a custom cursor.
**Not when:** on touch or with reduced motion; as a replacement for the real cursor (do not hide it: people lose track of the pointer); on pages for tasks or forms.
**Stack:** plain JavaScript with the kit (`vanilla`).
**Brief words:** custom cursor, cursor follower, trailing dot, cursor that grows over links, cursor effect.
**Study:** `web-references.md` sections 2 and 4 (GSAP `quickTo`).

## Sketch

```html
<div class="cursor-dot" aria-hidden="true"></div>
```

```css
.cursor-dot { position: fixed; left: 0; top: 0; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; background: var(--accent, #1b4dff);
  pointer-events: none; opacity: 0; z-index: 90; transition: opacity .2s linear, width .25s cubic-bezier(.33, 1, .68, 1), height .25s cubic-bezier(.33, 1, .68, 1), margin .25s cubic-bezier(.33, 1, .68, 1); }
.cursor-dot.is-on { opacity: .85; }
.cursor-dot.is-big { width: 44px; height: 44px; margin: -22px 0 0 -22px; }
```

```js
import { signal, reducedMotion, damp, frameLoop } from './kit/motion-core.js';

const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const dot = document.querySelector('.cursor-dot');
if (fine && !reducedMotion()) {
  const to = { x: innerWidth / 2, y: innerHeight / 2 }, at = { ...to };
  addEventListener('pointermove', (e) => { to.x = e.clientX; to.y = e.clientY; dot.classList.add('is-on'); dot.classList.toggle('is-big', !!e.target.closest?.('a, button')); }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => dot.classList.remove('is-on'));
  frameLoop((dt) => {
    at.x = damp(at.x, to.x, 18, dt); at.y = damp(at.y, to.y, 18, dt);                  // lag of about a tenth of a second
    dot.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`;
  });
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

The dot has `pointer-events: none` so it never blocks a click, and the real cursor stays visible. Its size changes only with a short transition on width and height of one 14 px element.

## Budget

One small element, one transform write per frame, `fixed` position. It is decorative: `aria-hidden`, no information. Keep it under 50 px. Colour that shows on both light and dark sections (a mid-tone, or `mix-blend-mode: difference`).

## Reduced motion and touch

Not created: no dot is added, and the normal cursor is used with no lag and no growth.

## Checks

`check_site.mjs`: reduced-motion run (the dot does not exist; nothing animating); phone run unaffected (touch emulation has no fine pointer); console errors 0; tap targets unaffected. By eye with a mouse: the dot never covers text it should not and never lags behind visibly.
