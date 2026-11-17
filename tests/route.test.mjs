// The router: each example's own brief must route to the stack that example was built with, and the rules that
// keep it honest (no style from one stray word, React swaps, fallback phrases ignored) must hold.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { route, report } from '../skills/brief2motion/scripts/route.mjs';

const brief = (name) => fs.readFileSync(new URL(`../examples/${name}/BRIEF.md`, import.meta.url), 'utf8');
const EXPECT = { 'copper-no-7': 'particles', relay: 'motion', 'halden-one': 'three', tidewater: 'gsap', halvorsen: 'view-transitions', keeling: 'svg', mise: 'motion-react', sprout: 'players', 'style-atlas': 'vanilla' };

for (const [name, stack] of Object.entries(EXPECT)) {
  test(`examples/${name}/BRIEF.md routes to ${stack}`, () => {
    const r = route(brief(name));
    assert.equal(r.stack.id, stack);
    assert.equal(r.stack.example.length > 0, true);
    assert.ok(r.read.includes('accessibility.md') && r.read.includes('performance.md') && r.read.includes('design-fundamentals.md'));
    for (const f of r.read) assert.ok(fs.existsSync(new URL(`../skills/brief2motion/references/${f}`, import.meta.url)), `references/${f} exists`);
  });
}

test('a vague brief gets the plain kit and no style', () => {
  const r = route('make it pop');
  assert.equal(r.stack.id, 'vanilla');
  assert.equal(r.style.id, null);
  assert.equal(r.style.confidence, 'none');
});
test('one stray word does not pick a look ("paper" in "paper plane")', () => {
  const r = route('Make my product rise out of dust on my landing page. A paper plane flies across when I scroll.');
  assert.equal(r.stack.id, 'particles');
  assert.equal(r.style.id, null);
});
test('a style named in the brief wins over an inferred one', () => {
  const r = route('A glassmorphism landing page for our bank, calm and trustworthy.');
  assert.equal(r.style.id, 'glassmorphism');
  assert.equal(r.style.confidence, 'named');
});
test('aliases are recognised', () => {
  assert.equal(route('We want a soft UI look for the smart-home dial page').style.id, 'neumorphism');
  assert.equal(route('neo-brutalism please, for my indie newsletter').style.id, 'neubrutalism');
});
test('audience picks a style when none is named', () => {
  assert.equal(route('Landing page for a bank savings product. Subtle hover only.').style.id, 'swiss');
  assert.equal(route('A learning app for children aged 6 to 9, with a friendly mascot.').style.id, 'claymorphism');
  assert.equal(route('Docs site and landing page for our open source CLI for developers.').style.id, 'dark-first');
});
test('3D in a React project goes to React Three Fiber', () => {
  const r = route('A Next.js launch page for our headphones with a 3D turntable you can rotate.');
  assert.equal(r.framework, 'react');
  assert.equal(r.stack.id, 'r3f');
  assert.match(r.cautions.join(' '), /bundler/);
});
test('3D without React stays plain three.js', () => {
  assert.equal(route('A launch page with a 3D product viewer you can rotate. Plain HTML.').stack.id, 'three');
});
test('interface motion in React goes to Motion for React', () => {
  assert.equal(route('Our React dashboard needs layout animation when cards reorder and a springy drawer.').stack.id, 'motion-react');
});
test('a fallback requirement is not a request for 3D', () => {
  const r = route('Fade the sections in as they appear. It must still read without WebGL and with JavaScript off.');
  assert.equal(r.stack.id, 'vanilla');
});
test('WebGL stacks carry the fallback caution', () => {
  assert.match(route('halftone portrait made of dots that forms my face').cautions.join(' '), /still picture/);
});
test('heavy computation adds the WebAssembly note', () => {
  const r = route('A fluid simulation with millions of particles behind the hero.');
  assert.ok(r.supporting.some((s) => s.id === 'wasm'));
});
test('an unreal style name is not matched to anything', () => {
  assert.equal(route('We want spectromorphism for the site.').style.id, null);
});
test('the report names the stack, the reason and what to read', () => {
  const text = report(route(brief('tidewater')));
  assert.match(text, /^Stack: GSAP/);
  assert.match(text, /references\/stacks\/gsap\.md/);
  assert.match(text, /Read before building:/);
});
test('the command line reads a file, standard input and rejects an empty brief', () => {
  const cli = new URL('../skills/brief2motion/scripts/route.mjs', import.meta.url).pathname;
  const json = JSON.parse(execFileSync('node', [cli, new URL('../examples/relay/BRIEF.md', import.meta.url).pathname, '--json'], { encoding: 'utf8' }));
  assert.equal(json.stack.id, 'motion');
  assert.match(execFileSync('node', [cli, '-'], { input: 'particles that form my logo', encoding: 'utf8' }), /dust engine/);
  assert.throws(() => execFileSync('node', [cli, '-'], { input: '   ', encoding: 'utf8', stdio: 'pipe' }));
});
