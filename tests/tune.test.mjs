// The dev-only tuning panel: its pure parts, the request flag, and the strip step that keeps it out of a shipped page.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { guessRange, snapshot, tuneRequested, tune, TWEAKPANE } from '../skills/brief2motion/kit/tune.js';
import { stripTune, hasTune, findDevTools, stripSite } from '../skills/brief2motion/scripts/strip_tune.mjs';

const CLI = new URL('../skills/brief2motion/scripts/strip_tune.mjs', import.meta.url).pathname;
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'b2m-tune-'));
const write = (dir, rel, text) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), text); };
const PAGE_JS = "import { signal } from './kit/motion-core.js';\nconst P = { duration: 0.7 };\n/* tune:start */\nif (new URLSearchParams(location.search).has('tune')) import('./kit/tune.js').then(({ tune }) => tune(P));\n/* tune:end */\nsignal('ready');\n";

test('tuneRequested only says yes for ?tune', () => {
  assert.equal(tuneRequested('?tune'), true); assert.equal(tuneRequested('?a=1&tune=1'), true);
  assert.equal(tuneRequested(''), false); assert.equal(tuneRequested('?tuned=1'), false); assert.equal(tuneRequested('?x=tune'), false);
});
test('tune() without ?tune returns the same object and loads nothing', async () => {
  const P = { duration: 0.7 };
  const r = await tune(P);                       // in Node there is no location, so no flag
  assert.equal(r.params, P); assert.equal(r.pane, null);
});
test('guessRange: a range that holds the value, symmetric for negatives, a step that suits the size', () => {
  assert.deepEqual(guessRange(0.7), { min: 0, max: 2.8, step: 0.01 });
  assert.deepEqual(guessRange(0.07), { min: 0, max: 1, step: 0.01 });
  assert.deepEqual(guessRange(24), { min: 0, max: 96, step: 0.5 });
  assert.deepEqual(guessRange(-20), { min: -80, max: 80, step: 0.5 });
  assert.deepEqual(guessRange(NaN), {}); assert.deepEqual(guessRange(1200), { min: 0, max: 4800, step: 1 });
  for (const v of [0.07, 0.7, 3, 24, 300]) { const r = guessRange(v); assert.ok(r.min <= v && v <= r.max, `${v} fits`); }
});
test('snapshot is JSON the page can paste back', () => {
  const P = { duration: 0.7, ease: 'power3.out', tint: '#1b4dff' };
  assert.deepEqual(JSON.parse(snapshot(P)), P);
});
test('Tweakpane is pinned to one version with an integrity hash', () => {
  assert.equal(TWEAKPANE.version, '4.0.5');
  assert.match(TWEAKPANE.url, /cdn\.jsdelivr\.net\/npm\/tweakpane@4\.0\.5\//);
  assert.match(TWEAKPANE.integrity, /^sha384-[A-Za-z0-9+/]{64}$/);
  assert.throws(() => { TWEAKPANE.version = '9'; }, TypeError, 'the pin is frozen');
});

test('stripTune removes JS and HTML blocks and nothing else', () => {
  assert.equal(stripTune(PAGE_JS), "import { signal } from './kit/motion-core.js';\nconst P = { duration: 0.7 };\nsignal('ready');\n");
  const html = '<body>\n  <!-- tune:start -->\n  <script type="module" src="tune-boot.js"></script>\n  <!-- tune:end -->\n  <p>hi</p>\n</body>\n';
  assert.equal(stripTune(html), '<body>\n  <p>hi</p>\n</body>\n');
  assert.equal(stripTune('a\r\n/* tune:start */\r\nx\r\n/* tune:end */\r\nb\r\n'), 'a\r\nb\r\n');
  const two = '/* tune:start */a/* tune:end */\nkeep\n/* tune:start */b/* tune:end */\n';
  assert.equal(stripTune(two), 'keep\n');
  assert.equal(stripTune('const tuned = 1; // the word tune alone\n'), 'const tuned = 1; // the word tune alone\n');
});
test('hasTune sees a marker or a Tweakpane reference, not a plain word', () => {
  assert.equal(hasTune(PAGE_JS), true); assert.equal(hasTune('import "https://x/tweakpane.js"'), true);
  assert.equal(hasTune('const tune = 3'), false);
  assert.equal(hasTune('<p>The tuning panel used Tweakpane (MIT), see <a href="https://tweakpane.github.io/docs/">its docs</a>.</p>'), false, 'naming it in a credits page is fine');
  assert.equal(hasTune("import { Pane } from 'tweakpane';"), true);
  assert.equal(hasTune('<script src="https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js"></script>'), true);
  assert.equal(hasTune("await import('/vendor/tweakpane-4.js')"), true);
});

test('findDevTools and stripSite clean a site folder and leave the rest alone', () => {
  const d = tmp();
  write(d, 'index.html', '<h1>ok</h1>\n'); write(d, 'main.js', PAGE_JS); write(d, 'kit/tune.js', '// panel\n'); write(d, 'kit/motion-core.js', 'export const x = 1;\n');
  assert.deepEqual(findDevTools(d).map((f) => f.file).sort(), ['kit/tune.js', 'main.js']);
  const r = stripSite(d);
  assert.deepEqual(r.removed, ['kit/tune.js']); assert.deepEqual(r.edited, ['main.js']); assert.deepEqual(r.left, []);
  assert.equal(fs.existsSync(path.join(d, 'kit/tune.js')), false);
  assert.equal(fs.readFileSync(path.join(d, 'kit/motion-core.js'), 'utf8'), 'export const x = 1;\n');
  assert.equal(findDevTools(d).length, 0);
  fs.rmSync(d, { recursive: true });
});
test('the command line: --check fails while the panel is there, passes after the strip', () => {
  const d = tmp(); write(d, 'main.js', PAGE_JS); write(d, 'kit/tune.js', '// panel\n');
  const bad = spawnSync('node', [CLI, d, '--check'], { encoding: 'utf8' });
  assert.equal(bad.status, 1); assert.match(bad.stdout, /kit\/tune\.js/);
  assert.match(execFileSync('node', [CLI, d], { encoding: 'utf8' }), /tuning panel removed/);
  assert.equal(spawnSync('node', [CLI, d, '--check'], { encoding: 'utf8' }).status, 0);
  assert.equal(spawnSync('node', [CLI, path.join(d, 'nope')], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync('node', [CLI], { encoding: 'utf8' }).status, 2);
  fs.rmSync(d, { recursive: true });
});
