// _probes.mjs: functions that run INSIDE the page (page.evaluate), shared by check_site.mjs and the site-mode checkers.
// Each one is self-contained: Playwright sends its source text to the browser, so it may not call anything defined
// outside it. They return plain data; the arithmetic on that data lives in _measure.mjs where it is unit-tested.

// runs in the page: layout facts at the current scroll position
export const LAYOUT_PROBE = () => {
  const vw = document.documentElement.clientWidth;
  const over = document.documentElement.scrollWidth - vw;
  const offenders = [];
  if (over > 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed') {
        let clipped = false;
        for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) { const o = getComputedStyle(n).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { clipped = true; break; } }
        if (!clipped) offenders.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''} right=${Math.round(r.right)}`);
      }
      if (offenders.length >= 4) break;
    }
  }
  return { vw, over, offenders };
};

export const TAP_PROBE = (min) => {
  const small = [];
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])')) {
    const cs = getComputedStyle(el);
    let r = el.getBoundingClientRect();
    if (/^(radio|checkbox)$/.test(el.type) && el.labels?.length) r = el.labels[0].getBoundingClientRect();   // the label takes the click, so its box is the target
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
    if (el.classList.contains('skip-link')) continue;                       // off screen until focused
    if (el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, figcaption, small, dd, td')) continue;   // links inside a sentence are exempt (WCAG 2.5.8)
    if (Math.min(r.width, r.height) < min - 0.5) small.push(`${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  return small;
};

// Text that is cut off. Every run of visible text is measured against each ancestor that clips (overflow hidden or clip):
// if less than 90% of a line of text is left inside, it is clipped. Scrollers (overflow auto or scroll) are not clipping.
// Elements marked data-allow-clip (a marquee, say) are skipped. Ellipsis truncation is reported on its own, as `truncated`.
export const CLIP_PROBE = () => {
  const clipped = [], truncated = [], seen = new Set();
  const name = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`;
  const rootW = document.documentElement.clientWidth;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (!el || seen.has(el)) continue;
    if (el.closest('[aria-hidden="true"], noscript, script, style, svg, .sr-only, .skip-link, [data-allow-clip]')) continue;
    const dt = el.closest('details');
    if (dt && !dt.open && !el.closest('summary')) continue;   // the body of a closed disclosure is not shown
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    seen.add(el);
    const range = document.createRange(); range.selectNodeContents(n);
    for (const fr of range.getClientRects()) {
      if (fr.width <= 1 || fr.height <= 1) continue;
      let l = fr.left, r = fr.right, t = fr.top, b = fr.bottom;
      for (let a = el; a; a = a.parentElement) {
        const s = getComputedStyle(a), root = a === document.body || a === document.documentElement;
        const cx = s.overflowX === 'hidden' || s.overflowX === 'clip', cy = !root && (s.overflowY === 'hidden' || s.overflowY === 'clip');
        const ar = a.getBoundingClientRect();
        if (cx) { l = Math.max(l, root ? 0 : ar.left + a.clientLeft); r = Math.min(r, root ? rootW : ar.left + a.clientLeft + a.clientWidth); }
        if (cy) { t = Math.max(t, ar.top + a.clientTop); b = Math.min(b, ar.top + a.clientTop + a.clientHeight); }
      }
      const kept = Math.max(0, r - l) * Math.max(0, b - t), whole = fr.width * fr.height;
      if (kept < whole * 0.9) { clipped.push(`${name(el)} ${Math.round((1 - kept / whole) * 100)}% cut off`); break; }
    }
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) truncated.push(name(el));
  }
  return { clipped: clipped.slice(0, 12), truncated: truncated.slice(0, 12) };
};

// Text and actions that collide. Boxes: each line of visible text (its height limited to its line-height, so tightly set
// headlines do not collide with themselves) and each link, button and form control. Fixed and sticky elements are left out
// (a sticky bar is judged by the focus check); so are inline SVG text, data-layer elements (layering on purpose) and
// pairs where one box sits inside the other (an icon in a button, a link in a sentence). Overlap must exceed `min` px
// on both axes. Returns the first pairs, with what each one is.
export const OVERLAP_PROBE = (min) => {
  const items = [];
  const name = (el) => `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24)}"`;
  const skip = (el) => {
    if (el.closest('[aria-hidden="true"], noscript, script, style, svg, .sr-only, .skip-link, [data-layer]')) return true;
    const dt = el.closest('details');
    if (dt && !dt.open && !el.closest('summary')) return true;   // the body of a closed disclosure is not shown
    for (let a = el; a; a = a.parentElement) { const p = getComputedStyle(a).position; if (p === 'fixed' || p === 'sticky') return true; }
    const cs = getComputedStyle(el);
    return cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.05;
  };
  const sx = scrollX, sy = scrollY;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (!el || skip(el)) continue;
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    const range = document.createRange(); range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width <= 1 || r.height <= 1) continue;
      const h = Number.isFinite(lh) && lh < r.height ? lh : r.height, top = r.top + (r.height - h) / 2;
      items.push({ el, kind: 'text', left: r.left + sx, right: r.right + sx, top: top + sy, bottom: top + h + sy });
    }
  }
  for (const el of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button]')) {
    if (skip(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) items.push({ el, kind: 'action', left: r.left + sx, right: r.right + sx, top: r.top + sy, bottom: r.bottom + sy });
  }
  items.sort((a, b) => a.top - b.top);
  const hits = [];
  for (let i = 0; i < items.length && hits.length < 8; i++) {
    for (let j = i + 1; j < items.length && items[j].top < items[i].bottom - min; j++) {
      const a = items[i], b = items[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w <= min || h <= min) continue;
      const inside = (o, p) => p.left >= o.left - 0.5 && p.right <= o.right + 0.5 && p.top >= o.top - 0.5 && p.bottom <= o.bottom + 0.5;
      if (inside(a, b) || inside(b, a)) continue;
      const [na, nb] = [name(a.el), name(b.el)], key = [na, nb].sort().join('|');
      if (!hits.some((x) => x.key === key)) hits.push({ key, kinds: `${a.kind}/${b.kind}`, a: na, b: nb, w: Math.round(w), h: Math.round(h) });
    }
  }
  return hits;
};

// Prose lines: for each paragraph (not in nav, header, footer, captions or tables) the number of characters on each
// rendered line, found by walking the characters and noting where the line changes. Capped at 900 characters a paragraph.
// `narrow` is true for text inside a grid or a row of columns (a card's text), which is exempt from the short end of the band.
export const MEASURE_PROBE = () => {
  const out = [];
  for (const el of document.querySelectorAll('main p, main li, main blockquote, article p, p')) {
    if (el.closest('nav, header, footer, figcaption, table, button, [aria-hidden="true"], [data-measure-skip], .sr-only')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.closest('details:not([open])')) continue;   // the body of a closed disclosure is not shown
    if (out.some((o) => o.el === el)) continue;
    const counts = []; let lineTop = null, count = 0, seen = 0;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    outer: for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      for (let i = 0; i < n.nodeValue.length; i++) {
        if (++seen > 900) break outer;
        const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
        const rect = r.getClientRects()[0];
        if (!rect || rect.width === 0) { count++; continue; }
        if (lineTop === null) lineTop = rect.top;
        else if (rect.top - lineTop > rect.height * 0.6) { counts.push(count); count = 0; lineTop = rect.top; }
        count++;
      }
    }
    if (count) counts.push(count);
    const name = `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)}"`;
    // text in a card grid or a row of columns is deliberately narrow: the short end of the band does not apply to it
    let narrow = false;
    for (let a = el.parentElement, d = 0; a && a !== document.body && d < 4 && !narrow; a = a.parentElement, d++) {
      const s = getComputedStyle(a);
      narrow = (s.display === 'grid' && s.gridTemplateColumns.trim().split(/\s+/).length > 1) || (s.display === 'flex' && s.flexDirection.startsWith('row') && a.children.length > 1 && s.flexWrap !== 'wrap');
    }
    out.push({ el, name, counts, narrow, width: Math.round(el.getBoundingClientRect().width), font: parseFloat(cs.fontSize) });
  }
  return out.map(({ el, ...rest }) => rest);
};

// Where keyboard focus is and whether anything is painted over it. Five points inside the focused element (centre and
// four inner corners, kept inside the screen) are hit-tested; a point belongs to the element when the thing on top is
// the element, one of its descendants, or one of its ancestors (a label wrapping a control).
export const FOCUS_PROBE = () => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
  const idx = [...document.querySelectorAll('*')].indexOf(el);   // lets the caller notice when Tab has wrapped round
  const label = `${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''} "${(el.textContent || el.getAttribute('aria-label') || el.getAttribute('value') || '').trim().replace(/\s+/g, ' ').slice(0, 24)}"`;
  const l = Math.max(0, r.left), rt = Math.min(vw, r.right), t = Math.max(0, r.top), b = Math.min(vh, r.bottom);
  if (rt - l < 1 || b - t < 1) return { idx, label, onScreen: false, samples: 0, covered: 0, by: null };
  const w = rt - l, h = b - t;
  const pts = [[0.5, 0.5], [0.15, 0.2], [0.85, 0.2], [0.15, 0.8], [0.85, 0.8]].map(([fx, fy]) => [l + w * fx, t + h * fy]);
  let covered = 0, by = null;
  for (const [x, y] of pts) {
    const top = document.elementFromPoint(x, y);
    if (!top || top === el || el.contains(top) || top.contains(el)) continue;
    covered++;
    if (!by) { let pos = ''; for (let a = top; a; a = a.parentElement) { const p = getComputedStyle(a).position; if (p === 'fixed' || p === 'sticky') { pos = ` (${p})`; break; } } by = `${top.tagName.toLowerCase()}${top.classList[0] ? '.' + top.classList[0] : ''}${pos}`; }
  }
  return { idx, label, onScreen: true, samples: pts.length, covered, by };
};
