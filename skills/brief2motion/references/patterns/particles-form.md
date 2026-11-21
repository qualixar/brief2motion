# Dust that forms a picture

Dots or dust drift in and assemble into a product, logo, face or word, then burst apart and re-form into the next shape as the page scrolls.

**Use when:** the brief wants particles, dust, dots, halftone or stipple that become something.
**Not when:** nothing needs to be formed (use a simple background), or a still image does the job. It is a heavy effect: one per page.
**Stack:** the built-in dust engine, config only (`particles`): copy `templates/site/` and edit `config.js`, never the engine.
**Brief words:** dust, particles that form, halftone portrait, stipple, made of dots, dissolves into particles.
**Study:** `stacks/particles.md`; `examples/copper-no-7/`; `web-references.md` section 5 for shader ideas, if the brief wants something the engine cannot do.

## Sketch

Edit only `config.js`, the title and description in `index.html`, and the colours in `style.css`:

```js
export const cfg = {
  colors: { paper: '#f4efe6', 'paper-2': '#fffaf2', ink: '#1d1b18', accent: '#9a4408' },
  assemble: {
    targets: [{ type: 'image', src: 'assets/product.webp', fill: 0.84 }, { type: 'text', text: 'No. 7', fill: 0.6 }],
    sequence: [0, 1, 0],                       // the order the shapes appear in; repeats are allowed
    points: { desktop: 60000, mobile: 25000 }, // lower them if the frame-time check fails
    seconds: 3.2,
  },
  scroll: { length: 250 },                     // how long the hero stays pinned, in % of a screen
};
```

## Budget

Dots: 60,000 on desktop and 25,000 on phones is the tested default for stipple; halftone faces start at 12,000. Frame time is the constraint: p95 20 ms desktop, 40 ms on the emulated phone. The engine never passes a budget by quietly drawing fewer dots: the checker fails a page that sheds any on desktop or more than 40% on the phone. A still picture (`assets/fallback.png`) stands in when WebGL is missing. Shape images are 512 px wide; a chapter image 1200 px wide with a 720 px `srcset`.

## Reduced motion

The finished state is shown still (the engine keeps a still image of the formed shape for this and for no WebGL); the page scrolls normally and nothing travels.

## Checks

This is the one pattern `check_motion.mjs` covers: run `check_motion.mjs site --out check --make-fallback` once to write the still picture, then `check_motion.mjs site --out check`. It checks desktop and phone frame time, the WebGL-off fallback, reduced motion holding still, page weight and console errors. Then run `check_site.mjs` for the general budgets. By eye: the screenshot of the formed shape is recognisable, not noise.
