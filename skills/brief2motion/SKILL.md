---
name: brief2motion
description: Turn a plain brief into live, measured web motion. Use when asked to make a website or landing page move, a hero animation, particles or dust that form a product, logo, face, portrait or words, a halftone or stipple portrait made of dots, something (a paper plane, an object) flying across the page, scroll animation, scrollytelling, or "make my site feel alive". Builds a working page with three.js, GSAP and Lenis, serves it at a localhost address, checks fps, page weight, phone, reduced-motion and no-WebGL fallbacks in a real browser, fixes what fails, and can hand the page to brief2mp4 to become a video.
---

# brief2motion 0.2.0

A brief goes in. A working page comes out in `site/`, with `REPORT.md` proving every line of the brief with a measured number or a named screenshot, and a `http://localhost` address the user can open.

Work in this order every time: **spec, build, self-check, fix, deliver.** A page that looks right on your screen is not a page that works on a phone.

## 0. Before you start

Run the doctor once per machine:

```bash
bash <this skill's folder>/scripts/doctor.sh
```

Required: Node.js 22+ and a Chrome or Chromium the checker can start (Google Chrome, `chromium` on PATH, Playwright's Chromium, or a path in `BRIEF2MOTION_CHROME`). The doctor says which one it found. If something required is missing, give the user the command the doctor printed and stop.

Also good to know: the first check downloads `playwright-core` 1.65.1 (about 14 MB on disk, install scripts off) into `~/.cache/brief2motion/deps`; the doctor shows whether it is there yet. Python 3 is optional (the preview server has a Node twin). ffmpeg and the brief2mp4 skill are only for a video. `cutout.swift` needs macOS 14 or newer and the Xcode command line tools.

Work inside one project folder. Never write outside it.

## 1. Spec: write SPEC.md first

Copy `templates/SPEC.md` and fill it in:

1. **What moves**, in the user's words, mapped to the three building blocks (section 2). Read `references/brief-words.md` when the brief is vague.
2. **Targets**: each image or text the dust forms, in order. Up to **four** distinct shapes; the optional `sequence` can repeat them (for example bottle, spice, bottle, spice). The dust forms the first shape, then bursts and re-forms as each next one.
3. **Look**: light theme by default (paper `#f4efe6`, ink `#1d1b18`, one accent with 4.5:1 contrast on paper). Dark only if the brief asks.
4. **Copy**: every word on the page, exactly as the brief gives it. If the brief gives none, write plain copy from what it says and mark it as drafted in REPORT.md. Never invent reviews, ratings, customer names or numbers.
5. **Done when**: one checkable line per requirement ("the face is recognisable at 100% scroll: shots/desktop-50.png", "mobile p95 frame time <= 40 ms").

If the brief leaves a choice open, make it, write it under **Decisions**, and continue.

## 2. The three building blocks

| The brief says | Block | Set in `config.js` |
|---|---|---|
| "made of dust", "particles form my product / logo / face", "rise out of dots" | **assemble** | `assemble.targets`: `{ type: 'image', src, style, mask, relief, fill }` or `{ type: 'text', text, fill }` |
| "a plane flies across", "something travels over the page" | **flight** | `flight.path` (SVG path in a 1000 x 600 box), `trigger: 'scroll'` or `'time'` |
| "when I scroll", "as you move down", "story as you scroll" | **scroll** | `scroll.length` (% of a screen the hero stays pinned); `null` plays it on a timer |

More assemble options, all in `config.js`: `sequence` (the order of shapes, repeats allowed), `captions` (one card per sequence step: `{ kicker, n, title, body, tint }`), `offsetX` and `offsetY` (how far right and up the shape sits on wide screens, so it clears the headline; it shrinks to stay on screen), `assembleOnLoad` (the dust forms on its own at load, so the first screen is never blank), `fill` (share of the frame height a shape takes), `points` (dots per screen size), `seed`.

The page itself is the `page` block in `config.js`: `brand`, `title`, `description`, `nav`, `hero`, `chapters`, `collection` (optional), `details`, `process`, `cta`, `footer`. Every word on the page comes from there.

Choosing the dot style for an image:
- `style: 'halftone'`: dots on a hexagonal grid, size from darkness. Clean round circles, print look. **Use for faces and portraits.** Start with `points.desktop` 12000 and leave `dotSize` unset: dot size is computed from the grid spacing so the circles fit at any screen size.
- default (stipple): dots placed by importance sampling. Dense, organic. Use for products and logos. Start with 60000 points; leave `dotSize` unset.
- `assemble.colour: 'photo'` makes each dot take the picture's own colour, darkened and saturated so it always reads on paper; the dust stays ink and the colour blooms in as the shape forms. Leave it out for one ink colour (print look).
- `mask: 'oval'` fades the edges of a photo so the background does not turn into dots. Use for portraits.
- Remove the background of any photo with people or clutter behind the subject. On macOS 14+ with the Xcode command line tools: `swift <this skill's folder>/scripts/cutout.swift in.jpg out.png` (Apple's on-device subject detection, nothing uploaded; paints the background paper white; honours the photo's rotation). Then crop to head and shoulders, chin included, about 5:6 width to height (`sips -c H W --cropOffset Y X in.png --out out.png`). Look at the crop before using it. Elsewhere: ask the user for a photo on a plain background.
- Faces need a calm, front-facing photo. Three-quarter profiles and busy backgrounds do not read as the person.

**Start from `templates/site/`**: copy the whole folder to `site/`. It runs as it is, with no images (the dust forms a word, chapters show colour swatches). Change only:
- `config.js` (all copy, targets, colours, motion settings),
- `index.html`: the `<title>`, `<meta name="description">`, the two `og:` tags and the `<noscript>` line, so link previews and crawlers see real text (the check warns while they still hold the template text),
- `style.css` colours and spacing if the brief asks.

Do not edit `assemble.js`, `flight.js`, `main.js`, `page.js` or `validate.js` unless the brief needs something the config cannot express; if you do, say why in REPORT.md. `examples/copper-no-7/` (in this plugin's repo, two folders above this skill) is a finished worked example with photos, a four-shape sequence and captions. Read its `config.js` for the pattern; never copy its pictures or words into a user's project.

Images: use only images the user owns or that carry a licence allowing reuse (for example CC BY on Wikimedia Commons). Put the credit line in `site/CREDITS.md` and in REPORT.md. Never copy another site's portraits, depth maps or code. Size them for the weight budget: chapter pictures 1200 px wide WebP or JPG (about 50-100 KB) with a 720 px copy in `srcset` for phones, collection pictures 600 px wide, shape pictures 512 px.

## 3. Self-check (do not skip)

```bash
node <this skill's folder>/scripts/check_motion.mjs site --out check --make-fallback
node <this skill's folder>/scripts/check_motion.mjs site --out check
```

The first run also writes `site/assets/fallback.png`: the finished first shape, photographed from the canvas alone (shown when WebGL is off). The second must pass every check:

| Check | Budget |
|---|---|
| Desktop 1440x900, p95 frame time | <= 20 ms |
| Emulated phone (390x844 touch screen, CPU slowed 4x), p95 frame time | <= 40 ms |
| Desktop sheds no dots; phone keeps at least 60% of its dots | the page may not pass by quietly drawing less |
| Page weight served from the project, desktop and phone | <= 1.5 MiB each (CDN libraries excluded) |
| Third-party requests | only `cdn.jsdelivr.net` |
| Console errors, all four runs | 0 |
| Reduced motion | finished shape on the canvas, still there after a resize, headline readable |
| WebGL off | fallback image shown and the headline readable over it |

The frame numbers only mean something on a machine with a real GPU. Then open the screenshots in `check/shots/` and look at them against every **Done when** line. A recognisable face is a judgement you make by looking, not a number. The check prints WARN lines for template text left in `index.html` or `config.js`: fix those too.

## 4. Fix

If a budget fails: lower `points` (desktop, mobile), lower `dotSize`, shorten `scroll.length`, shrink or crop the images, or add `srcset` copies. Re-run the check. Never relax a budget to pass.

## 5. Deliver

**Preview first.** Browsers refuse to load ES modules from `file://`, so opening `site/index.html` from the file shows a blank page. Start the preview server and give the user the address it prints:

```bash
python3 <this skill's folder>/scripts/serve.py site        # or: node <this skill's folder>/scripts/serve.mjs site
# prints  Open  http://localhost:8421/
```

Run it in the background so it stays up, tell the user the exact `http://localhost:PORT/` link, and say Ctrl-C (or closing the terminal) stops it. Never tell the user to open the file directly. For a real site, upload `site/` to any static host.

`REPORT.md` in the project root: the brief, every **Done when** line with its proof (number or screenshot path), the check table, credits and the licence notice (`references/licences.md` has the template), and what you decided.

Video wanted? `bash <this skill's folder>/scripts/to_video.sh site final.mp4 --seconds 12` records the hands-free `?play` run frame by frame (add `--mode scroll` for a scroll-through). The dust swirl runs on a virtual clock, so the video is frame-exact and two runs match. It finishes the file with brief2mp4 when installed.

## Licences in one paragraph

This skill's code is MIT. three.js (MIT), GSAP 3.15.0 (free standard licence; AI-written GSAP code is allowed) and Lenis (MIT) load from a CDN at pinned versions, with integrity hashes on the four script tags. The page uses system fonts and sends no request to a font service. LYGIA is an optional add-on only: non-commercial unless the user sponsors or contributes (Patron License); never copy it into the page without saying so in REPORT.md. Depth maps: only Depth Anything V2 **Small** (Apache-2.0); Base and Large are non-commercial.
