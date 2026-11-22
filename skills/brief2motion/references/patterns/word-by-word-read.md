# Words that read themselves

A paragraph starts dim and each word lights up as it crosses the screen, so the page paces the reading.

**Use when:** a manifesto, a mission paragraph or a single key statement that should be read slowly, once.
**Not when:** more than one such paragraph per page, long text, or any text the reader needs at once. Dim words must still pass contrast (see Budget).
**Stack:** plain CSS and JavaScript with the kit (`vanilla`). GSAP's ScrollTrigger does the same with `scrub` (`stacks/gsap.md`).
**Brief words:** words light up as you scroll, reads itself, text highlights as it scrolls, scroll-linked text, manifesto.
**Study:** `web-references.md` sections 3 (scroll-driven animations) and 4 (GSAP).

## Sketch

```html
<p class="read">We build on-call tools that stay calm at three in the morning, so one tired person always knows what to do next.</p>
```

```css
.read { font-size: clamp(1.6rem, 4vw, 3rem); line-height: 1.2; max-width: 28ch; }
.read .word { opacity: calc(.3 + .7 * var(--w, 1)); }        /* default 1: fully readable with no script and with reduced motion */
```

```js
import { signal, reducedMotion, scrollThrough, slice, clamp } from './kit/motion-core.js';
import { splitText } from './kit/split-text.js';

const el = document.querySelector('.read');
if (!reducedMotion()) {
  const { words } = splitText(el, { by: 'words' });
  words.forEach((w) => w.style.setProperty('--w', 0));
  scrollThrough(el, (p) => {
    const t = slice(p, 0.25, 0.65) * words.length;           // the words light up while the paragraph is mid-screen
    words.forEach((w, i) => w.style.setProperty('--w', clamp(t - i).toFixed(3)));
  });
}
signal(reducedMotion() ? 'reduced' : 'ready');
```

## Budget

Up to about 60 words. One write per word per frame, batched by `scrollThrough` into one call per frame. The dimmest state is `opacity .3`: pick a text colour whose dim state still reaches 3:1 on its background, because contrast is measured on the page as the checker sees it, and a reader who stops mid-way sees the dim state.

## Reduced motion

`--w` is never set, so every word is at full opacity. Nothing scrolls differently.

## Checks

`check_site.mjs`: reduced-motion run (all text visible, nothing animating); text contrast runs on the final state; one `<h1>` and `lang` unchanged. By eye: scroll slowly through it in `check/shots/` and confirm the dim state is still legible.
