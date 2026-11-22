# Step scrollytelling

Text steps scroll past while one sticky graphic changes state to match the step in view. The reader sets the pace; each step changes one thing.

**Use when:** explaining a process, a chart with several states, a data story, a before-and-after.
**Not when:** there are no distinct states (use a scrubbed scene instead), or the text is the whole content and the graphic adds nothing.
**Stack:** plain CSS and JavaScript with the kit (`vanilla`, `onScroll`). The most robust of the scroll patterns.
**Brief words:** scrollytelling, scroll story, data story, step by step as I scroll, chart that changes, chapters.
**Study:** `web-references.md` sections 1 (The Pudding article) and 4 (Scrollama); `stacks/scroll-story.md`.

## Sketch

```html
<section class="story">
  <div class="graphic" aria-hidden="false"><div class="bar" role="img" aria-label="Savings so far"></div></div>
  <ol class="steps">
    <li class="step" data-state="1"><h2>Month one</h2><p>The first deposit lands.</p></li>
    <li class="step" data-state="2"><h2>Month six</h2><p>Interest starts to show.</p></li>
    <li class="step" data-state="3"><h2>Year two</h2><p>The balance has doubled.</p></li>
  </ol>
</section>
```

```css
.story { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 4vw; }
.graphic { position: sticky; top: 0; height: 100svh; display: grid; place-items: center; }
.step { min-height: 80svh; opacity: .45; }
.step.is-active { opacity: 1; }
.bar { width: 60%; height: 2rem; background: currentColor; transform-origin: left; transform: scaleX(var(--v, .1)); }
@media (prefers-reduced-motion: no-preference) {
  .bar, .step { transition: transform .6s cubic-bezier(.33, 1, .68, 1), opacity .4s cubic-bezier(.33, 1, .68, 1); }
}
@media (max-width: 860px) { .story { grid-template-columns: 1fr; } .graphic { height: 40svh; background: var(--bg, #fff); z-index: 1; } }
```

```js
import { signal, reducedMotion, onScroll } from './kit/motion-core.js';

const steps = [...document.querySelectorAll('.step')], graphic = document.querySelector('.graphic');
const VALUE = { 1: 0.2, 2: 0.5, 3: 1 };
let active = -1;
const go = (i) => {                                              // does nothing if the step has not changed
  if (i === active) return; active = i;
  steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
  graphic.style.setProperty('--v', String(VALUE[steps[i].dataset.state]));
};
onScroll((vh) => {
  let best = 0, bestD = Infinity;
  steps.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - vh * 0.55); if (d < bestD) { bestD = d; best = i; } });
  go(best);
});
signal(reducedMotion() ? 'reduced' : 'ready');
```

The transitions live in CSS inside `no-preference`, so with reduced motion the state still changes, at once. Each step changes one thing.

## Budget

Steps about 80% of a screen tall. One shared scroll listener (one read, one write per frame). The graphic is `position: sticky`, never pinned with JavaScript. On phones the graphic sticks at about 40% height on a solid background. Chart text: give the graphic a text alternative and put the numbers in a table or `<details>`.

## Reduced motion

States still change on scroll, in cuts (no transition). Nothing travels.

## Checks

`check_site.mjs`: reduced-motion run (nothing animating; text visible); sideways scroll at 390 and 320 px; keyboard focus ring visible and the focused element on screen (a sticky graphic must not cover focused links); phone p95 40 ms or less. By eye: shots at three scroll positions show the right state beside the right step.
