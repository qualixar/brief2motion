#!/usr/bin/env node
// build_tokens.mjs: tokens.json (design tokens in the W3C Design Tokens shape) -> site/tokens.css, and a verdict on it.
//   node build_tokens.mjs tokens.json [--out site/tokens.css] [--check] [--json] [--qa check]
// tokens.json has three layers:
//   "primitive"  raw values: colour ramps, spacing, type sizes, radii, durations. Aliases between them are allowed.
//   "semantic"   one group per theme ("light", and "dark" if the site has one): roles such as color.canvas and
//                color.text, each an alias of a primitive. Every theme must define the same roles.
//   "$extensions.brief2motion.pairs"  the text/background pairs to measure: { fg, bg, kind } with fg and bg semantic
//                role names and kind "text" (4.5:1), "large" (3:1) or "ui" (3:1). There is no way to ask for less.
// An alias is the whole value written as {primitive.color.paper-50} (the path from the root). It is rejected when it points
// at nothing or when aliases run in a circle. Colours in pairs must be hex or rgb()/rgba() so the ratio can be computed.
// Output is deterministic: the same tokens.json always gives byte-identical CSS. Exit 0 ok, 1 errors, 2 cannot run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseColor, blend, contrastRatio } from './_measure.mjs';
import { parseArgs, loadJson, result, writeQa, printResults } from './_design.mjs';

const NEED = { text: 4.5, large: 3, ui: 3 };
const isToken = (n) => n && typeof n === 'object' && '$value' in n;
const isGroup = (n) => n && typeof n === 'object' && !Array.isArray(n) && !isToken(n);

// every token in the file -> Map(fullPath -> { value, type }); $type is inherited from the nearest group that has one
export function flatten(doc) {
  const map = new Map(), problems = [];
  (function walk(node, trail, type) {
    const t = node.$type || type;
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      const p = [...trail, k];
      if (isToken(v)) map.set(p.join('.'), { value: v.$value, type: v.$type || t || null });
      else if (isGroup(v)) walk(v, p, t);
      else problems.push({ kind: 'invalid', path: p.join('.'), message: `${p.join('.')}: expected a token ({"$value": ...}) or a group` });
    }
  })(doc, [], null);
  return { map, problems };
}

const aliasOf = (v) => (typeof v === 'string' && /^\{[^{}]+\}$/.test(v.trim()) ? v.trim().slice(1, -1) : null);

// follow aliases to a final value; reports a missing target or a loop
export function resolve(map, p, trail = []) {
  const tok = map.get(p);
  if (!tok) return { error: { kind: 'missing-ref', path: trail[trail.length - 1] || p, message: `${trail[trail.length - 1] || p}: reference {${p}} points at nothing` } };
  const a = aliasOf(tok.value);
  if (!a) return { value: tok.value, type: tok.type };
  if (trail.includes(p)) { const loop = [...trail.slice(trail.indexOf(p)), p]; return { error: { kind: 'cycle', path: p, message: `alias cycle: ${loop.join(' -> ')}`, key: [...new Set(loop)].sort().join('|') } }; }
  return resolve(map, a, [...trail, p]);
}

// a token value -> the CSS text for it
export function cssValue(v, type) {
  if (Array.isArray(v)) {
    if (type === 'cubicBezier' && v.length === 4) return `cubic-bezier(${v.join(', ')})`;
    if (type === 'fontFamily' || v.every((x) => typeof x === 'string')) return v.map((f) => (/[\s,]/.test(f) && !/^["']/.test(f) ? `"${f}"` : f)).join(', ');
    throw new Error(`cannot write an array of type ${type}`);
  }
  if (v && typeof v === 'object') {
    if (typeof v.hex === 'string') return v.hex;
    if ('value' in v && 'unit' in v) return `${v.value}${v.unit}`;
    throw new Error(`cannot write an object value (${type || 'no type'}); use a string, {value, unit} or {hex}`);
  }
  return String(v);
}

const cssName = (p) => `--${p.join('-')}`;

// the whole job on a parsed tokens.json -> { css, themes, pairs, errors }
export function buildTokens(doc) {
  const errors = [];
  const { map, problems } = flatten(doc);
  errors.push(...problems);
  const prim = [...map.keys()].filter((k) => k.startsWith('primitive.'));
  const themes = isGroup(doc.semantic) ? Object.keys(doc.semantic).filter((k) => !k.startsWith('$') && isGroup(doc.semantic[k])) : [];
  if (!prim.length) errors.push({ kind: 'invalid', path: 'primitive', message: 'tokens.json has no "primitive" tokens' });
  if (!themes.includes('light')) errors.push({ kind: 'invalid', path: 'semantic.light', message: 'tokens.json needs a "semantic.light" group' });

  const roles = Object.fromEntries(themes.map((t) => [t, [...map.keys()].filter((k) => k.startsWith(`semantic.${t}.`)).map((k) => k.slice(`semantic.${t}.`.length))]));
  for (const t of themes) for (const o of themes) if (o !== t) for (const r of roles[o]) if (!roles[t].includes(r)) errors.push({ kind: 'theme-mismatch', path: `semantic.${t}.${r}`, message: `theme "${t}" has no ${r}, which theme "${o}" defines` });

  const final = new Map();   // full path -> { value, type } with aliases followed
  for (const p of map.keys()) {
    const r = resolve(map, aliasOf(map.get(p).value) ?? p, aliasOf(map.get(p).value) ? [p] : []);
    if (r.error) { if (!errors.some((e) => e.message === r.error.message || (e.key && e.key === r.error.key))) errors.push(r.error); } else final.set(p, r);
  }
  // names must not collide once the layer prefixes are dropped
  const names = new Map();
  const claim = (name, from) => { if (names.has(name) && names.get(name) !== from) errors.push({ kind: 'invalid', path: from, message: `${name} is defined by both ${names.get(name)} and ${from}` }); names.set(name, from); };

  const decl = (full, trail) => {
    const tok = map.get(full), a = aliasOf(tok.value);
    if (a) {
      const target = a.startsWith('primitive.') ? cssName(a.split('.').slice(1)) : null;
      if (!target) throw new Error(`${full}: an alias must point at a primitive token, not ${a}`);
      return `  ${cssName(trail)}: var(${target});`;
    }
    return `  ${cssName(trail)}: ${cssValue(tok.value, tok.type)};`;
  };
  const lines = { prim: [], themes: {} };
  try {
    for (const k of prim) { const tr = k.split('.').slice(1); claim(cssName(tr), k); lines.prim.push(decl(k, tr)); }
    for (const t of themes) {
      lines.themes[t] = [];
      for (const r of roles[t]) { const k = `semantic.${t}.${r}`; claim(cssName(r.split('.')), t === 'light' ? k : `semantic.light.${r}`); lines.themes[t].push(decl(k, r.split('.'))); }
    }
  } catch (e) { errors.push({ kind: 'invalid', path: '', message: String(e.message || e) }); }

  const pairs = [];
  const declared = doc.$extensions?.brief2motion?.pairs;
  if (!Array.isArray(declared) || !declared.length) errors.push({ kind: 'invalid', path: '$extensions.brief2motion.pairs', message: 'declare the text/background pairs to measure in $extensions.brief2motion.pairs' });
  for (const pr of declared || []) {
    const kind = pr.kind || 'text';
    if (!(kind in NEED)) { errors.push({ kind: 'invalid', path: 'pairs', message: `pair ${pr.fg} on ${pr.bg}: kind must be text, large or ui` }); continue; }
    for (const t of themes) {
      const get = (role) => final.get(`semantic.${t}.${role}`);
      const fgT = get(pr.fg), bgT = get(pr.bg);
      if (!fgT || !bgT) {
        if (map.has(`semantic.${t}.${pr.fg}`) && map.has(`semantic.${t}.${pr.bg}`)) continue;   // already reported above
        errors.push({ kind: 'missing-ref', path: 'pairs', message: `pair ${pr.fg} on ${pr.bg}: no such role in theme "${t}"` }); continue;
      }
      const fg = parseColor(cssValue(fgT.value, fgT.type)), bg0 = parseColor(cssValue(bgT.value, bgT.type));
      if (!fg || !bg0) { errors.push({ kind: 'contrast', path: 'pairs', message: `pair ${pr.fg} on ${pr.bg} (${t}): colours must be hex or rgb() to compute a ratio` }); continue; }
      const canvas = get('color.canvas') ? parseColor(cssValue(get('color.canvas').value, 'color')) : { r: 255, g: 255, b: 255, a: 1 };
      const bg = blend(bg0, canvas || { r: 255, g: 255, b: 255, a: 1 });
      const ratio = contrastRatio(blend(fg, bg), bg), need = NEED[kind];
      const ok = ratio >= need - 0.0005;   // the thresholds are exact: 4.49 fails
      pairs.push({ theme: t, fg: pr.fg, bg: pr.bg, kind, ratio: Math.round(ratio * 100) / 100, need, pass: ok });
      if (!ok) errors.push({ kind: 'contrast', path: `${t}:${pr.fg}/${pr.bg}`, message: `${pr.fg} on ${pr.bg} (${t}) is ${(Math.floor(ratio * 100) / 100).toFixed(2)}:1; ${kind} needs ${need}:1` });
    }
  }

  const out = ['/* tokens.css: generated by build_tokens.mjs from tokens.json. Do not edit; change tokens.json and rebuild. */', ':root {', '  /* primitives */', ...lines.prim];
  const dark = themes.includes('dark');
  if (themes.includes('light')) out.push('', '  /* roles: light */', ...lines.themes.light, `  color-scheme: ${dark ? 'light dark' : 'light'};`);
  out.push('}');
  if (dark) {
    out.push('', '@media (prefers-color-scheme: dark) {', '  :root:not([data-theme="light"]) {', ...lines.themes.dark.map((l) => `  ${l}`), '    color-scheme: dark;', '  }', '}');
    out.push('', ':root[data-theme="dark"] {', ...lines.themes.dark, '  color-scheme: dark;', '}', '', ':root[data-theme="light"] { color-scheme: light; }');
  }
  return { css: out.join('\n') + '\n', themes, pairs, errors };
}

// ---- command line ----
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const USAGE = 'usage: node build_tokens.mjs tokens.json [--out site/tokens.css] [--check] [--json] [--qa <dir>]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['out', 'qa'], flags: ['check', 'json'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  let doc;
  try { doc = loadJson(path.resolve(args.pos[0]), 'tokens.json'); } catch (e) { console.error(e.message); process.exit(2); }
  const built = buildTokens(doc);
  const results = [result('tokens.resolve', built.errors.some((e) => e.kind !== 'contrast') ? 'FAIL' : 'PASS', { reason: built.errors.filter((e) => e.kind !== 'contrast').map((e) => e.message).join('; ') || `${built.themes.join(' and ')}: every alias resolves, no cycles, themes define the same roles` }),
    ...built.pairs.map((p) => result('tokens.contrast', p.pass ? 'PASS' : 'FAIL', { theme: p.theme, state: p.theme, measured: p.ratio, threshold: p.need, reason: `${p.fg} on ${p.bg} (${p.kind})` }))];
  const outFile = path.resolve(args.opts.out || path.join(path.dirname(path.resolve(args.pos[0])), 'site', 'tokens.css'));
  let drift = false;
  if (!built.errors.length) {
    if (args.flags.has('check')) { drift = (fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8') : null) !== built.css; if (drift) results.push(result('tokens.css-current', 'FAIL', { reason: `${outFile} is not what tokens.json builds: run build_tokens.mjs` })); }
    else { fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, built.css); }
  }
  if (args.opts.qa) writeQa(path.resolve(args.opts.qa), 'build_tokens', results);
  if (args.flags.has('json')) console.log(JSON.stringify({ errors: built.errors, pairs: built.pairs, themes: built.themes }, null, 2));
  else {
    printResults('brief2motion tokens', results, args.flags.has('check') ? '(check only)' : `-> ${path.relative(process.cwd(), outFile)}`);
    for (const e of built.errors) console.error(`  ${e.kind}: ${e.message}`);
  }
  process.exit(built.errors.length || drift ? 1 : 0);
}
