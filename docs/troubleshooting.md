# Troubleshooting

Start with the doctor. It checks Node.js, Chrome, playwright-core, Python, ffmpeg and the CDN, and prints `ok` or the exact install command for each:

```bash
bash skills/brief2motion/scripts/doctor.sh
```

**The page is blank when I open it.** You opened the file, not the address. Browsers refuse to load JavaScript modules from a `file://` address. Run `python3 skills/brief2motion/scripts/serve.py site` (or `node skills/brief2motion/scripts/serve.mjs site`) and open the `http://localhost` link it prints.

**The preview says the port is busy.** The server tries the next 20 ports by itself and prints the one it used. Pass `--port 9000` to choose one, or `--port 0` for any free port.

**The checker says it could not start a browser.** It lists every browser it tried. Install Chrome, or run `npx playwright@1.65.1 install chromium`, or set `BRIEF2MOTION_CHROME` to the path of any Chrome or Chromium.

**"The page never set data-motion."** The page did not report its motion state, so the checker cannot tell the animated run from the reduced-motion run. Call `signal('ready')`, `signal('reduced')` or `signal('static')` from `kit/motion-core.js` when setup is done.

**The frame-time check fails.** Read [performance.md](../skills/brief2motion/references/performance.md). The usual causes are animating layout properties instead of `transform` and `opacity`, an uncapped pixel ratio on a 3D canvas, and a loop that keeps running off screen. If every number is slow, check that the machine has a real GPU, or pass `--no-perf`: on a machine without one the frame numbers say nothing about real devices.

**The reduced-motion check fails.** Something still moves, or some text never becomes visible. [accessibility.md](../skills/brief2motion/references/accessibility.md) lists how each library honours the setting.

**The weight check fails.** The budget is 1.5 MiB per page from your own project (CDN libraries are counted separately). Pictures should be about 1200 px wide WebP with a 720 px copy in `srcset`; a picture sequence about 960 px wide at quality 60 to 70.

**A site-mode run ends `RESULT: INCOMPLETE`.** Nothing failed, but at least one check has no evidence yet (PENDING): a site not built, a form that ends at a fixture, or axe-core not reachable offline. It is not a pass. [site-mode.md](site-mode.md#what-the-outcomes-mean) explains each outcome and `--strict`.

**`check_a11y.mjs` reports axe-core as PENDING.** It fetches axe-core 4.14.1 from cdn.jsdelivr.net at check time and checks its hash. Without network access, or behind a proxy that blocks the CDN, it cannot run.

**A dust portrait does not look like the person.** Use a calm, front-facing photo from the shoulders up on a plain background, with `style: 'halftone'` and `mask: 'oval'`.

**Something else.** Open an issue with the brief, the command you ran and its output (for a failed check, `site-report.json` or `check/qa.json`).
