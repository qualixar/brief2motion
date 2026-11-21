---
name: brief2motion
description: Turn a plain brief into a website with professional motion, measured in a real browser. Use when asked to build or animate a website, landing page, product launch page, portfolio, scroll story or data story; to add a hero animation, scroll animation, scrollytelling, parallax, page transitions, kinetic typography, micro-interactions, a 3D product viewer or turntable, particles or dust that form a product, logo, face or words, SVG or Lottie or Rive animation; to pick a visual style such as neubrutalism, glassmorphism, neumorphism, claymorphism, bento, Swiss or minimal; or to "make my site feel alive". Chooses the motion stack (plain CSS and JavaScript, GSAP with ScrollTrigger and Lenis, Motion for vanilla or React, three.js or React Three Fiber, the View Transitions API, SVG, Lottie, Rive) and the style from the brief and says why, builds the page, serves it at a localhost address, then checks frame rate, phone layout, reduced motion, keyboard focus, contrast, no-WebGL and no-JavaScript fallbacks, fixes what fails, and can hand the page to brief2mp4 to become a video.
---

# brief2motion 1.0.0

A brief goes in. A working site comes out in `site/`, with `REPORT.md` proving every line of the brief with a measured number or a named screenshot, and an `http://localhost` address the user can open.

Work in this order every time: **route, spec, build, check, fix, deliver.** A page that looks right on your screen is not a page that works on a phone, with a keyboard, or for someone who has motion switched off.

## 0. Before you start

Run the doctor once per machine:

```bash
bash <this skill's folder>/scripts/doctor.sh
```

Required: Node.js 22+ and a Chrome or Chromium the checker can start (Google Chrome, `chromium` on PATH, Playwright's Chromium, or a path in `BRIEF2MOTION_CHROME`). If something required is missing, give the user the command the doctor printed and stop. The first check downloads `playwright-core` 1.65.1 (about 14 MB, install scripts off) into `~/.cache/brief2motion/deps`. Python 3 is optional (the preview server has a Node twin). ffmpeg and the brief2mp4 skill are only for a video.

Work inside one project folder. Never write outside it.

## 1. Route: pick the stack and the style from the brief

Save the brief as `BRIEF.md`, word for word, then:

```bash
node <this skill's folder>/scripts/route.mjs BRIEF.md
```

It prints a stack, a style, the phrases in the brief that led there, and the reference files to read. It is a keyword scorer and has never seen the product, so treat it as a first proposal: read the brief again, agree or overrule, and write the choice and the reason in `SPEC.md`. The brief's own words always win. If it names a library, a style or colours, use those.

The stacks, and when each is right:

| The brief wants | Stack | Read | Study |
|---|---|---|---|
| nothing that needs a library: reveals, hovers, a simple scroll effect | plain CSS and JavaScript with the kit (**the default**) | `references/stacks/vanilla.md` | `examples/sprout/` |
| dust, dots or particles that form a product, logo, face or word | the dust engine (config only) | `references/stacks/particles.md` | `examples/copper-no-7/` |
| a story told by scrolling: pinned scenes, scrubbing, a sideways gallery, a picture sequence | GSAP, ScrollTrigger, Lenis | `references/stacks/gsap.md`, `scroll-story.md` | `examples/tidewater/` |
| headlines that move, springs, a type-led landing page | Motion (vanilla) | `references/stacks/motion.md`, `kinetic-type.md` | `examples/relay/` |
| interface motion in a React or Next.js app: layout changes, drag, lists, presence | Motion for React | `references/stacks/motion.md` | `examples/mise/` |
| a real 3D object: a product to turn, an exploded view, a shader | three.js (React Three Fiber in a React project) | `references/stacks/three.md` | `examples/halden-one/` |
| moving between pages, or a grid that rearranges | View Transitions API | `references/stacks/view-transitions.md` | `examples/halvorsen/` |
| lines, icons and charts that draw; data told step by step | SVG with the kit (D3 for scales) | `references/stacks/svg-players.md`, `scroll-story.md` | `examples/keeling/` |
| an animation file from a designer (Lottie, Rive) | the players in the kit | `references/stacks/svg-players.md` | `examples/sprout/` |
| heavy per-frame computation | read the note first | `references/stacks/wasm.md` | |

Use the lightest stack that does the job, and one stack per page where you can. Two are fine when the brief needs both (GSAP for the scroll, three.js for the object). A React stack needs the project's own bundler: never ship React Three Fiber or a real React app from CDN modules.

The style: `references/styles.md` indexes 32 visual styles and approaches (neubrutalism, glassmorphism, Liquid Glass-inspired, neumorphism, claymorphism, skeuomorphism, flat, Material, Swiss, minimalism, maximalism, bento, editorial, Y2K, Frutiger Aero, vaporwave, synthwave, Memphis, Art Deco, cyberpunk, glitch, aurora, grain, duotone, dark-first, isometric and more). Each has its own page with tokens, tested CSS, the motion that fits, accessibility traps and sources. Open only the page for the style you chose. A style is a starting point: a brand's own colours and type replace its tokens. If the brief asks for a style that is not on the list, check the "names that are not styles" section before inventing one.

Always read, whatever the stack: `references/design-fundamentals.md` (hierarchy, type, space, colour, landing structure, motion principles), `references/accessibility.md` and `references/performance.md`.

## 2. Spec: write SPEC.md before any code

Copy `templates/SPEC.md` and fill it in:

1. **Stack and style**, with one sentence each on why, from step 1.
2. **Design plan**: four to six named colours with their contrast pairs checked, the typefaces and their roles, a one-line layout idea, and the one thing on the page that should be memorable. If any part reads like what you would produce for any similar page, change it.
3. **Motion plan**: three lists. On load, on scroll, on input. Each item says what moves and why. If you cannot say why, cut it. One orchestrated moment beats a fade on every section.
4. **Copy**: every word on the page, exactly as the brief gives it. If the brief gives none, write plain copy from what it says and mark it as drafted. Never invent reviews, ratings, customer names, logos or numbers. Made-up examples say that they are made up.
5. **Done when**: one checkable line per requirement, each naming the number or screenshot that will prove it.

If the brief leaves a choice open, make it, write it under **Decisions**, and continue.

## 3. Build

Start from the closest thing that already passes the checks:

- **Dust and particles**: copy `templates/site/` to `site/` and edit only `config.js`, the title and description in `index.html`, and colours in `style.css`. `references/stacks/particles.md` and `references/brief-words.md` map phrases to settings. Do not edit the engine files.
- **Everything else**: read the example for your stack, then build `site/` with its structure: `index.html`, `style.css`, one script, and a copy of the `kit/` folder. Take the pattern, never the example's words, pictures or look. Hand-installed without the repo? The examples are at `https://github.com/qualixar/brief2motion/tree/main/examples`.

What every page has, whatever the stack (the checker tests each one):

- Real content in the HTML: one `<h1>`, a `<title>`, a description, `lang`, a skip link, `<main>`, `alt` on images. The page reads with JavaScript off.
- `kit/kit.css` loaded first: focus ring, reduced-motion rule, `.sr-only`.
- The motion state reported once setup is done: `signal('ready')`, `signal('reduced')` or `signal('static')` from `kit/motion-core.js`.
- A reduced-motion branch that shows the finished state: no travel, no loops, no parallax.
- A still picture for every WebGL canvas (`<canvas data-webgl>` with `<img data-fallback>`), shown when WebGL is missing, a library fails to load, or a runtime error is caught.
- Libraries from `cdn.jsdelivr.net` only, at pinned versions, loaded after the text is on screen. System font stacks unless the brief supplies a font.
- A motion plan as a comment at the top of the script, matching SPEC.md.
- Nothing wider than a 320 px screen, and tap targets of at least 24 px.

Tuning by hand (optional, dev only): `kit/tune.js` opens a Tweakpane panel for easing, duration, stagger and colour when the address ends in `?tune`, and "Copy values" gives the numbers back as JSON to paste into the code. Wrap the loader line between `/* tune:start */` and `/* tune:end */`. It is never part of the shipped page: before step 4 run `node <this skill's folder>/scripts/strip_tune.mjs site`, which removes `kit/tune.js` and every marked block, and `check_site.mjs` fails a page that still has either. Examples do not carry `tune.js`; copy it from `kit/` when you want it.

Images: only ones the user owns or that carry a licence allowing reuse. Put the credit in `site/CREDITS.md` and in REPORT.md. Prefer drawing in code (SVG, canvas, three.js primitives) to borrowing. Size pictures for the 1.5 MiB budget.

## 4. Check (do not skip)

```bash
node <this skill's folder>/scripts/check_site.mjs site --out check
```

For a site with several pages add `--pages about.html,work/a.html`. For the dust engine also run `check_motion.mjs site --out check --make-fallback`, then `check_motion.mjs site --out check`.

| Check | Budget |
|---|---|
| Desktop 1440 x 900, p95 frame time, idle and scrolling | 20 ms or less |
| Emulated phone, 390 x 844, touch, CPU slowed 4x, p95 frame time | 40 ms or less |
| Sideways scroll at 1440, 390 and 320 px | none |
| Tap targets on the phone | 24 px or more |
| Reduced motion | the page says so; nothing animates; the picture holds still; all text visible; scrolling works |
| WebGL off | headline readable; a still stands in for each WebGL canvas |
| JavaScript off | the page still reads |
| Text contrast | WCAG AA: 4.5:1, or 3:1 for large text |
| Keyboard | every stop has a visible focus ring and is on screen |
| Basics | one `<h1>`, `lang`, real title and description, zoom allowed, `alt` text, `<main>` and a skip link |
| Page weight from the project, per page | 1.5 MiB or less |
| Third-party requests | `cdn.jsdelivr.net` only |
| Dev tuning panel | not in the shipped page: no `kit/tune.js`, no tune block, no Tweakpane request |
| Console errors, every run | 0 |

The frame numbers only mean something on a machine with a real GPU; elsewhere pass `--no-perf`. Then open the screenshots in `check/shots/` and look at them against every **Done when** line and against the design plan. A checker cannot see that a layout is dull, that text sits on a busy picture, or that the hero says nothing. Text over pictures, gradients and canvas is not measured for contrast: look at it.

## 5. Fix

Fix the page, not the budget, and check again. Slow frames: `references/performance.md`. Reduced-motion or fallback failures: `references/accessibility.md`. Layout: find what is wider than the screen (the checker names it). Stop after three rounds on the same failure and say what is still failing in REPORT.md.

## 6. Deliver

**Preview first.** Browsers refuse to load ES modules from `file://`, so opening `site/index.html` from the file shows a blank page. Start the preview server in the background and give the user the address it prints:

```bash
python3 <this skill's folder>/scripts/serve.py site        # or: node <this skill's folder>/scripts/serve.mjs site
# prints  Open  http://localhost:8421/
```

Say that Ctrl-C stops it. Never tell the user to open the file directly. For a real site, upload `site/` to any static host.

`REPORT.md` in the project root: the brief; the stack and style with the reason; every **Done when** line with its proof; the check table; credits and the licence notice (`references/licences.md` has the template); what you decided; what you could not verify.

Pictures or a video of the page:

```bash
node <this skill's folder>/scripts/capture_site.mjs site --out media                    # screenshots and a frame sheet of a scroll-through
bash <this skill's folder>/scripts/to_video.sh site final.mp4 --seconds 12              # the dust engine's frame-exact capture
```

## Licences in one paragraph

This skill's code is MIT. Sites it builds load libraries from a CDN at pinned versions and bundle none of them: three.js, Lenis, Motion, React, lottie-web, the Rive runtime and htm are MIT or Apache-2.0; D3 is ISC; GSAP 3.15.1 is free under GSAP's own "no charge" licence, which allows commercial use and AI-written GSAP code but not use inside no-code animation builders that compete with Webflow. Pages use system fonts and send no request to a font service. `references/licences.md` has the detail and the notice to write into each project.
