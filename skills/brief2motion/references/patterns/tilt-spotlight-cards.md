# Tilt and spotlight cards

Cards tilt a few degrees toward the pointer and a soft light follows it across the surface.

**Use when:** a row of feature or project cards on a pointer device, where the brief asks for "interactive", "premium" or "glow" cards.
**Not when:** on touch, with reduced motion, for cards with small text that must stay still while read, or more than about six at once.
**Stack:** plain CSS and JavaScript (`vanilla`).
**Brief words:** tilt card, 3D hover, spotlight, glow follows cursor, hover light, interactive cards.
**Study:** `web-references.md` section 2 (Aceternity spotlight and glow cards, for the look only) and 3 (`perspective`, `transform-style`).

## Sketch

```html
<article class="card"><h3>Fast rota</h3><p>Swap shifts in two taps.</p></article>
```

```css
.card { position: relative; border-radius: 16px; padding: 24px; transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform .35s cubic-bezier(.33, 1, .68, 1); }
.card::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .3s linear;
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgb(255 255 255 / .12), transparent 70%); }
.card:hover::after { opacity: 1; }
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';

const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fine && !reducedMotion()) {
  const TILT = 6;                                                                       // degrees, at the very edge
  for (const card of document.querySelectorAll('.card')) {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${((x - 0.5) * 2 * TILT).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-(y - 0.5) * 2 * TILT).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(x * r.width).toFixed(0)}px`); card.style.setProperty('--my', `${(y * r.height).toFixed(0)}px`);
    });
    card.addEventListener('pointerleave', () => { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
  }
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

Tilt is a CSS transform and the light is a CSS gradient position: no layout. The cards stay in normal flow and the text inside is a normal DOM, so it is selectable and readable.

## Budget

Maximum 6 degrees. Overlay alpha 0.12 or less, so it does not lower text contrast much; the checker measures text on the resting state, so still look at the hover state yourself. Do not tilt cards that contain forms or small text. Keyboard focus gets the normal focus ring, with no tilt.

## Reduced motion and touch

No listener is attached: flat cards, no light.

## Checks

`check_site.mjs`: text contrast on the resting state; reduced-motion run (cards still, text visible); keyboard focus visible; phone run (no pointer effect). By eye with a mouse: text remains readable at full tilt and with the light over it.
