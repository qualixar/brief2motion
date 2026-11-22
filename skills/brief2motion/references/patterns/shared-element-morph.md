# Shared element morph

A card or thumbnail grows into the hero of its detail page, and shrinks back to its place on Back.

**Use when:** a portfolio, case-study index, product grid or gallery with a detail page for each item.
**Not when:** the two images have very different shapes (a square thumbnail into a wide banner stretches), many elements would morph at once, or the detail opens in a modal on the same page (use `layout-reorder` or a same-page transition).
**Stack:** the View Transitions API with the kit (`view-transitions`, `sharedElementNav`).
**Brief words:** shared element, card grows into the page, hero morph, thumbnail expands, case study transition.
**Study:** `web-references.md` section 3; `stacks/view-transitions.md`; `examples/halvorsen/`.

## Sketch

Index page: each card links to its page and names its id.

```html
<a href="work/quay.html" class="card"><img data-vt="quay" src="assets/quay-poster.webp" width="800" height="1000" alt="Quay: a harbour at dawn"></a>
```

Project page (`work/quay.html`): the big poster has the same shape.

```html
<img class="project-poster" src="../assets/quay-poster.webp" width="1600" height="2000" alt="Quay: a harbour at dawn">
```

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
  .project-poster { view-transition-name: hero-media; }            /* only one element may carry the name per page */
  ::view-transition-group(hero-media) { animation-duration: 520ms; animation-timing-function: cubic-bezier(.65, 0, .35, 1); }
}
```

```html
<script type="module" blocking="render" src="site.js"></script>   <!-- in <head>: it must run before the first frame to catch pagereveal -->
```

```js
import { sharedElementNav } from './kit/view-transitions.js';
import { signal, reducedMotion } from './kit/motion-core.js';

sharedElementNav({ card: '[data-vt]', name: 'hero-media' });      // names the clicked card as the old page leaves, and the matching card on Back
signal(reducedMotion() ? 'reduced' : 'ready');
```

The shared name is set only on the one clicked card, never on all cards, because a name must be unique when the snapshot is taken.

## Budget

520 ms is the ceiling for a page change; ease in and out (`power2.inOut`) because the element moves between two places. Both elements the same aspect ratio. Everything else cross-fades as `root`. One travelling element per navigation.

## Reduced motion

Declared only inside `no-preference`: no morph, a plain page change. The kit's `sharedElementNav` adds names only when the API fires its events, which it does not without the opt-in.

## Checks

`check_site.mjs --pages work/quay.html,...` for every page. The morph itself is covered by `tests/browser/smoke.mjs view-transitions`, which pairs up the old and new elements; copy its approach for a new site. By eye: capture Back and Forward once each.
