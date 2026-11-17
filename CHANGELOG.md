# Changelog

All notable changes to brief2motion. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-18

brief2motion grows from one effect (dust that forms a picture) into a skill for web motion in general. It reads the brief, picks the stack and the style, and checks the result the same way whatever it built.

### Added
- **A router.** `scripts/route.mjs` reads a brief and proposes a motion stack and a visual style, quoting the words that led there. Rules live in `references/routing.json`.
- **Ten stack references** in `references/stacks/`: plain CSS and JavaScript, GSAP with ScrollTrigger and Lenis, Motion (vanilla and React), three.js and React Three Fiber, the dust engine, SVG with Lottie and Rive, the View Transitions API, kinetic type, scroll storytelling, and a note on WebAssembly. Their code comes from the tested examples.
- **A style system.** 32 visual styles and approaches, each checked against a published source, each with tokens, tested CSS, the motion that fits, accessibility traps and when to choose it. One data file (`references/styles.json`) generates the index, the 32 pages and a live atlas.
- **Design, accessibility and performance references** that apply to every site: hierarchy, type, spacing, contrast, breakpoints, Core Web Vitals, motion principles, landing page structure.
- **A shared kit** (`kit/`, no dependencies): reduced-motion switch and state signal, frame loops that stop when hidden, scroll progress, accessible split text, reveals, counters, SVG line drawing, a picture-sequence scrubber, view-transition helpers, a three.js stage, Lottie and Rive loaders, and a CSS accessibility floor.
- **Eight new examples**, each a complete site with its brief and passing report: `halden-one` (three.js product turntable), `tidewater` (GSAP scroll story), `relay` (kinetic type with Motion), `halvorsen` (multi-page portfolio with view transitions), `keeling` (data story on NOAA's CO2 record), `mise` (React and Motion for React), `sprout` (SVG, Lottie, native scroll-driven CSS), `style-atlas` (28 styles live).
- **`check_site.mjs`**, a checker for any site: frame time on desktop and an emulated phone, sideways scroll at three widths, tap targets, reduced motion (state, running animations, stillness, visible text, scrolling), no WebGL, no JavaScript, text contrast with see-through panels blended, keyboard focus, page basics, weight, third-party hosts and console errors. `--pages` checks several pages; `--no-perf` skips frame budgets on machines with no GPU.
- **`capture_site.mjs`**: screenshots, a contact sheet and a short film of any site.
- **Tests.** 43 unit tests (router, kit, measuring code, style data), a real-browser smoke test per stack, test pages for React Three Fiber, Rive and a three.js model and post-processing pipeline, and `tests/check_examples.sh`.
- **A learning guide** as a PDF with editable HTML, CSS and Python source in `docs/guide/`.
- A logo, a banner and an architecture diagram with their sources in `docs/diagrams/`; `NOTICE`; a study section in `RESOURCES.md` covering 43 repositories.

### Changed
- `SKILL.md` now runs route, spec, build, check, fix, deliver, and the spec template has a design plan and a motion plan.
- The dust engine template reports its motion state like every other page (`<html data-motion>`), marks its canvas and fallback for the general checker, and loads GSAP 3.15.1.
- README rewritten around what the skill makes now.

### Fixed
- Template: the brand link in the nav was 20 px tall, under the 24 px tap-target minimum.
- Template: with reduced motion on, the nav's background still faded for 1.1 s when the page scrolled. CSS transitions and animations are now cut for reduced motion.
- Both were found by running the new checker on the old example.

### Notes
- Tested on macOS with Chrome 157. Windows, Linux, real phones and Codex are not verified.
- React stacks (Motion for React, React Three Fiber) should be built by the project's bundler. The React example and the test page run from CDN modules to stay build-free, which depends on pinned versions.
- `brief2mp4`'s marketplace file still lists brief2motion at 0.1.0. Bump that entry in the same release.

## [0.2.0] - 2026-11-17

### Fixed
- **The page now opens.** Opening `site/index.html` from the file gave a blank page, because browsers refuse ES modules over `file://`. New `scripts/serve.py` (Python 3 standard library only) and `scripts/serve.mjs` (Node) serve the folder at `http://localhost:PORT/`. The skill, the doctor and the checker now hand over that command, and the README says why.
- **The template runs as shipped.** It had pointed at images that were not in it. The template is now neutral (the dust forms a word, chapters show colour swatches, no images needed) and passes the checker unchanged. The Copper No. 7 site with its photos, captions and sequence moved to `examples/copper-no-7/`, complete and runnable, with credits and the report from its passing check.
- **The code that was tested is the code in the repo.** The tested engine (caption cards, colour grading, sequence of up to four shapes) is the template engine now, and the example runs the template files unchanged. `tests/run_checks.sh` fails if they drift apart.
- Without WebGL, or after a runtime error, the headline and buttons were invisible and the still image had the nav bar baked into it. The words now show over the image, and `fallback.png` is a photograph of the canvas alone, made by setting the finished state directly instead of searching for a scroll position.
- Reduced motion: a resize cleared the canvas and nothing redrew it. It redraws now.
- A blocked CDN or a runtime error left an empty page. The page text now renders first from `config.js`, and three.js loads after it; on failure the visitor gets the text and the still image. The four script tags are `defer`red and carry integrity hashes.
- The page no longer loads Google Fonts: it uses system fonts, so no request goes to a font service.
- The draw loop stopped only when the tab was hidden. It now also stops while the hero is scrolled out of view, and a `destroy()` releases the WebGL context, listeners and timelines.
- The page used to shed up to 80% of its dots on its own when frames ran long and never brought them back, which let a page pass the frame budget by drawing less. It no longer sheds for a steady 30 fps cap, restores dots after a clean stretch, and the checker fails a page that sheds on desktop or keeps under 60% of its dots on the phone run.
- `to_video.sh` and `capture_frames.mjs` ran the dust on real time, so the swirl differed between runs. They now step a virtual clock (frame / fps) and switch off CSS transitions during capture: two captures of the same page match pixel for pixel. `to_video.sh` accepts `--mode play|scroll`, and bad arguments get a plain message.
- `cutout.swift` now honours a phone photo's rotation, needs and says macOS 14, prints errors to stderr and exits 1 or 2.
- The checker started only Google Chrome. It now tries `BRIEF2MOTION_CHROME`, Google Chrome, `chromium` or `google-chrome` on PATH, then Playwright's Chromium, and the doctor tests the same list and says which it found. `playwright-core` is pinned at 1.65.1, installed without running install scripts, and the doctor shows whether it is there. Windows uses `npm.cmd`.
- Page weight is checked on the phone run too, and the template's image advice now fits the 1.5 MiB budget (chapter pictures 1200 px with a 720 px `srcset`, collection 600 px, shape sources 512 px). The example weighs about 0.35 MiB on desktop.
- A wide word pushed sideways by `offsetX` ran off the right edge of the screen. The shape now shrinks to stay inside the frame after the move, and the starter's default word is sized and placed clear of the headline.
- Config mistakes (empty `targets`, a bad `sequence`, a missing `points`) now stop with a plain sentence instead of a TypeError. Targets are built in order, so a seed always gives the same dots.
- Accessibility: the default accent has 5.7:1 contrast on paper, a skip link, hidden hero links leave the tab order, and the nav gets its background with reduced motion on.

### Added
- The `page` block (nav, hero, chapters, collection, details, process, call to action, footer), `assemble.sequence`, `captions`, `offsetX`, `offsetY` (new), `assembleOnLoad`, `fill` and `srcset` support, all documented in `config.js`, `SKILL.md` and `references/brief-words.md`. One limit everywhere: up to four distinct shapes, and a `sequence` may repeat them.
- New checker checks: the finished shape drawn on the canvas alone in reduced motion and after a resize, headline readable in reduced motion and without WebGL, no shed dots, phone page weight, third-party requests only to `cdn.jsdelivr.net`, console errors in all four runs. It prints WARN lines for template text left in `index.html` or `config.js`. Reports no longer contain absolute paths; the default output folder is `check/` next to the site, not inside it.
- `examples/copper-no-7/` with `CREDITS.md` and `motion-report.json`.
- `CHANGELOG.md`, `tests/run_checks.sh` and a CI workflow that runs it.
- README rewritten to match the brief2mp4 layout, with Codex install steps, a troubleshooting section, an FAQ and full image credits.

### Notes
- `brief2mp4`'s marketplace file still lists brief2motion at 0.1.0. Bump that entry (or drop its `version` field) in the same release.
- Codex support is a manifest and a marketplace file. The skill was built and checked from Claude Code; no Codex run is recorded.

## [0.1.0] - 2026-11-16

First release. A plain brief in, a web page with dust that forms a face, product or logo, a paper plane across the page, and scroll-driven scenes out, checked in a real browser.
