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
  const r = spawnSync(process.execPath, [path.join(SCRIPTS, script), ...args, ...(json ? ['--json'] : [])], { encoding: 'utf8', env: { ...process.env, ...env }, timeout: 240000 });
  let results = null;
  if (json) { try { results = JSON.parse(r.stdout); } catch { /* not JSON: the tool failed before printing */ } }
  return { status: r.status, results, stdout: r.stdout, stderr: r.stderr };
}
export const outcomeOf = (results, id, filter = () => true) => (results || []).filter((r) => r.id === id && filter(r)).map((r) => r.outcome);
