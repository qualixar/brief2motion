# Performance rules for motion

The budgets below are what `check_site.mjs` enforces. A page that looks right on a fast laptop is not finished until it holds them on the emulated phone.

## Budgets

| What | Budget | How it is measured |
|---|---|---|
| Frame time, desktop 1440 x 900 | p95 of 20 ms or less | every frame for 2 s idle plus a 6 s scroll to the bottom |
| Frame time, emulated phone 390 x 844, touch, CPU slowed 4x | p95 of 40 ms or less | the same run |
| Project files per page | 1.5 MiB or less, desktop and phone | bytes received from your own folder |
| Third-party hosts | `cdn.jsdelivr.net` only | every request |
| Console errors | none | all runs |

The frame numbers mean something only on a machine with a real GPU. On a virtual machine or a CI runner, pass `--no-perf`. If a budget fails, make the page lighter. Never relax the budget.

## Rules that keep frames short

1. Animate `transform` and `opacity`. They are composited without layout or paint. Animating `width`, `height`, `top`, `left`, `margin`, `box-shadow` blur or `filter: blur()` on large areas costs every frame.
2. One read and one write per frame. Measuring layout (`getBoundingClientRect`, `offsetTop`) after writing a style forces the browser to lay out again. `kit/motion-core.js` `onScroll` gives every subscriber one call per frame with fresh numbers.
3. Scroll listeners are passive and do nothing but note that a frame is needed.
4. Stop what cannot be seen. Loops pause when the tab is hidden and when their element is off screen (`frameLoop` in the kit takes a `target`). Players pause off screen.
5. `will-change` only on an element that is about to move, and take it off afterwards. Promoting everything to its own layer exhausts GPU memory on phones.
6. Do not animate a blur radius or a full-screen SVG filter. Blur a picture once, then move it.
7. Springs and tweens on dozens of elements are fine; on thousands, use a canvas.

## WebGL

- Cap the pixel ratio: `Math.min(2, devicePixelRatio)`. A 3x phone draws 9 pixels for every CSS pixel otherwise.
- Size the drawing buffer from the canvas's own box with a `ResizeObserver`, not from the window.
- Light with an environment map plus one directional light. Shadow maps are expensive: a transparent disc with a radial gradient under the object reads as a contact shadow for almost nothing.
- Reuse geometries and materials; merge static meshes when there are hundreds.
- Textures: power-of-two sizes when mipmapped, no larger than they appear on screen, WebP or KTX2.
- Models: glTF with Draco or Meshopt compression; aim for under 1 MB for a hero object. `gltf-transform optimize in.glb out.glb` does most of it.
- Post-processing is a full-screen pass per effect. One or two on desktop; none on the phone tier.
- Render on demand when nothing moves: with reduced motion, and for scenes that only change with input.
- Handle `webglcontextlost` by pausing and `webglcontextrestored` by redrawing. `dispose()` geometries, materials, textures and the renderer when the scene goes away.

## Pictures and sequences

- Give every `<img>` its `width` and `height`. Use `loading="lazy"` below the fold and `srcset` with a 720 px copy for phones.
- Image sequences: WebP at quality 60 to 70, about 960 px wide, 40 to 60 frames. Load coarse to fine (`kit/image-sequence.js`), draw to a canvas, never swap `<img src>`.
- A short looping video is often smaller than a sequence, but it cannot be scrubbed smoothly on every browser. For scrubbing, use the sequence.

## Loading

- The page's text and layout must not wait for a motion library. Put scripts at the end or `defer` them; import heavy libraries with `import()` after the first paint.
- Pin every CDN version. Add an `integrity` hash to script tags for fixed files. jsDelivr's generated `+esm` bundles cannot carry one; pin the exact version and keep them to pages where a no-build ES module is the point.
- Load a player or a 3D library only when its element is near the screen.
- System font stacks: no font request at all.

## Measuring by hand

```bash
node <skill>/scripts/check_site.mjs site --out check        # everything, with screenshots
node <skill>/scripts/check_site.mjs site --no-perf          # on a machine with no GPU
node <skill>/scripts/check_site.mjs site --pages work/a.html,work/b.html
```

In Chrome's DevTools, the Performance panel with 4x CPU throttling shows the same thing the phone run measures. Long purple (layout) or green (paint) bars under an animation mean rule 1 or 2 is being broken.
