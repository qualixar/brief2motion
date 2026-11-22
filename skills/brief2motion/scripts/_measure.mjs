// _measure.mjs: the arithmetic behind check_site.mjs, kept free of any browser so it can be unit-tested.

// The q-th percentile of a list of numbers (q in 0..1). An empty list gives NaN.
export function percentile(values, q) {
  const s = [...values].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : NaN;
}

// "rgb(1, 2, 3)", "rgba(1, 2, 3, 0.5)", "rgb(1 2 3 / 50%)", "#abc", "#aabbcc", "#aabbccdd", color(srgb r g b / a) -> { r, g, b, a } or null.
export function parseColor(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const ch = (v) => (v.endsWith('%') ? parseFloat(v) * 2.55 : parseFloat(v));
    const al = parts[3] === undefined ? 1 : (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]));
    const c = { r: ch(parts[0]), g: ch(parts[1]), b: ch(parts[2]), a: al };
    return Object.values(c).every(Number.isFinite) ? c : null;
  }
  m = s.match(/^color\(srgb\s+([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s/]+/).filter(Boolean);
    const c = { r: parseFloat(parts[0]) * 255, g: parseFloat(parts[1]) * 255, b: parseFloat(parts[2]) * 255, a: parts[3] === undefined ? 1 : parseFloat(parts[3]) };
    return Object.values(c).every(Number.isFinite) ? c : null;
  }
  return null;
}

// A see-through text colour over a solid background -> the solid colour the eye gets.
export function blend(fg, bg) {
  const a = fg.a ?? 1;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

// WCAG 2 relative luminance and contrast ratio (1 to 21).
export function luminance({ r, g, b }) {
  const lin = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
export function contrastRatio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// A report passes only when it has checks and every one of them passed.
export const verdict = (checks) => checks.length > 0 && checks.every((c) => c.pass === true);

// ---- geometry and file facts for the site-mode checkers (check_layout, check_meta, ...) ----

// Rects are { left, top, right, bottom } in CSS px. How far two rects overlap on each axis (0 when they do not touch).
export function overlap(a, b) {
  return { w: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), h: Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) };
}
// True when the rects overlap by more than `min` px on BOTH axes: a corner graze or a shared edge does not count.
export function overlapsBeyond(a, b, min = 1) { const o = overlap(a, b); return o.w > min && o.h > min; }
// True when `inner` lies inside `outer` (within tol px): containment is layout, not a collision.
export function contains(outer, inner, tol = 0.5) {
  return inner.left >= outer.left - tol && inner.top >= outer.top - tol && inner.right <= outer.right + tol && inner.bottom <= outer.bottom + tol;
}

// Pixel size of a PNG, JPEG, GIF or WebP file from its header bytes -> { type, w, h } or null.
export function imageSize(buf) {
  if (!buf || buf.length < 24) return null;
  if (buf.readUInt32BE(0) === 0x89504e47) return { type: 'png', w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf.toString('ascii', 0, 3) === 'GIF') return { type: 'gif', w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    for (let i = 2; i + 9 < buf.length;) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { type: 'jpeg', w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return null;
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const k = buf.toString('ascii', 12, 16);
    if (k === 'VP8X') return { type: 'webp', w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (k === 'VP8L') { const b = buf.readUInt32LE(21); return { type: 'webp', w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
    if (k === 'VP8 ') return { type: 'webp', w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

// Characters per line of a paragraph, from the per-line counts a browser measured. The last line is the short
// end of the paragraph and is left out; fewer than 3 lines gives null (too short to judge a measure).
export function typicalLineLength(counts) {
  if (!Array.isArray(counts) || counts.length < 3) return null;
  const full = counts.slice(0, -1).sort((a, b) => a - b);
  return full[Math.floor(full.length / 2)];
}
