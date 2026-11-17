# three.js and React Three Fiber

Use this when the brief wants a real 3D object or scene: a product to turn, parts that come apart, a camera that travels, a shader. three.js (MIT) is the engine. React Three Fiber and drei (MIT) are the same engine written as React components, for React projects.

Worked example: `examples/halden-one/` (a product turntable built in code, four scroll poses, an exploded view, colourways, a still-picture fallback). Test pages that prove the patterns below run: `tests/fixtures/three-pipeline/` (a .glb through GLTFLoader, a ShaderMaterial, a bloom pass) and `tests/fixtures/r3f/` (React Three Fiber with drei).

## Loading (no build step)

```html
<script type="importmap">
  { "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.min.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/"
  } }
</script>
```

Import three inside `try` with `import()` after the page text is on screen. If it fails, show the still picture and call `signal('static')`.

## The stage

`kit/three-stage.js` does the parts that are the same every time: a renderer that returns `null` when WebGL is missing, a pixel-ratio cap of 2, sizing from the canvas's own box, a loop that stops when hidden or off screen, one held frame for reduced motion, context-loss recovery and `destroy()`.

```html
<div class="stage">
  <canvas data-webgl aria-hidden="true"></canvas>
  <img class="poster" data-fallback src="assets/poster.webp" width="1600" height="1000" alt="What the 3D shows, in words.">
</div>
```

```js
import { signal, hasWebGL, reducedMotion } from './kit/motion-core.js';
import { createStage } from './kit/three-stage.js';

async function start() {
  if (!hasWebGL()) { signal('static'); return; }
  let THREE, stage;
  try {
    THREE = await import('three');
    stage = createStage(THREE, canvas, { fov: 28 });
    if (!stage) throw new Error('no renderer');
    await buildScene(THREE, stage);
  } catch (err) { console.warn(err); signal('static'); return; }
  document.documentElement.classList.add('has-stage');     // CSS swaps the poster for the canvas
  stage.start((dt, t) => { /* move things; the stage renders after this */ });
  signal(stage.still ? 'reduced' : 'ready');
}
```

With reduced motion the stage draws once. After you change something in response to input, call `stage.invalidate()`.

## Light without files

```js
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture; pmrem.dispose();
scene.add(new THREE.DirectionalLight(0xffffff, 1.6));        // one key light for shape
```

A generated room gives metal and enamel something to reflect, with nothing to download. For a specific look, load one small HDR (about 1k) with `RGBELoader` or `UltraHDRLoader`.

Materials that read as real: `MeshPhysicalMaterial` with `clearcoat: 1` for enamel and car paint, `metalness: 1, roughness: .3` for brass or steel, `transmission: 1` with a small `thickness` for glass, `MeshStandardMaterial` with `roughness: .85` for fabric and plastic.

A contact shadow for almost nothing: a plane under the object with a radial-gradient `CanvasTexture`, `transparent: true, depthWrite: false`.

## A model in code, or a model file

`examples/halden-one` builds its radio from about forty primitives (`RoundedBoxGeometry`, cylinders, a torus) and draws its two textures on a 2D canvas. That keeps the page tiny and needs no asset. Do this when the object is simple and geometric.

For a real model, use glTF:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
const loader = new GLTFLoader();
const draco = new DRACOLoader(); draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/libs/draco/'); loader.setDRACOLoader(draco);
const { scene: model } = await loader.loadAsync('assets/product.glb');
```

Only take a model the user owns or one with a licence that allows reuse, and credit it in `CREDITS.md`. Shrink it first: `npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress webp`. A hero object should be under about 1 MB. If you only need to show a model with orbit controls and nothing else, Google's `<model-viewer>` element (Apache-2.0) does it in one tag.

## Scroll poses

Describe each pose as plain numbers (camera angle, distance, target, how far parts are pulled apart), give each a scroll position, and interpolate. Holding each pose for a while before travelling reads better than constant movement.

```js
const POSES = [{ yaw: -0.48, pitch: 0.13, dist: 10.6, explode: 0 }, { yaw: 0.36, pitch: 0.06, dist: 6.2, explode: 0 }, { yaw: -0.98, pitch: 0.2, dist: 17.5, explode: 1 }];
const STOPS = [0, 0.31, 0.64];
function poseAt(p, snap) {
  let k = 0; while (k < STOPS.length - 2 && p > STOPS[k + 1]) k++;
  let t = clamp((p - STOPS[k]) / (STOPS[k + 1] - STOPS[k]));
  if (snap) t = t < 0.5 ? 0 : 1;                                  // reduced motion: cut, do not travel
  const e = ease.inOutCubic(clamp((t - 0.18) / 0.64));             // hold, travel, hold
  return Object.fromEntries(Object.keys(POSES[k]).map((key) => [key, lerp(POSES[k][key], POSES[k + 1][key], e)]));
}
scrollScene(sceneEl, (p) => { progress = p; });                    // kit/motion-core.js
// in the frame callback: ease the live pose toward poseAt(progress) with damp(), then place the camera
```

Exploded view: put each part in its own `Group` with an offset, and set `group.position.z = offset * pose.explode`.

Labels that follow parts: project a point to the screen each frame and move an HTML element there.

```js
v.set(x, y, z); group.localToWorld(v); v.project(camera);
label.style.setProperty('--x', `${(v.x + 1) / 2 * width}px`); label.style.setProperty('--y', `${(1 - v.y) / 2 * height}px`);
```

Keep the product clear of the text with `camera.setViewOffset(w, h, -w * 0.2, 0, w, h)`: it moves the picture sideways without changing the perspective.

## Input

Drag to turn: `pointerdown`, `pointermove`, `pointerup` on the canvas, with `touch-action: pan-y` so a vertical swipe still scrolls the page. Always add a keyboard path: `examples/halden-one` has a range slider that does the same thing. `OrbitControls` (addons) is fine for a free viewer; set `enableZoom = false` so the wheel keeps scrolling the page.

## Shaders and post-processing

```js
const material = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#33c9ff') } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform float uTime; uniform vec3 uColor; varying vec2 vUv; void main() { float s = smoothstep(.45, .55, fract(vUv.y * 8. + uTime * .2)); gl_FragColor = vec4(uColor * (.25 + 2.2 * s), 1.); }',
});
```

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.5, 0.85));   // strength, radius, threshold
composer.addPass(new OutputPass());                                                // tone mapping and colour conversion, once, last
// in the loop: composer.render() instead of renderer.render(scene, camera)
```

Each pass is a full-screen draw. One or two on desktop, none on the phone tier. The `postprocessing` package from pmndrs (Zlib licence) merges several effects into one pass and is worth it when you need more than two; it is not used in the examples here. Use `THREE.Timer` for time: `THREE.Clock` is deprecated in r187.

## React Three Fiber and drei

In a React or Next.js project (`npm i three @react-three/fiber @react-three/drei`), the same scene is components. This is the component the R3F test page runs:

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, ContactShadows, PresentationControls } from '@react-three/drei';

function Product({ still }) {
  const group = useRef();
  useFrame((state, dt) => { if (!still) group.current.rotation.y += dt * 0.4; });   // mutate in useFrame; never setState per frame
  return (
    <group ref={group}>
      <RoundedBox args={[1.6, 1, 0.6]} radius={0.12} smoothness={4}>
        <meshPhysicalMaterial color="#1d44c4" roughness={0.25} clearcoat={1} />
      </RoundedBox>
    </group>
  );
}

export default function Stage() {
  const still = useReducedMotion();          // from motion/react, or your own matchMedia hook
  return (
    <Canvas dpr={[1, 2]} frameloop={still ? 'demand' : 'always'} camera={{ position: [0, 0.6, 4.2], fov: 32 }}>
      <ambientLight intensity={0.9} /><directionalLight position={[3, 5, 4]} intensity={2.2} />
      <PresentationControls global polar={[-0.2, 0.3]} azimuth={[-1, 1]}><Product still={still} /></PresentationControls>
      <ContactShadows position={[0, -0.62, 0]} opacity={0.45} scale={6} blur={2.4} far={2} />
    </Canvas>
  );
}
```

- `dpr={[1, 2]}` is the pixel-ratio cap; `frameloop="demand"` renders only when something changes (call `invalidate()`).
- drei has the helpers you would otherwise write: `useGLTF`, `Environment`, `ScrollControls` with `useScroll`, `Html` for labels, `Float`, `Center`. `npx gltfjsx model.glb` turns a model into a component.
- In Next.js the file needs `"use client"`, and the canvas is usually loaded with `next/dynamic` and `ssr: false`, with the poster image as the loading state.
- React Three Fiber needs the project's bundler. Its renderer must match the installed React version exactly, which a bundler resolves from `package.json` and a CDN import map does not. The test page pins React 19.3.0 for that reason.

## WebGPU

three.js ships a WebGPU renderer (`three/webgpu`) with a node-based shading language. It is the direction the library is going, and browser support is still uneven. The examples here use WebGL 2, which runs everywhere the checker runs. If a brief asks for WebGPU, keep a WebGL path.

## Rules

- A still picture for no-WebGL, and the same content as text. The canvas is invisible to assistive technology.
- Pixel ratio capped at 2. Loop paused off screen. One frame held for reduced motion.
- Frame-rate independent movement: multiply by `dt`, or use `damp()`.
- Dispose what you create.
- `performance.md` has the WebGL budget rules.
