<h1 align="center">brief2motion</h1>

<p align="center"><b>Web motion for Claude Code and Codex. Write a plain brief, get a web page that moves, checked in a real browser before you see it.</b><br>dust that turns into a photo, logo or word · halftone portraits · a paper plane across the page · scenes that play as you scroll</p>

<p align="center">
  <a href="https://github.com/qualixar/brief2motion/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/qualixar/brief2motion?style=flat&color=FF5A1F"></a>
  <img alt="Version 0.2.0" src="https://img.shields.io/badge/version-0.2.0-FF5A1F">
  <a href="https://github.com/qualixar/brief2motion/actions/workflows/test.yml"><img alt="Tests" src="https://github.com/qualixar/brief2motion/actions/workflows/test.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-16130F"></a>
  <img alt="Node 22 or newer" src="https://img.shields.io/badge/node-22%2B-16130F">
  <img alt="Claude Code plugin" src="https://img.shields.io/badge/Claude%20Code-plugin-FF5A1F">
  <img alt="Codex plugin manifest" src="https://img.shields.io/badge/Codex-manifest%20included-16130F">
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#what-it-makes">What it makes</a> ·
  <a href="#what-it-checks">What it checks</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#example-copper-no-7">Example</a> ·
  <a href="#write-a-brief">Write a brief</a> ·
  <a href="#troubleshooting">Troubleshooting</a> ·
  <a href="#faq">FAQ</a>
</p>

<p align="center">
  <img src="assets/faces-demo.webp" alt="Dust drifting, then forming three halftone portraits one after another" width="100%">
</p>

<p align="center"><b>One page, three faces.</b> The dust forms a portrait made of round dots, bursts, and re-forms as the next one. This is the effect on a real page, rendered live in the browser with three.js.</p>

| You give it | You get back |
|---|---|
| A plain brief: what moves, the words on the page, a photo or logo if you have one, and what "done" means. | A `site/` folder with a working page, a `REPORT.md` that goes through your brief line by line with the number or screenshot behind each line, and an `http://localhost` address to open it. |

brief2motion is a free, MIT-licensed agent skill. The agent writes a short spec with a checkable "done when" list, copies a starter page, fills in `config.js` from your brief, starts a local preview server, then measures the page in a real Chrome: frame time on desktop and on an emulated phone, page weight, console errors, and what a visitor sees with reduced motion on or without WebGL. If a check fails it fixes the page and measures again. Everything runs on your own machine.

Scope, stated plainly. It does four things: particle dust that assembles into a photo, a logo or a word; halftone (round dot) portraits; a flight path across the page (a paper plane or any object); and scroll-driven scenes with a pinned hero. Around that it writes the rest of a landing page (nav, headline, chapters, details, steps, call to action, footer). It is not a general animation tool, a page builder or a video editor.

<p align="center">
  <img src="assets/product-demo.jpg" alt="A perfume bottle formed from dust on a landing page, with the headline Bottled from a single copper still" width="720">
</p>

## Quick start

**Install it in Claude Code:**

```
/plugin marketplace add qualixar/brief2mp4
/plugin install brief2motion@brief2mp4
```

If you do not use brief2mp4, add this repo as its own marketplace instead: `/plugin marketplace add qualixar/brief2motion`, then `/plugin install brief2motion@brief2motion`.

| You use | Run |
|---|---|
| Claude Code (plugin) | the two lines above |
| Codex (plugin) | `codex plugin marketplace add qualixar/brief2motion` then `codex plugin add brief2motion@brief2motion` (see the Codex note in the FAQ) |
| Either app, by hand | `git clone https://github.com/qualixar/brief2motion.git`, then copy `brief2motion/skills/brief2motion` into `~/.claude/skills/` (Claude Code) or `~/.codex/skills/` (Codex) |

Start a new session after installing so the app loads the skill. Check the machine at any time with `bash skills/brief2motion/scripts/doctor.sh`. It prints `ok` or the exact install command for each tool.

**Then make a page.** In a folder for the project, ask in your own words:

```
Make my product rise out of dust on my landing page. A paper plane flies across when I scroll.
[attach product.jpg]
```

```
Turn my photo into a halftone portrait made of dots, in colour, then morph it into my logo.
```

```
A hero for my bakery site: the word "Crumb" forms from flour dust, calm, no scroll.
```

When it says it is done, it gives you a link such as `http://localhost:8421/`. Open that address in your browser. To start the preview yourself:

```bash
python3 skills/brief2motion/scripts/serve.py site     # or: node skills/brief2motion/scripts/serve.mjs site
```

**Do not open `site/index.html` by double-clicking it.** Browsers refuse to load JavaScript modules from a `file://` address, so you would see a blank page. The preview server is a few lines of standard-library code that serves the folder on `127.0.0.1` only, with caching off so every reload shows your latest edit. To publish, upload the `site/` folder to any static host.

When the page is up, send one follow-up:

> Check it against the brief.

That makes the agent go back to your original brief line by line, show the evidence for each line, fix what falls short and measure again.

### Requirements

| Tool | Needed for | macOS | Windows | Ubuntu / Debian |
|---|---|---|---|---|
| Node.js 22+ | everything | `brew install node` | `winget install -e --id OpenJS.NodeJS.LTS` | [nodesource setup_22.x](https://github.com/nodesource/distributions) |
| Chrome or Chromium | the checks (a real browser with WebGL) | `brew install --cask google-chrome` | `winget install -e --id Google.Chrome` | `sudo apt install chromium`, or `npx playwright@1.65.1 install chromium` |
| playwright-core 1.65.1 | drives the browser for the checks | downloaded once on the first check into `~/.cache/brief2motion/deps` (about 14 MB on disk, install scripts off); the doctor shows whether it is there | same | same |
| Python 3 | the preview server (optional; `serve.mjs` does the same with Node) | preinstalled or `brew install python` | `winget install -e --id Python.Python.3.12` | `sudo apt install python3` |
| ffmpeg | turning the page into an MP4 (optional) | `brew install ffmpeg` | `winget install -e --id Gyan.FFmpeg` | `sudo apt install ffmpeg` |
| brief2mp4 | finishing and checking that MP4 (optional) | see [brief2mp4](https://github.com/qualixar/brief2mp4) | same | same |
| macOS 14+ and Xcode command line tools | removing a photo's background on your machine (optional) | `xcode-select --install` | not available; ask for a photo on a plain background | not available; same |

The checker looks for a browser in this order: the path in `BRIEF2MOTION_CHROME`, Google Chrome, `chromium` or `google-chrome` on your PATH, then Playwright's own Chromium. Development and every run recorded here were on macOS; the Windows and Linux paths are written but not run by the author.

## What it makes

| Block | What the skill does with it | Set in `config.js` |
|---|---|---|
| **Assemble** | Dust drifts as a slow galaxy, then forms an image or words, and can burst and re-form as up to four shapes, in any order you list (`sequence`), with a caption card per step. `halftone` makes round dots on a grid sized by how dark the picture is (best for faces); the default stipple is dense and organic (best for products and logos). `colour: 'photo'` gives each dot the colour of the picture under it. | `assemble.targets`, `sequence`, `captions`, `colour`, `points` |
| **Flight** | A paper plane, or any object, travels along a path across the hero, leaving a fading trail. | `flight.path`, `trigger` (`scroll` or `time`) |
| **Scroll** | The hero pins while the scene plays as you scroll, with smooth scrolling (Lenis). Or it runs on a timer with no scroll at all. | `scroll.length`, or `scroll: null` |
| **The page around it** | Nav, headline, chapters with pictures, an optional collection grid, details, process steps, call to action and footer, all written from your brief. Add `?play` to the address to run the whole scene on its own, which is useful for screen recording. | the `page` block |

Photos of people work best front-facing, calm, from the shoulders up. On a Mac with macOS 14 or newer the skill removes the background on your machine (Apple's subject detection; nothing is uploaded).

## What it checks

| Check | Must be |
|---|---|
| Desktop, 1440 x 900 | p95 frame time 20 ms or less (smooth at 60 fps) |
| Emulated phone, 390 x 844 touch screen, processor slowed 4x | p95 frame time 40 ms or less |
| Dots drawn | desktop draws every dot; the phone run keeps at least 60%. A page cannot pass by quietly drawing less. |
| Page weight from your project, desktop and phone run | 1.5 MiB or less each |
| Third-party requests | only `cdn.jsdelivr.net` |
| Console errors, all four runs | none |
| Visitor has reduced motion switched on | the finished shape is on the canvas, still there after a resize, and the headline is readable |
| Browser without WebGL | a still image of the finished shape, with the headline readable over it |

If a check fails, the skill fixes the page and checks again. It never relaxes a budget to pass. The phone run is an emulated phone: this machine's graphics chip with the processor slowed down. On a machine with no GPU, such as a basic virtual machine, the frame numbers say nothing about real devices.

## How it works

1. **Spec.** Before any code the agent writes `SPEC.md`: what moves, the shapes in order, the look, every word on the page, and a "done when" list with one checkable line per requirement.
2. **Build.** It copies `skills/brief2motion/templates/site/` to `site/` and edits only `config.js` (all copy and motion settings), the title and description in `index.html`, and colours in `style.css`. The engine files are not touched.
3. **Self-check.** `check_motion.mjs` serves the page, measures it in a real browser and writes `motion-report.json` and screenshots. The agent looks at the screenshots against each "done when" line.
4. **Fix.** Lower the dot count, shrink the pictures, shorten the scroll, measure again.
5. **Deliver.** It starts the preview server and hands you the `http://localhost` link, plus `REPORT.md` with the evidence, the credits and the licence notice.

| The page needs | Library | Licence | How it loads |
|---|---|---|---|
| 3D particles | [three.js](https://github.com/mrdoob/three.js) r187 | MIT | CDN, pinned |
| Timelines, scroll pinning, the plane's path | [GSAP](https://gsap.com) 3.15.0 with ScrollTrigger and MotionPath | GSAP standard licence (free, AI-written code allowed) | CDN, pinned, integrity hash |
| Smooth scrolling | [Lenis](https://github.com/darkroomengineering/lenis) 1.3.27 | MIT | CDN, pinned, integrity hash |

The page text renders first from `config.js`; three.js loads after it. If the CDN is blocked or the browser has no WebGL, the visitor still gets the words and a still image, never a blank page. The page uses system fonts, so no request goes to a font service.

## Example: Copper No. 7

[`examples/copper-no-7/`](examples/copper-no-7/) is a finished page for a made-up perfume, built from one brief: the bottle forms from dust, cardamom, rose and amber pour in one after another and return to the bottle as you scroll, and a paper plane flies across. It runs the template engine unchanged; only `config.js` and the pictures are its own. Serve it with `python3 skills/brief2motion/scripts/serve.py examples/copper-no-7`.

[`examples/copper-no-7/motion-report.json`](examples/copper-no-7/motion-report.json) is the report from its passing check on an Apple M-series laptop with Chrome 157: p95 frame time 16.7 ms on desktop and 16.8 ms on the emulated phone, every dot drawn, 0.35 MiB of project files on desktop and 0.43 MiB on the phone run, no console errors. [`CREDITS.md`](examples/copper-no-7/CREDITS.md) says how each picture was made.

## Write a brief

The agent guesses less when the brief says more. A brief that works well has these parts:

```markdown
What moves: my product bottle forms from dust on load. When I scroll, three spice shapes pour into it one after another, then it is the bottle again. A paper plane flies across.
Words on the page, exactly: headline "Bottled from a single copper still." / button "Reserve a bottle".
Images: product.jpg (white background), three spice photos.
Look: light, paper and ink, one burnt-orange accent.
Done when: the bottle is recognisable at the end of the scroll, p95 frame time is 20 ms or less on desktop, the page is under 1.5 MiB, and it still reads without WebGL.
```

The "done when" lines matter most, because they are what the checks measure. [`references/brief-words.md`](skills/brief2motion/references/brief-words.md) maps common brief phrases ("made of dust", "turns into", "calm", "when I scroll") to settings.

## Troubleshooting

**The page is blank when I open it.** You opened the file, not the address. Run `python3 skills/brief2motion/scripts/serve.py site` and open the `http://localhost` link it prints.

**The preview says the port is busy.** The server tries the next 20 ports by itself and prints the one it used. Pass `--port 9000` to choose.

**`check_motion` says it could not start a browser.** It lists every browser it tried. Install Chrome, or run `npx playwright@1.65.1 install chromium`, or set `BRIEF2MOTION_CHROME` to the path of any Chrome or Chromium.

**The first check downloads something.** That is `playwright-core` 1.65.1, about 14 MB on disk, into `~/.cache/brief2motion/deps`, with install scripts off. `bash skills/brief2motion/scripts/doctor.sh` shows whether it is already there. To fetch it yourself: `npm i --no-save --ignore-scripts --prefix ~/.cache/brief2motion/deps playwright-core@1.65.1`.

**The frame-time check fails.** Lower `points.desktop` or `points.mobile` in `config.js`, shorten `scroll.length`, or crop the pictures tighter. If every number is slow, check the machine has a real GPU.

**The weight check fails.** Chapter pictures should be about 1200 px wide WebP or JPG with a 720 px copy in `srcset`, collection pictures 600 px wide, shape pictures 512 px.

**A portrait does not look like the person.** Use a calm, front-facing photo from the shoulders up on a plain background, with `style: 'halftone'` and `mask: 'oval'`. Three-quarter profiles and busy backgrounds do not read.

**`cutout.swift` fails.** It needs macOS 14 or newer and the Xcode command line tools (`xcode-select --install`). Otherwise ask for a photo on a plain background.

## FAQ

**Does it cost anything?** The skill is free and MIT licensed. The agent runs on your own Claude Code or Codex plan, and the checks run on your machine.

**Does it work in Codex?** The repo carries a Codex plugin manifest and marketplace file, and the skill is plain scripts and files that Codex can run. The author built and checked it from Claude Code and has not recorded a Codex run, so treat Codex as untested and open an issue if something breaks.

**Does it upload my files anywhere?** No. Your photos, the page, the checks and the report stay in your project folder. The page loads three.js, GSAP and Lenis from `cdn.jsdelivr.net` when a visitor opens it, and the first check downloads `playwright-core` from npm once.

**Will it work on a phone?** The page is built for one, and the check measures an emulated phone: a 390 x 844 touch screen with the processor slowed 4x. On narrow screens the shape moves above the headline and shrinks, and fewer dots are drawn. An emulated phone is not a real one, so look at it on yours.

**What do visitors with reduced motion or without WebGL see?** With reduced motion switched on, the finished shape is drawn once and nothing moves. Without WebGL, or if anything fails at run time, they get a still image of the finished shape and the full page text.

**Can I use the scripts without an agent?** Yes. Copy `skills/brief2motion/templates/site/` to a folder, edit `config.js`, then `python3 skills/brief2motion/scripts/serve.py <folder>` to preview and `node skills/brief2motion/scripts/check_motion.mjs <folder> --make-fallback` to measure.

**Can it make a video of the page?** Yes. `bash skills/brief2motion/scripts/to_video.sh site final.mp4 --seconds 12` records the hands-free `?play` run frame by frame (add `--mode scroll` for a scroll-through). The dust runs on a virtual clock, so two runs give the same frames. If [brief2mp4](https://github.com/qualixar/brief2mp4) is installed it finishes and checks the file; otherwise ffmpeg encodes it directly.

**How do I update or remove it?** Claude Code: `claude plugin update brief2motion@brief2mp4` or `claude plugin uninstall brief2motion@brief2mp4` (use `@brief2motion` if you added this repo as its own marketplace). Codex: `codex plugin marketplace upgrade` or `codex plugin remove brief2motion@brief2motion`. By hand: delete the folder you copied.

## What is inside

```
.claude-plugin/                    Claude Code plugin manifest and marketplace entry
.codex-plugin/, .agents/plugins/   Codex plugin manifest and marketplace file
skills/brief2motion/
  SKILL.md                         the loop the agent follows
  references/                      brief-words.md (brief phrases to settings), licences.md
  scripts/                         doctor.sh, serve.py, serve.mjs, check_motion.mjs, capture_frames.mjs,
                                   to_video.sh, cutout.swift, _common.mjs
  templates/                       SPEC.md and site/, the starter page that runs with no images
examples/copper-no-7/              a finished page for a made-up perfume, with its credits and passing report
tests/run_checks.sh                fast repo checks (syntax, versions, template and example in sync, integrity hashes, privacy)
RESOURCES.md                       49 open repos for motion work, each with its licence in plain words
CHANGELOG.md                       what changed in each release
```

## Part of a small family

[brief2mp4](https://github.com/qualixar/brief2mp4) turns a written brief into a finished, checked MP4. brief2motion turns a brief into live web motion. Use brief2motion when the motion should live on a website, and brief2mp4 when you want a video file. brief2motion can hand its page to brief2mp4 when you want a video of it too. If you already use brief2mp4, this skill installs from its marketplace: `/plugin install brief2motion@brief2mp4`.

## Contributing

Made something with it? Open an issue with the brief and a screenshot; the useful ones get added to the examples with your name on them. A page that failed a check is the most useful bug report: include the brief and `motion-report.json`. Code changes are welcome; run `bash tests/run_checks.sh` first. Releases are listed in [CHANGELOG.md](CHANGELOG.md).

## Star history

<a href="https://star-history.com/#qualixar/brief2motion&Date"><img alt="Star history chart for qualixar/brief2motion" src="https://api.star-history.com/svg?repos=qualixar/brief2motion&type=Date" width="600"></a>

## Licence and credits

brief2motion is MIT. It loads three.js (MIT), GSAP 3.15.0 (free under GSAP's standard licence, which allows AI-written GSAP code) and Lenis (MIT) from a CDN at pinned versions, with integrity hashes on the script tags, and bundles none of them. The skill writes a licence notice into every project it makes. [RESOURCES.md](RESOURCES.md) lists 49 open repos for motion work, each with its licence in plain words; a few are reference-only. [`skills/brief2motion/references/licences.md`](skills/brief2motion/references/licences.md) explains each licence and what it means for you.

**Inspiration.** The particle-face idea was inspired by Thomas Cullen's [faces playground](https://playground.thomascullen.io/faces). brief2motion is written from scratch and shares no code, images or data with it.

**Images.** Use only images you own or may reuse. The portraits in the faces demo above are the author's own photo and two Wikimedia Commons photos under CC BY 2.0. Each was cropped, resized and rendered as dots; the originals are unchanged on Commons.
- [Dario Amodei in 2023.jpg](https://commons.wikimedia.org/wiki/File:Dario_Amodei_in_2023.jpg) by UK Prime Minister, licensed [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).
- [Sam Altman TechCrunch SF 2019 Day 2 Oct 3 (cropped) (cropped).jpg](https://commons.wikimedia.org/wiki/File:Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_(cropped)_(cropped).jpg) by TechCrunch, licensed [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/).

They appear only as a demo of the effect. Nothing here suggests either person uses or endorses this project. The perfume pictures in the other demo image and in `examples/copper-no-7/` are generated images of made-up products; see its [CREDITS.md](examples/copper-no-7/CREDITS.md).

Made by [Varun Pratap Bhardwaj](https://github.com/qualixar). If a page it made is on your site, a star on the repo is the thank-you that helps most.
