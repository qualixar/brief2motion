#!/usr/bin/env node
// build_sitemap.mjs: routes.json -> SITEMAP.md (for people) and site/sitemap.xml (for crawlers).
//   node build_sitemap.mjs <project-dir> [--check] [--no-xml]
// SITEMAP.md is generated, never edited by hand: it shows the route tree, what each page is for and where it leads.
// sitemap.xml lists the indexable routes at their canonical address (routes.json "site.origin" + path); it is written
// only when the site has more than one route, and refused (exit 2) when site.origin is missing. --check changes nothing and exits 1 when either file is out of date.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, loadRoutes, projectFiles, readText } from './_design.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const canonical = (site, p) => `${String(site.origin || '').replace(/\/$/, '')}${p}`;

export function sitemapMd({ site, routes }) {
  const byId = new Map(routes.map((r) => [r.id, r]));
  const kids = (id) => routes.filter((r) => r.parent === id);
  const roots = routes.filter((r) => !r.parent || !byId.has(r.parent));
  const lines = [`# Sitemap: ${site.name || 'site'}`, '', '_Generated from routes.json by build_sitemap.mjs. Edit routes.json, not this file._', ''];
  const line = (r, depth) => {
    const act = r.primaryAction ? `primary action: ${r.primaryAction.label}` : 'no primary action';
    const st = r.states?.length ? `; states: ${r.states.map((s) => s.id).join(', ')}` : '';
    const to = r.links?.length ? `; links to: ${r.links.join(', ')}` : '';
    lines.push(`${'  '.repeat(depth)}- **${r.title}** \`${r.path}\` (${r.id}, ${r.template}${r.indexable === false ? ', not indexed' : ''}): ${act}${st}${to}`);
    for (const k of kids(r.id)) line(k, depth + 1);
  };
  for (const r of roots) line(r, 0);
  lines.push('');
  return lines.join('\n');
}

export function sitemapXml({ site, routes }) {
  const urls = routes.filter((r) => r.indexable !== false).map((r) => `  <url><loc>${esc(canonical(site, r.path))}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const USAGE = 'usage: node build_sitemap.mjs <project-dir> [--check] [--no-xml]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['site'], flags: ['check', 'no-xml'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  const f = projectFiles(args.pos[0], args.opts.site);
  let doc;
  try { doc = loadRoutes(f.routes); } catch (e) { console.error(e.message); process.exit(2); }
  const want = [[path.join(f.root, 'SITEMAP.md'), sitemapMd(doc)]];
  if (doc.routes.length > 1 && !args.flags.has('no-xml')) {
    if (!/^https?:\/\/[^/]/i.test(doc.site.origin || '')) { console.error('build_sitemap: routes.json needs "site": { "origin": "https://..." } to write sitemap.xml (it lists absolute addresses). Add it, or pass --no-xml.'); process.exit(2); }
    want.push([path.join(f.site, 'sitemap.xml'), sitemapXml(doc)]);
  }
  let stale = 0;
  for (const [file, text] of want) {
    if (args.flags.has('check')) { if (readText(file) !== text) { stale++; console.error(`out of date: ${file}`); } else console.log(`current: ${file}`); }
    else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); console.log(`wrote ${file}`); }
  }
  process.exit(stale ? 1 : 0);
}
