// _design.mjs: what the site-mode checkers share, with no browser in it so it can be unit-tested.
// Outcomes (PASS, FAIL, REVIEW, PENDING), the machine-readable check/qa.json, the project's files (routes.json, DISCOVERY.md,
// CONTENT.md, ...), a markdown table reader and a small argument reader.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

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
// The one rule every site-mode checker follows (SKILL.md says the same):
//   FAIL        a measurement missed its threshold, or nothing was checked at all             exit 1
//   INCOMPLETE  nothing FAILed but some checks are PENDING: their evidence does not exist yet   exit 0, or 1 with --strict
//               (a site not built, axe-core offline, a sign-up that ends at a fixture). It is never printed as PASS.
//   PASS        every check measured and met its threshold (REVIEW lines still want a person)  exit 0, or 1 with --strict
//               when anything needs REVIEW
// Exit 2 means the tool could not run.
export function verdict(results, { strict = false } = {}) {
  const n = summarize(results);
  if (results.length === 0 || n.FAIL) return 'FAIL';
  if (strict && (n.REVIEW || n.PENDING)) return 'FAIL';
  return n.PENDING ? 'INCOMPLETE' : 'PASS';
}
// Ship decision for the exit code: no FAIL; with strict, no REVIEW and no PENDING either.
export const passes = (results, { strict = false } = {}) => verdict(results, { strict }) !== 'FAIL';

// A short fingerprint of a folder's files (paths, sizes and contents), so qa.json can tell which records were measured on
// the site as it is now and which on an earlier build. null when the folder does not exist.
export function folderHash(dir) {
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return null;
  const h = crypto.createHash('sha256');
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.git') walk(p); }
      else if (e.isFile()) { h.update(path.relative(dir, p).split(path.sep).join('/')); h.update('\0'); h.update(fs.readFileSync(p)); h.update('\0'); }
    }
  })(dir);
  return h.digest('hex').slice(0, 16);
}

// Write (or update) <outDir>/qa.json: the results of one checker replace its earlier ones; other checkers' results stay.
// Every record carries the time its checker ran and, when `site` is given, a fingerprint of that folder. Records measured
// on an older build of the same folder are marked stale: they are not evidence about the site as it is now, so the file's
// verdict is INCOMPLETE until those checkers run again.
export function writeQa(outDir, checker, results, env = {}, { site = null } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, 'qa.json');
  let doc = { tool: 'brief2motion site mode', results: [] };
  try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* first run */ }
  const when = new Date().toISOString(), siteHash = site ? folderHash(site) : null;
  const kept = (doc.results || []).filter((r) => r.checker !== checker)
    .map(({ stale, ...r }) => (siteHash && r.siteHash && r.site === path.resolve(site) && r.siteHash !== siteHash ? { ...r, stale: true } : stale ? { ...r, stale } : r));
  const mine = results.map((r) => ({ checker, when, ...(site ? { site: path.resolve(site), siteHash } : {}), ...r }));
  const all = [...kept, ...mine];
  const staleCheckers = [...new Set(all.filter((r) => r.stale).map((r) => r.checker))];
  let v = verdict(all);
  if (v === 'PASS' && staleCheckers.length) v = 'INCOMPLETE';
  const out = { tool: 'brief2motion site mode', when, environment: { ...(doc.environment || {}), ...env }, summary: summarize(all), verdict: v, pass: v !== 'FAIL', complete: v === 'PASS', staleCheckers, results: all };
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  return file;
}

// "--out dir --strict file" -> { pos: ['file'], opts: { out: 'dir' }, flags: Set(['strict']) }. "--out=dir" works too.
// A value option with no value (the end of the line, or the next option) is an error, not a silent undefined.
export function parseArgs(argv, { value = [], flags = [] } = {}) {
  const pos = [], opts = {}, set = new Set();
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i], inline = null;
    if (a.startsWith('--') && a.includes('=')) { inline = a.slice(a.indexOf('=') + 1); a = a.slice(0, a.indexOf('=')); }
    if (a.startsWith('--') && value.includes(a.slice(2))) {
      const v = inline ?? argv[++i];
      if (v === undefined || v === '' || (inline === null && v.startsWith('--'))) throw new Error(`${a} needs a value`);
      opts[a.slice(2)] = v;
    } else if (inline !== null) throw new Error(`${a} takes no value`);
    else if (a.startsWith('--') && flags.includes(a.slice(2))) set.add(a.slice(2));
    else if (a === '-h') set.add('help');
    else if (a.startsWith('--') && a !== '--help') throw new Error(`unknown option ${a}`);
    else if (a === '--help') set.add('help');
    else pos.push(a);
  }
  return { pos, opts, flags: set };
}
// "--widths 390,1440" -> [390, 1440]; "--themes light,dark" -> ['light', 'dark']. A value that cannot be used is an error,
// so a typo never turns into an empty run that prints nothing.
export function listOf(text, fallback, kind) {
  const items = String(text ?? fallback).split(',').map((x) => x.trim()).filter(Boolean);
  if (!items.length) throw new Error(`--${kind} is empty`);
  if (kind === 'widths') {
    const bad = items.filter((x) => !/^\d+$/.test(x) || Number(x) < 200 || Number(x) > 4000);
    if (bad.length) throw new Error(`--widths takes pixel widths from 200 to 4000, such as 390,1440 (not ${bad.join(', ')})`);
    return items.map(Number);
  }
  const bad = items.filter((x) => x !== 'light' && x !== 'dark');
  if (bad.length) throw new Error(`--themes takes light, dark or light,dark (not ${bad.join(', ')})`);
  return items;
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
    root, site, siteBuilt: fs.existsSync(site) && fs.statSync(site).isDirectory() && fs.readdirSync(site).length > 0,   // an empty folder is not a built site
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

// The wireframe for a template: wireframes/<template>.html, or wireframes/index.html when the site has one template.
// check_plan and check_layout --wireframes both use this, so the plan never accepts a file the layout check cannot open.
export function wireframeFile(wfDir, template, routes) {
  const single = new Set(routes.map((r) => r.template)).size === 1;
  return [`${template}.html`, single ? 'index.html' : null].filter(Boolean).map((n) => path.join(wfDir, n)).find((p) => fs.existsSync(p) && fs.statSync(p).isFile()) || null;
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
// PENDING lines are always listed, whatever `only` says: a check that did not run must never be hidden.
export function printResults(title, results, extra = '', only = null, { strict = false } = {}) {
  console.log(`\n${title}${extra ? '  ' + extra : ''}\n`);
  for (const r of only ? results.filter((x) => x.outcome === 'PENDING' || only(x)) : results) {
    const where = [r.route, r.state, r.viewport].filter(Boolean).join(' ');
    console.log(`${r.outcome.padEnd(7)} ${r.id}${where ? `  [${where}]` : ''}  (${r.reason})`);
  }
  const n = summarize(results), v = verdict(results, { strict });
  console.log(`\nRESULT: ${v}   ${n.PASS} pass, ${n.FAIL} fail, ${n.REVIEW} review, ${n.PENDING} pending`);
  if (!results.length) console.log('Nothing was checked, so this is not a pass.');
  else if (n.PENDING && !n.FAIL) console.log(`${n.PENDING} check${n.PENDING === 1 ? ' has' : 's have'} no evidence yet (PENDING), so this is not a pass.${strict ? '' : ' --strict exits 1 on them.'}`);
}
