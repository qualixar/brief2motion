# SPEC: Larkspur

## Brief (verbatim)
See [BRIEF.md](BRIEF.md).

## Stack and style
- Stack: plain CSS and JavaScript with the kit (`kit/kit.css`, `kit/motion-core.js`). The router proposed SVG because the brief says "statistics", but the brief says there are none ("no statistics about speed or satisfaction"): a negation is not a request. One small timed class change and CSS transitions do the whole job, so nothing heavier is loaded. Overruled on purpose.
- Style: editorial and calm, as the router suggested ("serif", "calm", "studio"), with the brief's own palette (warm paper, ink navy, one violet). Georgia for headlines, the system sans for text, so no font file and no font request.
- References read: `design-fundamentals.md` (sections 1 to 15), `motion-doctrine.md`, `accessibility.md`, `page-blueprints.md` (SaaS), `design-review.md`, `patterns/hero-load-sequence.md`.

## Design plan
See [DESIGN.md](DESIGN.md); tokens in [tokens.json](tokens.json), built into `site/tokens.css`.
- Colours and their pairs: light theme: ink on paper 13.79:1, quiet ink on paper 7.04:1, paper on violet 6.75:1, violet on paper 6.75:1; dark theme 15.03, 8.61, 9.31, 9.31 (measured by `build_tokens.mjs`, all 20 pairs in `qa.json`).
- The one memorable thing: the inbox drawing itself, a message that arrives and is claimed, so the product's whole idea is seen in a second and a half.

## Motion plan
See [MOTION.md](MOTION.md).
- On load: the inbox drawing plays one arrival, once.
- On scroll: nothing.
- On input: buttons move 2 px while pressed; the trial form shows an error summary or a thank-you.
- With reduced motion the visitor sees: the finished drawing (the message already claimed); everything else is the same.
- With no WebGL or a blocked CDN: there is no WebGL and no CDN request; the page is identical.

## Copy (exact)
See [CONTENT.md](CONTENT.md): every claim has a source row; the only drafted claim is the sample data in the drawing (C11), which is labelled "Sample data" on the page. The prices, plans, features and the product itself are fictional, and the site says so in the hero, the pricing and form pages, the FAQ and the footer.

## Done when
- [x] Plan checks: routes reachable, tasks mapped, claims sourced, assets have rights records, wireframes carry each primary action (`check_plan.mjs`)
- [x] Layout at 320, 390, 768 and 1440 px in light and dark: no overflow, clipping, overlap, small targets, covered focus (`check_layout.mjs`)
- [x] axe-core: no violation on any route or state, both themes; Tab reaches each primary action (`check_a11y.mjs`)
- [x] Journeys: start the trial, compare plans, recover from a mistake, on a phone and a desktop width (`check_journeys.mjs`)
- [x] Titles, descriptions, canonical, share image, robots, sitemap (`check_meta.mjs`)
- [x] Tokens: every reference resolves, no cycles, every declared pair meets AA in both themes (`build_tokens.mjs`)
- [x] The existing motion, fallback and weight checks on all three pages (`check_site.mjs`; frame-time budgets skipped, see REPORT.md)
- [ ] Trial sign-ups reach a real service: PENDING, the form is a fixture
- [ ] A second reader's `REVIEW.md` (`design-review.md`): not done in this example

## Decisions
- No dark-mode switch: the page follows the system setting (`prefers-color-scheme`), and `data-theme` on `<html>` would override it.
- No hamburger menu: the header has one text link and one button, which fit at 320 px.
- The header button reads "Try free" so it does not repeat the hero's "Start free trial" (two links with the same name and different places to go would confuse a screen-reader list).
- The 14-day trial, the prices and the limits are shown on the pricing page and in the form's plan choice, each from the brief, so a visitor never has to guess what "free" costs afterwards.
