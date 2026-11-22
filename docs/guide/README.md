# The brief2motion guide

[`brief2motion-guide.pdf`](brief2motion-guide.pdf) is the learning guide for brief2motion: writing a brief, how the stack and the style are chosen, each stack, the style system, accessibility, performance, the checks and the examples. It is A4, with a clickable contents page and bookmarks.

It is built from editable sources in this folder:

| File | What it is |
|---|---|
| `build.py` | the prose and the assembly. It reads the repository (styles, routing rules, example briefs and reports), so the guide cannot drift from it. Writes `brief2motion-guide.html` and `guide-prose.txt` |
| `extra.py` | the two sections added in 1.1.0, "Site mode" and "Motion patterns". The Larkspur numbers come from `examples/larkspur/qa.json`, the page types from `references/page-blueprints.md`, the 27-row pattern table from `references/patterns/`, and the router example from running `route.mjs` |
| `guide.css` | the print stylesheet |
| `render.py` | HTML to PDF with WeasyPrint, then checks: page count, contents links, text inside every page, metadata |
| `img/` | screenshots of the examples and the style atlas, made with `capture_site.mjs` |
| `fonts/` | Inter and Space Grotesk (SIL Open Font License 1.1) and DejaVu Sans Mono, each with its licence text |

Rebuild with Python 3.12 or newer (and Node.js, which `build.py` runs once to print a real router example):

```bash
python3 -m venv .venv && .venv/bin/pip install -r docs/guide/requirements.txt pillow
.venv/bin/python docs/guide/build.py
.venv/bin/python docs/guide/render.py --sheets      # --sheets also writes contact sheets to docs/guide/qa/
humanize-gate docs/guide/guide-prose.txt             # the prose gate used for this project, if you have it
```

WeasyPrint needs the Pango libraries. On macOS: `brew install pango`. On Debian or Ubuntu: `sudo apt install libpango-1.0-0 libpangoft2-1.0-0`.
