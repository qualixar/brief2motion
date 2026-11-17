# Copper No. 7: a worked brief2motion example

A fictional perfume landing page. It shows what one brief produces: a bottle that forms out of dust, then cardamom, rose and amber pouring in and returning to the bottle as you scroll, a paper plane across the page, and the chapters, collection, details and craft sections below.

Only `config.js` and `index.html` (title and description) are specific to this example. `main.js`, `assemble.js`, `page.js`, `flight.js`, `validate.js` and `style.css` are the template, unchanged; `tests/run_checks.sh` fails if they drift apart.

## Run it

Browsers will not load this page from the file (modules need http), so serve the folder:

```bash
python3 ../../skills/brief2motion/scripts/serve.py .
# prints  Open  http://localhost:8421/
```

No Python? Use `node ../../skills/brief2motion/scripts/serve.mjs .` instead.

## Check it

```bash
node ../../skills/brief2motion/scripts/check_motion.mjs . --out /tmp/copper-check
```

`motion-report.json` in this folder is the report from the run that passed for this release.
