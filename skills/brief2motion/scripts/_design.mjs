// _design.mjs: what the site-mode checkers share, with no browser in it so it can be unit-tested.
// Outcomes (PASS, FAIL, REVIEW, PENDING), the machine-readable check/qa.json, the project's files (routes.json, DISCOVERY.md,
// CONTENT.md, ...), a markdown table reader and a small argument reader.
import fs from 'node:fs';
import path from 'node:path';

export const OUTCOMES = ['PASS', 'FAIL', 'REVIEW', 'PENDING'];

// One check result. FAIL blocks. REVIEW needs a person to look. PENDING means the evidence does not exist yet
// (a site not built, no field data, a tool that is offline). PASS is a measurement that met its threshold.
export function result(id, outcome, fields = {}) {
  if (!OUTCOMES.includes(outcome)) throw new Error(`result ${id}: outcome must be one of ${OUTCOMES.join(', ')}, got ${outcome}`);
  return { id, outcome, route: null, state: null, viewport: null, browser: null, theme: 'light', input: 'pointer', measured: null, threshold: null, evidence: null, reason: '', ...fields };
}

export function summarize(results) {
  const n = { PASS: 0, FAIL: 0, REVIEW: 0, PENDING: 0 };
  for (const r of results) n[r.outcome]++;
  return n;
}
// Ship decision for a set of results: no FAIL. With strict, no REVIEW either.
export const passes = (results, { strict = false } = {}) => results.length > 0 && results.every((r) => r.outcome !== 'FAIL' && !(strict && r.outcome === 'REVIEW'));

// Write (or update) <outDir>/qa.json: the results of one checker replace its earlier ones; other checkers' results stay.
export function writeQa(outDir, checker, results, env = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'qa.json');
  let doc = { tool: 'brief2motion site mode', results: [] };
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* first run */ }
  const kept = (doc.results || []).filter((r) => r.checker !== checker);
  const mine = results.map((r) => ({ checker, ...r }));
  const all = [...kept, ...mine];
  const out = { tool: 'brief2motion site mode', when: new Date().toISOString(), environment: { ...(doc.environment || {}), ...env }, summary: summarize(all), pass: passes(all), results: all };
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  return file;
}

// "--out dir --strict file" -> { pos: ['file'], opts: { out: 'dir' }, flags: Set(['strict']) }
export function parseArgs(argv, { value = [], flags = [] } = {}) {
  const pos = [], opts = {}, set = new Set();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--') && value.includes(a.slice(2))) { opts[a.slice(2)] = argv[++i]; }
    else if (a.startsWith('--') && flags.includes(a.slice(2))) set.add(a.slice(2));
    else if (a === '-h') set.add('help');
    else if (a.startsWith('--') && a !== '--help') throw new Error(`unknown option ${a}`);
    else if (a === '--help') set.add('help');
    else pos.push(a);
  }
  return { pos, opts, flags: set };
}

export function loadJson(file, label = path.basename(file)) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { throw new Error(`${label}: file not found (${file})`); }
  try { return JSON.parse(text); } catch (e) { throw new Error(`${label}: not valid JSON (${e.message})`); }
}
export const readText = (file) => { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } };

// Where a project keeps each stage's file.
export function projectFiles(dir, siteDir) {
  const root = path.resolve(dir);
  const site = path.resolve(siteDir || path.join(root, 'site'));
  return {
    root, site, siteBuilt: fs.existsSync(site) && fs.statSync(site).isDirectory(),
    routes: path.join(root, 'routes.json'), discovery: path.join(root, 'DISCOVERY.md'), content: path.join(root, 'CONTENT.md'),
    assets: path.join(root, 'ASSETS.json'), journeys: path.join(root, 'journeys.json'), tokens: path.join(root, 'tokens.json'),
    wireframes: path.join(root, 'wireframes'), out: path.join(root, 'check'),
  };
}

// Everything a browser checker visits: each route as it loads, and each state the route declares.
export function targets(routes) {
  return routes.flatMap((r) => [{ route: r, state: null, path: r.path, id: r.id, label: r.id }, ...r.states.map((s) => ({ route: r, state: s, path: s.path || r.path, id: `${r.id}-${s.id}`, label: `${r.id}:${s.id}` }))]);
}

// routes.json -> { site, routes }, with the fields every checker relies on filled in.
export function loadRoutes(file) {
  const doc = loadJson(file, 'routes.json');
  if (!Array.isArray(doc.routes) || doc.routes.length === 0) throw new Error('routes.json: needs a non-empty "routes" array');
  const routes = doc.routes.map((r) => ({ parent: null, actions: [], states: [], links: [], indexable: true, ...r }));
  return { site: doc.site || {}, routes };
}
export const homeOf = (routes) => routes.find((r) => r.path === '/') || routes.find((r) => r.id === 'home') || routes[0];

// A route path -> the file that serves it in a built site folder: "/" -> index.html, "/a/" -> a/index.html,
// "/a.html" -> a.html, "/a" -> a.html or a/index.html. null when there is no such file.
export function routeFile(siteDir, routePath) {
  const rel = routePath.replace(/^\/+/, '');
  const tries = routePath.endsWith('/') || rel === '' ? [path.join(rel, 'index.html')] : path.extname(rel) ? [rel] : [`${rel}.html`, path.join(rel, 'index.html')];
  for (const t of tries) { const f = path.join(siteDir, t); if (fs.existsSync(f) && fs.statSync(f).isFile()) return f; }
  return null;
}

// ---- markdown pieces the stage files use ----

// The first table under a heading whose text matches `heading` (a RegExp) -> rows as { lower-cased header: cell }.
export function mdTable(md, heading) {
  const lines = String(md).split(/\r?\n/);
  const at = lines.findIndex((l) => /^#{1,6}\s/.test(l) && heading.test(l.replace(/^#+\s*/, '')));
  if (at < 0) return null;
  const rows = [];
  for (let i = at + 1; i < lines.length; i++) {
    if (/^#{1,6}\s/.test(lines[i])) break;
    if (lines[i].trim().startsWith('|')) rows.push(lines[i]);
    else if (rows.length) break;
  }
  if (rows.length < 2) return [];
  const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const head = cells(rows[0]).map((h) => h.toLowerCase());
  return rows.slice(2).map(cells).map((c) => Object.fromEntries(head.map((h, i) => [h, (c[i] ?? '').replace(/^`|`$/g, '')])));
}

// Level-2 sections: { "home": "body text", ... } keyed by the first word of the heading.
export function mdSections(md) {
  const out = {};
  for (const part of String(md).split(/^## +/m).slice(1)) {
    const nl = part.indexOf('\n');
    const title = (nl < 0 ? part : part.slice(0, nl)).trim();
    out[title.split(/\s+/)[0].toLowerCase()] = nl < 0 ? '' : part.slice(nl + 1);
  }
  return out;
}

// Print results the way the other checkers print theirs. `only` limits which lines are listed; the counts cover all of them.
export function printResults(title, results, extra = '', only = null) {
  console.log(`\n${title}${extra ? '  ' + extra : ''}\n`);
  for (const r of only ? results.filter(only) : results) {
    const where = [r.route, r.state, r.viewport].filter(Boolean).join(' ');
    console.log(`${r.outcome.padEnd(7)} ${r.id}${where ? `  [${where}]` : ''}  (${r.reason})`);
  }
  const n = summarize(results);
  console.log(`\nRESULT: ${n.FAIL ? 'FAIL' : 'PASS'}   ${n.PASS} pass, ${n.FAIL} fail, ${n.REVIEW} review, ${n.PENDING} pending`);
}
