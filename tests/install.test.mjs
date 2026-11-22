// The one-time playwright-core install (placeInstall in _common.mjs) repairs a broken copy of the same version, replaces a
// wrong version, never replaces a good copy another checker just placed, and leaves no old folders behind.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { tmp } from './_design_helpers.mjs';
import { placeInstall, installed, npmCommand } from '../skills/brief2motion/scripts/_common.mjs';

const pkg = (dir, version, entry = true, mark = '') => { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version })); if (entry) fs.writeFileSync(path.join(dir, 'index.mjs'), `export const mark = '${mark}';`); return dir; };
const setup = () => { const d = tmp('deps'), nm = path.join(d, 'node_modules'); fs.mkdirSync(nm); return { nm, target: path.join(nm, 'playwright-core'), fresh: pkg(path.join(d, 'stage', 'playwright-core'), '1.65.1', true, 'fresh') }; };
const leftovers = (nm) => fs.readdirSync(nm).filter((e) => e.includes('.old-'));

test('a broken copy of the same version (no entry file) is replaced, not kept for ever', () => {
  const { nm, target, fresh } = setup();
  pkg(target, '1.65.1', false);
  assert.equal(installed(target, '1.65.1'), false);
  placeInstall(fresh, target, '1.65.1');
  assert.equal(installed(target, '1.65.1'), true);
  assert.match(fs.readFileSync(path.join(target, 'index.mjs'), 'utf8'), /fresh/);
  assert.deepEqual(leftovers(nm), []);
});
test('a wrong version is replaced and old folders from earlier runs are swept up', () => {
  const { nm, target, fresh } = setup();
  pkg(target, '1.60.0'); pkg(path.join(nm, 'playwright-core.old-123'), '1.50.0');
  placeInstall(fresh, target, '1.65.1');
  assert.equal(installed(target, '1.65.1'), true);
  assert.deepEqual(leftovers(nm), []);
});
test('a good copy another checker placed first is kept, so files are never pulled from under a running checker', () => {
  const { target, fresh } = setup();
  pkg(target, '1.65.1', true, 'first');
  placeInstall(fresh, target, '1.65.1');
  assert.match(fs.readFileSync(path.join(target, 'index.mjs'), 'utf8'), /first/);
});
test('npm is started without a shell: plain npm on macOS and Linux, Node\'s own npm-cli.js on Windows', () => {
  assert.deepEqual(npmCommand({ platform: 'darwin' }), { cmd: 'npm', pre: [], shell: false });
  const win = npmCommand({ platform: 'win32', execPath: 'C:\\Program Files\\nodejs\\node.exe', exists: () => true });
  assert.deepEqual(win, { cmd: 'C:\\Program Files\\nodejs\\node.exe', pre: ['C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js'], shell: false });
  assert.equal(npmCommand({ platform: 'win32', execPath: 'C:\\n\\node.exe', exists: () => false }).shell, true, 'the shell is only a fallback');
});
