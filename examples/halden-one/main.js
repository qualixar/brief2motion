// Halden One: a product turntable in three.js (MIT), no model file. About forty shapes are built in code,
// lit by a generated studio environment, and posed by the scroll position.
// Motion plan:
//   idle    the radio sways a few degrees so the enamel catches the light
//   scroll  four poses (hero, dial close-up, exploded view, colours), eased from one to the next; a caption per pose
//   input   drag or use the slider to turn it; the colour buttons repaint the shell
// Reduced motion: no sway, no easing between poses. The radio cuts from pose to pose as the chapters change.
// No WebGL, or the CDN is blocked: the still picture and four plain blocks of text.
import { signal, reducedMotion, hasWebGL, scrollScene, clamp, lerp, damp, slice, ease } from './kit/motion-core.js';
import { createStage } from './kit/three-stage.js';

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const sceneEl = $('.scene'), canvas = $('.stage canvas');
const POSTER = new URLSearchParams(location.search).has('poster');   // ?poster: the radio alone, centred, for making assets/poster.webp

// pose k: camera yaw and pitch (radians), distance, where it looks, how far the parts are pulled apart, antenna length
const POSES = [
  { yaw: -0.48, pitch: 0.13, dist: 10.6, tx: 0.0, ty: 0.15, tz: 0, explode: 0, antenna: 0.25, shift: 0.2 },
  { yaw: 0.36, pitch: 0.06, dist: 6.2, tx: 0.72, ty: -0.2, tz: 0.6, explode: 0, antenna: 0.25, shift: 0.27 },
  { yaw: -0.98, pitch: 0.2, dist: 17.5, tx: 0.0, ty: 0.25, tz: -0.2, explode: 1, antenna: 1, shift: 0.19 },
  { yaw: -0.3, pitch: 0.1, dist: 10.2, tx: 0.0, ty: 0.15, tz: 0, explode: 0, antenna: 0.6, shift: 0.2 },
];
const STOPS = [0, 0.31, 0.64, 0.96];                 // scroll progress at which each pose is fully reached
const CAPTION = [[-0.1, 0.16], [0.24, 0.42], [0.52, 0.76], [0.86, 1.1]];   // each caption is fully shown inside its range

function poseAt(p, snap) {
  let k = 0; while (k < STOPS.length - 2 && p > STOPS[k + 1]) k++;
  let t = clamp((p - STOPS[k]) / (STOPS[k + 1] - STOPS[k]));
  if (snap) t = t < 0.5 ? 0 : 1;                      // reduced motion: cut, do not travel
  // hold each pose for a while, then travel: flat at both ends
  const e = ease.inOutCubic(clamp((t - 0.18) / 0.64));
  const a = POSES[k], b = POSES[k + 1], out = {};
  for (const key of Object.keys(a)) out[key] = lerp(a[key], b[key], e);
  return out;
}

async function build() {
  const THREE = await import('three');
  const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
  const stage = createStage(THREE, canvas, { fov: 28, far: 80 });
  if (!stage) throw new Error('WebGL renderer could not start');
  const { scene, camera, renderer } = stage;

  // light: a generated room, blurred into an environment map. No HDR file to download.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture; pmrem.dispose();
  scene.environmentIntensity = 0.95;
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 6, 7); scene.add(key);

  const enamel = new THREE.MeshPhysicalMaterial({ color: '#1d44c4', roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const brass = new THREE.MeshStandardMaterial({ color: '#b8935a', roughness: 0.32, metalness: 1 });
  const bone = new THREE.MeshStandardMaterial({ color: '#ebe4d3', roughness: 0.85 });
  const dark = new THREE.MeshStandardMaterial({ color: '#1b1d21', roughness: 0.6 });
  const leather = new THREE.MeshStandardMaterial({ color: '#7a4a2a', roughness: 0.75 });
  const mesh = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const facing = (geo) => geo.rotateX(Math.PI / 2);   // cylinders are built upright; turn them to face the front

  // textures drawn on a 2D canvas at load: the grille holes and the printed tuning scale
  const drawn = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const grilleMap = drawn(512, 512, (g, w) => {
    g.fillStyle = '#ebe4d3'; g.fillRect(0, 0, w, w); g.fillStyle = '#2a2622';
    const n = 23, step = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + 0.5 + (j % 2) * 0.5) * step, y = (j + 0.5) * step, d = Math.hypot(x - w / 2, y - w / 2);
      if (d < w * 0.46) { g.beginPath(); g.arc(x, y, step * 0.26, 0, 7); g.fill(); }
    }
  });
  const scaleMap = drawn(1024, 160, (g, w, h) => {
    g.fillStyle = '#f3eee2'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1d21'; g.strokeStyle = '#1b1d21';
    g.font = '600 34px Futura, "Century Gothic", sans-serif'; g.textAlign = 'center';
    for (let i = 0; i <= 40; i++) {
      const x = 50 + i * (w - 100) / 40, major = i % 4 === 0;
      g.lineWidth = major ? 4 : 2; g.beginPath(); g.moveTo(x, h - 16); g.lineTo(x, h - (major ? 62 : 40)); g.stroke();
      if (major) g.fillText(String(88 + i / 2), x, 56);
    }
  });

  // ---- the radio: groups that the exploded view pulls apart along the depth axis ----
  const radio = new THREE.Group(); scene.add(radio);
  const parts = {};                                   // name -> { group, dz, dy }: where it goes when exploded
  const part = (name, dz = 0, dy = 0) => { const g = new THREE.Group(); radio.add(g); parts[name] = { g, dz, dy }; return g; };

  const shell = part('shell', 0);
  mesh(new RoundedBoxGeometry(3.2, 2.0, 1.2, 6, 0.22), enamel, shell);
  for (const [x, z] of [[-1.25, 0.4], [1.25, 0.4], [-1.25, -0.4], [1.25, -0.4]]) mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.1, 24), dark, shell, x, -1.04, z);

  const face = part('face', 1.75);
  mesh(facing(new THREE.CylinderGeometry(0.8, 0.8, 0.05, 64)), new THREE.MeshStandardMaterial({ map: grilleMap, bumpMap: grilleMap, bumpScale: 1.5, roughness: 0.9 }), face, -0.68, 0.02, 0.61).rotation.z = 0;
  mesh(new THREE.TorusGeometry(0.82, 0.035, 16, 96), brass, face, -0.68, 0.02, 0.63);
  mesh(new THREE.BoxGeometry(1.42, 0.3, 0.04), new THREE.MeshStandardMaterial({ map: scaleMap, roughness: 0.6 }), face, 0.72, 0.55, 0.605);
  mesh(new THREE.BoxGeometry(1.48, 0.36, 0.03), brass, face, 0.72, 0.55, 0.595);
  mesh(new THREE.BoxGeometry(1.42, 0.3, 0.015), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 1, thickness: 0.05, transparent: true, opacity: 0.35 }), face, 0.72, 0.55, 0.64);
  const needle = mesh(new THREE.BoxGeometry(0.022, 0.26, 0.012), new THREE.MeshStandardMaterial({ color: '#d1311c', roughness: 0.5 }), face, 0.4, 0.55, 0.632);

  const knobs = part('knobs', 2.45);
  const knob = (r, x, y) => {
    const g = new THREE.Group(); g.position.set(x, y, 0.61); knobs.add(g);
    mesh(facing(new THREE.CylinderGeometry(r, r * 1.06, 0.26, 56)), brass, g, 0, 0, 0.13);
    mesh(new THREE.BoxGeometry(0.03, r * 0.7, 0.02), dark, g, 0, r * 0.55, 0.265);
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; const rib = mesh(new THREE.BoxGeometry(0.022, 0.03, 0.2), brass, g, Math.cos(a) * r * 1.02, Math.sin(a) * r * 1.02, 0.12); rib.rotation.z = a; }
    return g;
  };
  const tune = knob(0.36, 0.98, -0.3), volume = knob(0.2, 0.3, -0.42);

  const cone = part('cone', 0.95);
  mesh(facing(new THREE.CylinderGeometry(0.72, 0.2, 0.34, 48, 1, true)), new THREE.MeshStandardMaterial({ color: '#cdbf9f', roughness: 0.95, side: THREE.DoubleSide }), cone, -0.68, 0.02, 0.2);
  mesh(facing(new THREE.CylinderGeometry(0.26, 0.26, 0.3, 32)), dark, cone, -0.68, 0.02, -0.05);

  const board = part('board', -1.15);
  mesh(new THREE.BoxGeometry(2.5, 1.5, 0.05), new THREE.MeshStandardMaterial({ color: '#a8792c', roughness: 0.55 }), board, 0, 0, -0.1);
  for (const [x, y, w, h] of [[-0.7, 0.3, 0.5, 0.4], [0.2, 0.35, 0.34, 0.34], [0.8, -0.2, 0.6, 0.26], [-0.3, -0.35, 0.3, 0.22], [0.75, 0.42, 0.22, 0.22]]) mesh(new THREE.BoxGeometry(w, h, 0.12), dark, board, x, y, -0.02);
  for (const x of [-1.0, -0.86, -0.72]) mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 20), brass, board, x, -0.4, 0);

  const cells = part('cells', -1.9);
  mesh(new RoundedBoxGeometry(2.3, 0.72, 0.36, 3, 0.06), dark, cells, 0, -0.45, -0.25);
  for (let i = 0; i < 4; i++) { const c = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 24), brass, cells, -0.84 + i * 0.56, -0.45, -0.12); c.rotation.z = Math.PI / 2; }

  const back = part('back', -2.6);
  mesh(new RoundedBoxGeometry(3.0, 1.8, 0.06, 3, 0.03), dark, back, 0, 0, -0.6);
  for (const [x, y] of [[-1.35, 0.78], [1.35, 0.78], [-1.35, -0.78], [1.35, -0.78]]) mesh(facing(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16)), brass, back, x, y, -0.64);

  const top = part('top', 0, 0.75);
  const strap = mesh(new THREE.TorusGeometry(0.95, 0.045, 10, 48, Math.PI), leather, top, 0, 0.92, 0); strap.scale.set(1, 0.42, 2.2);
  for (const x of [-0.95, 0.95]) mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 20), brass, top, x, 1.0, 0);
  const antenna = new THREE.Group(); antenna.position.set(1.32, 1.0, -0.4); antenna.rotation.z = -0.5; top.add(antenna);
  const segs = [0.03, 0.022, 0.015].map((r, i) => mesh(new THREE.CylinderGeometry(r, r, 1, 12).translate(0, 0.5, 0), brass, antenna, 0, i * 0.02, 0));

  // a soft contact shadow: one transparent disc with a radial gradient, no shadow maps
  const shadowMap = drawn(256, 256, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, 'rgba(20,25,35,.55)'); r.addColorStop(1, 'rgba(20,25,35,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const shadow = mesh(new THREE.PlaneGeometry(6.4, 3.4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false }), scene, 0, -1.1, 0);

  // hotspots: where each label points, in the radio's own space
  const spots = { cone: [cone, -0.68, 0.72, 0.2], board: [board, -1.0, 0.75, -0.1], cells: [cells, -1.0, -0.82, -0.25], shell: [shell, 1.5, 1.0, 0.3] };
  const spotEls = Object.fromEntries($$('.hotspots li').map((li) => [li.dataset.spot, li]));
  const v = new THREE.Vector3();

  return { stage, THREE, radio, parts, needle, tune, volume, segs, shadow, enamel, spots, spotEls, v, camera };
}

async function start() {
  if (!hasWebGL('webgl2') && !hasWebGL('webgl')) { signal('static'); return; }
  let R;
  try { R = await build(); } catch (err) { console.warn('3D did not start; showing the still picture.', err); signal('static'); return; }
  const { stage, THREE, parts, camera } = R;
  const still = reducedMotion();
  document.documentElement.classList.add('has-stage'); if (POSTER) document.documentElement.classList.add('poster-mode');

  // in-page links such as #inside point at markers placed along the tall scene, not at the pinned captions
  const chapters = $$('.chapter');
  chapters.forEach((ch, i) => {
    if (!ch.id) return;
    const a = Object.assign(document.createElement('span'), { className: 'anchor', id: ch.id }); ch.removeAttribute('id');
    a.style.top = `calc(${(CAPTION[i][0] + CAPTION[i][1]) / 2} * (100% - 100vh))`; sceneEl.append(a);
  });

  let progress = 0, userYaw = 0, userYawTarget = 0, shown = { explode: 0, antenna: 0.25 }, pose = poseAt(0, still);
  const colour = { from: new THREE.Color('#1d44c4'), to: new THREE.Color('#1d44c4'), t: 1 };

  const layout = () => {                                // keep the product clear of the caption: right on wide screens, up on narrow ones
    const { w, h } = stage.size; if (!w) return;
    if (POSTER) camera.clearViewOffset();
    else if (w > 820) camera.setViewOffset(w, h, -w * pose.shift, 0, w, h); else camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    camera.fov = w > 820 ? 28 : 46; camera.updateProjectionMatrix();
  };

  const frame = (dt, t) => {
    layout();
    const target = poseAt(progress, still);
    const k = still ? 1 : 1 - Math.exp(-7 * dt);      // ease toward the scroll pose so a fast flick still glides
    for (const key of Object.keys(target)) pose[key] = lerp(pose[key], target[key], k);
    userYaw = still ? userYawTarget : damp(userYaw, userYawTarget, 9, dt);
    const sway = still ? 0 : Math.sin(t * 0.6) * 0.07 * (1 - pose.explode);
    const yaw = pose.yaw + userYaw + sway, r = pose.dist;
    camera.position.set(pose.tx + Math.sin(yaw) * Math.cos(pose.pitch) * r, pose.ty + Math.sin(pose.pitch) * r, pose.tz + Math.cos(yaw) * Math.cos(pose.pitch) * r);
    camera.lookAt(pose.tx, pose.ty, pose.tz);
    for (const { g, dz, dy } of Object.values(parts)) { g.position.z = (dz || 0) * pose.explode; g.position.y = (dy || 0) * pose.explode; }
    R.segs.forEach((s, i) => { s.scale.y = 0.35 + pose.antenna * 0.9; s.position.y = i * (0.3 + pose.antenna * 0.85); });
    R.shadow.material.opacity = 1 - pose.explode * 0.75;
    // the needle and the tuning knob move together: a slow sweep across the band, tied to the scroll so it is repeatable
    const station = 0.5 + 0.42 * Math.sin(progress * 9 + (still ? 0 : t * 0.25));
    R.needle.position.x = 0.72 + (station - 0.5) * 1.26; R.tune.rotation.z = -station * 4.2; R.volume.rotation.z = -0.6;
    if (colour.t < 1) { colour.t = still ? 1 : Math.min(1, colour.t + dt / 0.45); R.enamel.color.copy(colour.from).lerp(colour.to, ease.inOutCubic(colour.t)); }
    // labels follow their parts
    const { w, h } = stage.size;
    for (const [name, [group, x, y, z]] of Object.entries(R.spots)) {
      R.v.set(x, y, z); group.localToWorld(R.v); R.v.project(camera);
      R.spotEls[name].style.setProperty('--x', `${((R.v.x + 1) / 2 * w).toFixed(1)}px`);
      R.spotEls[name].style.setProperty('--y', `${((1 - R.v.y) / 2 * h).toFixed(1)}px`);
      R.spotEls[name].classList.toggle('flip', (R.v.x + 1) / 2 * w > w - 190);   // near the right edge the label sits to the left of its dot
    }
  };

  const captions = (p) => {
    chapters.forEach((ch, i) => {
      const [a, b] = CAPTION[i];
      const o = still ? (p >= (i === 0 ? -1 : (CAPTION[i - 1][1] + a) / 2) && p < (i === 3 ? 2 : (b + CAPTION[i + 1][0]) / 2) ? 1 : 0)
        : Math.min(slice(p, a - 0.07, a), 1 - slice(p, b, b + 0.07));
      ch.style.setProperty('--o', o.toFixed(3)); ch.classList.toggle('is-live', o > 0.02);
    });
    $('.hotspots').style.setProperty('--spots', (still ? (p > 0.47 && p < 0.81 ? 1 : 0) : Math.min(slice(p, 0.56, 0.62), 1 - slice(p, 0.74, 0.8))).toFixed(3));
  };
  let lastChapter = -1;
  scrollScene(sceneEl, (p) => {
    progress = p; captions(p);
    if (still) { const c = chapters.findIndex((ch) => ch.classList.contains('is-live')); if (c !== lastChapter) { lastChapter = c; stage.invalidate(); } }
  });

  // input: drag to turn (horizontal only, so a vertical swipe still scrolls the page), or the slider
  const slider = $('.turn input');
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, yaw: userYawTarget }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!drag) return; userYawTarget = clamp(drag.yaw - (e.clientX - drag.x) * 0.008, -Math.PI, Math.PI); slider.value = String(Math.round(-userYawTarget * 180 / Math.PI)); if (still) stage.invalidate(); });
  for (const type of ['pointerup', 'pointercancel']) canvas.addEventListener(type, () => { drag = null; });
  slider.addEventListener('input', () => { userYawTarget = -Number(slider.value) * Math.PI / 180; if (still) stage.invalidate(); });
  for (const b of $$('.swatches button')) b.addEventListener('click', () => {
    $$('.swatches button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    colour.from.copy(R.enamel.color); colour.to.set(b.dataset.colour); colour.t = 0;
    document.documentElement.style.setProperty('--enamel', b.dataset.colour === '#e9e2d2' ? '#14171c' : b.dataset.colour);
    if (still) stage.invalidate();
  });

  stage.start(frame);
  window.__halden = { stage, pose: () => pose };       // for the poster capture and debugging
  signal(still ? 'reduced' : 'ready');
}
start();
