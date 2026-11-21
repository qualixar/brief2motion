// _html.mjs: just enough HTML reading for the static checks (check_meta, check_plan). Not a parser: it finds tags and
// their attributes in the markup a page ships, which is all those checks need. No browser, no dependencies.

const stripComments = (html) => String(html).replace(/<!--[\s\S]*?-->/g, '');

// name="value", name='value', name=value, or a bare name -> { name: value }. Names are lower-cased.
export function attrs(raw) {
  const out = {};
  for (const m of String(raw).matchAll(/([^\s=/<>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    const k = m[1].toLowerCase();
    if (!(k in out)) out[k] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return out;
}

// Every <name ...> start tag in the markup -> [{ raw, attrs }].
export function tags(html, name) {
  const out = [];
  for (const m of stripComments(html).matchAll(new RegExp(`<${name}(?=[\\s/>])([^>]*)>`, 'gi'))) {
    const raw = m[1].replace(/\/$/, '');
    out.push({ raw, attrs: attrs(raw) });
  }
  return out;
}

// The text inside the first <name>...</name>, tags removed, spaces folded.
export function textOf(html, name) {
  const m = stripComments(html).match(new RegExp(`<${name}(?=[\\s>])[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
}

// The content of <meta name=... | property=...> by its name or property.
export function metaContent(html, key) {
  const hit = tags(html, 'meta').find((t) => (t.attrs.name || t.attrs.property || '').toLowerCase() === key.toLowerCase());
  return hit ? (hit.attrs.content ?? '') : null;
}

// Every href of every <a> in the markup, in order.
export const hrefs = (html) => tags(html, 'a').map((t) => t.attrs.href).filter((h) => typeof h === 'string');

// The visible words of a page: scripts, styles and tags removed.
export function visibleText(html) {
  return stripComments(html).replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
