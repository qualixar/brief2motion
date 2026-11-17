#!/usr/bin/env node
// route.mjs: read a brief, suggest the motion stack and the visual style, and say why.
//   node route.mjs BRIEF.md            a short report
//   node route.mjs BRIEF.md --json     the same as JSON
//   echo "make my logo out of dust" | node route.mjs -
// It is a keyword scorer over references/routing.json and references/styles.json, not a judge: it never sees the
// product. Treat the answer as a first proposal, check it against the brief, and write the final choice and the
// reason in SPEC.md. The brief's own words always win: if it names a library, a style or colours, use those.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REF = path.resolve(HERE, '..', 'references');
const load = (f) => JSON.parse(fs.readFileSync(path.join(REF, f), 'utf8'));

const rx = (src) => new RegExp(src, 'gi');
// every distinct phrase a pattern matches in the text, lower-cased and trimmed to something quotable
function hits(text, src) {
  const out = new Set();
  for (const m of text.matchAll(rx(src))) out.add(m[0].toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 48));
  return [...out];
}
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function route(brief, { routing = load('routing.json'), styles = load('styles.json') } = {}) {
  const text = String(brief || '').replace(/[’‘]/g, "'");
  // "it still reads without WebGL" is a fallback requirement, not a request for 3D: such phrases are not evidence for a stack
  const stackText = text.replace(/\b(without|with no|no|when|if|where)\s+(webgl|javascript|js|3d)(\s+(is|are))?(\s+(off|disabled|missing|unavailable|blocked))?/gi, ' ');
  const framework = routing.frameworks.find((f) => f.signals.some((s) => rx(s).test(text)))?.id || 'unknown';

  // ---- stack ----
  const scored = routing.stacks.map((s, order) => {
    const matched = []; let score = 0;
    for (const [src, weight] of s.signals) { const h = hits(stackText, src); if (h.length) { score += weight; matched.push(...h); } }
    // a stack that needs React is only eligible when the brief says React; a no-build stack loses a little when it does
    if (s.requires === 'react' && framework !== 'react') score = 0;
    return { id: s.id, name: s.name, score, matched: [...new Set(matched)], order, ref: s.ref, example: s.example, template: s.template, why: s.why };
  }).sort((a, b) => b.score - a.score || a.order - b.order);
  let primary = scored[0];
  // "something should move" with no stronger signal is not evidence for any library: the default is the plain kit
  const vanilla = scored.find((s) => s.id === 'vanilla');
  if (!primary.score || (primary.score <= 2 && primary.id !== 'vanilla')) primary = { ...vanilla, score: vanilla.score, matched: vanilla.matched };
  // In a React project, 3D and interface motion belong in React's own tools rather than beside them.
  if (framework === 'react') {
    const swap = { three: 'r3f', motion: 'motion-react' }[primary.id];
    const to = swap && scored.find((s) => s.id === swap);
    if (to && to.score > 0) primary = { ...to, matched: [...new Set([...primary.matched, ...to.matched])] };
  }
  const alsoStacks = scored.filter((s) => s.id !== primary.id && s.score >= 4 && s.score >= primary.score * 0.5).slice(0, 2);
  const supporting = routing.supporting.map((s) => ({ id: s.id, ref: s.ref, why: s.why, matched: s.signals.flatMap((src) => hits(text, src)) }))
    .filter((s) => s.matched.length && s.ref !== primary.ref);

  // ---- style ----
  const styleScore = new Map(); const styleWhy = new Map();
  const strong = new Set();   // styles backed by more than one stray word: a name, an audience or a mood
  const bump = (id, n, why, isStrong = false) => { styleScore.set(id, (styleScore.get(id) || 0) + n); styleWhy.set(id, [...(styleWhy.get(id) || []), why]); if (isStrong) strong.add(id); };
  let named = false;
  for (const st of styles.styles) {
    // a style named outright (or by an alias) beats everything inferred
    for (const nm of [st.name, ...st.aliases, st.id.replace(/-/g, ' ')]) {
      const short = nm.replace(/\s*\(.*\)/, '').split(' / ')[0];
      if (short.length > 3 && new RegExp(`\\b${escapeRx(short)}\\b`, 'i').test(text)) { bump(st.id, 20, `the brief names "${short.toLowerCase()}"`, true); named = true; break; }
    }
    for (const kw of st.keywords) if (new RegExp(`\\b${escapeRx(kw)}\\w*\\b`, 'i').test(text)) bump(st.id, st.family === 'approach' ? 1 : 3, `it says "${kw}"`);
  }
  for (const group of [routing.audiences, routing.moods]) for (const a of group) {
    const m = a.match.flatMap((src) => hits(text, src)); if (!m.length) continue;
    a.styles.forEach((id, i) => bump(id, (group === routing.audiences ? 4.5 : 3) - i, `${a.why} ("${m[0]}")`, true));
  }
  const looks = [...styleScore].map(([id, score]) => ({ id, score, style: styles.styles.find((s) => s.id === id) })).filter((x) => x.style && x.style.family !== 'approach')
    .filter((x) => strong.has(x.id) || x.score >= 6)   // one loose keyword ("paper" in "paper plane") is not a reason to pick a look
    .sort((a, b) => b.score - a.score);
  const approaches = [...styleScore].map(([id, score]) => ({ id, score, style: styles.styles.find((s) => s.id === id) })).filter((x) => x.style && x.style.family === 'approach').sort((a, b) => b.score - a.score);
  const top = looks[0];
  const style = top ? { id: top.id, name: top.style.name, confidence: named && top.score >= 20 ? 'named' : 'inferred', why: [...new Set(styleWhy.get(top.id))].slice(0, 3), ref: `styles/${top.id}.md`, avoid: top.style.avoid, a11y: top.style.a11y.slice(0, 2),
      alternatives: looks.slice(1, 3).map((x) => ({ id: x.id, name: x.style.name })) }
    : { id: null, name: null, confidence: 'none', why: ['the brief gives no product type, audience or mood words the table knows'], ref: 'styles.md', avoid: [], a11y: [], alternatives: [] };

  const read = ['design-fundamentals.md', primary.ref, ...supporting.map((s) => s.ref), style.ref, 'accessibility.md', 'performance.md'];
  return {
    framework,
    stack: { id: primary.id, name: primary.name, score: primary.score, matched: primary.matched.slice(0, 6), why: primary.why, ref: primary.ref, example: primary.example, template: primary.template },
    alsoConsider: alsoStacks.map((s) => ({ id: s.id, name: s.name, matched: s.matched.slice(0, 4), ref: s.ref })),
    supporting, style,
    approach: approaches[0] ? { id: approaches[0].id, name: approaches[0].style.name, example: approaches[0].style.example } : null,
    read: [...new Set(read)],
    cautions: [
      primary.id === 'r3f' || primary.id === 'motion-react' ? 'This stack needs the project\'s own bundler (Vite or Next.js). Do not ship it from CDN ES modules.' : null,
      framework === 'react' && !['r3f', 'motion-react'].includes(primary.id) ? 'The brief mentions React, but the motion asked for does not need it. Build the motion as a self-contained component and mount it; do not add a second framework.' : null,
      ['three', 'r3f', 'particles'].includes(primary.id) ? 'WebGL: ship a still picture for browsers without it, cap the pixel ratio at 2, stop the loop off screen.' : null,
      style.id && style.confidence === 'inferred' ? 'The style is a guess from the product and audience words. If the brief or the brand has its own colours and type, those win.' : null,
    ].filter(Boolean),
  };
}

export function report(r) {
  const L = [];
  L.push(`Stack: ${r.stack.name}`);
  L.push(`  why: ${r.stack.why}`);
  if (r.stack.matched.length) L.push(`  the brief says: ${r.stack.matched.map((m) => `"${m}"`).join(', ')}`);
  L.push(`  read: references/${r.stack.ref}   study: examples/${r.stack.example}/${r.stack.template ? `   start from: ${r.stack.template}` : ''}`);
  for (const a of r.alsoConsider) L.push(`Also fits: ${a.name} (${a.matched.map((m) => `"${m}"`).join(', ')}): references/${a.ref}`);
  for (const s of r.supporting) L.push(`Also read: references/${s.ref}, because ${s.why}`);
  if (r.style.id) {
    L.push(`Style: ${r.style.name} (${r.style.confidence === 'named' ? 'named in the brief' : 'inferred'})`);
    for (const w of r.style.why) L.push(`  why: ${w}`);
    L.push(`  read: references/${r.style.ref}`);
    if (r.style.alternatives.length) L.push(`  or: ${r.style.alternatives.map((a) => a.name).join(', ')}`);
    if (r.style.a11y.length) L.push(`  watch: ${r.style.a11y.join('; ')}`);
  } else L.push(`Style: none suggested. ${r.style.why[0]}. Choose from references/styles.md and say why in SPEC.md.`);
  if (r.approach) L.push(`Approach: ${r.approach.name} (examples/${r.approach.example}/)`);
  L.push(`Framework in the brief: ${r.framework}`);
  for (const c of r.cautions) L.push(`Note: ${c}`);
  L.push(`Read before building: ${r.read.map((f) => `references/${f}`).join(', ')}`);
  return L.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), file = args.find((a) => !a.startsWith('--'));
  if (!file || args.includes('--help') || args.includes('-h')) { console.log('usage: node route.mjs <BRIEF.md | -> [--json]\n  Suggests a motion stack and a visual style for a brief, with reasons. "-" reads the brief from standard input.'); process.exit(file ? 0 : 2); }
  let brief;
  try { brief = fs.readFileSync(file === '-' ? 0 : file, 'utf8'); } catch (e) { console.error(`route.mjs: cannot read ${file}: ${e.message}`); process.exit(2); }
  if (!brief.trim()) { console.error('route.mjs: the brief is empty'); process.exit(2); }
  const r = route(brief);
  console.log(args.includes('--json') ? JSON.stringify(r, null, 2) : report(r));
}
