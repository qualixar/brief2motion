# Text line reveal

A headline rises line by line from behind an invisible edge, so each line appears to be set into place.

**Use when:** a type-led page, a headline that carries the brief, a section title that should feel crafted.
**Not when:** body text, long paragraphs, or more than two reveals on one page (it stops being special). Not for text that must be readable while it moves.
**Stack:** GSAP with SplitText (`gsap`). Without GSAP, `kit/split-text.js` plus the Web Animations API gives words rising with no mask.
**Brief words:** headline rises, line by line, masked text, text reveal, kinetic headline, split text.
**Study:** `web-references.md` section 4 (GSAP SplitText) and `stacks/kinetic-type.md`.

## Sketch

```html
<h1 class="display">A page that sets itself line by line</h1>
```

```js
import { signal } from './kit/motion-core.js';

function start() {
  const { gsap, SplitText } = window;
  if (!gsap || !SplitText) { signal('static'); return; }          // CDN blocked: the plain heading is complete
  gsap.registerPlugin(SplitText);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    SplitText.create('.display', {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.1, ease: 'power4.out', delay: 0.15 }),
    });
    signal('ready');
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { signal('reduced'); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
```

`autoSplit` re-splits when fonts load or the width changes, and returning the tween from `onSplit` lets GSAP rebuild it. SplitText adds an `aria-label` and hides the pieces from assistive technology.

## Budget

Two lines to four lines; each line travels its own height (`yPercent: 110`). Duration 0.9 to 1.3 s with `power4.out`, stagger 0.08 to 0.12 s. Load SplitText after the text is on screen (`defer`). Give italic or serif lines room for descenders: add `padding-bottom: .12em` to the masked line, or the mask clips them.
Accessibility: the heading keeps one readable sentence. Do not split text smaller than about 24 px.

## Reduced motion

`gsap.matchMedia()` creates the motion only inside the no-preference branch. In the reduced branch nothing is created, so the heading is the plain, finished text.

## Checks

`check_site.mjs`: state `ready` or `reduced`; reduced-motion run (nothing animating, text visible); one `<h1>` still found with its full text (a split that loses words fails the visibility check); JavaScript off still reads. By eye: the final frame has no clipped descenders.
