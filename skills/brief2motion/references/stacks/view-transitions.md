# View Transitions and page transitions

The View Transitions API lets the browser animate between two states of a page, or between two pages, by taking a picture of the old state and cross-fading or morphing it into the new one. You write CSS and almost no script, and a browser without the API changes the page the ordinary way.

Worked example: `examples/halvorsen/` (a multi-page portfolio: the clicked poster grows into the next page's hero, in both directions; filter and sort buttons glide the cards to new places). `tests/browser/smoke.mjs` checks that the morph really pairs up.

## Page to page (a normal multi-page site)

Both pages opt in with one CSS rule. Put it behind the reduced-motion query, so visitors who asked for less motion get a plain page change.

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
  ::view-transition-old(root) { animation: 240ms ease-in both vt-out; }
  ::view-transition-new(root) { animation: 380ms 120ms ease-out both vt-in; }
  ::view-transition-group(hero-media) { animation-duration: 520ms; animation-timing-function: cubic-bezier(.3, 0, .1, 1); }
}
@keyframes vt-out { to { opacity: 0; transform: translateY(-12px); } }
@keyframes vt-in { from { opacity: 0; transform: translateY(18px); } }
```

That alone cross-fades same-origin navigations. To make one element travel, give it the same `view-transition-name` on both pages. The name must be unique on each page at the moment of the snapshot.

```css
.nav { view-transition-name: site-nav; }                 /* stays put while the page under it changes */
.project-poster { view-transition-name: hero-media; }    /* the big picture on the project page */
```

On the index there are many cards, and only the one that was clicked may carry `hero-media`. Set it as the old page leaves, and set it again on the matching card when the index is shown by Back. `kit/view-transitions.js` does both:

```js
import { sharedElementNav } from './kit/view-transitions.js';
sharedElementNav({ card: '[data-vt]', name: 'hero-media' });    // <img data-vt="quay"> links to work/quay.html
```

It listens to `pageswap` (the old page, just before it is photographed; `event.activation.entry.url` is where you are going) and `pagereveal` (the new page, before its first frame; `navigation.activation.from.url` is where you came from).

The script that registers `pagereveal` has to run before the page's first frame, or it misses the event. Load it in the `<head>` as a render-blocking module:

```html
<script type="module" blocking="render" src="site.js"></script>
```

With an ordinary module script at the end of `<body>`, the first navigation after a fresh load showed no morph in testing. With `blocking="render"` it works in both directions.

Rules of thumb:

- Cross-document transitions need both pages on the same origin and a real navigation (a link click, Back, Forward).
- Keep the two elements the same shape. A poster that is 4:5 on both pages morphs cleanly; a square thumbnail into a wide banner stretches.
- Name few things: the travelling element and anything that should stay still (the nav). Everything else cross-fades as `root`.
- Total time under about 600 ms. A page change is a frequent interaction.

## Same page (filter, sort, tabs, a theme switch)

Wrap the DOM change in `document.startViewTransition`. Give every item that should glide its own name.

```html
<li class="card" style="view-transition-name: card-quay">...</li>
```
```js
import { transition } from './kit/view-transitions.js';
button.addEventListener('click', () => transition(() => { grid.append(...sorted); hide(filteredOut); }));
```

`transition()` runs the update directly when the API is missing or the visitor has reduced motion on, so the result is the same, without travel. After the change, tell screen readers what happened with a live region ("2 typefaces shown").

Useful CSS:

```css
::view-transition-group(*) { animation-duration: 420ms; animation-timing-function: cubic-bezier(.3, 0, .1, 1); }
::view-transition-old(card-quay):only-child { animation: 200ms ease-in both fade-out; }      /* an item that is leaving */
```

## Where the API is not available

Support differs between browsers and has been changing. The examples here were tested in Chrome 157. Check current support before promising a morph in a brief's "done when" list, and design so the site is complete without it. The checker's reduced-motion run and its JavaScript-off run both see plain pages.

## When you need a library instead

The API cannot keep an element alive across pages (a playing video or audio, a WebGL canvas), and it cannot run a custom JavaScript animation mid-flight. For those, a client-side router replaces the page's content without a real navigation:

- **swup** (MIT): fetches the next page, swaps the containers you name, runs CSS or JavaScript animations around the swap, and has plugins for preloading, head management and scroll.
- **Barba.js** (MIT): the same idea with hooks (`leave`, `enter`, `once`) made for GSAP timelines.

With either, you take on what the browser did for free: focus goes to the new content, the title updates, scripts for the new page start and old ones are cleaned up, and the Back button restores scroll. In a framework, use its own transition support: Next.js and Astro expose view transitions, and Motion's `AnimatePresence` handles route changes in React.

## Rules

- The site works as ordinary pages first. Transitions are added on top.
- Behind `prefers-reduced-motion: no-preference`, always.
- One travelling element per navigation. More is noise.
- After any page change, focus and the document title are correct.
