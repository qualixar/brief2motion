#!/usr/bin/env node
// check_meta.mjs: what search engines and share previews read from each page. Static, no browser.
//   node check_meta.mjs <project-dir> [--site <dir>] [--out check] [--strict] [--json]
// For every route in routes.json (its file is found in site/), and for the site as a whole:
//   meta.title        present and unique (FAIL); 10 to 70 characters (REVIEW outside)
//   meta.description  present, at least 50 characters, unique (FAIL); over 160 characters (REVIEW)
//   meta.canonical    <link rel="canonical"> is absolute and equals routes.json site.origin + path (FAIL)
//   meta.og           og:title, og:type, og:image, og:url present and og:url equals the canonical (FAIL); og:description and og:image:alt (REVIEW)
//   meta.og-image     the og:image is an absolute address, its file is in site/, at least 600 x 315 px (FAIL); about 1.91:1 (REVIEW)
//   meta.robots       an indexable route has no noindex; a route with "indexable": false has one (FAIL)
//   meta.robots-txt   robots.txt exists and does not block the whole site (FAIL if it does, REVIEW if missing)
//   meta.sitemap      more than one route: sitemap.xml lists exactly the indexable routes (FAIL); one route: not needed
// An image on another host cannot be read from here and is PENDING; so is everything when the site is not built yet.
// The run's verdict (_design.mjs verdict): FAIL on any FAIL or when nothing was checked (exit 1); INCOMPLETE when
// something is PENDING (no evidence yet), never printed as PASS (exit 0, 1 with --strict); PASS otherwise (exit 0, 1 with
// --strict when anything needs REVIEW). Exit 2 when the tool cannot run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, loadRoutes, projectFiles, routeFile, readText, result, writeQa, passes, printResults } from './_design.mjs';
import { tags, textOf, metaContent } from './_html.mjs';
import { imageSize } from './_measure.mjs';

const isAbs = (u) => /^https?:\/\//i.test(u || '');
const join = (origin, p) => `${String(origin).replace(/\/$/, '')}${p}`;

export function metaChecks(project) {
  const f = typeof project === 'string' ? projectFiles(project) : project;
  const { site, routes } = loadRoutes(f.routes);
  const out = [];
  if (!f.siteBuilt) return [result('meta.built', 'PENDING', { reason: `no site folder at ${f.site} yet` })];
  const origin = site.origin || '';
  const pages = routes.map((r) => { const file = routeFile(f.site, r.path); return { r, file, html: file ? fs.readFileSync(file, 'utf8') : null }; });
  const count = (key, val) => pages.filter((p) => p.html && key(p.html) === val).length;

  for (const { r, file, html } of pages) {
    const at = { route: r.id, evidence: file ? path.relative(f.root, file) : null };
    if (!html) { out.push(result('meta.title', 'FAIL', { ...at, reason: `no file serves ${r.path}` })); continue; }
    const title = textOf(html, 'title'), desc = metaContent(html, 'description') ?? '';
    out.push(result('meta.title', !title || count((h) => textOf(h, 'title'), title) > 1 ? 'FAIL' : title.length < 10 || title.length > 70 ? 'REVIEW' : 'PASS', { ...at, measured: title.length, threshold: '10-70', reason: !title ? 'no <title>' : count((h) => textOf(h, 'title'), title) > 1 ? `another page has the same title "${title}"` : title.length < 10 || title.length > 70 ? `"${title}" is ${title.length} characters` : `"${title}"` }));
    out.push(result('meta.description', desc.length < 50 || count((h) => metaContent(h, 'description'), desc) > 1 ? 'FAIL' : desc.length > 160 ? 'REVIEW' : 'PASS', { ...at, measured: desc.length, threshold: '50-160', reason: desc.length < 50 ? `${desc.length} characters (need 50 or more)` : count((h) => metaContent(h, 'description'), desc) > 1 ? 'another page has the same description' : desc.length > 160 ? `${desc.length} characters: search results usually cut it` : `${desc.length} characters` }));

    const canon = tags(html, 'link').find((t) => (t.attrs.rel || '').toLowerCase() === 'canonical')?.attrs.href || '';
    const want = origin ? join(origin, r.path) : null;
    out.push(result('meta.canonical', !canon || !isAbs(canon) ? 'FAIL' : !want ? 'PENDING' : canon === want ? 'PASS' : 'FAIL', { ...at, measured: canon || null, threshold: want, reason: !canon ? 'no <link rel="canonical">' : !isAbs(canon) ? `${canon} is not an absolute address` : !want ? 'set site.origin in routes.json to compare' : canon === want ? canon : `${canon} is not ${want}` }));

    const og = (k) => metaContent(html, `og:${k}`);
    const missing = ['title', 'type', 'image', 'url'].filter((k) => !og(k)), soft = ['description', 'image:alt'].filter((k) => !og(k));
    const urlOk = !og('url') || !canon || og('url') === canon;
    out.push(result('meta.og', missing.length || !urlOk ? 'FAIL' : soft.length ? 'REVIEW' : 'PASS', { ...at, reason: missing.length ? `missing og:${missing.join(', og:')}` : !urlOk ? `og:url ${og('url')} differs from the canonical ${canon}` : soft.length ? `no og:${soft.join(', og:')}` : 'og:title, type, image, url, description and image alt are all set' }));

    const img = og('image');
    if (!img) out.push(result('meta.og-image', 'FAIL', { ...at, reason: 'no og:image' }));
    else if (!isAbs(img)) out.push(result('meta.og-image', 'FAIL', { ...at, measured: img, reason: `${img} is not an absolute address; previews need https://...` }));
    else if (!origin || !img.startsWith(origin.replace(/\/$/, '') + '/')) out.push(result('meta.og-image', 'PENDING', { ...at, measured: img, reason: 'the image is on another host: open it by hand and check its size' }));
    else {
      const file2 = path.join(f.site, decodeURIComponent(img.slice(origin.replace(/\/$/, '').length)));
      const buf = fs.existsSync(file2) ? fs.readFileSync(file2) : null, size = buf && imageSize(buf);
      if (!buf) out.push(result('meta.og-image', 'FAIL', { ...at, measured: img, reason: `${path.relative(f.site, file2)} is not in the site folder` }));
      else if (!size) out.push(result('meta.og-image', 'FAIL', { ...at, measured: img, reason: 'not a PNG, JPEG, WebP or GIF file (previews need a raster image)' }));
      else {
        const ratio = size.w / size.h, small = size.w < 600 || size.h < 315, odd = Math.abs(ratio - 1.91) / 1.91 > 0.08;
        out.push(result('meta.og-image', small ? 'FAIL' : odd ? 'REVIEW' : 'PASS', { ...at, measured: `${size.w}x${size.h}`, threshold: '600x315 minimum, 1.91:1', reason: small ? `${size.w}x${size.h} is under 600x315` : odd ? `${size.w}x${size.h} is ${ratio.toFixed(2)}:1; most previews crop to 1.91:1` : `${size.w}x${size.h} ${size.type}` }));
      }
    }

    const robots = (metaContent(html, 'robots') || '').toLowerCase(), noindex = /noindex/.test(robots);
    out.push(result('meta.robots', r.indexable !== false && noindex ? 'FAIL' : r.indexable === false && !noindex ? 'FAIL' : 'PASS', { ...at, measured: robots || null, reason: r.indexable !== false && noindex ? 'the route is meant to be indexed but has noindex' : r.indexable === false && !noindex ? 'the route is "indexable": false but has no <meta name="robots" content="noindex">' : r.indexable === false ? 'noindex, as planned' : 'indexable, as planned' }));
  }

  const rtxt = readText(path.join(f.site, 'robots.txt'));
  const blocksAll = rtxt !== null && /user-agent:\s*\*[\s\S]*?\n\s*disallow:\s*\/\s*(\n|$)/i.test(rtxt) && routes.some((r) => r.indexable !== false);
  out.push(result('meta.robots-txt', blocksAll ? 'FAIL' : rtxt === null ? 'REVIEW' : 'PASS', { evidence: 'robots.txt', reason: blocksAll ? 'robots.txt has "Disallow: /" for every crawler' : rtxt === null ? 'no robots.txt (a missing file allows everything; add one that points at the sitemap)' : 'robots.txt does not block the site' }));

  const indexable = routes.filter((r) => r.indexable !== false);
  const smFile = path.join(f.site, 'sitemap.xml'), sm = readText(smFile);
  if (routes.length <= 1) out.push(result('meta.sitemap', 'PASS', { reason: 'one page: no sitemap needed' }));
  else if (sm === null) out.push(result('meta.sitemap', 'FAIL', { evidence: 'sitemap.xml', reason: `${routes.length} routes and no sitemap.xml (node build_sitemap.mjs writes it)` }));
  else {
    const locs = [...sm.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
    const wantLocs = indexable.map((r) => join(origin, r.path));
    const absent = wantLocs.filter((u) => !locs.includes(u)), extra = locs.filter((u) => !wantLocs.includes(u));
    out.push(result('meta.sitemap', absent.length || extra.length ? 'FAIL' : 'PASS', { evidence: 'sitemap.xml', measured: locs.length, threshold: wantLocs.length, reason: [...(absent.length ? [`missing ${absent.join(', ')}`] : []), ...(extra.length ? [`lists pages that should not be there: ${extra.join(', ')}`] : [])].join('; ') || `${locs.length} addresses, exactly the indexable routes` }));
  }
  return out;
}

if (process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const USAGE = 'usage: node check_meta.mjs <project-dir> [--site <dir>] [--out <dir>] [--strict] [--json]';
  let args;
  try { args = parseArgs(process.argv.slice(2), { value: ['site', 'out'], flags: ['strict', 'json'] }); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }
  if (args.flags.has('help')) { console.log(USAGE); process.exit(0); }
  if (!args.pos[0]) { console.error(USAGE); process.exit(2); }
  const f = projectFiles(args.pos[0], args.opts.site);
  let results;
  try { results = metaChecks(f); } catch (e) { console.error(`check_meta: ${e.message}`); process.exit(2); }
  writeQa(path.resolve(args.opts.out || f.out), 'check_meta', results, {}, { site: f.site });
  if (args.flags.has('json')) console.log(JSON.stringify(results, null, 2));
  else printResults('brief2motion meta check', results, f.site, null, { strict: args.flags.has('strict') });
  process.exit(passes(results, { strict: args.flags.has('strict') }) ? 0 : 1);
}
