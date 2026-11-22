// One version everywhere. The plugin manifest is the source; every other place that declares the skill's version must say
// the same thing, so a release cannot ship with a stale badge, heading, guide cover or changelog.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const VERSION = json('.claude-plugin/plugin.json').version;

test('the version is a plain x.y.z number', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test('the Codex manifest and the marketplace entry carry the same version', () => {
  assert.equal(json('.codex-plugin/plugin.json').version, VERSION);
  const entries = json('.claude-plugin/marketplace.json').plugins.filter((p) => p.name === 'brief2motion');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].version, VERSION);
});

test('SKILL.md heading says the version', () => {
  assert.match(read('skills/brief2motion/SKILL.md'), new RegExp(`^# brief2motion ${VERSION.replaceAll('.', '\\.')}$`, 'm'));
});

test('the README badge says the version, in its label and its address', () => {
  const readme = read('README.md');
  assert.ok(readme.includes(`alt="Version ${VERSION}"`), 'badge alt text');
  assert.ok(readme.includes(`badge/version-${VERSION}-`), 'badge address');
});

test('the changelog has an entry for the version, newest first and not "Unreleased"', () => {
  const heads = [...read('CHANGELOG.md').matchAll(/^## \[([^\]]+)\]/gm)].map((m) => m[1]);
  assert.equal(heads[0], VERSION, `first changelog heading is ${heads[0]}`);
});

test('the guide is built for the version', () => {
  const html = read('docs/guide/brief2motion-guide.html');
  assert.ok(html.includes(`<title>brief2motion ${VERSION}: the web motion guide</title>`), 'guide html title');
  const stale = [...html.matchAll(/brief2motion (\d+\.\d+\.\d+)/g)].map((m) => m[1]).filter((v) => v !== VERSION);
  assert.deepEqual(stale, [], 'guide html names another version');
});
