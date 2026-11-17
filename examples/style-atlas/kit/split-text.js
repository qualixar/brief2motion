// brief2motion kit: split-text.js. MIT. No dependencies.
// Splits a heading into words, characters or lines so each piece can move on its own (kinetic type).
// Screen readers keep reading the sentence as one: the original text stays in a visually hidden span and the
// moving pieces are aria-hidden. Words never break in the middle, emoji and accented letters stay whole
// (Intl.Segmenter), and revert() puts the element back exactly as it was.

// Pure: text -> [{ word, chars: [...] }], whitespace collapsed. Unit-tested in Node.
export function segment(text, locale = 'en') {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter(locale, { granularity: 'grapheme' }) : null;
  return words.map((word) => ({ word, chars: seg ? [...seg.segment(word)].map((s) => s.segment) : [...word] }));
}

// Pure: group word boxes into lines by their top edge. tops: number[] -> number[][] (indexes per line).
export function groupLines(tops, tolerance = 2) {
  const lines = []; let lastTop = null;
  tops.forEach((top, i) => {
    if (lastTop === null || Math.abs(top - lastTop) > tolerance) { lines.push([]); lastTop = top; }
    lines[lines.length - 1].push(i);
  });
  return lines;
}

const SR = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0';

export function splitText(el, { by = 'words', locale = document.documentElement.lang || 'en' } = {}) {
  const original = el.innerHTML;
  const text = el.textContent;
  const parts = segment(text, locale);
  const sr = document.createElement('span'); sr.style.cssText = SR; sr.textContent = text.trim().replace(/\s+/g, ' ');
  const visual = document.createElement('span'); visual.setAttribute('aria-hidden', 'true');
  const words = [], chars = [];
  parts.forEach((p, i) => {
    const w = document.createElement('span'); w.className = 'word'; w.style.display = 'inline-block'; w.style.whiteSpace = 'nowrap';
    if (by === 'chars') {
      for (const c of p.chars) { const s = document.createElement('span'); s.className = 'char'; s.style.display = 'inline-block'; s.textContent = c; w.append(s); chars.push(s); }
    } else w.textContent = p.word;
    w.style.setProperty('--i', i);
    visual.append(w); words.push(w);
    if (i < parts.length - 1) visual.append(' ');
  });
  chars.forEach((c, i) => c.style.setProperty('--i', i));
  el.replaceChildren(sr, visual);

  // Lines only exist after layout, and change when the box gets narrower: call lines() again after a resize.
  const lines = () => groupLines(words.map((w) => w.offsetTop)).map((idx, n) => idx.map((i) => { words[i].style.setProperty('--line', n); return words[i]; }));
  return { words, chars, lines, revert: () => { el.innerHTML = original; } };
}
