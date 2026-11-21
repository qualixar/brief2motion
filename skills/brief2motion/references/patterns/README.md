# Patterns: what a brief maps to

Twenty-seven pattern recipes. Each page says when to use the pattern and when not, the stack, a minimal sketch written against the kit's conventions, the performance and accessibility budget, the reduced-motion form and how `check_site.mjs` (and, for the dust engine, `check_motion.mjs`) verify it. `route.mjs` prints the matching pages for a brief (they appear under "Patterns"). Read `../motion-doctrine.md` first: every sketch follows it.

How to use one: copy the sketch into the page's own files, change the content to the brief's words, keep the structure. The sketches are not tested example pages; the examples in `examples/` are. Where a sketch uses a library (GSAP, three.js), the library is loaded the way the matching `stacks/` page shows. Each sketch's JavaScript parses and its imports from `./kit/` exist (`tests/patterns.test.mjs`).

Every pattern obeys the same frame: content is in the HTML and readable without JavaScript; motion is created only when `reducedMotion()` is false; the page ends its setup with `signal('ready' | 'reduced' | 'static')`; nothing else moves than what the motion plan lists.

## Index

| Pattern | The brief says | Stack | Checks that cover it |
|---|---|---|---|
| [hero-load-sequence](hero-load-sequence.md) | hero animates in, first impression | vanilla | reduced motion, phone frame time, `<h1>` |
| [text-line-reveal](text-line-reveal.md) | headline rises line by line | gsap | reduced motion, text visible |
| [word-by-word-read](word-by-word-read.md) | words light up as you scroll | vanilla | reduced motion, contrast |
| [mask-reveal](mask-reveal.md) | image wipe, curtain, clip reveal | vanilla | reduced motion, `alt`, weight |
| [number-counter](number-counter.md) | count up, animated stats | vanilla | reduced motion, JS off |
| [marquee](marquee.md) | ticker, scrolling strip | vanilla (CSS) | reduced motion, sideways scroll |
| [step-scrollytelling](step-scrollytelling.md) | scrollytelling, chart that changes | vanilla | reduced motion, focus, phone layout |
| [pinned-scene-scrub](pinned-scene-scrub.md) | pinned scene, scrubbed by scroll | vanilla or gsap | reduced motion, focus visible |
| [horizontal-scroll](horizontal-scroll.md) | scroll sideways, timeline | gsap | sideways scroll, reduced motion |
| [image-sequence-scrub](image-sequence-scrub.md) | frame sequence follows scroll | vanilla or gsap | weight, reduced motion |
| [parallax-depth](parallax-depth.md) | parallax, layered depth | vanilla (CSS) | reduced motion, sideways scroll |
| [scroll-progress-bar](scroll-progress-bar.md) | reading progress | vanilla (CSS) | tap targets, console |
| [product-3d-scroll](product-3d-scroll.md) | 3D product turns as you scroll | three | WebGL off, reduced motion, frame time |
| [shader-background](shader-background.md) | animated gradient, aurora, liquid | three | WebGL off, console errors |
| [magnetic-button](magnetic-button.md) | button follows the cursor | vanilla | tap targets, focus |
| [cursor-follower](cursor-follower.md) | custom cursor, trailing dot | vanilla | reduced motion |
| [tilt-spotlight-cards](tilt-spotlight-cards.md) | tilt card, glow follows cursor | vanilla | contrast, reduced motion |
| [bento-motion](bento-motion.md) | bento grid, feature tiles | vanilla | phone layout, reduced motion |
| [page-transition](page-transition.md) | smooth navigation between pages | view-transitions | `--pages`, reduced motion |
| [shared-element-morph](shared-element-morph.md) | card grows into the detail page | view-transitions | `--pages`, smoke test |
| [layout-reorder](layout-reorder.md) | filter, sort, cards rearrange | view-transitions | reduced motion, focus |
| [theme-toggle-transition](theme-toggle-transition.md) | dark mode switch | view-transitions | focus, contrast per theme |
| [section-colour-shift](section-colour-shift.md) | background changes per chapter | vanilla | contrast, reduced motion |
| [scroll-snap-carousel](scroll-snap-carousel.md) | carousel, swipe row | vanilla (CSS) | sideways scroll, tap targets |
| [svg-line-draw](svg-line-draw.md) | line draws itself | svg | reduced motion |
| [lottie-rive-spot](lottie-rive-spot.md) | Lottie, Rive, animated icon | players | reduced motion, third-party hosts |
| [particles-form](particles-form.md) | dust that forms a picture | particles | `check_motion.mjs` and `check_site.mjs` |

## What the checkers can and cannot see

`check_site.mjs` measures: frame time on desktop and an emulated phone, sideways scroll at 1440, 390 and 320 px, tap targets of 24 px or more, the reduced-motion run (the page says so, nothing animates over 250 ms, the picture holds still, text is visible, scrolling works), no WebGL, no JavaScript, contrast of text on its resting state, keyboard focus, page weight, third-party hosts, console errors and the dev-panel check. It does not film an animation, judge easing or contrast over a moving picture, or test hover effects. Each pattern's "Checks" section says what to look at by hand in `check/shots/` for the rest. `check_motion.mjs` is for the dust engine only.

## Adding a pattern

Write the page with the same sections (Use when, Not when, Stack, Brief words, Study, Sketch, Budget, Reduced motion, Checks), add it to this index and to `patterns` in `../routing.json` with signals and example phrases, then run `node --test tests/*.test.mjs`.
