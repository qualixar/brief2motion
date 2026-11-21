# Scroll progress bar

A thin bar at the top of the page fills as the reader scrolls: a quiet cue for long articles and stories.

**Use when:** a long read, an article, a scroll story where "how far" helps.
**Not when:** a short page, or where the bar would sit over a fixed nav and add noise.
**Stack:** CSS scroll-driven animation, with a kit fallback (`vanilla`).
**Brief words:** progress bar, reading progress, scroll indicator, how far down the page.
**Study:** `web-references.md` section 3 (`animation-timeline: scroll()`).

## Sketch

```html
<div class="progress" role="presentation"></div>
```

```css
.progress { position: fixed; inset: 0 0 auto 0; height: 4px; background: var(--accent, #1b4dff); transform-origin: left; transform: scaleX(0); z-index: 50; pointer-events: none; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) { .progress { animation: grow linear both; animation-timeline: scroll(root); } }
}
@keyframes grow { to { transform: scaleX(1); } }
```

```js
import { signal, reducedMotion, onScroll } from './kit/motion-core.js';

if (reducedMotion() || !CSS.supports('animation-timeline: scroll()')) {   // reduced motion, or no scroll timeline: one passive listener
  const bar = document.querySelector('.progress');
  onScroll((vh) => { const max = document.documentElement.scrollHeight - vh; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`; });
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

A progress bar is information, not decoration, so reduced motion keeps it. The CSS animation is declared only inside `no-preference`; with reduced motion the script updates the bar directly, which creates no animation and no travel: it grows with the reader's own scroll. The bar is `pointer-events: none` and carries no focus.

## Budget

4 px high, transform only, no layout. The animation is driven by the browser's scroll timeline, so there is no scroll listener cost where it is supported. Colour passes 3:1 against the page (WCAG 1.4.11) if it is the only indicator.

## Reduced motion

Kept, through the listener path above. If a stricter brief wants no bar at all, delete the listener branch and show nothing.

## Checks

`check_site.mjs`: tap targets and focus unaffected (the bar must not be focusable or cover a control); phone p95 40 ms or less; no sideways scroll. By eye: the bar is empty at the top and full at the bottom (screenshots at 0 and 100% scroll).
