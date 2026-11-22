# Layout change: filter, sort, reorder

When a grid is filtered or sorted, the cards glide to their new places instead of jumping.

**Use when:** a filterable portfolio, a sortable list, a gallery with tags, a dashboard whose cards reorder.
**Not when:** the order changes constantly (a live feed), or there are hundreds of items. Never animate the content a person is trying to read mid-change.
**Stack:** the View Transitions API (`view-transitions`, `kit/view-transitions.js`); GSAP Flip for a library route; Motion's `layout` in a React project (`motion-react`).
**Brief words:** filter, sort, reorder, cards rearrange, layout animation, grid shuffles, drag to reorder.
**Study:** `web-references.md` sections 3 (View Transitions) and 4 (GSAP Flip, Motion layout animation); `examples/halvorsen/`, `examples/mise/`.

## Sketch

```html
<ul class="grid" id="grid">
  <li class="card" data-name="Quay" style="view-transition-name: card-quay">Quay</li>
  <li class="card" data-name="Ember" style="view-transition-name: card-ember">Ember</li>
  <li class="card" data-name="Moth" style="view-transition-name: card-moth">Moth</li>
</ul>
<button type="button" id="sort">Sort A to Z</button>
<p role="status" aria-live="polite" id="status"></p>
```

```css
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-group(*) { animation-duration: 420ms; animation-timing-function: cubic-bezier(.65, 0, .35, 1); }   /* moves between places: ease in and out */
}
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';
import { transition } from './kit/view-transitions.js';

const grid = document.getElementById('grid');
document.getElementById('sort').addEventListener('click', async () => {
  const sorted = [...grid.children].sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
  await transition(() => grid.replaceChildren(...sorted));        // with no API or reduced motion the change just happens
  document.getElementById('status').textContent = 'Sorted A to Z';
});
signal(reducedMotion() ? 'reduced' : 'ready');
```

Every item that should glide has its own unique `view-transition-name`. The live region tells screen readers what changed.

## Budget

Under about 500 ms; at most a few dozen named items (each name is a snapshot). Keep names unique at the moment of the change. Moving items stay readable: do not scale or blur them while they travel.
Accessibility: the buttons are real buttons with focus rings; focus stays on the button after the change.

## Reduced motion

`transition()` runs the update directly: same result, no travel.

## Checks

`check_site.mjs`: reduced-motion run; keyboard focus visible; tap targets; console errors 0. `tests/browser/smoke.mjs view-transitions` shows how to test that the glide pairs up on a real example.
