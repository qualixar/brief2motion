// brief2motion: assemble. Particles drift as dust, then form a target shape (image or text).
// Our own code. MIT. three.js r187 (WebGL2). Light theme: ink dots on paper, normal blending.
import * as THREE from 'three';

const TAU = Math.PI * 2;

// Seeded random so every run of the same brief looks identical (testable, recordable).
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((ok, fail) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => ok(img);
      img.onerror = () => fail(new Error(`image failed to load: ${src}`));
      img.src = src;
    }));
  }
  return imageCache.get(src);
}

// Draw the target into a small canvas and return per-pixel weights (darkness x opacity + edges).
function rasterise(draw, long = 420) {
  const c = document.createElement('canvas');
  const { w, h } = draw.size(long);
  c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  draw.paint(g, w, h);
  const px = g.getImageData(0, 0, w, h).data;
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
  }
  // Background = median of the border pixels. Ink goes where the image differs from its own background,
  // so dark subjects on light paper AND light subjects on dark photos both work.
  const border = [];
  for (let x = 0; x < w; x++) border.push(lum[x], lum[(h - 1) * w + x]);
  for (let y = 0; y < h; y++) border.push(lum[y * w], lum[y * w + w - 1]);
  border.sort((a, b) => a - b);
  const bg = border[border.length >> 1];
  // auto-levels on the subject only: stretch its own tones to 0..1 so skin, beard, eyes and
  // glasses separate even in low-contrast photos (the background is left out of the stats)
  const subj = [];
  for (let i = 0; i < w * h; i++) if (Math.abs(lum[i] - bg) > 0.06) subj.push(lum[i]);
  subj.sort((p, q) => p - q);
  const lo = subj.length ? subj[Math.floor(subj.length * 0.03)] : 0;
  const hi = subj.length ? subj[Math.floor(subj.length * 0.97)] : 1;
  const span = Math.max(0.05, hi - lo);
  const level = (v) => Math.min(1, Math.max(0, (v - lo) / span));
  // tone: how much ink this pixel deserves (0..1). Portraits read as stipple: darker = more, bigger dots.
  const tone = new Float32Array(w * h);
  const weight = new Float32Array(w * h);
  const oval = draw.mask === 'oval';
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = lum[i + 1] - lum[i - 1];
      const gy = lum[i + w] - lum[i - w];
      const edge = Math.min(1, Math.hypot(gx, gy) * 4);
      const lv = level(lum[i]);
      const ink = bg > 0.5 ? 1 - lv : lv;                  // ink on the dark side of the background
      const contrast = Math.abs(lum[i] - bg);
      let m = 1;
      if (oval) {
        const dx = (x / w - 0.5) / 0.5, dy = (y / h - 0.5) / 0.5;
        m = 1 - Math.min(1, Math.max(0, (Math.hypot(dx, dy) - 0.78) / 0.22));
      }
      const t = Math.min(1, Math.pow(ink, 1.25) * 0.85 + edge * 0.45) * (contrast < 0.04 && edge < 0.05 ? 0 : 1) * m;
      tone[i] = t;
      weight[i] = contrast < 0.04 && edge < 0.05 ? 0 : (0.12 + Math.pow(Math.min(t, 0.7), draw.gamma ?? 1.1));
    }
  }
  const rgb = new Float32Array(w * h * 3);
  for (let i = 0; i < w * h; i++) { rgb[i * 3] = px[i * 4] / 255; rgb[i * 3 + 1] = px[i * 4 + 1] / 255; rgb[i * 3 + 2] = px[i * 4 + 2] / 255; }
  return { w, h, lum, tone, weight, rgb };
}

const imageDraw = (img, mask, gamma) => ({
  mask, gamma,
  size: (long) => {
    const k = long / Math.max(img.width, img.height);
    return { w: Math.round(img.width * k), h: Math.round(img.height * k) };
  },
  paint: (g, w, h) => g.drawImage(img, 0, 0, w, h),
});

const textDraw = (text, font) => ({
  size: (long) => ({ w: long, h: Math.round(long * 0.32) }),
  paint: (g, w, h) => {
    g.fillStyle = '#000';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    let size = h * 0.8;
    g.font = `800 ${size}px ${font}`;
    while (g.measureText(text).width > w * 0.92 && size > 8) {
      size -= 2; g.font = `800 ${size}px ${font}`;
    }
    g.fillText(text, w / 2, h / 2);
  },
});

// Importance-sample N points from the weight map. Depth (0..1, near = 1) pushes points toward the viewer.
function samplePoints(r, n, rand, depth, worldH, relief) {
  const { w, h, weight, lum, tone } = r;
  const cdf = new Float32Array(w * h);
  let acc = 0;
  for (let i = 0; i < w * h; i++) { acc += weight[i]; cdf[i] = acc; }
  if (acc === 0) throw new Error('target is empty: nothing dark enough to sample');
  const out = new Float32Array(n * 3);
  const tones = new Float32Array(n);
  const cols = new Float32Array(n * 3);
  const scale = worldH / h;
  for (let k = 0; k < n; k++) {
    const t = rand() * acc;
    let lo = 0, hi = cdf.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < t) lo = m + 1; else hi = m; }
    const x = lo % w, y = (lo / w) | 0;
    const d = depth ? depth(x / w, y / h) : 1 - lum[lo];
    out[k * 3] = (x + rand() - 0.5 - w / 2) * scale;
    out[k * 3 + 1] = -(y + rand() - 0.5 - h / 2) * scale;
    out[k * 3 + 2] = (d - 0.5) * relief * worldH + (rand() - 0.5) * scale;
    tones[k] = tone[lo];
    cols.set(r.rgb.subarray(lo * 3, lo * 3 + 3), k * 3);
  }
  return { pos: out, tone: tones, col: cols };
}

// Halftone: dots on a hexagonal grid, one per cell, dot size from the tone under it.
// Gives clean, evenly spaced circles (print look). Unused points get tone -1 and vanish on arrival.
function halftonePoints(r, n, rand, depth, worldH, relief) {
  const { w, h, tone, lum } = r;
  const cells = n * 0.92;
  const s = Math.sqrt((w * h) / (cells * 0.866));
  const rowH = s * 0.866;
  const kept = [];
  for (let row = 0, y = rowH / 2; y < h; row++, y += rowH) {
    for (let x = (row % 2 ? s : s / 2); x < w; x += s) {
      const i = (y | 0) * w + (x | 0);
      if (tone[i] > (r.cut ?? 0.12)) kept.push([x, y, i]);
    }
  }
  if (!kept.length) throw new Error('halftone target is empty: the image has no dark enough areas. Use a photo with more contrast, or drop style: "halftone".');
  const out = new Float32Array(n * 3);
  const tones = new Float32Array(n);
  const cols = new Float32Array(n * 3);
  const scale = worldH / h;
  for (let k = 0; k < n; k++) {
    if (k < kept.length) {
      const [x, y, i] = kept[k];
      const d = depth ? depth(x / w, y / h) : 1 - lum[i];
      out[k * 3] = (x - w / 2) * scale;
      out[k * 3 + 1] = -(y - h / 2) * scale;
      out[k * 3 + 2] = (d - 0.5) * relief * worldH;
      tones[k] = tone[i];
      cols.set(r.rgb.subarray(i * 3, i * 3 + 3), k * 3);
    } else {
      const [x, y] = kept[(rand() * kept.length) | 0];
      out[k * 3] = (x - w / 2) * scale;
      out[k * 3 + 1] = -(y - h / 2) * scale;
      tones[k] = -1;
    }
  }
  // shuffle so a shorter draw range (fps budget) still covers the whole picture
  for (let k = n - 1; k > 0; k--) {
    const j = (rand() * (k + 1)) | 0;
    for (let c = 0; c < 3; c++) { const t = out[k * 3 + c]; out[k * 3 + c] = out[j * 3 + c]; out[j * 3 + c] = t; }
    const t = tones[k]; tones[k] = tones[j]; tones[j] = t;
    for (let c = 0; c < 3; c++) { const q = cols[k * 3 + c]; cols[k * 3 + c] = cols[j * 3 + c]; cols[j * 3 + c] = q; }
  }
  return { pos: out, tone: tones, col: cols, spacing: s * scale };   // grid spacing in world units
}

// Trim to the subject: centre the points and scale them so the subject (not the photo's empty
// margins) fills the frame. A small product on a big white photo becomes a large product.
function fitToFrame(t, height) {
  const p = t.pos;
  // robust box: ignore the outer 1.5% of dots each side, so stray background specks
  // (JPEG noise) cannot stretch the box to the whole photo
  const xs = [], ys = [];
  for (let i = 0; i < p.length; i += 3) {
    if (t.tone && t.tone[i / 3] < 0) continue;            // hidden padding dots do not count
    xs.push(p[i]); ys.push(p[i + 1]);
  }
  xs.sort((u, v) => u - v); ys.sort((u, v) => u - v);
  const q = (arr, f) => arr[Math.min(arr.length - 1, Math.max(0, Math.floor(arr.length * f)))];
  const x0 = q(xs, 0.015), x1 = q(xs, 0.985), y0 = q(ys, 0.015), y1 = q(ys, 0.985);
  // fit inside a frame as tall as `height` and 1.5x as wide, so a wide wordmark and a tall bottle
  // both fill the same frame instead of the wide one shrinking everything
  const k = Math.min(height / Math.max(1e-6, y1 - y0), (height * 1.5) / Math.max(1e-6, x1 - x0));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  for (let i = 0; i < p.length; i += 3) { p[i] = (p[i] - cx) * k; p[i + 1] = (p[i + 1] - cy) * k; p[i + 2] *= k; }
  if (t.spacing) t.spacing *= k;
  return t;
}

async function depthSampler(src) {
  if (!src) return null;
  const img = await loadImage(src);
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  return (u, v) => d[((Math.min(c.height - 1, (v * c.height) | 0) * c.width) + Math.min(c.width - 1, (u * c.width) | 0)) * 4] / 255;
}

export async function buildTarget(spec, n, rand, worldH) {
  if (spec.type === 'text') {
    const r = rasterise(textDraw(spec.text, spec.font || 'system-ui, sans-serif'));
    return fitToFrame(samplePoints(r, n, rand, null, worldH * 0.42, 0.04), worldH * (spec.fill ?? 0.84));
  }
  const img = await loadImage(spec.src);
  const r = rasterise(imageDraw(img, spec.mask, spec.gamma), spec.detail ?? 420);
  const depth = await depthSampler(spec.depth);
  const fn = spec.style === 'halftone' ? halftonePoints : samplePoints;
  return fitToFrame(fn(r, n, rand, depth, worldH, spec.relief ?? 0.18), worldH * (spec.fill ?? 0.84));
}

// The opening dust: a slowly turning spiral galaxy, dense at the core, thin at the arms.
function scatterCloud(n, rand, R) {
  const out = new Float32Array(n * 3);
  const arms = 3;
  for (let k = 0; k < n; k++) {
    const r = R * Math.pow(rand(), 0.6);
    const arm = (k % arms) * (TAU / arms);
    const th = arm + r * 2.4 + (rand() - 0.5) * (0.9 - r / R * 0.5);
    out[k * 3] = r * Math.cos(th) * 1.25;
    out[k * 3 + 1] = r * Math.sin(th) * 0.75;
    out[k * 3 + 2] = (rand() - 0.5) * 0.5 * (1 - r / R);
  }
  return out;
}

const vertex = /* glsl */`
  uniform float uProgress, uTime, uSize, uPixelRatio, uFrom, uTo, uMix;
  attribute vec3 aScatter, aTarget0, aTarget1, aTarget2, aTarget3;
  attribute float aSeed;
  attribute vec4 aCol0, aCol1, aCol2, aCol3;   // rgb = photo colour, a = tone (packed: WebGL allows ~16 attributes)
  vec3 tPos(float i) { return i < 0.5 ? aTarget0 : i < 1.5 ? aTarget1 : i < 2.5 ? aTarget2 : aTarget3; }
  vec4 tCT(float i) { return i < 0.5 ? aCol0 : i < 1.5 ? aCol1 : i < 2.5 ? aCol2 : aCol3; }
  float tTone(float i) { return tCT(i).a; }
  vec3 tCol(float i) { return tCT(i).rgb; }
  uniform vec3 uInk;
  uniform float uColour;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vTone;
  vec3 swirl(vec3 p, float t, float s) {
    return vec3(sin(p.y * 1.7 + t * 0.6 + s * 6.2),
                cos(p.x * 1.3 - t * 0.5 + s * 3.1),
                sin(p.x * 0.9 + p.y * 1.1 + t * 0.4));
  }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
  float backOut(float x) { float c = 1.9; x -= 1.0; return 1.0 + (c + 1.0) * x * x * x + c * x * x; }
  void main() {
    // 1. galaxy turns while it waits
    vec3 dust = aScatter;
    dust.xy = rot(uTime * 0.12 * (1.2 - length(aScatter.xy) * 0.25)) * dust.xy;
    // 2. staggered arrival, spiralling in, overshooting slightly, then settling (the drama)
    float delay = aSeed * 0.4;
    float p = clamp((uProgress - delay) / 0.6, 0.0, 1.0);
    float e = backOut(p);
    // a sequence step: from target uFrom to target uTo, uMix 0..1 (staggered per dot so they stream)
    float m = smoothstep(aSeed * 0.25, 0.75 + aSeed * 0.25, uMix);
    vec3 target = mix(tPos(uFrom), tPos(uTo), m);
    // 3. between two targets the dots burst outward and fall back in
    float burst = uFrom == uTo ? 0.0 : sin(3.14159 * m);
    target += normalize(target + vec3(0.0001)) * burst * (0.9 + aSeed * 1.4);
    target.xy = rot(burst * (aSeed - 0.5) * 1.6) * target.xy;
    vec3 pos = mix(dust, target, e);
    pos.xy = rot((1.0 - p) * (1.0 - p) * (2.6 + aSeed * 2.0)) * pos.xy;
    float drift = (1.0 - p) * 0.35 + 0.008 + burst * 0.15;
    pos += swirl(pos, uTime, aSeed) * drift;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // 4. stipple: darker tone = bigger dot once assembled; dust dots are small and even
    vTone = mix(tTone(uFrom), tTone(uTo), m);
    // colour mode: each dot takes the photo's colour, darkened and saturated so it reads on paper;
    // dust stays ink and the colour blooms in as the shape forms
    vec3 photo = mix(tCol(uFrom), tCol(uTo), m);
    float g = dot(photo, vec3(0.299, 0.587, 0.114));
    photo = clamp(mix(vec3(g), photo, 1.75), 0.0, 1.0);
    // keep the hue, compress lightness into a range that always reads on paper
    float g2 = max(dot(photo, vec3(0.299, 0.587, 0.114)), 0.02);
    photo = clamp(photo * (mix(0.05, 0.40, g2) / g2), 0.0, 1.0);
    vColor = mix(uInk, photo, uColour * smoothstep(0.55, 1.0, p));
    float settled = vTone < 0.0 ? 0.0 : 0.22 + sqrt(vTone) * 0.95;
    float sizeK = mix(0.5 + aSeed * 0.35, settled, p);
    gl_PointSize = uSize * uPixelRatio * sizeK * (6.0 / -mv.z);
    vAlpha = mix(0.7, 1.0, p);
  }`;

const fragment = /* glsl */`
  varying float vAlpha;
  varying float vTone;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    // crisp round dot: a hard edge with ~1px of antialiasing
    float edge = fwidth(d);
    float a = 1.0 - smoothstep(0.5 - edge * 1.5, 0.5, d);
    gl_FragColor = vec4(vColor, vAlpha * a);
  }`;


// Per-dot buffers: scatter cloud, one position + colour/tone attribute per target, a seed per dot.
function buildGeometry(targets, n, rand, worldH) {
  const geo = new THREE.BufferGeometry();
  const seeds = new Float32Array(n);
  for (let i = 0; i < n; i++) seeds[i] = rand();
  geo.setAttribute('position', new THREE.BufferAttribute(targets[0].pos, 3));
  geo.setAttribute('aScatter', new THREE.BufferAttribute(scatterCloud(n, rand, worldH * 0.75), 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  targets.forEach((t, k) => {
    geo.setAttribute(`aTarget${k}`, new THREE.BufferAttribute(t.pos, 3));
    const ct = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) {
      ct[i * 4] = t.col ? t.col[i * 3] : 0.1; ct[i * 4 + 1] = t.col ? t.col[i * 3 + 1] : 0.1; ct[i * 4 + 2] = t.col ? t.col[i * 3 + 2] : 0.1;
      ct[i * 4 + 3] = t.tone[i];
    }
    geo.setAttribute(`aCol${k}`, new THREE.BufferAttribute(ct, 4));
  });
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), worldH * 3);
  return geo;
}

// The frame loop. It draws only while the canvas is on screen, and it sheds dots only when the GPU
// is genuinely slow (never for a steady 30 fps cap). Shed dots come back after a clean stretch.
function createLoop({ draw, geo, n, budget, motion }) {
  const { stats } = motion;
  let raf = 0, running = false, last = 0, skip = true, live = n, clean = 0, restoredOnce = false, blocked = false;
  const setLive = (k) => {
    live = k; geo.setDrawRange(0, k); stats.drawn = k; stats.minDrawn = Math.min(stats.minDrawn, k); stats.times.length = 0;
  };
  const adapt = () => {
    if (stats.times.length < 60) return;
    const sorted = [...stats.times].sort((a, b) => a - b);
    const med = sorted[sorted.length >> 1], p95 = sorted[Math.floor(sorted.length * 0.95)];
    const capped = Math.abs(med - 33.3) < 4 && p95 - med < 4;   // steady ~33 ms = 30 fps cap, not a slow GPU
    if (p95 > budget && !capped && live > n * 0.2) {
      if (restoredOnce) blocked = true;                          // shedding again after a restore: stay shed
      setLive(Math.floor(live * 0.7)); stats.shed++; clean = 0;
    } else if (p95 <= budget * 0.9 && live < n && !blocked) {
      if (++clean >= 6) { setLive(Math.min(n, Math.ceil(live / 0.7))); stats.restored++; restoredOnce = true; clean = 0; }
    } else clean = 0;
  };
  const frame = (now) => {
    const dt = now - last; last = now;
    stats.frames++;
    if (skip) skip = false;                                      // the first interval after a pause is not a frame time
    else { stats.times.push(dt); if (stats.times.length > 240) stats.times.shift(); }
    if (stats.frames % 90 === 0 && motion.clock == null) adapt();
    draw(now / 1000);
  };
  const loop = (now) => { raf = 0; if (!running) return; frame(now); raf = requestAnimationFrame(loop); };
  return {
    start() { if (running) return; running = true; skip = true; last = performance.now(); raf = requestAnimationFrame(loop); },
    stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

// Create the scene. Returns a controller the scroll/time driver sets progress on.
export async function createAssemble(canvas, cfg) {
  const mobile = matchMedia('(max-width: 760px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const n = mobile ? cfg.points.mobile : cfg.points.desktop;
  const rand = rng(cfg.seed ?? 7);
  const worldH = 3.2;
  // Up to 4 distinct shapes. `sequence` lists which shape shows at each step, and shapes may repeat,
  // e.g. [0, 1, 0, 2, 0] = shape 1 pours into shape 0, then shape 2 pours into shape 0 again.
  const specs = cfg.targets.slice(0, 4);
  specs.forEach((t) => { if (t.type === 'image') loadImage(t.src).catch(() => {}); });   // start every download now
  const targets = [];
  for (const t of specs) targets.push(await buildTarget(t, n, rand, worldH));   // built in order, so a seed always gives the same dots
  const sequence = (cfg.sequence && cfg.sequence.length ? cfg.sequence : targets.map((_, i) => i)).filter((i) => i < targets.length);
  const count = sequence.length;                     // the driver morphs from step 0 to count - 1
  while (targets.length < 4) targets.push(targets[targets.length - 1]);
  const geo = buildGeometry(targets, n, rand, worldH);

  const uniforms = {
    uProgress: { value: reduced ? 1 : 0 }, uMorph: { value: 0 }, uTime: { value: 0 },
    uFrom: { value: sequence[0] }, uTo: { value: sequence[0] }, uMix: { value: 0 },
    uSize: { value: cfg.dotSize ?? (mobile ? 2.4 : 1.8) },
    uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
    uInk: { value: new THREE.Color(cfg.ink) },
    uColour: { value: cfg.colour === 'photo' ? 1 : 0 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: vertex, fragmentShader: fragment, uniforms,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
  });
  const points = new THREE.Points(geo, mat);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(uniforms.uPixelRatio.value);
  const scene = new THREE.Scene();
  scene.add(points);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  // the largest width and height any target needs (targets are already centred by fitToFrame)
  let needW = 0, needH = 0;
  for (const t of targets) for (let i = 0; i < t.pos.length; i += 3) {
    needW = Math.max(needW, Math.abs(t.pos[i]) * 2); needH = Math.max(needH, Math.abs(t.pos[i + 1]) * 2);
  }
  // halftone: the biggest dot should just touch its neighbours at any screen size,
  // so dot size is computed from the grid spacing instead of a fixed number
  const spacing = Math.min(...targets.map((t) => t.spacing ?? Infinity));

  const stats = { frames: 0, times: [], drawn: n, minDrawn: n, total: n, mode: reduced ? 'reduced-motion' : 'webgl2', shed: 0, restored: 0 };
  const motion = { stats, uniforms, points, camera, sequence, clock: null };   // exposed for check_motion, capture and debugging
  // `clock` (seconds) replaces the real time when set, so a capture can step the scene frame by frame
  const draw = (t) => {
    const tt = motion.clock ?? t;
    uniforms.uTime.value = tt;
    const pr = uniforms.uProgress.value;
    camera.position.z = 7.4 - 1.6 * pr * pr * (3 - 2 * pr);   // camera pushes in as the shape forms
    points.rotation.y = Math.sin(tt / 4) * 0.14 * pr;          // a slow turn shows the depth relief
    renderer.render(scene, camera);
  };
  motion.renderOnce = () => draw(performance.now() / 1000);
  // the finished first shape, frozen at clock 0: used to make the no-WebGL fallback picture
  motion.showFinished = () => {
    motion.clock = 0; uniforms.uProgress.value = 1; uniforms.uMix.value = 0; uniforms.uMorph.value = 0;
    uniforms.uFrom.value = sequence[0]; uniforms.uTo.value = sequence[0];
    motion.renderOnce();
  };

  let W = 0, H = 0;
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === W && h === H) return;                   // setSize clears the canvas, so only touch it when the size changed
    W = w; H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * 5.8 * Math.tan((camera.fov * Math.PI) / 360), visW = visH * camera.aspect;
    // offsetX / offsetY: push the subject sideways / up (shares of the visible width / height) so it sits beside the
    // headline on wide screens, and shrink it so it still fits on screen after the push. On narrow screens it stays
    // centred in the upper half, smaller, clear of the headline.
    const wide = camera.aspect > 1.15;
    const offX = wide ? (cfg.offsetX ?? 0) * visW : 0, offY = wide ? (cfg.offsetY ?? 0) * visH : 0;
    const fit = Math.min(1, (visW * 0.46 - Math.abs(offX)) / (needW / 2), (visH * 0.48 - Math.abs(offY)) / (needH / 2));
    points.scale.setScalar(fit);
    points.position.x = offX;
    if (!wide) { points.scale.setScalar(fit * 0.6); points.position.y = visH * 0.2; } else { points.position.y = offY; }
    if (!Number.isFinite(spacing) && cfg.dotSize == null && !mobile) {
      // stipple: size dots from screen height and point count, so every screen gets the same solid coverage
      uniforms.uSize.value = (1.4 * h) / Math.sqrt(n) * (wide ? 1 : 0.8);
    }
    if (Number.isFinite(spacing) && cfg.dotSize == null) {
      const pxPerWorld = h / visH;
      uniforms.uSize.value = (spacing * fit * pxPerWorld) / 1.17;   // 1.17 = largest dot factor at tone 1
    }
    motion.renderOnce();                               // a resized canvas is blank until redrawn (matters when the loop is stopped)
  };
  resize();
  addEventListener('resize', resize);

  const loop = createLoop({ draw, geo, n, budget: mobile ? 40 : 20, motion });
  const io = new IntersectionObserver((entries) => {   // no drawing while the canvas is scrolled out of view
    if (reduced) return;
    entries[entries.length - 1].isIntersecting ? loop.start() : loop.stop();
  });
  io.observe(canvas);

  motion.destroy = () => {
    loop.stop(); io.disconnect(); removeEventListener('resize', resize);
    geo.dispose(); mat.dispose(); renderer.dispose(); renderer.forceContextLoss();
  };
  window.__motion = motion;

  let lastStep = -1, lastMoving = false;
  return {
    set progress(v) { uniforms.uProgress.value = v; },
    set morph(v) {   // v runs 0..count-1 along the sequence
      uniforms.uMorph.value = v;
      const k = Math.max(0, Math.min(count - 1, Math.floor(v)));
      const nxt = Math.min(count - 1, k + 1);
      uniforms.uFrom.value = sequence[k]; uniforms.uTo.value = sequence[nxt]; uniforms.uMix.value = nxt === k ? 0 : v - k;
      const step = Math.round(v), moving = v > 0.06;   // tell the page only when the step changes (captions listen)
      if (step !== lastStep || moving !== lastMoving) {
        lastStep = step; lastMoving = moving;
        window.dispatchEvent(new CustomEvent('b2m-step', { detail: { step, of: count, v, moving } }));
      }
    },
    stats,
    count,
    destroy: motion.destroy,
  };
}
