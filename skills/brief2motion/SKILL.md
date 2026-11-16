---
name: brief2motion
description: Turn a plain brief into live, measured web motion. Use when asked to make a website or landing page move, a hero animation, particles or dust that form a product, logo, face, portrait or words, a halftone or stipple portrait made of dots, something (a paper plane, an object) flying across the page, scroll animation, scrollytelling, or "make my site feel alive". Builds a working page with three.js, GSAP and Lenis, checks fps, page weight, phone, reduced-motion and no-WebGL fallbacks in a real browser, fixes what fails, and can hand the page to brief2mp4 to become a video.
---

# brief2motion

A brief goes in. A working page comes out in `site/`, with `REPORT.md` proving every line of the brief with a measured number or a named screenshot.

Work in this order every time: **spec, build, self-check, fix, deliver.** A page that looks right on your screen is not a page that works on a phone.

## 0. Before you start

Run the doctor once per machine:

```bash
bash <this skill's folder>/scripts/doctor.sh
```

Required: Node.js 22+ and Google Chrome (or Playwright's Chromium). Optional: ffmpeg and the brief2mp4 skill (only for a video). If something required is missing, give the user the command the doctor printed and stop.

Work inside one project folder. Never write outside it.

## 1. Spec: write SPEC.md first

Copy `templates/SPEC.md` and fill it in:

1. **What moves**, in the user's words, mapped to the three building blocks (section 2). Read `references/brief-words.md` when the brief is vague.
2. **Targets**: each image or text the dust forms, in order (at most 3: it forms the first, then bursts and re-forms as each next one).
3. **Look**: light theme by default (paper `#f4efe6`, ink `#1d1b18`, one accent). Dark only if the brief asks.
4. **Copy**: every word on the page, exactly as the brief gives it.
5. **Done when**: one checkable line per requirement ("the face is recognisable at 100% scroll: shots/desktop-50.png", "mobile p95 frame time <= 40 ms").

If the brief leaves a choice open, make it, write it under **Decisions**, and continue.

## 2. The three building blocks

| The brief says | Block | Set in `config.js` |
|---|---|---|
| "made of dust", "particles form my product / logo / face", "rise out of dots" | **assemble** | `assemble.targets`: `{ type: 'image', src, mask, style, relief }` or `{ type: 'text', text }` |
| "a plane flies across", "something travels over the page" | **flight** | `flight.path` (SVG path in a 1000 x 600 box), `trigger: 'scroll' | 'time'` |
| "when I scroll", "as you move down", "story as you scroll" | **scroll** | `scroll.length` (% of a screen the hero stays pinned); `null` plays it on a timer |

Choosing the dot style for an image:
- `style: 'halftone'`: dots on a hexagonal grid, size from darkness. Clean round circles, print look. **Use for faces and portraits.** Start with `points.desktop` 12000 and leave `dotSize` unset: dot size is computed from the grid spacing so the circles fit at any screen size.
- default (stipple): dots placed by importance sampling. Dense, organic. Use for products and logos. Start with 60000-120000 points, `dotSize` 1.8-2.6.
- `assemble.colour: 'photo'` makes each dot take the picture's own colour (skin, clothes), darkened and saturated so it always reads on paper; the dust stays ink and the colour blooms in as the face forms. Leave it out for one ink colour (print look).
- `mask: 'oval'` fades the edges of a photo so the background does not turn into dots. Use for portraits.
- Remove the background of any photo with people or clutter behind the subject. On macOS: `swift <this skill's folder>/scripts/cutout.swift in.jpg out.png` (Apple's on-device subject detection, nothing uploaded; paints the background paper white). Then crop to head and shoulders, chin included, about 5:6 width to height (`sips -c H W --cropOffset Y X in.png --out out.png`). Look at the crop before using it. Elsewhere: ask the user for a photo on a plain background.
- Faces need a calm, front-facing photo. Three-quarter profiles and busy backgrounds do not read as the person.

Start from `templates/site/` (copy the whole folder to `site/`). Change only `config.js`, `index.html` copy and `style.css` colours. Do not edit `assemble.js`, `flight.js` or `main.js` unless the brief needs something the config cannot express; if you do, say why in REPORT.md.

Images: use only images the user owns or that carry a licence allowing reuse (for example CC BY on Wikimedia Commons). Put the credit line in `site/CREDITS.md` and in REPORT.md. Never copy another site's portraits, depth maps or code.

## 3. Self-check (do not skip)

```bash
node <this skill's folder>/scripts/check_motion.mjs site --out check --make-fallback
node <this skill's folder>/scripts/check_motion.mjs site --out check
```

The first run makes `site/assets/fallback.png` (shown when WebGL is off). The second must pass every budget:

| Check | Budget |
|---|---|
| Desktop 1440x900, p95 frame time | <= 20 ms |
| Phone 390x844 with the CPU slowed 4x, p95 frame time | <= 40 ms |
| Page weight served from the project (excluding CDN libraries) | <= 1.5 MB |
| Console errors | 0 |
| Reduced motion | finished shape shown, no motion |
| WebGL off | fallback image shown |

Then open the screenshots in `check/shots/` and look at them against every **Done when** line. A recognisable face is a judgement you make by looking, not a number.

## 4. Fix

If a budget fails: lower `points` (desktop, mobile), lower `dotSize`, shorten `scroll.length`, or crop the image tighter. Re-run the check. Never relax a budget to pass.

## 5. Deliver

`REPORT.md` in the project root: the brief, every **Done when** line with its proof (number or screenshot path), the check table, credits and the licence notice (`references/licences.md` has the template), and what you decided.

Video wanted? `bash <this skill's folder>/scripts/to_video.sh site final.mp4 --seconds 12` captures a scroll-through and finishes it with brief2mp4 when installed.

## Licences in one paragraph

This skill's code is MIT. three.js (MIT), GSAP 3.15.0 (free standard licence; AI-written GSAP code is allowed) and Lenis (MIT) load from a CDN at pinned versions. LYGIA is an optional add-on only: non-commercial unless the user sponsors or contributes (Patron License); never copy it into the page without saying so in REPORT.md. Depth maps: only Depth Anything V2 **Small** (Apache-2.0); Base and Large are non-commercial.
