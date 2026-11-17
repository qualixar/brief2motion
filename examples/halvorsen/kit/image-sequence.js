// brief2motion kit: image-sequence.js. MIT. No dependencies.
// Scrub a numbered run of pictures on a canvas as the page scrolls (the "video that follows your scroll" effect).
// Frames load coarse to fine: the first, then every 8th, 4th, 2nd, then all. Scrubbing works after a few
// frames have arrived, and it always draws the nearest frame it already has, so there is never a blank canvas.

// Pure, unit-tested. The order frames are requested in: 0, then strides 8, 4, 2, 1 without repeats.
export function loadOrder(count) {
  const seen = new Set(), order = [];
  const push = (i) => { if (i < count && !seen.has(i)) { seen.add(i); order.push(i); } };
  push(0); push(count - 1);
  for (const stride of [8, 4, 2, 1]) for (let i = 0; i < count; i += stride) push(i);
  return order;
}
// Pure, unit-tested. The loaded frame closest to `want` (ties go to the earlier one). loaded: boolean[] or Set.
export function nearestLoaded(want, loaded, count) {
  const has = (i) => (loaded instanceof Set ? loaded.has(i) : !!loaded[i]);
  for (let d = 0; d < count; d++) {
    if (want - d >= 0 && has(want - d)) return want - d;
    if (want + d < count && has(want + d)) return want + d;
  }
  return -1;
}
export const frameAt = (progress, count) => Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
// Pure. Where to draw an image of iw x ih so it covers (or fits inside) a box of cw x ch, centred.
export function fitRect(iw, ih, cw, ch, fit = 'cover') {
  const s = fit === 'cover' ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
  const w = iw * s, h = ih * s;
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

export function createSequence(canvas, { count, src, fit = 'cover', dprCap = 2, concurrency = 4 }) {
  const ctx = canvas.getContext('2d');
  const frames = new Array(count).fill(null);
  let current = -1, wanted = 0, alive = true;
  const size = () => {
    const dpr = Math.min(dprCap, devicePixelRatio || 1);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; current = -1; }
  };
  const paint = () => {
    const i = nearestLoaded(wanted, frames, count); if (i < 0 || i === current) return;
    const img = frames[i], r = fitRect(img.width, img.height, canvas.width, canvas.height, fit);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, r.x, r.y, r.w, r.h);
    current = i;
  };
  const ro = new ResizeObserver(() => { size(); paint(); }); ro.observe(canvas); size();

  const queue = loadOrder(count);
  const loadOne = async (i) => {
    const res = await fetch(src(i)); if (!res.ok) throw new Error(`frame ${i}: ${res.status}`);
    const blob = await res.blob();
    frames[i] = 'createImageBitmap' in window ? await createImageBitmap(blob) : await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(blob); });
  };
  const worker = async () => { while (alive && queue.length) { const i = queue.shift(); try { await loadOne(i); current = -1; paint(); } catch (e) { console.warn(String(e)); } } };
  const first = loadOne(queue.shift()).then(() => { paint(); });
  const all = first.then(() => Promise.all(Array.from({ length: concurrency }, worker)));

  return {
    first, all,                                             // promises: first frame on screen, every frame loaded
    draw(progress) { wanted = frameAt(progress, count); paint(); },
    get loaded() { return frames.filter(Boolean).length; },
    destroy() { alive = false; ro.disconnect(); frames.forEach((f) => f?.close?.()); },
  };
}
