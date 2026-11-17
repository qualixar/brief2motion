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
