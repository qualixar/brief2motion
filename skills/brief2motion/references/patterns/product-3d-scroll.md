# 3D product that turns as you scroll

A real 3D object sits in a pinned scene and changes pose as the reader scrolls: turns, tilts, moves aside to make room for a caption.

**Use when:** hardware, a physical product, an object whose shape is the selling point, with a model (`.glb`) from the user.
**Not when:** there is no model and no time to make one (draw it in SVG or use an image sequence), or the page must run well on weak phones with no fallback.
**Stack:** three.js with the kit (`three`); React Three Fiber and drei in a React project with a bundler (`r3f`).
**Brief words:** 3D product, turntable, rotate the model, product viewer, exploded view, 3D scroll, spin as I scroll.
**Study:** `web-references.md` section 4 (three.js examples, drei, glTF Transform, Poly Haven for lighting); `stacks/three.md`; `examples/halden-one/`.

## Sketch

```html
<section class="scene">                      <!-- height: 300vh; the stage inside is position: sticky -->
  <div class="stage">
    <canvas data-webgl aria-hidden="true"></canvas>
    <img data-fallback src="assets/poster.webp" width="1600" height="1000" alt="The radio, front on, in cobalt blue">
  </div>
</section>
```

```js
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { signal, scrollScene, slice, ease, lerp, damp } from './kit/motion-core.js';
import { createStage } from './kit/three-stage.js';

const stage = createStage(THREE, document.querySelector('canvas[data-webgl]'));
if (!stage) { signal('static'); }                                  // no WebGL: the poster <img> stays
else {
  document.documentElement.classList.add('has-stage');             // CSS hides the poster now
  stage.scene.environment = new THREE.PMREMGenerator(stage.renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const product = new THREE.Mesh(new THREE.TorusKnotGeometry(0.6, 0.22, 160, 24),   // stands in for the user's glTF model
    new THREE.MeshStandardMaterial({ color: 0x2b4cff, roughness: 0.35, metalness: 0.2 }));
  stage.scene.add(product);
  stage.camera.position.set(0, 0, 4);

  let target = 0, shown = 0;
  scrollScene(document.querySelector('.scene'), (p) => { target = p; if (stage.still) { shown = p; stage.invalidate(); } });
  stage.start((dt) => {                                            // reduced motion: runs once per invalidate, no loop
    shown = damp(shown, target, 6, dt);                            // glide toward the scroll position, same feel at any frame rate
    product.rotation.y = lerp(-0.6, 2.4, ease.inOutCubic(shown));
    product.position.x = lerp(0, 0.9, slice(shown, 0.55, 1));
  });
  signal(stage.still ? 'reduced' : 'ready');
}
```

`createStage` caps the pixel ratio at 2, sizes from the canvas box, stops the loop off screen and when the tab is hidden, recovers from context loss and disposes properly. Load a model with `GLTFLoader` from `three/addons/loaders/GLTFLoader.js`; compress it first (`stacks/three.md`).

## Budget

Model under 1 MB (Draco or Meshopt); one environment map plus one directional light, no shadow maps (a gradient disc under the object reads as a contact shadow); no more than one or two post-processing passes, none on phones. The `<img data-fallback>` is mandatory. Phone p95 frame time 40 ms or less: lower `dprCap` to 1.5 on narrow screens if it fails.
Accessibility: the canvas is `aria-hidden` and the captions are real text beside it; hotspots, if any, are buttons.

## Reduced motion

One still frame; scroll changes the pose in cuts (each `invalidate` renders once), never a glide. The `still` flag from the stage drives this.

## Checks

`check_site.mjs`: WebGL off (headline readable and a `[data-fallback]` visible); reduced-motion run; phone p95 40 ms or less on a real GPU (pass `--no-perf` on a machine without one); console errors 0; page weight (the model counts). By eye: the poster and the first rendered frame show the same object.
