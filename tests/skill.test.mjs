// SKILL.md front matter stays inside the Agent Skills limits (agentskills.io/specification: name up to 64 characters,
// description up to 1,024; Claude Code cuts its listing at 1,536), and the description keeps the words that trigger it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const md = fs.readFileSync(fileURLToPath(new URL('../skills/brief2motion/SKILL.md', import.meta.url)), 'utf8');
const field = (k) => (md.match(new RegExp(`^${k}: (.*)$`, 'm')) || [])[1] || '';

test('SKILL.md name and description fit the Agent Skills limits and keep the trigger words', () => {
  assert.match(md, /^---\n/);
  const name = field('name'), desc = field('description');
  assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/); assert.ok(name.length <= 64);
  assert.ok(desc.length > 0 && desc.length <= 1024, `description is ${desc.length} characters (limit 1024)`);
  for (const w of ['website', 'landing page', 'site mode', 'wireframes', 'scrollytelling', 'parallax', 'page transitions', '3D', 'Lottie', 'Rive', 'neubrutalism', 'GSAP', 'three.js', 'reduced motion', 'brief2mp4']) assert.ok(desc.includes(w), `description says "${w}"`);
});
