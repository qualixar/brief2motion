# Report: Larkspur

Larkspur is a made-up product. This report covers the example site built from [BRIEF.md](BRIEF.md) through site mode. Checks were run on 22 Nov 2026 on an Apple M-series laptop with Chrome 158, by `tools/run-checks.sh`.

## Stack and style
Plain CSS and JavaScript with the kit; editorial and calm, in the brief's own colours. The router proposed SVG from the word "statistics" in a sentence that says there are none, and that was overruled in [SPEC.md](SPEC.md).

## Done when
| Line | Proof |
|---|---|
| Plan: routes reachable, tasks mapped, claims sourced, assets with rights, wireframes carry the primary action, links in the built pages | `check_plan.mjs`: 13 of 13 PASS (`qa.json`) |
| Tokens: every reference resolves, no cycles, every declared pair meets AA in light and dark | `build_tokens.mjs`: 21 of 21 PASS, 20 contrast pairs (lowest 5.73:1) |
| Wireframes hold together at 320, 390, 768, 1440 px | `wireframes/qa.json`: 72 of 72 PASS; shots in `wireframes/shots/` |
| Layout of the built site, both themes, five targets (three routes and two form states), four widths | `check_layout.mjs`: 240 of 240 PASS: no overflow, clipped text, overlap, target under 24 px, covered focus; no paragraph outside 45 to 75 characters |
| Accessibility: axe-core 4.14.1 on every route and state, both themes, phone and desktop; Tab reaches each primary action | `check_a11y.mjs`: 32 of 32 PASS, 0 violations, 0 for review |
| Journeys: start the trial; compare the plans; recover from a mistake; phone and desktop | `check_journeys.mjs`: 12 PASS, 2 PENDING (below) |
| Titles, descriptions, canonical, share image 1200 x 630, robots, sitemap | `check_meta.mjs`: 20 of 20 PASS |
| Motion, fallbacks, weight, console | `check_site.mjs` on all three pages: 74 of 74 PASS, with the frame-time budgets on (about 60 fps desktop and phone, three pages); page weight 0.03 MiB; no third-party request |

## What is pending, and why
- **The sign-up service.** The trial form is a fixture. The `start-trial` journey proves the interaction (fill, submit, thank-you) and ends PENDING for the integration, twice (phone and desktop). Nothing here claims a real sign-up works.
- **Field data.** No traffic, so Core Web Vitals in the field are not measured. Lab frame times only.

## What could not be verified by a tool
- A second reader's pass (`references/design-review.md`) was not done in this example, so there is no `REVIEW.md`.
- No screen reader was run. axe-core and the Tab walk cover part of WCAG 2.2; alt text, heading meaning and announcements need a person.
- Forced-colours and 200% zoom were not exercised.
- The rights record lists one file (the share image, drawn in code). The inbox drawing is HTML and CSS.

## Credits and licences
Plain guide, not legal advice. The page loads nothing from any other host and bundles no library. The kit is this project's own (MIT). The checks use playwright-core (Apache-2.0) and axe-core 4.14.1 by Deque Systems (MPL-2.0, <https://github.com/dequelabs/axe-core>), fetched when the checker runs, hash-verified and injected into the checker's page; it is not in `site/`. Fonts: system fonts only; Georgia is the operating system's own. Pictures: one share image drawn by `tools/make-og.mjs`; everything else is HTML and CSS. Larkspur, its prices and its features are invented, and no real person, company or customer is named.

## Decisions
See [SPEC.md](SPEC.md): no dark-mode switch (the page follows the system setting), no hamburger menu, a differently worded header button, and every price and limit taken from the brief.
