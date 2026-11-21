# Motion doctrine: the rules every page follows

This is the shared motion doctrine of brief2motion (live pages) and brief2mp4 (films): the same rules, with web examples here. Read it with `design-fundamentals.md` before you write a motion plan. Each rule has a number or a test, so a reviewer can check it. Where a rule has an exception, the exception is named. Easing curves are the standard ones listed on <https://easings.net/> (checked 22 Nov 2026).

## 1. Smooth beats bouncy

Default to a long-tail deceleration: the thing arrives fast and settles slowly. In GSAP that is `power3.out` or `expo.out`; in CSS it is the cubic-bezier values below. `back`, `elastic` and `bounce` are a rare, explicit choice for one playful moment (a confetti pop, a toy, a game), never the house style of a page.

| Feel | GSAP | CSS cubic-bezier | Use for |
|---|---|---|---|
| Arrives and settles | `power3.out` | `cubic-bezier(.33, 1, .68, 1)` | most entrances |
| Arrives faster, settles longer | `power4.out` | `cubic-bezier(.25, 1, .5, 1)` | headlines, hero media |
| Very long tail | `expo.out` | `cubic-bezier(.16, 1, .3, 1)` | large panels, page enters |
| Leaves | `power3.in` | `cubic-bezier(.32, 0, .67, 0)` | exits |
| Moves between two places | `power2.inOut` | `cubic-bezier(.45, 0, .55, 1)` | repositioning, layout changes |
| Tied to scroll | `none` | `linear` | scrubbed tweens: the scroll is the easing |

Dots or cards that appear use `power3.out` on a short scale-up (`stacks/gsap.md`); an overshoot such as `back.out(2.5)` pops past its size and wobbles back, which reads as a toy, so it needs a brief that asks for one. Exceptions that exist in the examples, on purpose: the leaves in `examples/sprout/` grow with a small overshoot because a plant is a playful brief, and `examples/relay/` uses springs for the rota highlight and one node, because its brief says the highlight "springs". Both are one moment, not every element.

## 2. Easing is direction

Entrances ease out, exits ease in, moves between two places ease in and out. Linear is for constant things only (a spinner, a marquee, a scrubbed value).

**Enter slower than you exit.** An entrance runs 0.4 to 0.8 s; the matching exit runs about 0.25 to 0.4 s, because the viewer already knows what is leaving and is waiting for what is next. A modal that opens in 0.5 s and closes in 0.3 s feels right; the other way round feels sticky. Camera-like moves (a pinned scene changing pose, a page-wide travel) take 1.2 to 3 s with ease in and out.

The commonest first-draft fault is an entrance faster than a person can read. Slow the first draft one notch, then look again.

```js
gsap.from('.panel', { y: 32, autoAlpha: 0, duration: 0.7, ease: 'power3.out' });        // in
gsap.to('.panel', { y: 16, autoAlpha: 0, duration: 0.3, ease: 'power3.in' });           // out: shorter, smaller travel
```

## 3. Vary on purpose

If everything moves with the same ease, duration and direction, the page reads as a template. Rules a reviewer can count:

- No more than two independent tweens with the same ease in one section.
- The slowest section's main move is about three times the fastest one's.
- Not every element comes from the same side: vary direction between sections, keep it the same inside one group.
- A different stagger per section. Total stagger stays under about 0.5 s however many items there are: use `stagger: { amount: 0.5 }` in GSAP, or divide: `each = 0.5 / count`.
- The first move starts 0.1 to 0.3 s after load, not at zero and not after a second of nothing.
- The most important element moves first.

## 4. Build, breathe, resolve

Every scene, whether it is the hero on load or a pinned scroll scene, has three parts.

| Part | Share of the scene | What happens |
|---|---|---|
| Build | first 0 to 30% | elements enter, staggered; the eye is led to the main one |
| Breathe | 30 to 70% | everything is readable; at most one ambient motion (a slow drift, a cursor-driven shift) |
| Resolve | 70 to 100% | the scene exits, or settles into the state the next one starts from |

Do not put every entrance into the first quarter and then leave a dead screen. In a pinned scene, `slice(p, 0, .3)`, `slice(p, .3, .7)` and `slice(p, .7, 1)` from `kit/motion-core.js` give each part its own 0 to 1 to drive.

**Stillness beats bad motion.** A looping scale pulse on a headline, a slow zoom behind text that is being read, a floating card with no purpose: cut them. Let a held readout stay still. The aliveness a hold may have is one small, real detail (a cursor blink, a line that finishes drawing).

## 5. Reveal on cue

Show each thing when the reader reaches it, not all at once on load. On a page the cue is the scroll position or a step the reader triggers; in a film it is a spoken word. Rules:

- A heading, card or figure animates in when 20 to 30% of it is in the viewport (`inView` and `reveal` in the kit use 0.2 and 0.25).
- Fewer things, each on its own beat. One orchestrated moment per section beats a fade on every block.
- Content is visible by default and hidden only once the script runs, so no script and reduced motion both get the finished page (`kit/reveal.js` does this).
- With reduced motion the cue still works but the change is an opacity or colour change of a fraction of a second, or none.

## 6. Overlap and follow-through

Start the next move before the last one ends; trailing parts lag the lead by 2 to 5 frames (about 30 to 80 ms). In GSAP, position the next tween at `'<0.15'` or `'-=0.2'` rather than waiting for the end. If everything starts and stops together, the page reads as a slideshow.

## 7. Ration the loud effects

- One glint or shimmer per view, on the hero, clipped inside its rounded corners.
- Whole-page effects (a flash, a shake, a full-screen colour wipe, a scale pump): at most about three on a page, far apart, on the strongest moment.
- One transition style per kind of seam. If sections cross-fade, they all cross-fade.
- One entrance style for headings, two at most.

## 8. Transitions carry meaning

Pick the transition for what it says.

| Transition | It says | On the web |
|---|---|---|
| Cross-fade | "this continues" | the View Transitions default; a tab or a filter changing content |
| Hard cut | "new context, wake up" | a jump to a different section or a theme switch with no travel |
| Slide in the reading direction | "forward, more of the same" | next project, next step; slide back for Back |
| Slow dissolve | "drift with me" | an ambient background change between chapters |
| Shared-element morph | "the same thing, now somewhere else" | a card growing into its detail page |

Crossfading everything is a tell. A transition that demonstrates something (a card that really becomes the hero of the next page) beats one that only replaces a block. Never start a new headline in the spot where the old one is still fading.

**Velocity-matched seams.** When one thing leaves and another arrives, mirror the curve across the seam: the outgoing element eases in (`power3.in`) so it is at speed at the cut, and the incoming one eases out (`power3.out`) from that same speed. In CSS View Transitions: `::view-transition-old(root)` with an ease-in curve, `::view-transition-new(root)` with an ease-out one, equal in length.

**Blur by subject size.** If a transition uses a blur, scale it to what is blurred: about 10 px peak on text-sized subjects (20 px smears letterforms), 18 to 20 px on a full-frame surface, the same value on both sides of the seam, applied to the wrapper and never to each child. On a live page the cost rule in `performance.md` wins: do not animate a blur on a large area, and prefer opacity and transform. These blur numbers matter most for filmed pages and small chips.

## 9. SVG line drawing: one rule

Measure the real length with `getTotalLength()`, set `stroke-dasharray` to it and animate `stroke-dashoffset` from that length to 0. `kit/svg-draw.js` does this. Do not use `pathLength="1"`: it draws in a live browser, but in a frame-by-frame render (brief2mp4's HyperFrames) it did not draw progressively, and together with `vector-effect: non-scaling-stroke` Chrome draws the wrong amount (measured 22 Nov 2026). Do not put `non-scaling-stroke` on a line you draw. brief2mp4 follows the same rule, so a site filmed through it draws the same. The one exception is the dust engine's flight trail, which sits in a stretched layer. Detail and code: `stacks/svg-players.md`.

## 10. Scroll is the reader's, never ours

Do not hijack scrolling: no one-tick-one-section, no changing the scroll direction or speed, no blocking the keyboard. A pinned scene is 200 to 300% of a screen for one idea; longer and people think the page is stuck. Show progress inside it. Scrubbed tweens use `ease: 'none'`. Smooth scrolling (Lenis) only smooths; it stands down for reduced motion.

## 11. Pacing a page

A page has a rhythm like any timed medium. These numbers come from the NN/g findings quoted in `design-fundamentals.md` (57% of viewing time is above the fold) plus the cadence rules above.

- The first screen states what the thing is with real content before any motion finishes. Never delay the hero behind an animation or a loader.
- Something new to look at roughly every one to two screens on a landing page; every step on a story page. A long stretch of unchanging text is where people leave.
- A second look: after about three screens, bring back the main action or the main idea in a new form.
- Quiet sections are allowed and good. The strongest motion goes where attention is weakest, usually the middle, not the hero.
- Muted test: a page whose meaning only arrives with sound or hover has a hole.

## 12. Respect the person

Every rule above has a reduced-motion form: the finished state, no travel, no loops (`accessibility.md`). Nothing flashes more than three times a second. Anything that moves by itself for more than five seconds can be paused. These are not extras to add at the end; the motion plan in SPEC.md lists the reduced form beside each item.

## Checklist for the motion plan

1. Is the default ease a smooth deceleration, and is every overshoot a named exception?
2. Entrances 0.4 to 0.8 s, exits about 0.25 to 0.4 s?
3. Do durations, eases and directions differ between sections?
4. Does each scene build, breathe and resolve, and is anything animating that has no job?
5. Is every reveal tied to a cue the reader controls?
6. Does each transition say what it means, and are the seams velocity-matched?
7. Is each SVG draw measured, not `pathLength`?
8. Is there a reduced-motion form for every item?
