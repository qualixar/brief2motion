# Shader background

A full-screen fragment shader paints a slow, living background (noise, a gradient that drifts, contour lines) behind the content.

**Use when:** a hero or a section that wants atmosphere the brief names: "flowing", "aurora", "liquid", "gradient mesh". One per page.
**Not when:** text sits directly on it without a scrim, the page already has a 3D scene, or the brief wants calm and low power. Never as decoration on every section.
**Stack:** three.js with the kit (`three`); OGL for a lighter library (`web-references.md` section 4).
**Brief words:** shader, animated gradient, flowing background, liquid background, aurora, noise background, generative.
**Study:** `web-references.md` section 5 (Book of Shaders, Quilez articles; Shadertoy for what is possible, never copy a shader).

## Sketch

```html
<div class="bg"><canvas data-webgl aria-hidden="true"></canvas><img data-fallback src="assets/bg-still.webp" width="1600" height="900" alt=""></div>
```

```js
import * as THREE from 'three';
import { signal } from './kit/motion-core.js';
import { createStage } from './kit/three-stage.js';

const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FRAG = `
precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uRes; uniform vec3 uA; uniform vec3 uB;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() {
  vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) * 2.2; float t = uTime * 0.05;
  float n = noise(p + vec2(t, -t)) * 0.6 + noise(p * 2.0 - vec2(t * 1.3, t)) * 0.4;
  gl_FragColor = vec4(mix(uA, uB, smoothstep(0.25, 0.85, n)), 1.0);
}`;

const stage = createStage(THREE, document.querySelector('.bg canvas'), { alpha: false, toneMapping: false, dprCap: 1.5 });
if (!stage) { signal('static'); }
else {
  document.documentElement.classList.add('has-stage');
  const uniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) },
    uA: { value: new THREE.Vector3(0.09, 0.13, 0.32) }, uB: { value: new THREE.Vector3(0.62, 0.45, 0.86) } };   // sRGB numbers, used as they are
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }));
  quad.frustumCulled = false; stage.scene.add(quad);
  stage.start((dt, t) => { uniforms.uTime.value = stage.still ? 8 : t; uniforms.uRes.value.set(stage.size.w, stage.size.h); });
  signal(stage.still ? 'reduced' : 'ready');
}
```

The noise function is the common hash-and-interpolate form, written out here; study published shader courses to learn it, and write your own variants.

## Budget

One draw call, a fragment shader of two noise octaves: cheap on any GPU, but fill rate scales with pixels, so cap the pixel ratio at 1.5 (or 1 on phones). The loop stops off screen and in a hidden tab (`createStage`). Content over it sits on a scrim or a solid panel; the checker does not measure text over canvas, so look at the screenshot.

## Reduced motion

One frame at a fixed time (`stage.still`), no loop. A good still is part of the design: pick the time value with a screenshot.

## Checks

`check_site.mjs`: WebGL off (a visible `[data-fallback]`); reduced-motion run (the canvas holds still); desktop and phone p95 frame time; console errors 0 (a shader compile error shows here). By eye: the text over the background in `check/shots/` is readable on the brightest part of the noise.
