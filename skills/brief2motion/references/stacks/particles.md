# Canvas and WebGL particles: the dust engine

Use this when the brief says dust, dots or particles form something: a product, a logo, a face, a word. It is the one stack with a complete template: you change `config.js` and the engine does the rest.

Worked example: `examples/copper-no-7/`. Template: `templates/site/`.

## How it works

`assemble.js` turns each target (an image or a word) into a list of points, uploads them once, and draws them as one `THREE.Points` object with a custom shader. Each dot has a start position in a slow galaxy of dust and one position per shape. Two numbers drive everything: `progress` (dust to first shape, 0 to 1) and `morph` (which shape, 0 to count-1, fractional while travelling). The shader moves every dot on the GPU, so 60,000 dots cost about the same as 600.

`main.js` wires it: the page text renders first from `config.js`; three.js loads after; scroll or a timer drives `progress` and `morph`; a still image stands in when WebGL is missing or anything fails.

## What you set in `config.js`

| Setting | What it does |
|---|---|
| `assemble.targets` | up to four shapes: `{ type: 'image', src, style, mask, relief, fill }` or `{ type: 'text', text, fill }` |
| `assemble.sequence` | the order shapes appear in; repeats allowed, for example `[0, 1, 0, 2, 0]` |
| `assemble.captions` | one card per sequence step: `{ kicker, n, title, body, tint }` |
| `assemble.points` | dots per screen size: `{ desktop, mobile }` |
| `assemble.colour` | `'photo'` makes each dot take the picture's colour; leave out for one ink colour |
| `assemble.offsetX`, `offsetY` | move the shape clear of the headline on wide screens |
| `assemble.assembleOnLoad` | form the first shape on load so the first screen is never empty |
| `flight` | a paper plane or any object along an SVG path: `{ path, trigger: 'scroll' or 'time' }` |
| `scroll.length` | how long the hero stays pinned, in percent of a screen; `null` runs on a timer |
| `page` | every word on the page: nav, hero, chapters, details, call to action, footer |

## Choosing the dot style

- **Stipple** (the default): dots placed by importance sampling, denser where the picture is darker. Organic. Use for products and logos. Start at 60,000 points on desktop.
- **Halftone** (`style: 'halftone'`): dots on a hexagonal grid, sized by darkness. A printed look. Use for faces. Start at 12,000 points and leave `dotSize` unset.
- `mask: 'oval'` fades the edges of a photo so its background does not turn into dots. Use for portraits.
- Faces need a calm, front-facing photo from the shoulders up on a plain background. On macOS 14 or newer, `swift <skill>/scripts/cutout.swift in.jpg out.png` removes the background on the machine.

## Tuning

| Symptom | Change |
|---|---|
| Frame budget fails on the phone | lower `points.mobile`, then `points.desktop` |
| The shape looks thin | raise `points`, or lower `fill` so the same dots cover less area |
| The face is not recognisable | use halftone, crop tighter (about 5:6), raise contrast in the photo |
| The shape runs under the headline | `offsetX`, `offsetY`, or a smaller `fill` |
| Scroll feels long | lower `scroll.length` |

The engine never passes a budget by quietly drawing fewer dots: the checker fails a page that sheds any on desktop or more than 40% on the phone.

## Checks

This engine has its own checker beside the general one:

```bash
node <skill>/scripts/check_motion.mjs site --out check --make-fallback    # also writes assets/fallback.png
node <skill>/scripts/check_motion.mjs site --out check                    # dots drawn, fallback shown, shape survives a resize
node <skill>/scripts/check_site.mjs site --out check                      # layout, contrast, keyboard, reduced motion, weight
```

## Writing your own particles

When the brief wants particles that do something else (a field that follows the pointer, a flow, confetti), the same rules apply:

- One draw call: `THREE.Points` or an `InstancedMesh`, never one object per particle.
- Move them in the vertex shader from a time uniform and per-particle attributes. Updating positions in JavaScript every frame is fine up to a few thousand.
- Seed your random numbers so two loads look the same and a video capture is repeatable.
- A 2D canvas handles a few thousand round dots well and needs no library: `ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill()`, batched by colour.
- Keep a still image of the finished state for no-WebGL and reduced motion.

## Do not edit

`assemble.js`, `flight.js`, `main.js`, `page.js` and `validate.js` are the tested engine. `tests/run_checks.sh` fails if the example's copies differ from the template's. If the brief needs something the config cannot express, change them, and say why in `REPORT.md`.
