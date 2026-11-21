// The pattern recipes in references/patterns/ must be real: every page has the same sections, every JavaScript sketch
// parses as a module, every import from ./kit/ names something the kit exports, every CSS sketch has balanced braces,
// the index lists every page, and every link to another reference page resolves.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF = path.join(ROOT, 'skills', 'brief2motion', 'references');
const DIR = path.join(REF, 'patterns');
const KIT = path.join(ROOT, 'skills', 'brief2motion', 'kit');
const pages = fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
const read = (f) => fs.readFileSync(path.join(DIR, f), 'utf8');

const SECTIONS = ['## Sketch', '## Budget', '## Reduced motion', '## Checks'];
const LABELS = ['**Use when:**', '**Not when:**', '**Stack:**', '**Brief words:**', '**Study:**'];

export function codeBlocks(md) {
  return [...md.matchAll(/```(\w*)\n([\s\S]*?)```/g)].map((m) => ({ lang: m[1], code: m[2] }));
}

test('codeBlocks reads fenced blocks with their language', () => {
  const b = codeBlocks('a\n```js\nconst x = 1;\n```\ntext\n```css\n.a { }\n```\n');
  assert.deepEqual(b, [{ lang: 'js', code: 'const x = 1;\n' }, { lang: 'css', code: '.a { }\n' }]);
});

test('between 20 and 30 patterns, and the index lists each one', () => {
  assert.ok(pages.length >= 20 && pages.length <= 30, `${pages.length} pages`);
  const index = read('README.md');
  for (const f of pages) assert.ok(index.includes(`](${f})`), `${f} is in README.md`);
});

for (const f of pages) {
  const md = read(f);
  test(`${f}: sections, labels, size`, () => {
    assert.match(md, /^# .+\n/);
    for (const s of SECTIONS) assert.ok(md.includes(s), `${s}`);
    for (const l of LABELS) assert.ok(md.includes(l), `${l}`);
    assert.ok(md.split('\n').length <= 120, `${md.split('\n').length} lines`);
    assert.ok(codeBlocks(md).some((b) => b.lang === 'js') || /CSS only|config only|config\.js/.test(md), 'a JavaScript sketch, or a stated CSS-only or config-only recipe');
    const section = (name) => (md.match(new RegExp(`^${name}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |(?![\\s\\S]))`, 'm')) || [, ''])[1].trim();
    for (const s of ['## Budget', '## Reduced motion', '## Checks']) assert.ok(section(s).length >= 40, `${s} says something`);
    assert.match(section('## Checks'), /check_site\.mjs|check_motion\.mjs/);
    assert.match(md, /reduced|Reduced/);
    assert.doesNotMatch(md, /—/, 'no em dash');
  });

  test(`${f}: JavaScript parses and kit imports exist`, async () => {
    for (const [i, { lang, code }] of codeBlocks(md).entries()) {
      if (lang === 'js') {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b2m-pat-'));
        const file = path.join(dir, 'sketch.mjs');
        fs.writeFileSync(file, code);
        const r = spawnSync('node', ['--check', file], { encoding: 'utf8' });
        fs.rmSync(dir, { recursive: true });
        assert.equal(r.status, 0, `${f} js block ${i} does not parse:\n${r.stderr.split('\n').slice(0, 4).join('\n')}`);
        for (const m of code.matchAll(/import\s+\{([^}]+)\}\s+from\s+'\.\/kit\/([\w-]+)\.js'/g)) {
          const mod = await import(pathToFileURL(path.join(KIT, `${m[2]}.js`)).href);
          for (const name of m[1].split(',').map((n) => n.trim().split(/\s+as\s+/)[0]).filter(Boolean)) assert.ok(name in mod, `${f}: kit/${m[2]}.js does not export ${name}`);
        }
        for (const m of code.matchAll(/import\('\.\/kit\/([\w-]+)\.js'\)/g)) assert.ok(fs.existsSync(path.join(KIT, `${m[1]}.js`)));
      } else if (lang === 'css') {
        const open = (code.match(/{/g) || []).length, close = (code.match(/}/g) || []).length;
        assert.equal(open, close, `${f} css block ${i}: ${open} { and ${close} }`);
      }
    }
  });

  test(`${f}: references to other pages exist`, () => {
    for (const m of md.matchAll(/`((?:stacks\/|references\/)?[\w-]+\.md|patterns\/[\w-]+\.md|\.\.\/[\w-]+\.md)`/g)) {
      const name = m[1].replace(/^references\//, '');
      if (/^(CREDITS|REPORT|SPEC|README)\.md$/.test(name)) continue;       // files of the user's project, not of this skill
      const candidates = [path.join(REF, name), path.join(DIR, name), path.join(REF, 'stacks', name)];
      assert.ok(candidates.some((c) => fs.existsSync(c)), `${f} mentions ${name}, which does not exist`);
    }
    for (const m of md.matchAll(/`examples\/([\w-]+)\/`/g)) assert.ok(fs.existsSync(path.join(ROOT, 'examples', m[1])), `example ${m[1]}`);
  });
}

test('the CSS braces check would catch a broken block (negative)', () => {
  const open = ('.a { color: red;'.match(/{/g) || []).length, close = ('.a { color: red;'.match(/}/g) || []).length;
  assert.notEqual(open, close);
});
