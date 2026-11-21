# Page transition

Moving to another page of the site cross-fades with a small, matched slide instead of a hard flash.

**Use when:** a multi-page site (portfolio, studio, documentation with a few pages) where the brief wants it to feel continuous.
**Not when:** a single-page site, or when the brief needs a video or WebGL canvas to survive the navigation (the API cannot keep it alive; see `stacks/view-transitions.md` for routers).
**Stack:** the View Transitions API with the kit's CSS conventions (`view-transitions`).
**Brief words:** page transition, between pages, smooth navigation, fade between pages, route transition.
**Study:** `web-references.md` section 3 (Chrome and MDN View Transitions, same-document and cross-document).

## Sketch

Put the same block in the stylesheet of every page.

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
  ::view-transition-old(root) { animation: 240ms cubic-bezier(.32, 0, .67, 0) both vt-out; }                 /* ease-in: leaves at speed */
  ::view-transition-new(root) { animation: 400ms 120ms cubic-bezier(.33, 1, .68, 1) both vt-in; }           /* ease-out: arrives from that speed */
  .site-nav { view-transition-name: site-nav; }                                                              /* the nav stays put */
}
@keyframes vt-out { to { opacity: 0; transform: translateY(-12px); } }
@keyframes vt-in { from { opacity: 0; transform: translateY(16px); } }
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';

signal(reducedMotion() ? 'reduced' : 'ready');                    // every page reports its state
```

Exit 240 ms ease-in, enter 400 ms ease-out after a 120 ms overlap: the seam is velocity-matched and the exit is shorter than the entrance (`motion-doctrine.md`, rules 2 and 8). A browser without the API simply navigates.

## Budget

Total under about 600 ms. Name few things: the nav and a travelling element at most. Transform and opacity only; the browser takes pictures of the pages, so avoid very large fixed backdrops. Focus and the document title must be right after the change: nothing here changes either, because it is a real navigation.

## Reduced motion

The block is inside `no-preference`, so there is no transition and the page changes at once. `kit/kit.css` also switches off the view-transition pseudo-elements.

## Checks

`check_site.mjs --pages about.html,work/a.html` checks every listed page the same way (state, reduced motion, layout, contrast, console). A transition itself is a browser behaviour the checker does not film: confirm with `capture_site.mjs`, or by hand in Chrome. `tests/browser/smoke.mjs view-transitions` shows how the morph on `examples/halvorsen/` is tested.
