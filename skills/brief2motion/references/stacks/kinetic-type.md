# Kinetic type (split text)

The words are the animation. A headline is cut into lines, words or characters, and each piece gets its own timing. Done well it makes a page with no pictures feel designed. Done badly it makes text hard to read.

Worked example: `examples/relay/` (a headline that sets word by word, a highlight that wipes in behind two words, three rows of words that slide with the scroll). `examples/tidewater/` shows GSAP's SplitText with masked lines.

## Splitting

Three ways, all tested here:

| Tool | Use it when |
|---|---|
| `kit/split-text.js` | no library on the page, or with Motion or the Web Animations API |
| GSAP SplitText | the page already uses GSAP; it adds masks, automatic re-splitting and line detection |
| CSS only | the motion is per line and the lines are fixed (each line in its own `<span>`) |

```js
import { splitText } from './kit/split-text.js';
const split = splitText(document.querySelector('h1'), { by: 'words' });   // or 'chars'
split.words      // one <span class="word"> per word, each with --i set to its index
split.chars      // with by: 'chars'; characters stay inside their word, so words never break
split.lines()    // words grouped by the line they landed on; call again after a resize
split.revert()   // puts the heading back exactly as it was
```

What the kit does for accessibility: the real sentence stays in a visually hidden span, and the moving pieces are `aria-hidden`. A screen reader reads "The 3 a.m. page goes to one person" once, not eleven fragments. Emoji and accented letters stay whole (`Intl.Segmenter`).

## Recipes

### Set a headline word by word

```js
// Web Animations API (kit/reveal.js)
staggerIn(split.words, { y: '0.6em', duration: 800, each: 45 });
// Motion
animate(split.words, { opacity: [0, 1], y: ['0.55em', '0em'], rotate: [4, 0] }, { duration: 0.9, delay: stagger(0.055) });
// GSAP, lines rising from behind a mask
SplitText.create('h1', { type: 'lines', mask: 'lines', autoSplit: true, onSplit: (s) => gsap.from(s.lines, { yPercent: 110, stagger: 0.12, duration: 1.2, ease: 'power4.out' }) });
```

Timing that reads well: 30 to 60 ms between words, 15 to 30 ms between characters, 80 to 120 ms between lines, and the whole headline set within about 1.2 seconds.

### A highlight that wipes in behind a phrase

Mark the phrase in the HTML with `<mark>`, so it is highlighted even with no script. After splitting, give those words a pseudo-element and animate one CSS variable.

```css
.word.is-marked::before { content: ""; position: absolute; z-index: -1; inset: .09em -.07em .02em; background: var(--amber); transform: scaleX(var(--wipe, 1)); transform-origin: left; }
```
```js
animate(word, { '--wipe': [0, 1] }, { duration: 0.5, delay: 0.95, ease: [0.7, 0, 0.2, 1] });
```

### Rows of words that slide with the scroll

```html
<h2 class="sr-only">Page, acknowledge, resolve</h2>
<div class="band-row" data-dir="-1" aria-hidden="true"><span>Page.</span><span class="hollow">Page.</span><span>Page.</span></div>
```
```css
.band-row { display: flex; gap: .35em; width: max-content; white-space: nowrap; font-size: clamp(3.4rem, 13vw, 12.5rem); transform: translate3d(var(--x, 0px), 0, 0); }
.hollow { color: transparent; -webkit-text-stroke: 2px currentColor; }
```
```js
import { scrollThrough } from './kit/motion-core.js';
for (const row of rows) scrollThrough(row, (p) => row.style.setProperty('--x', `${Number(row.dataset.dir) * p * 600}px`));
```

The repeated words are decoration, so they are hidden from assistive technology and one real heading says it once. The section needs `overflow: hidden`.

### Text that reads itself

Words go from dim to full as the paragraph crosses the screen. See `gsap.md`: one scrubbed tween with a stagger on a CSS variable. Keep the dim state at about 20 to 25% opacity so the shape of the paragraph is visible, and default the variable to 1.

### A marquee

One row, duplicated once, translated by half its width in a linear loop. Pause it on hover and on focus, and do not run it with reduced motion:

```css
@media (prefers-reduced-motion: no-preference) { .marquee-track { animation: marquee 30s linear infinite; } .marquee:hover .marquee-track, .marquee:focus-within .marquee-track { animation-play-state: paused; } }
@keyframes marquee { to { transform: translateX(-50%); } }
```

## Type choices that make it work

- One family, very large, tight tracking (`letter-spacing: -.03em` to `-.05em`) and tight leading (0.92 to 1.05).
- `text-wrap: balance`, and a `max-width` in `ch` so lines break where you expect.
- System stacks with character: `"Avenir Next", "Segoe UI Variable Display"` for a heavy grotesque, `"Iowan Old Style", Palatino` for a serif, `Futura, "Century Gothic"` for a geometric, `Didot, "Bodoni 72"` for a display serif.
- If you load a web font, wait for it before splitting by lines (`document.fonts.ready`), or the lines are measured in the fallback font.

## Rules

- The sentence must be readable before, during and after. Never leave a headline half-set.
- Move in reading order. Random-order character reveals are slow to read.
- No more than one kinetic headline per screen.
- With reduced motion: no split at all. The plain heading is the finished state.
- A headline that animates on load must not delay the Largest Contentful Paint: start within 100 ms and never wait for a font or a library to show the text.
- Text that keeps moving by itself for more than 5 seconds needs a pause (WCAG 2.2.2).
