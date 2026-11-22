# Design fundamentals: what every page gets, whatever the style

Motion sits on top of a page. If the page under it is hard to read, badly spaced or slow, no animation rescues it. Apply everything here before choosing a style, and check it again after the motion is in. Each rule has a number you can test and the source it comes from (all read on 17 Nov 2026).

## 1. Say what it is, at the top

- The first screen states what the product is and what to do next, with real content. Nielsen Norman Group's homepage guidance: make the value clear at a glance, show actual offerings above the fold, give a clear call to action, keep motion minimal and never delay the hero behind an animation. <https://www.nngroup.com/articles/homepage-design-principles/>
- People still spend most of their time near the top: 57% of viewing time above the fold and 74% in the first two screens (NN/g, 2018). Do not make the first screen a slow reveal of nothing. <https://www.nngroup.com/articles/scrolling-and-attention/>
- Avoid a "false floor": a first screen that looks like the whole page. Let the next section show a little.

A landing page that converts usually runs in this order. Use it when the brief gives no structure of its own:

1. Hero: the claim in one line, one supporting sentence, one primary action, and the product itself (a picture, a demo, the 3D object).
2. Proof that it is real: what it does, shown, in two to four parts.
3. How it works, as steps only if it truly is a sequence.
4. Detail for people who are nearly convinced: specification, pricing, questions.
5. The primary action again, and a footer.

Never invent proof. No made-up reviews, ratings, customer names, logos or numbers. If the brief has none, leave that section out.

## 2. Visual hierarchy

- One thing per screen is the most important, and it is the biggest or the highest in contrast. If three things shout, none is heard.
- Build hierarchy from size, weight, colour and space, in that order. Decoration is the last resort.
- Group with space before lines: related things sit closer together than unrelated things.
- One primary button per view. Secondary actions look quieter (an outline or a text link).

## 3. Type

- Body text 16 px or larger. Apple's default body size on iOS is 17 pt, and it treats 11 pt as the floor. <https://developer.apple.com/design/human-interface-guidelines/accessibility>
- Line length 45 to 90 characters; WCAG's own advice is no more than 80. Use `max-width` in `ch`. <https://practicaltypography.com/line-length.html> <https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html>
- Line height about 1.5 for body text (WCAG 1.4.8), tighter for headlines: 0.95 to 1.15.
- A scale, not a pile of sizes. Tailwind's default steps are a good reference: 0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875, 2.25, 3, 3.75, 4.5, 6, 8 rem. Pick four or five.
- Fluid headlines: `font-size: clamp(2.2rem, 6vw, 5.4rem)`. Always give `clamp()` a rem floor, so zooming still works.
- `text-wrap: balance` on headlines, `text-wrap: pretty` on paragraphs.
- Most pages need a single family; a second earns its place only when it contrasts plainly with the first (a serif with a sans).
- Use system font stacks unless the brief supplies a font. A web font is a network request, a layout shift and a licence. If you add one, host the file with the site.

## 4. Space and grid

- Spacing in steps of 4 px (Tailwind's base unit is 0.25 rem; Material uses a 4 and 8 dp grid). Typical steps: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Section padding scales with the screen: `padding-block: clamp(56px, 10vh, 120px)`.
- Side gutters: `clamp(18px, 5vw, 72px)`.
- Lay out with CSS Grid and `minmax(0, 1fr)` tracks, so long words cannot push a column wider than the screen.

## 5. Colour and contrast

- Text contrast at least 4.5:1; large text (24 px, or 18.66 px bold) at least 3:1 (WCAG 1.4.3). The thresholds are not rounded: 4.49 fails. <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- Control boundaries and meaningful graphics at least 3:1 against what is next to them (WCAG 1.4.11). <https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html>
- A palette is four to six named colours: a background, a surface, text, quieter text, one accent, and the text colour that sits on the accent. Check the two text colours on both backgrounds, and the accent pair, before writing CSS.
- Never signal state with colour alone. Add text, an icon or a shape.
- Light mode is the safer default. NN/g: for people with normal vision, light mode performs better most of the time. Offer dark mode with `prefers-color-scheme`; default to dark only when the audience expects it (developer tools, media, games). <https://www.nngroup.com/articles/dark-mode/>

## 6. Responsive layout

- Design for 320 px wide first. The site check loads every page at 1440, 390 and 320 px and fails any sideways scroll.
- Common breakpoints, for reference: Tailwind 640, 768, 1024, 1280, 1536 px; Bootstrap 576, 768, 992, 1200, 1400 px. Choose breakpoints where your layout breaks, not from a list. <https://tailwindcss.com/docs/responsive-design> <https://getbootstrap.com/docs/5.3/layout/breakpoints/>
- Touch targets at least 24 by 24 CSS px (WCAG 2.5.8); Apple's default is 44 by 44 pt. Aim for 44 on anything primary. <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>
- Use `100svh` beside `100vh` for full-height sections, so mobile browser bars do not cut the bottom off.
- Never disable zoom in the viewport meta tag.

## 7. Speed: Core Web Vitals

Google's thresholds, measured at the 75th percentile of real visits: <https://web.dev/articles/vitals>

| Metric | What it measures | Good | Poor |
|---|---|---|---|
| LCP, Largest Contentful Paint | when the main content appears | 2.5 s or less | over 4.0 s |
| INP, Interaction to Next Paint | how fast the page answers a tap or key | 200 ms or less | over 500 ms |
| CLS, Cumulative Layout Shift | how much things jump while loading | 0.1 or less | over 0.25 |

What motion does to them, and the fix:

- LCP: text hidden until an entrance animation runs is late content. Render the headline visible, then animate from a state that is already readable, or keep the delay under 100 ms. Never wait for a library to load before showing text.
- CLS: give every image, video, canvas and player a `width` and `height` or an `aspect-ratio`. Animate `transform` and `opacity`, not `top`, `width` or `margin`.
- INP: do not run heavy work in scroll or pointer handlers. Read layout once per frame, write styles once per frame (`kit/motion-core.js` `onScroll` does this).

`performance.md` has the frame-rate rules and the budgets the checker enforces.

## 8. Motion principles

- Every animation has a job: point the eye, explain a change of state, or show where an element came from or went. No job, no animation.
- Spend the motion budget on one planned entrance or reveal. When every block fades up as it scrolls in and every card lifts on hover, nothing stands out, and the page looks machine-made.
- Feedback to a person's own action (a panel that opens, a list that reorders, a saved state) is always worth animating briefly.
- Durations (NN/g): about 100 ms for direct feedback, 200 to 300 ms for most interface changes, up to 400 ms for large movements; 500 ms and more drags. Things entering can take slightly longer than things leaving (for example 300 ms in, 200 ms out). <https://www.nngroup.com/articles/animation-duration/>
- Material's scale, if you want named steps: short 50 to 200 ms, medium 250 to 400 ms, long 450 to 600 ms, extra long 700 to 1000 ms. <https://github.com/material-components/material-web>
- Easing: ease-out for things arriving (`cubic-bezier(.2, .8, .2, 1)`), ease-in for things leaving, ease-in-out for things that travel across the screen. Material's standard curve is `cubic-bezier(.2, 0, 0, 1)`. Linear is for scroll-linked values and continuous rotation only.
- Springs for anything a person drags or can interrupt: they keep their speed when the target changes.
- Choreography: stagger related items 30 to 80 ms apart, in reading order. More than about ten items in one stagger feels slow; group them.
- Hero sequences read best when the whole thing is over in about 1.5 seconds.
- Reduced motion is not optional. `accessibility.md` has the rules; in short: no travel, no parallax, no loops, and the finished state on screen.
- Apple's guidance says the same in its own words: motion should be purposeful and optional, feedback brief and precise, and frequent interactions should not animate. <https://developer.apple.com/design/human-interface-guidelines/motion>

## 9. Words

- Use the brief's words exactly. If it gives none, write plain copy from what it says and mark it as drafted in `REPORT.md`.
- Label a button with its result: "Reserve a bottle" tells a visitor more than "Submit".
- Write labels and headings in sentence case, cut padding words, and skip three-part slogans.
- Made-up examples say that they are made up.

## 10. Type, measure and the grid, in numbers (site mode)

Defaults for a first draft. Change them against the real content; record the endpoints in `tokens.json` so they can be checked.

- Five type roles are enough to start: caption, body, section heading, page heading, display. Try a 1.20 to 1.25 step between them. Body is 1 to 1.125 rem; its fluid form `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` is a good start, and the other sizes follow from the narrow and wide layouts. Display size and line height depend on the typeface and the headline, not on the body ratio. Test at 200% zoom and with the user's own font-size setting; a relative unit in the formula is only part of that test. <https://web.dev/learn/design/typography>
- Measure: 45 to 75 characters on a line for sustained Latin prose, shorter on a phone. WCAG 1.4.8 (AAA, visual presentation) names 80 as the ceiling (40 for CJK). `ch` is the width of a zero, not of an average letter: in one test with macOS's system face a 68ch column held 95 real characters a line and a 54ch column 76, so a column near 50ch lands in the band. Other faces differ, which is why the checker counts. `check_layout.mjs` counts the real characters of each rendered paragraph (three lines or more) and sends the ones outside 45 to 75 to review; short lines are fine below 768 px, and captions, short-label lists and deliberately narrow asides are exempt (mark one `data-measure-skip`).
- Type loading: one family by default, two at most (one for text, one for display), and only the faces and scripts the page uses. Review long words, bold and italic, figures and amounts in the real strings, and see the fallback when the web font fails. A system stack has none of these costs.
- Grid: 4, 8 and 12 columns for compact, medium and wide layouts, when the design needs a grid at all. Gutters 16 px on a phone and 32 px wide. Bigger gaps between groups than inside them. Name any exception (a full-bleed image, a deliberate overlap) so a reviewer sees it is on purpose. Spacing steps are the 4 to 96 list in section 4.

## 11. Colour roles, themes and forced colours

- Build three ramps: neutral, brand and state (success, warning, error). OKLCH is a good way to design a ramp with even lightness steps; write the values the page uses as hex or `rgb()` in `tokens.json`, because the token builder computes contrast from those.
- Name roles, not colours: canvas, surface, text, quiet text, icon, focus, border, action, on-action, status. Components use roles; only `tokens.json` knows the hex. Check each text pair on each surface in each theme: `build_tokens.mjs` fails a pair below 4.5:1 (3:1 for large text and for UI).
- With a dark theme, write two full role maps, follow the system preference by default and let a switch override it. Test native controls, the focus ring, images and inline SVG in both. Then run a forced-colours pass (`@media (forced-colors: active)`) separately and check that state, focus and boundaries are still visible: a background colour that carried the meaning is gone.
- Text over a picture, gradient or canvas is judged at its worst crop and at sampled frames, or put on a solid surface. No tool does this for you.

## 12. Images and icons

- Every substantial image has a role (what it proves), a focal point, an aspect ratio, a crop for each layout (the phone crop may be a different picture), its intrinsic width and height, and a rights record in `ASSETS.json`. Check that the subject survives every crop and that text over the image stays readable on all of them. `srcset` and `sizes` give resolution choices; `<picture>` gives different crops.
- One icon family, sizes from 16, 20 and 24 px, one stroke weight, aligned the same way. An unfamiliar action gets a visible label. An icon-only button has an accessible name; a decorative icon is hidden from assistive technology. A 20 px glyph can sit inside a 44 px hit area.

## 13. Responsive sweep, zoom and text spacing

- Sweep 320, 390, 768, 1024 and 1440 px, plus one pixel either side of each breakpoint you wrote. Add a breakpoint where the composition breaks, not from a list; use a container query when a component changes with its container, not the screen. Check a card in a wide and a narrow container, and with long and translated content.
- Reflow: vertical-scrolling content must work at 320 CSS px wide (WCAG 1.4.10), with the exception of content that needs two dimensions, such as a data table or a map.
- Text spacing: with line height 1.5 times the font size, paragraph spacing 2 times, letter spacing 0.12 times and word spacing 0.16 times, nothing may be lost, clipped or stop working (WCAG 1.4.12). `check_layout.mjs` looks for clipped text and overlaps at four widths; override the spacing by hand and look once.
- Touch and pointer: targets 24 by 24 CSS px at least (WCAG 2.5.8), 44 for a primary action on a phone. Sticky bars and cookie banners must not cover the focused element (2.4.11).

## 14. Forms, states and microcopy

- Specify each journey's states: idle, empty or no results, loading, validation error, service error, success; offline or permission states where they apply. Keep what the person typed after an error. Visible labels, a message beside each field and an error summary that links to the fields; a receipt after success that names the next step. A known layout gets a sized skeleton while it loads; a pending action gets a short status.
- Microcopy: an action verb and its object when the effect is unclear ("Download the guide"). An error says what failed, what to do next and what happened to the data. Ask a reader to say back what a button will do before they press it.
- Test the unhappy path with realistic content: empty data, delayed data, invalid input, a rejected request, retry, a double submit. Assert what is shown, the accessible name or status, the keyboard route, that the entry survived, and how many requests were made.

## 15. Before you call it done

Run `check_site.mjs`. It measures items 3 (one `<h1>`, a title, a description), 5 (contrast), 6 (three widths, tap targets, zoom) and the motion rules. For a whole site or a page that must convert, site mode adds the plan, layout, accessibility, journey and meta checks (SKILL.md, "Site mode"). Then look at the screenshots in `check/shots/` yourself: a checker cannot see that a headline is ugly, that a card is lost in space, or that the hero says nothing.
