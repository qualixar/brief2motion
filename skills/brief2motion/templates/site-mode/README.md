# Site mode project files

Copy this folder's files into the project root (next to `BRIEF.md`). Every file is filled in for a made-up one-page event, "Tidepool Open Day", so each shows its shape: replace every line with the brief's own, and delete a stage only when the brief is small enough not to need it (a one-page site keeps one short entry in each file; a site with several page types gets one entry per route or template).

| Stage | File | Written by | Check it with |
|---|---|---|---|
| 1. Discovery | `DISCOVERY.md` | you | `check_plan.mjs` (tasks map to routes and actions) |
| 2. Content | `CONTENT.md` | you | `check_plan.mjs` (every claim has a source or is DRAFTED) |
| 3. Routes | `routes.json`, `SITEMAP.md` | you; `build_sitemap.mjs` writes SITEMAP.md and sitemap.xml | `check_plan.mjs`, `check_meta.mjs` |
| 4. Wireframes | `wireframes/<template>.html` | you | `check_layout.mjs <project> --wireframes` (shots at 390 and 1440) |
| 5. Tokens | `tokens.json` | you; `build_tokens.mjs` writes `site/tokens.css` | `build_tokens.mjs` (references, cycles, contrast) |
| 6. Design | `DESIGN.md`, `ASSETS.json` | you | `check_plan.mjs` (every asset has a rights record) |
| 7. Motion | `MOTION.md`, then the usual `SPEC.md` | you | `check_site.mjs` |
| 8. Build | `site/` | you | all of the above |
| 9. Checks | `journeys.json`, `check/qa.json` | the checkers | `check_layout.mjs`, `check_a11y.mjs`, `check_journeys.mjs`, `check_meta.mjs` |

Commands, from the project root (`S` is this skill's `scripts` folder):

```bash
node $S/build_sitemap.mjs .                      # SITEMAP.md (and site/sitemap.xml when there is more than one route)
node $S/build_tokens.mjs tokens.json --qa check  # site/tokens.css, and the contrast pairs in check/qa.json
node $S/check_plan.mjs .                         # before the build: plan, content, assets; after: links in the built pages
node $S/check_layout.mjs . --wireframes          # the wireframes at 320, 390, 768 and 1440
node $S/check_layout.mjs .                       # the built site, same widths
node $S/check_a11y.mjs .                         # axe-core and a keyboard walk to each primary action
node $S/check_journeys.mjs .                     # journeys.json
node $S/check_meta.mjs .                         # titles, descriptions, canonical, share image, robots, sitemap
node $S/check_site.mjs site --out check          # the existing motion, fallback and weight checks
```

Every checker writes into `check/qa.json`: one record per check with its outcome. PASS means measured and within its threshold. FAIL blocks the release. REVIEW means a person should look (an ambiguous overlap, text over a picture, a claim that holds a figure). PENDING means the evidence does not exist yet (a site not built, a journey that ends at a fixture, axe-core not loaded offline). Exit code 0 means no FAIL; `--strict` also fails on REVIEW.
