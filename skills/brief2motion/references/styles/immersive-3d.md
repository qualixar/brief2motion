# 3D / immersive WebGL

Family: Motion-led approaches.

A real-time 3D scene is the page: a product you can turn, a world the camera moves through, particles that form a shape.

## Signature rules

- One hero object, well lit, beats a busy scene
- Camera moves tied to scroll or pointer
- A still picture for no-WebGL and for reduced motion
- Pixel ratio capped at 2 and the loop paused off screen

## Worked example

`examples/halden-one/` is a complete site built this way, with its brief, its motion plan at the top of its script and a passing `site-report.json`. The stack reference to read is `references/stacks/three.md`.

## Motion that fits

Slow, weighty camera moves with damping. Idle motion of a few degrees keeps the scene alive.

## Accessibility

- The canvas is invisible to assistive technology: the same content must exist as text
- Large rotations and zooms should become cuts for reduced motion
- Give controls a keyboard path (a slider, buttons)

## Choose it for

- Product launches, hardware, automotive, games, portfolios of 3D work

## Avoid it for

- Content pages, slow devices, anything that must load in a second

## Sources

- <https://github.com/mrdoob/three.js>
- <https://web.dev/articles/vitals>

Facts checked on 2026-11-17.
