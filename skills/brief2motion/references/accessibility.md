# Accessibility rules for motion

These hold for every stack. `check_site.mjs` tests most of them; the rest you check by looking and by using the keyboard.

## Reduced motion

Some people get dizzy or nauseous from on-screen movement, and they tell their system so. Honour it everywhere: CSS, script, canvas, players.

What "reduced" means here:

- No travel across the screen, no parallax, no zoom, no rotation, no auto-playing loop.
- The finished state is on screen: the headline is set, the line is drawn, the shape is formed, the last picture of a sequence is showing.
- Content that changes with scroll may still change, but in cuts, not in travel. `examples/halden-one` snaps between its four poses; `examples/keeling` switches chart states at once.
- Opacity changes and colour changes of a fraction of a second are fine.
- Native scrolling works: smooth-scroll libraries stand down (Lenis does this itself).

How to do it:

```css
/* kit/kit.css: stops CSS animation and transition from being seen */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
/* opt in, not out, for anything decorative */
@media (prefers-reduced-motion: no-preference) { .aurora { animation: drift 18s infinite alternate; } }
```

```js
import { reducedMotion, signal } from './kit/motion-core.js';
if (reducedMotion()) { showFinishedState(); signal('reduced'); } else { animate(); signal('ready'); }
```

The CSS rule cannot stop a canvas, a JavaScript tween or a Lottie file. Each of those checks `reducedMotion()` itself. Libraries have their own switches:

| Library | How it honours the setting |
|---|---|
| GSAP | `gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => { ... })`: motion is only created inside |
| Lenis | on by default (`respectReducedMotion`): no smoothing, instant programmatic scrolls |
| Motion for React | `<MotionConfig reducedMotion="user">` turns transform and layout animation off and keeps opacity |
| Motion (vanilla) | check `reducedMotion()` before calling `animate()` |
| three.js | render one frame and hold it (`kit/three-stage.js` does this); re-render only when something changes |
| Lottie, Rive | load paused on a chosen still frame (`kit/players.js`) |
| View Transitions | wrap `@view-transition` in `@media (prefers-reduced-motion: no-preference)` |

WCAG references: 2.3.3 Animation from Interactions (AAA) and 2.2.2 Pause, Stop, Hide (A): anything that moves by itself for more than 5 seconds needs a way to stop it. 2.3.1: nothing flashes more than three times a second.

The checker's reduced-motion run requires: the page reports `data-motion="reduced"`, no animation longer than 250 ms is running, two screenshots 0.7 s apart are identical at three scroll positions, every heading and paragraph is fully visible at some point of the scroll, and `window.scrollTo` lands where asked.

## The page works without the motion

- Content is in the HTML. Text that only exists after a script runs is invisible to a crawler and to anyone whose script failed. If a framework renders it (React), put a static version inside the mount point and a `<noscript>` line.
- Content is visible by default. Hide something for an entrance only from a script that is already running, never in the stylesheet. `kit/reveal.js` does it this way.
- Every WebGL canvas has a still picture standing by: `<canvas data-webgl>` and `<img data-fallback>`. Show the picture when the context cannot be created, when the library fails to load, and when a runtime error is caught.
- A blocked CDN leaves a complete, still page. Load libraries with `import()` inside `try`, or check `window.gsap` before using it, and call `signal('static')`.

## Keyboard and focus

- Everything that works with a pointer works with a keyboard. A drag needs another way: a slider, arrow buttons, or the built-in keyboard grab of Motion's `Reorder`.
- Tab order follows reading order. Pinned and sideways-scrolling sections must not trap focus or hide the focused element (WCAG 2.4.11).
- Keep a visible focus ring on every control. `kit/kit.css` gives a ring with a halo that shows on any background; set `--focus` and `--focus-halo` per section when the background changes. Never write `outline: none` without a replacement.
- Start the page with a skip link and wrap the content in `<main id="main">`.
- Elements that are faded out or off screen must leave the tab order too: `visibility: hidden` or `inert`, not only `opacity: 0`.

## Screen readers

- Split text keeps one readable sentence. `kit/split-text.js` leaves the original text in a visually hidden span and marks the moving pieces `aria-hidden`. GSAP's SplitText does the equivalent by default.
- Decorative canvases and SVGs: `aria-hidden="true"`. Meaningful ones: `role="img"` with an `aria-label` that says what is shown, or a caption and a data table beside them.
- A number that counts up keeps its final value in the DOM for assistive technology (`kit/counter.js`).
- Announce results of an action with a live region: `<p role="status" aria-live="polite">`.
- One `<h1>` per page, headings in order, `lang` on `<html>`, `alt` on every `<img>`.

## Contrast and size

- Text 4.5:1, large text 3:1, control edges 3:1. Text over a picture, a gradient or a canvas has no single background: put a solid or tinted panel behind it, or a scrim, and look at the screenshot.
- Tap targets at least 24 by 24 CSS px; inline links in a sentence are exempt.
- Do not block zoom.

## Style-specific traps

Each page in `references/styles/` lists the accessibility problems that come with that look: glass over a busy background, neumorphism's missing edges, neon glow that is not contrast, glitch bursts and flashing. Read the list for the style you picked.
