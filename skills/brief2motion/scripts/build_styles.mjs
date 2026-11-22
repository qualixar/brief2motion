#!/usr/bin/env node
// build_styles.mjs: one source for the style system, three things made from it.
//   references/styles.json + references/styles/<id>.css   (the source: facts, tokens and the CSS for each style)
//     -> references/styles.md             the index the agent reads first
//     -> references/styles/<id>.md        one page per style: rules, tokens, the CSS, motion, accessibility, sources
//     -> examples/style-atlas/            a page that shows every style live, so check_site.mjs can measure the same CSS
//   node build_styles.mjs           write the files
//   node build_styles.mjs --check   exit 1 if any generated file is out of date (the repo tests run this)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.resolve(HERE, '..');
const REF = path.join(SKILL, 'references');
const ATLAS = path.resolve(SKILL, '..', '..', 'examples', 'style-atlas');
const CHECK = process.argv.includes('--check');
const data = JSON.parse(fs.readFileSync(path.join(REF, 'styles.json'), 'utf8'));
const cssOf = (id) => fs.readFileSync(path.join(REF, 'styles', `${id}.css`), 'utf8').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// @keyframes cannot sit inside a style rule, so they are lifted out of each style's nested block.
export function hoistKeyframes(css) {
  const frames = []; let out = '', i = 0;
  while (i < css.length) {
    const at = css.indexOf('@keyframes', i);
    if (at < 0) { out += css.slice(i); break; }
    out += css.slice(i, at);
    let depth = 0, j = css.indexOf('{', at);
    for (; j < css.length; j++) { if (css[j] === '{') depth++; else if (css[j] === '}' && --depth === 0) break; }
    frames.push(css.slice(at, j + 1)); i = j + 1;
  }
  return { body: out, frames };
}
const TOKEN_VARS = { bg: '--bg', surface: '--surface', fg: '--fg', muted: '--muted', accent: '--accent', accentFg: '--accent-fg', border: '--border', radius: '--radius', shadow: '--shadow', fontDisplay: '--font-display', fontText: '--font-text', weightDisplay: '--weight-display', tracking: '--tracking' };
const tokenCss = (t) => Object.entries(TOKEN_VARS).map(([k, v]) => `${v}: ${t[k]};`).join(' ');
// the scoped rule for one style, exactly as the atlas loads it and as the docs print it
export function scopedCss(style) {
  const { body, frames } = hoistKeyframes(cssOf(style.id));
  return `.stage[data-style="${style.id}"] {\n  ${tokenCss(style.tokens)}\n${body.split('\n').map((l) => (l.trim() ? '  ' + l : l)).join('\n').replace(/\s+$/, '')}\n}${frames.length ? '\n' + frames.join('\n') : ''}`;
}

// Everything below runs only when this file is the program (tests import the two functions above).
const IS_MAIN = process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(import.meta.url));
if (IS_MAIN) {
const specimens = data.styles.filter((s) => s.specimen), approaches = data.styles.filter((s) => !s.specimen);
const list = (items) => items.map((x) => `- ${x}`).join('\n');
const files = new Map();   // absolute path -> content

/* ---- 1. the docs ---- */
const BASE_NOTE = 'The CSS below is the block the style atlas loads (`examples/style-atlas/`), so it has been through `check_site.mjs`. It styles the specimen markup in `references/styles/_specimen.html`; `.s-btn`, `.s-card` and the rest are that markup\'s class names. Take the tokens and the signature rules into your own page; do not copy the specimen.';
for (const s of data.styles) {
  const lines = [`# ${s.name}`, '', s.aliases.length ? `Also called: ${s.aliases.join(', ')}.` : null, `Family: ${data.families[s.family]}.`, '', s.what, s.origin ? `\n${s.origin}` : null, s.note ? `\n${s.note}` : null, '', '## Signature rules', '', list(s.rules), ''].filter((x) => x !== null);
  if (s.specimen) {
    lines.push('## Tokens', '', '| Token | Value |', '|---|---|', ...Object.entries(TOKEN_VARS).map(([k, v]) => `| \`${v}\` | \`${s.tokens[k]}\` |`), '');
    lines.push('## Tested CSS', '', BASE_NOTE, '', '```css', scopedCss(s), '```', '');
  } else {
    lines.push('## Worked example', '', `\`examples/${s.example}/\` is a complete site built this way, with its brief, its motion plan at the top of its script and a passing \`site-report.json\`. The stack reference to read is \`references/stacks/${s.stack}.md\`.`, '');
  }
  lines.push('## Motion that fits', '', s.motion, '', '## Accessibility', '', list(s.a11y), '', '## Choose it for', '', list(s.choose), '', '## Avoid it for', '', list(s.avoid), '', '## Sources', '', list(s.sources.map((u) => `<${u}>`)), '', `Facts checked on ${data.checked}.`, '');
  files.set(path.join(REF, 'styles', `${s.id}.md`), lines.join('\n'));
}
{
  const row = (s) => `| [${s.name}](styles/${s.id}.md) | ${s.what.split('. ')[0].replace(/\.$/, '')}. | ${s.choose[0]} | ${s.avoid[0]} |`;
  const lines = ['# The style system', '',
    `${data.styles.length} visual styles and approaches for the web, each checked against a published source on ${data.checked}. This is the index. When a brief names or implies a style, open that style's own page for its tokens, tested CSS, motion and accessibility notes. \`route.mjs\` picks one from a brief and says why.`, '',
    'A style is a starting point for the look, never a reason to ignore the brief. If the brief gives colours, type or a reference site, those win. If it gives none, pick the style whose "choose it for" matches the product and audience, and say in SPEC.md why.', ''];
  for (const [fam, title] of Object.entries(data.families)) {
    const group = data.styles.filter((s) => s.family === fam); if (!group.length) continue;
    lines.push(`## ${title}`, '', fam === 'approach' ? '| Approach | What it is | Choose it for | Avoid it for |' : '| Style | What it is | Choose it for | Avoid it for |', '|---|---|---|---|', ...group.map(row), '');
  }
  lines.push('## Tools, not styles', '', ...data.techniques.map((t) => `- **${t.name}.** ${t.what}`), '', '## Names that are not styles', '', ...data.notReal.map((n) => `- **${n.name}.** ${n.verdict}`), '',
    '## How the pages are made', '', 'Every page in `references/styles/` and the atlas in `examples/style-atlas/` are generated from `references/styles.json` and the CSS files beside it by `scripts/build_styles.mjs`. Edit the JSON or the CSS, run the script, then run `check_site.mjs` on the atlas.', '');
  files.set(path.join(REF, 'styles.md'), lines.join('\n'));
}

/* ---- 2. the atlas ---- */
const SPECIMEN = (s) => `      <div class="stage" data-style="${s.id}">
        <div class="s-nav"><span class="s-logo">Orbit</span><span class="s-links"><a href="#${s.id}">Product</a><a href="#${s.id}">Pricing</a></span></div>
        <div class="s-main">
          <h3 class="s-title">Ship the thing you planned.</h3>
          <p class="s-text">Orbit keeps one list of what the team agreed to build this week, and shows what is left.</p>
          <div class="s-actions"><button type="button" class="s-btn">Start free</button><button type="button" class="s-btn s-btn-2">See how it works</button></div>
        </div>
        <div class="s-card">
          <span class="s-label">Closed this week</span>
          <strong class="s-stat">128</strong>
          <span class="s-note">tasks, 14 still open</span>
          <label class="s-field"><span>Work email</span><input type="email" name="email-${s.id}" autocomplete="off" placeholder="you@example.com"></label>
        </div>
      </div>`;
files.set(path.join(REF, 'styles', '_specimen.html'), `<!-- The markup every style in this folder is written against. One style: <div class="stage" data-style="ID">. -->\n${SPECIMEN({ id: 'ID' })}\n`);

const section = (s) => `    <section class="specimen" id="${s.id}" aria-labelledby="t-${s.id}">
      <header class="spec-head">
        <p class="spec-family">${esc(data.families[s.family])}</p>
        <h2 id="t-${s.id}">${esc(s.name)}</h2>
        <p class="spec-what">${esc(s.what)}</p>
      </header>
${SPECIMEN(s)}
      <details class="spec-more">
        <summary>Rules, motion, accessibility and when to choose it</summary>
        <div class="spec-cols">
          <div><h3>Signature rules</h3><ul>${s.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>
          <div><h3>Motion that fits</h3><p>${esc(s.motion)}</p><h3>Choose it for</h3><p>${esc(s.choose.join('. '))}.</p><h3>Avoid it for</h3><p>${esc(s.avoid.join('. '))}.</p></div>
          <div><h3>Accessibility</h3><ul>${s.a11y.map((r) => `<li>${esc(r)}</li>`).join('')}</ul><h3>Sources</h3><ul>${s.sources.map((u) => `<li><a href="${esc(u)}">${esc(new URL(u).hostname.replace(/^www\./, ''))}</a></li>`).join('')}</ul></div>
        </div>
      </details>
    </section>`;
const families = Object.entries(data.families).filter(([f]) => f !== 'approach');
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Style atlas · ${specimens.length} web design styles, live</title>
  <meta name="description" content="${specimens.length} web design styles shown side by side on the same small page: neubrutalism, glassmorphism, neumorphism, claymorphism, Swiss, bento, Y2K, Art Deco and more, each with its rules, motion and accessibility notes. Part of brief2motion.">
  <link rel="canonical" href="https://style-atlas.example/">
  <meta property="og:title" content="Style atlas · ${specimens.length} web design styles, live">
  <meta property="og:description" content="The same small page in ${specimens.length} visual styles, with the rules, motion and accessibility notes for each.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://style-atlas.example/">
  <meta property="og:image" content="https://style-atlas.example/og.jpg">
  <meta property="og:image:alt" content="Style atlas: the opening screen of a page that shows ${specimens.length} web design styles.">
  <meta name="theme-color" content="#f5f5f2">
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="kit/kit.css">
  <link rel="stylesheet" href="atlas.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="top">
    <a class="top-name" href="#main">Style atlas</a>
    <nav aria-label="Style families">${families.map(([f, t]) => `<a href="#fam-${f}">${esc(t.replace(/ styles$/, '').replace(/^Visual /, ''))}</a>`).join('')}<a href="#fam-approach">Approaches</a></nav>
  </header>
  <main id="main">
    <section class="intro">
      <h1>The same small page, in ${specimens.length} styles.</h1>
      <p>Every block below is one product page fragment: a nav, a headline, two buttons, a card with a number and a field. Only the style changes. Hover, press and tab through each one, then open its notes. brief2motion picks from these when a brief says what the product is and who it is for.</p>
    </section>
${families.map(([f, t]) => `    <h2 class="fam" id="fam-${f}">${esc(t)}</h2>
    <ul class="fam-index">${specimens.filter((s) => s.family === f).map((s) => `<li><a href="#${s.id}">${esc(s.name)}</a></li>`).join('')}</ul>
${specimens.filter((s) => s.family === f).map(section).join('\n')}`).join('\n')}
    <h2 class="fam" id="fam-approach">${esc(data.families.approach)}</h2>
    <p class="fam-note">These four are ways of using motion, not looks, so each has a whole example site in the brief2motion repository.</p>
    <ul class="approaches">
${approaches.map((s) => `      <li><h3>${esc(s.name)}</h3><p>${esc(s.what)}</p><p><a href="https://github.com/qualixar/brief2motion/tree/main/examples/${s.example}">Example site: ${esc(s.example)}</a></p></li>`).join('\n')}
    </ul>
  </main>
  <footer class="foot"><p>Generated from <code>references/styles.json</code> by <a href="https://github.com/qualixar/brief2motion">brief2motion</a>. Facts checked on ${data.checked}; sources are listed under each style.</p></footer>
  <script type="module" src="atlas.js"></script>
</body>
</html>
`;
files.set(path.join(ATLAS, 'index.html'), html);
const base = fs.readFileSync(path.join(REF, 'styles', '_atlas-base.css'), 'utf8');
files.set(path.join(ATLAS, 'atlas.css'), `/* Generated by skills/brief2motion/scripts/build_styles.mjs. Edit references/styles/*.css and run it again. */\n${base}\n/* ---- one block per style ---- */\n${specimens.map(scopedCss).join('\n\n')}\n`);

/* ---- write or check ---- */
let stale = 0;
for (const [file, content] of files) {
  const have = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (have === content) continue;
  if (CHECK) { console.error(`out of date: ${path.relative(process.cwd(), file)}`); stale++; }
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
}
if (CHECK) { console.log(stale ? `${stale} generated file(s) out of date: run node ${path.relative(process.cwd(), fileURLToPath(import.meta.url))}` : `style system: ${files.size} generated files are current`); process.exit(stale ? 1 : 0); }
console.log(`style system: ${data.styles.length} styles (${specimens.length} with a live specimen), ${files.size} files written`);
}
