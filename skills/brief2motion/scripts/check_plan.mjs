#!/usr/bin/env node
// check_plan.mjs: is the plan sound, before and after the site is built? No browser.
//   node check_plan.mjs <project-dir> [--site <dir>] [--out check] [--strict] [--json]
// Reads routes.json, DISCOVERY.md, CONTENT.md, ASSETS.json, wireframes/ and (when it exists) site/. Checks:
//   plan.routes-valid       ids and paths are unique, parents exist and do not loop, every route has a template and title
//   plan.reachable          every route can be reached from home through the links routes.json declares (no orphans)
//   plan.tasks-mapped       every task row in DISCOVERY.md names a route that exists and an action that route offers
//   plan.content-routes     CONTENT.md has a "## <route id>" section for every route
//   plan.claims-sourced     every claim has a source or is marked DRAFTED; drafted proof (reviews, ratings, logos) fails
//   plan.claims-resolve     claims point at real routes and every [C#] marker in the copy has a claim
//   plan.assets-rights      every asset in ASSETS.json has a source, author, licence and alt text (or is decorative)
//   plan.states-declared    a form, search or checkout route declares the states it can be in
//   plan.wireframes         each template has a wireframe and the primary action is on it
//   plan.links-built        (needs site/) every declared link exists in the built page; every internal href lands somewhere
// Outcomes: PASS, FAIL, REVIEW (a person should look), PENDING (nothing to check yet, such as a site not built).
// The run's verdict (_design.mjs verdict): FAIL on any FAIL or when nothing was checked (exit 1); INCOMPLETE when
// something is PENDING (no evidence yet), never printed as PASS (exit 0, 1 with --strict); PASS otherwise (exit 0, 1 with
// --strict when anything needs REVIEW). Exit 2 when the tool cannot run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, loadRoutes, loadJson, readText, projectFiles, homeOf, routeFile, mdTable, mdSections, wireframeFile, result, writeQa, passes, printResults } from './_design.mjs';
import { hrefs } from './_html.mjs';

const PLACEHOLDER = /^(|-|\?|tbd|todo|n\/a|na|none|unknown|\.\.\.|xxx)$/i;
const SOURCE_FORM = /^(drafted|brief|owner|measured|https?:|doc|spec|file|source|supplied|contract)/i;
const PROOF = /\b(trusted by|rated|reviews?|testimonials?|customers? (say|love|trust)|\d+ stars?|case stud(y|ies)|as seen (in|on)|award[- ]winning)\b|[“"][^”"]{12,}[”"]/i;
const STATE_TEMPLATES = new Set(['form', 'search', 'checkout', 'listing', 'signup']);
const IMAGE = /\.(png|jpe?g|webp|gif|avif|svg|mp4|webm)$/i;
const rel = (p, root) => path.relative(root, p) || '.';

const routePathOf = (href, from) => { try { const u = new URL(href, `http://x${from}`); return u.origin === 'http://x' ? u.pathname : null; } catch { return null; } };

export function planChecks(project) {
  const f = typeof project === 'string' ? projectFiles(project) : project;
  const out = [];
  const { routes } = loadRoutes(f.routes);
  const byId = new Map(routes.map((r) => [r.id, r]));

  // ---- routes ----
  const bad = [];
  const seenId = new Set(), seenPath = new Set();
  for (const r of routes) {
    for (const k of ['id', 'path', 'template', 'title']) if (!r[k]) bad.push(`a route has no ${k}${r.id ? ` (${r.id})` : ''}`);
    if (r.path && !r.path.startsWith('/')) bad.push(`${r.id}: path must start with "/" (${r.path})`);
    if (seenId.has(r.id)) bad.push(`duplicate id ${r.id}`); seenId.add(r.id);
    if (seenPath.has(r.path)) bad.push(`duplicate path ${r.path}`); seenPath.add(r.path);
    if (r.parent && !byId.has(r.parent)) bad.push(`${r.id}: parent "${r.parent}" does not exist`);
    for (let p = r, n = 0; p && p.parent; p = byId.get(p.parent), n++) if (n > routes.length) { bad.push(`${r.id}: parents loop`); break; }
  }
  out.push(result('plan.routes-valid', bad.length ? 'FAIL' : 'PASS', { measured: routes.length, reason: bad.join('; ') || `${routes.length} routes, unique ids and paths, parents resolve` }));

  // ---- reachability over the declared links ----
  const home = homeOf(routes), reach = new Set([home.id]), queue = [home.id], dead = [];
  while (queue.length) {
    const cur = byId.get(queue.shift());
    for (const to of cur.links) { if (!byId.has(to)) { dead.push(`${cur.id} links to unknown route ${to}`); continue; } if (!reach.has(to)) { reach.add(to); queue.push(to); } }
  }
  const orphans = routes.filter((r) => !reach.has(r.id)).map((r) => r.id);
  out.push(result('plan.reachable', orphans.length || dead.length ? 'FAIL' : 'PASS', { measured: reach.size, threshold: routes.length, reason: [...dead, ...(orphans.length ? [`no link leads to: ${orphans.join(', ')} (from ${home.id})`] : [])].join('; ') || `all ${routes.length} routes are reachable from ${home.id}` }));

  // ---- discovery: tasks ----
  const disc = readText(f.discovery);
  if (disc === null) out.push(result('plan.tasks-mapped', 'FAIL', { evidence: 'DISCOVERY.md', reason: 'DISCOVERY.md is missing' }));
  else {
    const tasks = mdTable(disc, /^tasks?\b/i);
    if (!tasks || !tasks.length) out.push(result('plan.tasks-mapped', 'FAIL', { evidence: 'DISCOVERY.md', reason: 'DISCOVERY.md has no Tasks table (columns: id, visitor, task, route, action)' }));
    else {
      const miss = [];
      for (const t of tasks) {
        const r = byId.get(t.route);
        const acts = r ? [r.primaryAction?.id, ...r.actions.map((a) => a.id)].filter(Boolean) : [];
        if (!t.id || !t.task) miss.push(`a task row is missing its id or text`);
        else if (!r) miss.push(`${t.id}: route "${t.route}" does not exist`);
        else if (!acts.includes(t.action)) miss.push(`${t.id}: route ${t.route} has no action "${t.action}" (it offers ${acts.join(', ') || 'none'})`);
      }
      out.push(result('plan.tasks-mapped', miss.length ? 'FAIL' : 'PASS', { measured: tasks.length, evidence: 'DISCOVERY.md', reason: miss.join('; ') || `${tasks.length} tasks, each mapped to a route and an action that exists` }));
    }
    const heads = [['visitors', /^visitors?/i], ['goal', /goal/i], ['constraints', /constraints?/i], ['assets and claims', /assets/i], ['open questions', /open questions?/i]];
    const lacking = heads.filter(([, rx]) => !disc.split('\n').some((l) => /^#{1,6}\s/.test(l) && rx.test(l.replace(/^#+\s*/, '')))).map(([n]) => n);
    const open = mdTable(disc, /open questions?/i) || [];
    const noAssume = open.filter((q) => PLACEHOLDER.test(q['assumption taken'] ?? q.assumption ?? '')).length;
    out.push(result('plan.discovery-complete', lacking.length || noAssume ? 'REVIEW' : 'PASS', { evidence: 'DISCOVERY.md', reason: [...(lacking.length ? [`no section for: ${lacking.join(', ')}`] : []), ...(noAssume ? [`${noAssume} open question(s) without an assumption taken`] : [])].join('; ') || 'visitors, goal, constraints, assets and open questions are all written down' }));
  }

  // ---- content: sections and claims ----
  const content = readText(f.content);
  if (content === null) for (const id of ['plan.content-routes', 'plan.claims-sourced', 'plan.claims-resolve']) out.push(result(id, 'FAIL', { evidence: 'CONTENT.md', reason: 'CONTENT.md is missing' }));
  else {
    const secs = mdSections(content);
    const noSec = routes.filter((r) => !(r.id.toLowerCase() in secs)).map((r) => r.id);
    out.push(result('plan.content-routes', noSec.length ? 'FAIL' : 'PASS', { evidence: 'CONTENT.md', reason: noSec.length ? `no "## <route id>" section for: ${noSec.join(', ')}` : `a section for each of the ${routes.length} routes` }));
    const claims = mdTable(content, /^claims?\b/i) || [];
    const fail = [], review = [], ids = new Set();
    for (const c of claims) {
      const src = (c.source ?? '').trim(), text = c.claim ?? '', drafted = /^drafted/i.test(src);
      ids.add(c.id);
      if (!c.id) fail.push('a claim has no id');
      else if (PLACEHOLDER.test(src)) fail.push(`${c.id}: no source (write where it comes from, or DRAFTED)`);
      else if (drafted && PROOF.test(text)) fail.push(`${c.id}: drafted proof ("${text.slice(0, 40)}"): reviews, ratings, logos and quotes come from the owner, never from a draft`);
      else if (drafted && /\d/.test(text)) review.push(`${c.id}: drafted claim contains a figure ("${text.slice(0, 40)}")`);
      else if (!SOURCE_FORM.test(src)) review.push(`${c.id}: source "${src.slice(0, 30)}" is not brief:, owner:, measured:, a link, doc:, or DRAFTED`);
    }
    out.push(result('plan.claims-sourced', fail.length ? 'FAIL' : review.length ? 'REVIEW' : 'PASS', { measured: claims.length, evidence: 'CONTENT.md', reason: [...fail, ...review].join('; ') || `${claims.length} claims, each with a source or marked DRAFTED` }));
    const dangling = [];
    for (const c of claims) if (c.route && c.route !== '*' && c.route !== 'all' && !byId.has(c.route)) dangling.push(`${c.id}: route "${c.route}" does not exist`);
    for (const m of content.matchAll(/\[(C\d+)\]/g)) if (!ids.has(m[1])) dangling.push(`copy cites ${m[1]}, which has no claim row`);
    out.push(result('plan.claims-resolve', dangling.length ? 'FAIL' : 'PASS', { evidence: 'CONTENT.md', reason: [...new Set(dangling)].join('; ') || 'every claim names a real route and every [C#] marker has a claim' }));
  }

  // ---- states ----
  const stateless = routes.filter((r) => STATE_TEMPLATES.has(r.template) && !r.states.length).map((r) => r.id);
  out.push(result('plan.states-declared', stateless.length ? 'REVIEW' : 'PASS', { evidence: 'routes.json', reason: stateless.length ? `${stateless.join(', ')}: a ${[...STATE_TEMPLATES].join('/')} page declares its states (empty, loading, error, success) in routes.json` : 'every form-like route declares its states' }));

  // ---- assets ----
  const adoc = fs.existsSync(f.assets) ? loadJson(f.assets, 'ASSETS.json') : null;
  if (!adoc) out.push(result('plan.assets-rights', 'FAIL', { evidence: 'ASSETS.json', reason: 'ASSETS.json is missing (list every picture, icon and font file with where it came from, even if the list is "none")' }));
  else {
    const list = adoc.assets || [], miss = [];
    for (const a of list) {
      const need = ['file', 'source', 'author', 'licence'].filter((k) => !a[k] || PLACEHOLDER.test(String(a[k]).trim()));
      if (!a.alt && a.decorative !== true && !/font|audio|video/i.test(a.role || '')) need.push('alt (or "decorative": true)');
      if (need.length) miss.push(`${a.file || '(no file)'}: missing ${need.join(', ')}`);
      else if (f.siteBuilt && !fs.existsSync(path.join(f.site, a.file))) miss.push(`${a.file}: listed but not in ${rel(f.site, f.root)}/`);
    }
    out.push(result('plan.assets-rights', miss.length ? 'FAIL' : 'PASS', { measured: list.length, evidence: 'ASSETS.json', reason: miss.join('; ') || (list.length ? `${list.length} assets, each with source, author, licence and alt text` : 'no assets listed') }));
    if (f.siteBuilt) {
      const listed = new Set(list.map((a) => a.file)), loose = [];
      (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'kit' && e.name !== 'node_modules') walk(p); } else if (IMAGE.test(e.name) && !listed.has(path.relative(f.site, p).split(path.sep).join('/'))) loose.push(path.relative(f.site, p).split(path.sep).join('/')); } })(f.site);
      out.push(result('plan.assets-listed', loose.length ? 'REVIEW' : 'PASS', { evidence: 'ASSETS.json', reason: loose.length ? `in the site but not in ASSETS.json: ${loose.slice(0, 6).join(', ')}` : 'every image and video file in the site has a record' }));
    }
  }

  // ---- wireframes ----
  if (!fs.existsSync(f.wireframes)) out.push(result('plan.wireframes', 'PENDING', { reason: 'no wireframes/ folder yet (stage 4)' }));
  else {
    const problems = [];
    for (const tpl of new Set(routes.map((r) => r.template))) {
      const file = wireframeFile(f.wireframes, tpl, routes);
      if (!file) { problems.push(`no wireframe for template "${tpl}" (wireframes/${tpl}.html)`); continue; }
      const html = fs.readFileSync(file, 'utf8');
      for (const r of routes.filter((x) => x.template === tpl && x.primaryAction)) {
        const want = r.primaryAction.label.replace(/\s+/g, ' ').trim().toLowerCase();
        const found = [...html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)].some((m) => m[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() === want)
          || [...html.matchAll(/<input\b[^>]*type="?submit"?[^>]*value="([^"]*)"/gi)].some((m) => m[1].trim().toLowerCase() === want);
        if (!found) problems.push(`${path.basename(file)}: the primary action "${r.primaryAction.label}" of ${r.id} is not a link or button on it`);
      }
    }
    out.push(result('plan.wireframes', problems.length ? 'FAIL' : 'PASS', { evidence: 'wireframes/', reason: problems.join('; ') || 'every template has a wireframe with its primary action as a real link or button' }));
  }

  // ---- built site: links ----
  if (!f.siteBuilt) out.push(result('plan.links-built', 'PENDING', { reason: 'no site/ folder yet (stage 8)' }));
  else {
    const problems = [];
    for (const r of routes) {
      const file = routeFile(f.site, r.path);
      if (!file) { problems.push(`${r.id}: no file serves ${r.path}`); continue; }
      const links = hrefs(fs.readFileSync(file, 'utf8')).filter((h) => !/^(#|mailto:|tel:|javascript:)/i.test(h));
      const targets = new Set();
      for (const h of links) {
        const p = routePathOf(h, r.path); if (p === null) continue;
        targets.add(p);
        const hit = routes.find((x) => x.path === p) || routes.find((x) => x.path.replace(/index\.html$/, '') === p.replace(/index\.html$/, ''));
        if (!hit && !routeFile(f.site, p) && !(fs.existsSync(path.join(f.site, p)) && fs.statSync(path.join(f.site, p)).isFile())) problems.push(`${r.id}: link ${h} leads nowhere`);
      }
      for (const to of r.links) { const t = byId.get(to); if (t && ![...targets].some((p) => p === t.path)) problems.push(`${r.id}: declares a link to ${to} but ${rel(file, f.site)} has none`); }
    }
    out.push(result('plan.links-built', problems.length ? 'FAIL' : 'PASS', { evidence: rel(f.site, f.root) + '/', reason: [...new Set(problems)].join('; ') || 'every declared link is in the built pages and no internal link is broken' }));
  }
  return out;
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const USAGE = 'usage: node check_plan.mjs <project-dir> [--site <dir>] [--out <dir>] [--strict] [--json]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['site', 'out'], flags: ['strict', 'json'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  let results;
  const f = projectFiles(args.pos[0], args.opts.site);
  try { results = planChecks(f); } catch (e) { console.error(`check_plan: ${e.message}`); process.exit(2); }
  const outDir = path.resolve(args.opts.out || f.out);
  writeQa(outDir, 'check_plan', results, {}, { site: f.siteBuilt ? f.site : null });
  if (args.flags.has('json')) console.log(JSON.stringify(results, null, 2));
  else printResults('brief2motion plan check', results, f.root, null, { strict: args.flags.has('strict') });
  process.exit(passes(results, { strict: args.flags.has('strict') }) ? 0 : 1);
}
