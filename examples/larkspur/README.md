# Larkspur

A three-page launch site for a shared inbox, built from [BRIEF.md](BRIEF.md) through every stage of brief2motion's site mode. **Larkspur is a made-up product.** Its name, plans, prices and features are invented for this example, and the site says so on every page. There are no customers, logos, reviews or numbers about speed or satisfaction, because the brief has none.

The point of the example is the process, so the stage files are the content of the folder:

| Stage | File |
|---|---|
| 1. Discovery | [DISCOVERY.md](DISCOVERY.md) |
| 2. Content and claims | [CONTENT.md](CONTENT.md) |
| 3. Routes | [routes.json](routes.json), [SITEMAP.md](SITEMAP.md) (generated) |
| 4. Wireframes | [wireframes/](wireframes/) with screenshots at 390 and 1440 px in `wireframes/shots/` |
| 5. Tokens | [tokens.json](tokens.json), built into `site/tokens.css` |
| 6. Design | [DESIGN.md](DESIGN.md), [ASSETS.json](ASSETS.json), [SPEC.md](SPEC.md) |
| 7. Motion | [MOTION.md](MOTION.md) |
| 8. Build | [site/](site/): plain HTML, one stylesheet, one script, the kit; no library, no font file, no third-party request |
| 9. Checks | [qa.json](qa.json), [site-report.json](site-report.json), [journeys.json](journeys.json), [REPORT.md](REPORT.md) |

- **Stack:** plain CSS and JavaScript with the kit. One motion moment: an inbox drawing where a message arrives and a teammate claims it, once, about a second and a half; the finished state is the default for reduced motion and for no JavaScript.
- **What the checks say:** `qa.json` has every record with its outcome. The sign-up form is a fixture (it sends and stores nothing), so its journey is PENDING for the real service, not PASS. The frame-time budgets were on and passed.
- **Not done here:** a second reader's `REVIEW.md` (see `references/design-review.md`), a screen-reader pass, and anything that needs a real back end.

```bash
python3 skills/brief2motion/scripts/serve.py examples/larkspur/site     # open the address it prints
bash examples/larkspur/tools/run-checks.sh                               # run every check again (add --no-perf on a machine with no GPU)
```
