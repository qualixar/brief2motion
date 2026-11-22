// Shared by the site-mode tests: paths, and running a checker on a fixture as a person would, from the command line.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SCRIPTS = path.join(ROOT, 'skills', 'brief2motion', 'scripts');
export const FIX = path.join(ROOT, 'tests', 'fixtures', 'design-checks');
export const tmp = (name) => fs.mkdtempSync(path.join(os.tmpdir(), `b2m-${name}-`));

// Runs `node <script> <args> --json` and returns { status, results, stdout, stderr }. results is the parsed JSON, or null.
export function runChecker(script, args, { env = {}, json = true } = {}) {
  const r = spawnSync(process.execPath, [path.resolve(SCRIPTS, script), ...args, ...(json ? ['--json'] : [])], { encoding: 'utf8', env: { ...process.env, ...env }, timeout: 240000 });
  let results = null;
  if (json) { try { results = JSON.parse(r.stdout); } catch { /* not JSON: the tool failed before printing */ } }
  return { status: r.status, results, stdout: r.stdout, stderr: r.stderr };
}
export const outcomeOf = (results, id, filter = () => true) => (results || []).filter((r) => r.id === id && filter(r)).map((r) => r.outcome);

// A browser checker exits 2 both when no browser can start and when it crashes. Only the first is a reason to skip:
// _common.mjs prints "Could not start a browser" (or "Could not install playwright-core" offline) in that case. Any other
// exit 2 is a crash, and the test fails with the checker's stderr. Returns true when the test was skipped.
export const NO_BROWSER = /Could not start a browser|Could not install playwright-core/;
export function noBrowser(t, r) {
  if (r.status !== 2) return false;
  if (NO_BROWSER.test(r.stderr || '')) { t.skip(`no browser could start: ${(r.stderr.match(NO_BROWSER) || [''])[0]}`); return true; }
  throw new Error(`the checker exited 2 but a browser was available, so it crashed:\n${String(r.stderr).slice(0, 1500)}`);
}
