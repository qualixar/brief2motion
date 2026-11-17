#!/usr/bin/env python3
"""build.py: assemble the brief2motion guide as one HTML file (brief2motion-guide.html) and a plain-text copy of
its prose (guide-prose.txt, for the humanize gate). render.py turns the HTML into the PDF.

The guide reads the repository so it cannot drift from it: the style pages come from references/styles.json, the
audience table from references/routing.json, each example's brief from examples/<name>/BRIEF.md and its numbers
from examples/<name>/site-report.json. Edit the prose in this file, the look in guide.css.

    python3 docs/guide/build.py
"""
import html
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
SKILL = REPO / 'skills' / 'brief2motion'
E = html.escape
STYLES = json.loads((SKILL / 'references' / 'styles.json').read_text())
ROUTING = json.loads((SKILL / 'references' / 'routing.json').read_text())
VERSION = json.loads((REPO / '.claude-plugin' / 'plugin.json').read_text())['version']
N_STYLES = len(STYLES['styles'])
N_LOOKS = sum(1 for s in STYLES['styles'] if s['specimen'])


def inline(t):
    t = E(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
    return t


def p(*paras):
    return ''.join(f'<p>{inline(x)}</p>' for x in paras)


def lead(t):
    return f'<p class="lead">{inline(t)}</p>'


def h2(t):
    return f'<h2>{inline(t)}</h2>'


def h3(t):
    return f'<h3>{inline(t)}</h3>'


def ul(items):
    return '<ul>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ul>'


def ol(items):
    return '<ol>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + '</ol>'


def code(t):
    return f'<pre><code>{E(t.strip(chr(10)))}</code></pre>'


def table(head, rows, widths=None):
    cols = ''.join(f'<col style="width:{w}">' for w in widths) if widths else ''
    return (f'<table>{cols}<thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>'
            + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table>')


def note(title, text):
    return f'<aside><b>{inline(title)}</b>{p(text)}</aside>'


def fig(src, caption):
    return f'<figure><img src="img/{src}" alt=""><figcaption>{inline(caption)}</figcaption></figure>'


def two(a, b):
    return f'<div class="two"><div>{a}</div><div>{b}</div></div>'


SECTIONS = []   # (id, title, eyebrow, body, in_toc)


def section(sid, title, eyebrow, body, toc=True):
    SECTIONS.append((sid, title, eyebrow, body, toc))


def report(name):
    return json.loads((REPO / 'examples' / name / 'site-report.json').read_text())


def frame(name, which):
    r = report(name)
    page = r['pages']['index.html']
    return page[which]['p95Ms']


def brief(name):
    lines = (REPO / 'examples' / name / 'BRIEF.md').read_text().strip().splitlines()[1:]
    return '\n'.join(x for x in lines if x.strip())


# ----------------------------------------------------------------------------------------------------- content

section('what', 'What you can build', 'Orientation', lead(
    'brief2motion is a skill for Claude Code and Codex. You describe a website in plain words, and the agent builds '
    'it with motion that suits it, then measures the result in a real browser before you see it.') + p(
    'This guide is for people who can describe what they want and would like to understand what they get back: '
    'founders, designers, marketers and developers. It explains how to write the brief, how the skill chooses its '
    'tools, what each tool is good at, the visual styles it knows, and what the checks mean. Every example in it is '
    'in the repository and runs on your machine.') + table(['Kind of site', 'What moves', 'Built with', 'Example'], [
        ['Product launch', 'a 3D object you can turn; scroll poses; an exploded view; colourways', 'three.js', '`halden-one`'],
        ['Brand scroll story', 'pinned scenes, a picture sequence scrubbed by scroll, a sideways gallery', 'GSAP, ScrollTrigger, Lenis', '`tidewater`'],
        ['Type-led landing page', 'a headline that sets word by word, rows of words that slide, springs', 'Motion', '`relay`'],
        ['Portfolio', 'a thumbnail that grows into the next page; a grid that glides when filtered', 'View Transitions API', '`halvorsen`'],
        ['Data story', 'one chart that redraws as you read; counters', 'SVG, D3 scales', '`keeling`'],
        ['App interface', 'tabs, drag to reorder, items moving between lists, numbers on springs', 'React, Motion for React', '`mise`'],
        ['Illustrated page', 'a drawing that draws itself, icon animations, pots that fill on scroll', 'CSS, JavaScript, Lottie', '`sprout`'],
        ['Particles', 'dust that forms a product, a logo, a face or a word', 'the dust engine', '`copper-no-7`'],
    ], ['20%', '38%', '24%', '18%']) + two(fig('halden-one-top.jpg', '`halden-one`: a radio built from about forty shapes in three.js. No model file, no photograph.'),
                                         fig('tidewater-25.jpg', '`tidewater`: the crystal is 48 pictures; your scroll position picks one.'))
    + note('What it is not', 'It is not a page builder with a visual editor, and it does not host your site. It writes ordinary '
           'files (HTML, CSS, JavaScript) into a folder that you can read, change and upload anywhere.'))

section('loop', 'How it works: one loop for every site', 'Orientation', lead(
    'Whatever the brief asks for, the agent goes through the same six steps. The fourth is the one that matters: '
    'the page is measured, and a failed check is a fix, not a footnote.') + fig('architecture.png', 'The loop, and the stacks the first step chooses from.') + table(
    ['Step', 'What happens', 'What you can read afterwards'], [
        ['1. Route', '`route.mjs` reads the brief and proposes a motion stack and a visual style, quoting the words that led there. The agent agrees or overrules.', 'the first lines of `SPEC.md`'],
        ['2. Spec', 'A design plan, a motion plan in three lists (on load, on scroll, on input), every word of copy, and a "done when" list.', '`SPEC.md`'],
        ['3. Build', 'Starts from the closest example and the shared kit, with the reference for that stack and style open.', '`site/`'],
        ['4. Check', '`check_site.mjs` opens the page in Chrome seven ways and measures it.', '`check/site-report.json`, `check/shots/`'],
        ['5. Fix', 'Fixes the page, never the budget, and measures again. Then looks at the screenshots.', 'the same files'],
        ['6. Deliver', 'Starts a local preview and writes the report.', '`REPORT.md` and an `http://localhost` link'],
    ], ['14%', '56%', '30%']) + p(
    'Two ideas hold the loop together. The first is that a brief ends in things that can be checked, so "done" is a list '
    'of numbers and screenshots instead of an opinion. The second is that the page has to work for everyone who opens '
    'it: on a small phone, with a keyboard, with motion switched off, without WebGL, even with JavaScript off.'))

section('setup', 'Setup', 'Getting started', lead('Two commands in Claude Code, then a new session.') + code(
    '/plugin marketplace add qualixar/brief2mp4\n/plugin install brief2motion@brief2mp4') + p(
    'If you do not use brief2mp4, add this repository as its own marketplace: `/plugin marketplace add qualixar/brief2motion`, '
    'then `/plugin install brief2motion@brief2motion`. In Codex: `codex plugin marketplace add qualixar/brief2motion`, then '
    '`codex plugin add brief2motion@brief2motion`. Or clone the repository and copy `skills/brief2motion` into `~/.claude/skills/` '
    'or `~/.codex/skills/`.') + table(['Tool', 'Needed for', 'Install on macOS'], [
        ['Node.js 22 or newer', 'everything', '`brew install node`'],
        ['Chrome or Chromium', 'the checks, which need a real browser with WebGL', '`brew install --cask google-chrome`'],
        ['playwright-core 1.65.1', 'driving the browser', 'downloaded once by the first check, about 14 MB'],
        ['Python 3', 'the preview server (a Node version is included)', 'preinstalled'],
        ['ffmpeg', 'a short film of the page (optional)', '`brew install ffmpeg`'],
    ], ['26%', '42%', '32%']) + p(
    'Check a machine at any time with `bash skills/brief2motion/scripts/doctor.sh`. It prints `ok` or the exact install '
    'command for each tool, for macOS, Windows and Linux.') + note('What has been tested', 'Everything in this guide was built and measured on macOS with Chrome 157. The Windows and Linux '
        'commands are written but were not run by the author. Codex has a plugin manifest but no recorded run.') + h2('Opening the page') + p(
    'When the agent says it is done, it gives you a link such as `http://localhost:8421/`. Open that address. Do not '
    'double-click `site/index.html`: browsers refuse to load JavaScript modules from a file, so you would see a blank page. '
    'To start the preview yourself: `python3 skills/brief2motion/scripts/serve.py site`. It serves the folder on your own '
    'machine only, and Ctrl-C stops it. To publish, upload the `site/` folder to any static host.'))

section('brief', 'Writing a brief that can be checked', 'The brief', lead(
    'The agent guesses less when the brief says more. Seven lines cover almost everything.') + table(['Line', 'What to write', 'Why it matters'], [
        ['What it is', 'the product, and who it is for', 'the router picks a visual style from the product and the audience'],
        ['What moves', 'in your own words, in order: on load, as I scroll, when I click', 'this picks the motion stack'],
        ['Words on the page', 'the headline and button text, exactly', 'the agent uses them as written and invents nothing'],
        ['Images', 'what you have, or "none: draw it in code"', 'it will not borrow pictures it has no right to'],
        ['Look', 'colours, type, a mood, or a style by name', 'your words replace any style the router would guess'],
        ['Stack', 'only if you care: "plain HTML", "Next.js", "use GSAP"', 'a named library is always used'],
        ['Done when', 'one checkable line per thing you care about', 'these are what the checks measure'],
    ], ['17%', '42%', '41%']) + h2('An annotated brief') + p('This is the brief that produced `halden-one`, as it is in the repository.') + code(brief('halden-one')) + ul([
        '"We have no photos and no 3D model yet, so build the radio in code" removes a whole class of problems: nothing to license, nothing to download, a page under 100 KB.',
        '"As I scroll it goes through four steps" gives the motion plan its structure. Four named poses are easier to build and to check than "it animates as you scroll".',
        'Every "done when" line can be tested: count the labels, switch WebGL off, switch reduced motion on, read a number.',
    ]) + h2('Briefs that go wrong') + table(['The brief says', 'What happens', 'Say this instead'], [
        ['"Make it pop", "feel alive", "modern"', 'nothing to route on; the agent proposes one moment and builds that', 'what should move, and when'],
        ['"Like Apple" or "like Stripe"', 'the agent has to guess which quality you mean', 'the quality: the glass, the scroll scenes, the restraint'],
        ['"Add animations everywhere"', 'a fade on every section, which reads as generated', 'the one moment you want people to remember'],
        ['"Use our customer logos and reviews" with none attached', 'it leaves the section out; it will not invent proof', 'attach them, or drop the section'],
    ], ['30%', '36%', '34%']) + p('When the page is up, one follow-up is worth sending: **"Check it against the brief."** The agent goes back to your original '
                                   'words line by line, shows the evidence for each, fixes what falls short and measures again.'))

aud_rows = [[re.sub(r'\\b|[()\\]|\\w\*|\?|\[\^\.\]\{0,40\}', '', a['match'][0]).replace('|', ', ').strip(', ')[:70] + ' ...',
             ', '.join(next(s['name'] for s in STYLES['styles'] if s['id'] == i) for i in a['styles']), a['why']] for a in ROUTING['audiences'][:12]]
section('route', 'Routing: how the stack and the style are chosen', 'The first step', lead(
    'The router is a keyword scorer with a rule book you can read. It has never seen your product, so the agent treats '
    'its answer as a proposal.') + code('''$ node skills/brief2motion/scripts/route.mjs BRIEF.md
Stack: GSAP with ScrollTrigger and Lenis
  why: The brief describes a sequence tied to scrolling: pinned sections, scrubbed timelines,
       sideways galleries or a picture sequence. GSAP timelines with ScrollTrigger are the
       dependable tool for that, with Lenis for smooth scroll.
  the brief says: "as you scroll", "pinned", "scrubbed", "sideways", "sequence", "story"
  read: references/stacks/gsap.md   study: examples/tidewater/
Style: Editorial / magazine (inferred)
  why: craft and food want warmth and a printed, tactile feel ("salt")
  read: references/styles/editorial.md''') + h2('The stack') + p(
    'Each stack has a list of phrases with weights. The stack with the highest total wins, and the default is the lightest '
    'one. A few rules keep it honest:') + ul([
        '**The default is no library.** "Something should move" is not evidence for GSAP or three.js. Reveals, hovers and a pinned scene are plain CSS and JavaScript.',
        '**React changes the answer.** 3D in a React project goes to React Three Fiber, and interface motion goes to Motion for React. Both come with a note that they need your project\'s bundler.',
        '**Fallback requirements are not requests.** "It must still read without WebGL" does not route to three.js.',
        '**A named library wins.** If the brief says GSAP, it is GSAP.',
    ]) + h2('The style') + p(
    'A style named in the brief is used. Otherwise the router looks at what the product is, who it is for and the mood words, '
    'and one stray word is never enough: "paper" in "paper plane" does not pick a paper-textured look. The first rows of the audience table:') + table(
        ['The brief mentions', 'Styles proposed, in order', 'The reason it gives'], aud_rows, ['30%', '30%', '40%']) + p(
    'If nothing matches, it says so and suggests none. A brand\'s own colours and type always replace a style\'s tokens. '
    'The rule book is `references/routing.json`; adding a phrase is a one-line change, and the tests check that every '
    'example\'s own brief still routes to the stack that example was built with.'))

section('kit', 'The default stack: plain CSS and JavaScript, with the kit', 'Stacks', lead(
    'Most motion on a website needs no library. The kit is ten small files that handle the parts that are easy to get wrong.') + table(['File', 'What it does'], [
        ['`kit.css`', 'the accessibility floor: a skip link, a focus ring that shows on any background, the reduced-motion rule'],
        ['`motion-core.js`', 'the reduced-motion switch, the state signal, frame loops that stop when hidden, one shared scroll listener, scroll progress for pinned scenes, and the maths'],
        ['`reveal.js`', 'entrances with the Web Animations API; content stays visible if the script never runs'],
        ['`split-text.js`', 'a heading cut into words, characters or lines, still read as one sentence by a screen reader'],
        ['`counter.js`', 'a number that counts up while its real value stays in the page'],
        ['`svg-draw.js`', 'lines that draw themselves'],
        ['`image-sequence.js`', 'numbered pictures scrubbed on a canvas, loaded coarse to fine'],
        ['`view-transitions.js`', 'same-page transitions and the shared element between pages'],
        ['`three-stage.js`', 'a three.js renderer that fails softly, caps its pixel ratio, pauses off screen and holds one frame for reduced motion'],
        ['`players.js`', 'Lottie and Rive, loaded only when needed and paused when unseen'],
    ], ['24%', '76%']) + h2('A pinned scene with no library') + p(
    'Make the section tall and its child sticky. The kit turns scrolling into a number from 0 to 1 and writes it to a CSS variable.') + code('''<section class="scene" style="height: 400vh">
  <div style="position: sticky; top: 0; height: 100svh"> ... </div>
</section>

import { scrollScene, slice } from './kit/motion-core.js';
scrollScene(document.querySelector('.scene'), (p) => {
  caption.style.opacity = Math.min(slice(p, 0.3, 0.4), 1 - slice(p, 0.6, 0.7));
});''') + h2('Scroll-driven animation with no script at all') + p(
    'CSS can tie an animation to scroll position. `sprout` fills its pots this way. Browsers without the feature, and visitors with reduced motion, see the finished state.') + code('''.water::after { transform: scaleY(var(--fill)); transform-origin: bottom; }   /* the default is the end state */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .water::after { animation: fill linear both; animation-timeline: view();
                    animation-range: entry 20% cover 45%; }
    @keyframes fill { from { transform: scaleY(0); } }
  }
}''') + note('Every page reports its state', 'A page ends its setup with `signal(\'ready\')`, `signal(\'reduced\')` or `signal(\'static\')`. The checker waits for it, '
                                           'and CSS can style on it. "Static" means something the motion needs is missing and the page fell back to a still.'))

section('gsap', 'GSAP, ScrollTrigger and Lenis', 'Stacks', lead(
    'For choreography: several things moving in a set order, scenes pinned and scrubbed by scroll, sideways galleries, text that splits and sets.') + p(
    'All of GSAP is free since 2025, the former paid plugins included. It is free under GSAP\'s own licence, not an open-source one: '
    'it allows commercial work and code an AI wrote, and forbids use inside no-code animation builders that compete with Webflow. '
    'Pages load it from a CDN at a pinned version with integrity hashes.') + fig('tidewater-50.jpg', '`tidewater`: the section is pinned; the caption and the picture follow the scroll.') + h2('One frame for every page') + p(
    '`gsap.matchMedia()` owns every branch. Motion is created only inside it, and GSAP undoes all of it when a condition stops matching.') + code('''const mm = gsap.matchMedia();
mm.add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 861px)' }, (ctx) => {
  const { motion, wide } = ctx.conditions;
  if (!motion) { showFinishedState(); signal('reduced'); return; }

  const lenis = new Lenis({ anchors: true });               // smooth scroll on the same clock
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);

  ScrollTrigger.create({ trigger: '.seq-pin', start: 'top top', end: '+=260%', pin: true, scrub: true,
    onUpdate: (st) => sequence.draw(st.progress) });         // the picture follows the scroll
  signal('ready');
});''') + ul([
        '`scrub: true` for things that must stay locked to the scroll; `scrub: 0.5` for things that should glide.',
        'A pin of 200 to 300% of a screen is enough for one idea. Longer, and people think the page is stuck.',
        'Sideways sections on wide screens with motion on; a normal swipe row otherwise.',
        'Lenis stands down for reduced motion by itself. Give in-page links `anchors: true`, or they stop working.',
    ]))

section('motion', 'Motion, for plain pages and for React', 'Stacks', lead(
    'Motion is the library that used to be Framer Motion. Use it for how an interface feels: springs, gestures, layout changes, things entering and leaving.') + two(
    fig('relay-top.jpg', '`relay`: the headline sets word by word; an amber block wipes in behind two words.'),
    fig('mise-top.jpg', '`mise`: a React planner. Rows make room when you drag; ticking moves an item between lists.')) + h2('On a plain page') + code('''import { animate, stagger, scroll, spring } from 'motion';
const { words } = splitText(title, { by: 'words' });
animate(words, { opacity: [0, 1], y: ['0.55em', '0em'] }, { duration: 0.9, delay: stagger(0.055) });
scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));          // page progress

let y = 0;                                                              // a spring you can interrupt
const moveTo = (to) => animate(y, to, { type: spring, stiffness: 420, damping: 30,
  onUpdate: (v) => { y = v; el.style.setProperty('--y', v + 'px'); } });''') + h2('In React') + code('''<MotionConfig reducedMotion="user">
  {tab === id && <motion.span layoutId="tab-marker" transition={spring} />}      {/* one marker, shared */}
  <Reorder.Group axis="y" values={ids} onReorder={setIds}>
    <AnimatePresence initial={false}>
      {items.map((item) => <Reorder.Item key={item.id} value={item.id} layout
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} />)}
    </AnimatePresence>
  </Reorder.Group>
</MotionConfig>''') + p('Three things learned while building `mise`, each now in the reference:') + ul([
        'A reorderable list tracks rows by value. Objects made during render look new every time and the order never changes. Pass ids.',
        'A reorderable row is also a keyboard stop: Space picks it up, the arrow keys move it, Space drops it. Say so in its label.',
        'Motion in an interface answers input. If nothing was pressed, nothing moves, and with reduced motion the same changes happen at once.',
    ]))

section('three', 'three.js and React Three Fiber', 'Stacks', lead(
    'For a real 3D object or scene: a product to turn, parts that come apart, a camera that travels, a shader.') + two(
    fig('halden-one-50.jpg', 'The exploded view: each part sits in its own group and moves along one axis.'),
    fig('halden-one-75.jpg', 'Colourways: a button repaints the enamel; a slider turns the radio for keyboard users.')) + h2('What the kit\'s stage does for you') + ul([
        'returns nothing instead of crashing when WebGL is missing, so the page can show its still picture;',
        'caps the pixel ratio at 2 (a phone at 3 would draw nine pixels for every one);',
        'sizes itself from the canvas, pauses when hidden or off screen, recovers from a lost context;',
        'with reduced motion, draws one frame and holds it until something changes.',
    ]) + h2('Light without files, a model without a file') + p(
    'A generated room, blurred into an environment map, gives enamel and brass something to reflect with nothing to download. '
    'A plane with a soft dark gradient under the object reads as a contact shadow and costs almost nothing. The radio itself is '
    'about forty primitives. For a real model the reference covers glTF, compression and credits.') + h2('Scroll poses') + p(
    'Describe each pose as plain numbers (camera angle, distance, how far the parts are pulled apart), give each a scroll '
    'position, and interpolate, holding each pose for a while before travelling. With reduced motion the scene cuts from pose to pose.') + code('''const POSES = [{ yaw: -0.48, dist: 10.6, explode: 0 }, { yaw: 0.36, dist: 6.2, explode: 0 },
               { yaw: -0.98, dist: 17.5, explode: 1 }];
if (snap) t = t < 0.5 ? 0 : 1;                       // reduced motion: cut, do not travel
const e = ease.inOutCubic(clamp((t - 0.18) / 0.64));  // hold, travel, hold''') + note('React Three Fiber needs a bundler', 'The same scene can be written as React components with React Three Fiber and drei, and the reference shows how. '
        'Its renderer must match the installed React version exactly. A bundler takes care of that; a page that loads modules from a CDN cannot. '
        'The test page in the repository pins the versions by hand for that reason.'))

section('particles', 'The dust engine', 'Stacks', lead(
    'The one stack with a complete template: you change a settings file and the engine does the rest.') + two(
    fig('copper-no-7-top.jpg', '`copper-no-7`: 60,000 dots form the bottle as the page loads.'),
    p('Each dot has a place in a slow galaxy of dust and a place in each shape. Two numbers drive everything: how far the dust '
      'has formed, and which shape it is forming. The graphics chip moves every dot, so sixty thousand cost about the same as six hundred.',
      'Stipple places dots by darkness and suits products and logos. Halftone puts round dots on a grid, sized by darkness, and suits faces. '
      'A portrait needs a calm, front-facing photo on a plain background.')) + table(['The brief says', 'Setting'], [
        ['"made of dust", "particles form my product"', '`assemble.targets`, stipple'],
        ['"portrait", "my face", "halftone"', '`style: \'halftone\'`, `mask: \'oval\'`'],
        ['"turns into", "then back to the product"', 'up to four shapes and a `sequence`'],
        ['"a plane flies across"', '`flight.path`'],
        ['"when I scroll"', '`scroll.length`'],
    ], ['50%', '50%']) + p('The engine never passes a budget by quietly drawing fewer dots: its own checker fails a page that sheds any on desktop.'))

section('vt', 'Page transitions with the View Transitions API', 'Stacks', lead(
    'The browser takes a picture of the old page and morphs it into the new one. You write CSS and almost no script, and a browser without the feature changes the page the ordinary way.') + two(
    fig('halvorsen-top.jpg', '`halvorsen`: four posters on the index.'),
    fig('halvorsen-50.jpg', 'A project page. The poster on the left is the one that was clicked: it grew into place.')) + code('''@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }                       /* both pages opt in */
  ::view-transition-group(hero-media) { animation-duration: 520ms; }
}
.project-poster { view-transition-name: hero-media; }          /* the big picture on the project page */''') + p(
    'On the index only the clicked card may carry that name, so a few lines of script set it as the old page leaves and again '
    'when you come Back. That script has to run before the page\'s first frame:') + code('<script type="module" blocking="render" src="site.js"></script>') + p(
    'Without `blocking="render"` the first navigation after a fresh load showed no morph in testing. The smoke test now checks '
    'that both halves of the morph exist, in both directions.') + ul([
        'Keep the two elements the same shape. A 4:5 poster into a 4:5 poster is clean.',
        'One travelling element per navigation, and under about 600 ms: page changes are frequent.',
        'For filter, sort and tabs on one page, wrap the change in `document.startViewTransition` and give each item its own name.',
    ]))

section('svg', 'SVG, charts, Lottie and Rive', 'Stacks', lead(
    'Three ways to move illustration. SVG in code is the lightest. Lottie plays an animation exported from After Effects. Rive plays an interactive animation with states.') + two(
    fig('keeling-50.jpg', '`keeling`: the line is revealed by widening a clip, so it always ends exactly on the right year.'),
    fig('sprout-top.jpg', '`sprout`: the stem draws, then seven leaves grow from the points where they meet it.')) + h2('A line that draws itself') + p(
    'Give the shape `pathLength="1"`. A dash of length 1 then covers it whatever its real length, and progress from 0 to 1 maps straight onto the dash offset.') + h2('Charts') + p(
    'Write the SVG yourself and use D3 only for the maths: scales, and the path of a line. A chart needs a text alternative: a label '
    'that states the finding, a caption with the source, and the numbers in a table. Every number in `keeling` comes from one public file, and the page links to it.') + h2('Players') + p(
    'The kit loads a player from the CDN only when the first animation is near the screen, plays it only while visible, and shows one chosen '
    'still frame with reduced motion. Reserve the box with `aspect-ratio`, so nothing jumps when the animation arrives.') + table(['The brief has', 'Use'], [
        ['lines, simple shapes, icons, a chart', 'SVG with the kit'],
        ['a finished animation exported from After Effects', 'Lottie'],
        ['a character or control that reacts to input, with several states', 'Rive'],
        ['a looping illustration heavier than about 200 KB as Lottie', 'a short muted video with a poster'],
    ], ['60%', '40%']))

section('type', 'Kinetic type and scroll stories', 'Techniques', lead('Two techniques that cut across the stacks.') + h2('Kinetic type') + p(
    'A headline is cut into lines, words or characters, and each piece gets its own timing. The sentence has to stay one sentence for a '
    'screen reader, which the kit and GSAP\'s SplitText both handle.') + table(['Piece', 'Gap between pieces', 'Whole headline'], [
        ['Lines', '80 to 120 ms', 'set within about 1.2 seconds'], ['Words', '30 to 60 ms', ''], ['Characters', '15 to 30 ms', '']], ['30%', '35%', '35%']) + ul([
        'Move in reading order. Random-order reveals are slow to read.',
        'One kinetic headline per screen.',
        'With reduced motion there is no split at all: the plain heading is the finished state.',
        'Text that keeps moving by itself for more than 5 seconds needs a pause.',
    ]) + h2('Scroll stories') + table(['Way', 'How', 'Use it for'], [
        ['Step-triggered', 'the section nearest a line on screen is active; switching runs a short transition', 'charts and diagrams with distinct states; the most robust'],
        ['Scrubbed, CSS sticky', 'a tall section, a sticky child, a number from 0 to 1', 'one scene with no library'],
        ['Scrubbed, GSAP', 'pin and scrub with a timeline', 'several scenes, sideways travel'],
        ['Native CSS', '`animation-timeline`', 'enhancements that may be absent'],
    ], ['22%', '44%', '34%']) + p(
    'Scrolling scrolls: do not hijack it, do not make one wheel tick equal one section, do not block the keyboard. One change per step, with '
    'the text beside the graphic. Parallax adds little by itself and makes some people nauseous; a 2013 Purdue study found it did not improve the experience.') + h2('WebAssembly') + p(
    'Almost no motion on a website needs it. It cannot speed up moving page elements or drawing, which the browser and the graphics chip already do. '
    'It can help with heavy arithmetic every frame: physics with thousands of bodies, fluid or cloth, processing pictures or video. Prove the JavaScript version is too slow first.'))

section('design', 'Design fundamentals: what every page gets', 'Design', lead(
    'Motion sits on top of a page. If the page under it is hard to read, badly spaced or slow, no animation rescues it.') + h2('Say what it is, at the top') + p(
    'The first screen states what the product is and what to do next, with real content. People spend 57% of their viewing time above the fold and 74% in the first two screens (Nielsen Norman Group, 2018), so the first screen must not be a slow reveal of nothing.') + h2('Type and space') + ul([
        'Body text 16 px or larger. Line length 45 to 90 characters. Line height about 1.5 for text, 0.95 to 1.15 for headlines.',
        'A scale of four or five sizes, not a pile. Fluid headlines with `clamp()` and a rem floor.',
        'One family or two; if two, clearly different. System fonts unless the brief supplies one.',
        'Spacing in steps of 4 px. Group with space before lines.',
    ]) + h2('Colour and contrast') + ul([
        'Text contrast at least 4.5:1; large text 3:1; control edges 3:1. The thresholds are not rounded.',
        'A palette is four to six named colours, with the text pairs checked before any CSS is written.',
        'Light mode is the safer default. Research says it reads better for most people; default to dark only when the audience expects it.',
    ]) + h2('Responsive, and fast') + ul([
        'Design for 320 px wide first. Tap targets at least 24 px, 44 for anything primary. Never disable zoom.',
        'Main content visible within 2.5 seconds, a tap answered within 200 ms, layout shift 0.1 or less (Google\'s Core Web Vitals).',
        'Text hidden until an entrance animation runs is late content. Render it visible; animate from a readable state.',
        'Give every picture, canvas and player a size, and animate `transform` and `opacity`, so nothing jumps.',
    ]) + h2('Motion principles') + table(['Rule', 'Number'], [
        ['Direct feedback', 'about 100 ms'], ['Most interface changes', '200 to 300 ms'], ['Large movements', 'up to 400 ms; 500 ms and more drags'],
        ['Entering against leaving', 'entering slightly longer, for example 300 ms in and 200 ms out'], ['Stagger between related items', '30 to 80 ms, in reading order'],
        ['A hero sequence', 'over in about 1.5 seconds']], ['45%', '55%']) + p(
    'Every animation has a reason: it shows what changed, where something came from, or what to look at. One orchestrated moment beats many scattered ones. '
    'A fade on every section and a hover effect on every card is the commonest sign of a generated page. Motion that answers input is always welcome.') + note('Never invent proof', 'No made-up reviews, ratings, customer names, logos or numbers. If the brief has none, the section is left out. Made-up examples say that they are made up.'))


def style_block(s):
    img = f'<img src="img/style-{s["id"]}.jpg" alt="">'
    left = f'<div class="pic">{img}<h3>Choose it for</h3><p>{inline(". ".join(s["choose"]))}.</p><h3>Avoid it for</h3><p>{inline(". ".join(s["avoid"]))}.</p></div>'
    mid = f'<div><h3>Signature rules</h3>{ul(s["rules"][:4])}<h3>Motion that fits</h3><p>{inline(s["motion"])}</p></div>'
    right = f'<div><h3>Accessibility</h3>{ul(s["a11y"][:3])}<h3>Origin</h3><p>{inline(s["origin"])}</p></div>'
    return f'<div class="style"><div class="fam">{E(STYLES["families"][s["family"]])}</div><h2>{E(s["name"])}</h2><p>{inline(s["what"])}</p><div class="cols">{left}{mid}{right}</div></div>'


section('styles', f'The style system: {N_STYLES} styles and approaches', 'Styles', lead(
    'Web motion sits on a design, so the skill knows the major visual styles. Each was checked against a published source, and each has tokens, tested CSS, '
    'the motion that fits, its accessibility traps and when to choose it.') + p(
    f'The {N_LOOKS} looks are live on one page in the repository, `examples/style-atlas/`: the same small product fragment in every style, so they can be compared '
    'and measured. The pictures on the next pages are screenshots of it. The atlas, the reference pages and the router are generated from one data file, so they cannot drift apart.') + table(
        ['Family', 'Styles'], [[STYLES['families'][f], ', '.join(s['name'] for s in STYLES['styles'] if s['family'] == f)] for f in STYLES['families']], ['24%', '76%']) + h2('How to use a style') + ul([
        'A style is a starting point for the look, never a reason to ignore the brief. Your colours and type replace its tokens.',
        'Take the signature rules, not the specimen. Neubrutalism is thick borders, hard shadows and loud flat colour; it is not that particular yellow.',
        'Read the accessibility list first. Several styles are defined by a property that fails contrast unless you compensate.',
        'Spend the boldness in one place. A neubrutalist page with glass panels and a neon glow is three styles and no design.',
    ]) + h2('Tools, not styles') + ul([f'**{t["name"]}.** {t["what"]}' for t in STYLES['techniques']]) + h2('A name that is not a style') + p(
    *[f'**{n["name"]}.** {n["verdict"]}' for n in STYLES['notReal']]))

looks = [s for s in STYLES['styles'] if s['specimen']]
for i in range(0, len(looks), 2):
    group = looks[i:i + 2]
    section(f'styles-{i}', ', '.join(x['name'].split(' (')[0].split(' / ')[0] for x in group), 'Styles', ''.join(style_block(x) for x in group), toc=False)

appr = [s for s in STYLES['styles'] if not s['specimen']]
section('approaches', 'Motion-led approaches', 'Styles', lead('Four ways of using motion that are not looks. Each has a complete example site.') + ''.join(
    f'<div class="style"><h2>{E(s["name"])}</h2><p>{inline(s["what"])}</p><div class="cols"><div><h3>Rules</h3>{ul(s["rules"])}</div><div><h3>Motion</h3><p>{inline(s["motion"])}</p>'
    f'<h3>Example</h3><p><code>examples/{s["example"]}/</code></p></div><div><h3>Accessibility</h3>{ul(s["a11y"])}</div></div></div>' for s in appr))

section('a11y', 'Accessibility: the page works without the motion', 'Quality', lead(
    'Some people get dizzy or nauseous from movement on a screen, and they tell their system so. Others use a keyboard, a screen reader, or a browser where a script failed. The page has to work for all of them.') + h2('Reduced motion') + ul([
        'No travel across the screen, no parallax, no zoom, no rotation, no loop that plays by itself.',
        'The finished state is on screen: the headline is set, the line is drawn, the shape is formed.',
        'Things that change with scroll may still change, in cuts instead of travel.',
        'Normal scrolling works.',
    ]) + table(['Library', 'How it honours the setting'], [
        ['GSAP', 'motion is created only inside `gsap.matchMedia()` for visitors with no preference'],
        ['Lenis', 'on by default: no smoothing, instant programmatic scrolls'],
        ['Motion for React', '`<MotionConfig reducedMotion="user">` turns transform and layout animation off'],
        ['three.js', 'draw one frame and hold it; draw again only when something changes'],
        ['Lottie, Rive', 'load paused on a chosen still frame'],
        ['View Transitions', 'the opt-in rule sits inside a media query for visitors with no preference'],
    ], ['26%', '74%']) + h2('Without the script, without WebGL') + ul([
        'Content is in the HTML, and visible by default. Something is hidden for an entrance only by a script that is already running.',
        'Every WebGL canvas has a still picture standing by, shown when the context cannot be created, a library fails to load, or an error is caught.',
        'A blocked CDN leaves a complete, still page.',
    ]) + h2('Keyboard and screen readers') + ul([
        'Everything that works with a pointer works with a keyboard. A drag needs another way: a slider, arrow buttons, or a built-in keyboard grab.',
        'A visible focus ring on every control. A skip link first, and the content inside a main landmark.',
        'Split text keeps one readable sentence. Decorative canvases are hidden from assistive technology; meaningful ones have a label.',
        'The result of an action is announced in a live region, not shown by motion alone.',
    ]) + note('A floor, not an audit', 'The checker verifies these mechanically. That catches the common failures. It does not replace testing with a screen reader and with real people.'))

section('perf', 'Performance', 'Quality', lead('A page that looks right on a fast laptop is not finished until it holds its budgets on the emulated phone.') + table(['What', 'Budget'], [
    ['Frame time, desktop 1440 by 900', '95 in every 100 frames take 20 ms or less'],
    ['Frame time, emulated phone, processor slowed four times', '95 in every 100 frames take 40 ms or less'],
    ['Files from the project, per page', '1.5 MiB or less'],
    ['Third-party hosts', 'one: `cdn.jsdelivr.net`'],
    ['Console errors', 'none'],
], ['55%', '45%']) + h2('Rules that keep frames short') + ol([
    'Animate `transform` and `opacity`. They are composited without layout or paint.',
    'One read and one write per frame. Measuring layout after writing a style makes the browser lay out again.',
    'Stop what cannot be seen: loops pause when the tab is hidden and when their element is off screen.',
    'Do not animate a blur radius or a full-screen filter. Blur a picture once, then move it.',
    'On a 3D canvas, cap the pixel ratio at 2, light with an environment map and one light, and keep post-processing off the phone tier.',
]) + h2('What the examples measure') + table(['Example', 'Desktop, p95 frame', 'Emulated phone, p95 frame'], [
    [f'`{n}`', f'{frame(n, "desktop")} ms', f'{frame(n, "phone")} ms'] for n in ['halden-one', 'tidewater', 'relay', 'keeling', 'mise', 'sprout', 'copper-no-7', 'style-atlas']
], ['40%', '30%', '30%']) + p(
    'These are from the reports in the repository, measured on an Apple M-series laptop with Chrome 157. A screen that refreshes 60 times a second gives a frame every 16.7 ms, so these '
    'pages are at the screen\'s own limit. The phone run is this machine\'s graphics chip with the processor slowed down. It is not a real phone: it catches layout and most '
    'performance problems, and you should still look at the page on yours.'))

section('checks', 'The checks, one by one', 'Quality', lead('`check_site.mjs` opens every page in Chrome seven ways. A page with one WebGL canvas gets 27 checks.') + table(['Run', 'What it checks', 'A failure means'], [
    ['Desktop', 'the page reports its motion state; frame time while idle and scrolling; no sideways scroll at six scroll positions; one main heading, a language, a title and description, zoom allowed, alt text, a main landmark and a skip link; a visible focus ring on the first twelve keyboard stops; page weight', 'the page is slow, wider than the screen, or missing basics'],
    ['Phone, 390 px', 'frame time with the processor slowed four times; sideways scroll; tap targets of 24 px or more; page weight', 'it will stutter or be hard to tap'],
    ['Phone, 320 px', 'sideways scroll, loaded fresh at that width', 'the layout breaks on the narrowest phones'],
    ['Reduced motion', 'the page says so; no animation longer than a quarter of a second is running; two screenshots 0.7 seconds apart are identical at three scroll positions; every heading and paragraph is fully visible at some point; text contrast; normal scrolling works', 'something still moves, or some text never appears'],
    ['JavaScript off', 'something readable is on the page', 'the content only exists after a script runs'],
    ['WebGL off', 'the headline is readable; a still stands in for each WebGL canvas', 'visitors without WebGL get a hole'],
    ['Every run', 'no console errors; requests only to the page itself and one CDN', 'something is broken or leaking'],
], ['15%', '58%', '27%']) + h2('What a checker cannot see') + p(
    'It cannot see that a layout is dull, that a headline says nothing, or that text sits on a busy picture: text over pictures, gradients and canvas has no single '
    'background colour, so its contrast is not measured. After the checks pass, the agent opens the screenshots and looks at them against every "done when" line. So should you.') + h2('What the checker found in its first week') + ul([
    'In the version 0.2 template, the brand link was 20 px tall, and the navigation bar kept fading for 1.1 seconds when a reduced-motion visitor scrolled. Both are fixed.',
    'Five styles in the atlas had button text below 4.5:1. See-through panels were being measured as if they were solid, which was a fault in the checker itself; it now blends them first.',
    'A helper line faded to 86% opacity failed "all text visible". The fade was removed.',
]) + h2('Three layers of tests') + p(
    'Unit tests cover the router, the kit\'s maths and the measuring code. A smoke test per stack opens the real example and proves the documented pattern does what it says: '
    'the poster really morphs between pages, keyboard reorder really moves the row, the canvas really changes with scroll. Then the full check runs on every example.'))

EXAMPLES = [
    ('halden-one', 'Halden One: a product launch with a 3D turntable', 'top', 'three.js',
     ['A radio built from primitives and lit by a generated room: nothing to download.', 'Four poses on the scroll, with a hold on each.', 'Labels that follow parts, by projecting a 3D point to the screen each frame.',
      'Reduced motion cuts between poses. No WebGL shows a still made from the same scene.']),
    ('tidewater', 'Tidewater: a scroll story', '25', 'GSAP, ScrollTrigger, Lenis',
     ['A picture sequence drawn by a script and loaded coarse to fine.', 'One `matchMedia` block decides what runs on which screen and for which visitor.', 'The sideways gallery is a normal swipe row on phones.',
      'Text that "reads itself" defaults to fully visible, so it works with no script.']),
    ('relay', 'Relay: kinetic type', 'top', 'Motion',
     ['A headline split into words that a screen reader still hears as one sentence.', 'A highlight marked in the HTML, so it is there before any script runs.', 'Decorative repeated words are hidden from assistive technology; one real heading says it once.',
      'A rota highlight on a spring, which answers a click and can be interrupted.']),
    ('halvorsen', 'Halvorsen: a portfolio with page transitions', '50', 'View Transitions API',
     ['Five ordinary pages. The transition is added on top with CSS.', 'The clicked poster is named as the page leaves, and again on Back.', 'The script is render-blocking, so it runs before the first frame.',
      'Filter and sort run inside a same-page transition, and announce the result.']),
    ('keeling', 'Keeling: a data story', '50', 'SVG, D3 scales',
     ['Real numbers from one public file, with the source on the page.', 'Five chart states, switched by whichever paragraph is nearest the middle of the screen.', 'The line is revealed by a clip, so it ends on the right year.',
      'The decade figures are computed in the page from the same data, not typed in.']),
    ('mise', 'Mise: an app interface', 'top', 'React, Motion for React',
     ['A static list inside the mount point, so the page reads before React starts and with JavaScript off.', 'Reordering by drag and from the keyboard.', 'An item that moves between two lists keeps one identity, so it travels.',
      'Every motion answers an input.']),
    ('sprout', 'Sprout: an illustrated page', 'top', 'CSS, JavaScript, Lottie',
     ['No animation library on the page itself.', 'Leaves that grow from the point where they meet the stem.', 'Lottie icons written by a script, loaded only when near the screen, still with reduced motion.',
      'Pots that fill with CSS alone, as an enhancement.']),
    ('copper-no-7', 'Copper No. 7: particles', 'top', 'the dust engine',
     ['A settings file and four pictures; the engine is untouched.', 'Up to four shapes in a sequence, with a caption per step.', 'A still picture of the finished shape for visitors without WebGL.',
      'Its own checker counts the dots, so it cannot pass by drawing fewer.']),
]
ex_body = lead('Eight sites, each built from the brief beside it. Run any of them: `python3 skills/brief2motion/scripts/serve.py examples/tidewater`.')
for i, (name, title, shot, stack, learn) in enumerate(EXAMPLES):
    r = report(name)
    n = sum(1 for c in r['checks'] if c['pass'])
    ex_body += (f'<div class="style"><div class="fam">{E(stack)}</div><h2>{E(title)}</h2><div class="cols"><div class="pic"><img src="img/{name}-{shot}.jpg" alt=""></div>'
                f'<div><h3>What to learn from it</h3>{ul(learn)}<h3>Its report</h3><p>{n} of {len(r["checks"])} checks passed. Chrome {E(r["chrome"].split(".")[0])}.</p></div></div></div>')
section('examples', 'The examples', 'Examples', ex_body)

section('recipes', 'Recipes on one page', 'Reference', table(['You want', 'Do this'], [
    ['A headline that sets word by word', 'split it with the kit; stagger 30 to 60 ms per word; finished within 1.2 seconds'],
    ['A section that pins while something plays', 'a tall section with a sticky child and `scrollScene`; or ScrollTrigger with `pin` and `scrub`'],
    ['A picture that follows the scroll', '40 to 60 WebP frames about 960 px wide; `createSequence`; keep the last frame as a plain image'],
    ['A sideways gallery', 'pinned on wide screens with motion on; a swipe row with scroll snap otherwise'],
    ['A line that draws itself', '`pathLength="1"`, dash 1, animate the offset from 1 to 0'],
    ['A number that counts up', '`countUp`; the real value stays in the page for screen readers'],
    ['A chart that changes as you read', 'step-triggered states; the paragraph nearest the middle of the screen is active'],
    ['A 3D product to turn', 'the kit stage, a generated environment, drag plus a slider, a still picture as fallback'],
    ['A thumbnail that grows into the next page', '`@view-transition`, one shared name, a render-blocking script'],
    ['A grid that rearranges', 'change the page inside a view transition; name each card'],
    ['A list to drag and reorder', 'Motion\'s `Reorder` with ids as values; it handles the keyboard too'],
    ['A spring', 'Motion `animate` with `type: spring`; start the next one from the current value'],
    ['Soft colour behind a hero', 'two to four blurred radial gradients; move them with transform only, over 15 to 30 seconds'],
    ['Grain', 'one small noise tile from an SVG filter, repeated; never a live full-screen filter'],
    ['Glass panels', 'a tinted see-through fill, a 10 to 25 px backdrop blur, a light edge, and a solid fallback for reduced transparency'],
    ['Dust that forms a picture', 'the dust engine template: edit `config.js` only'],
    ['An icon animation from a designer', '`mountLottie`; reserve the box; choose the still frame'],
], ['36%', '64%']) + h2('Commands') + code('''node skills/brief2motion/scripts/route.mjs BRIEF.md                 # which stack and style, and why
python3 skills/brief2motion/scripts/serve.py site                    # preview at http://localhost
node skills/brief2motion/scripts/check_site.mjs site --out check     # measure it
node skills/brief2motion/scripts/check_site.mjs site --no-perf       # on a machine with no GPU
node skills/brief2motion/scripts/capture_site.mjs site --out media --film   # pictures and a short film
node skills/brief2motion/scripts/build_styles.mjs                    # regenerate the style pages and atlas'''))

section('trouble', 'Troubleshooting and questions', 'Reference', table(['Symptom', 'Cause and fix'], [
    ['The page is blank', 'You opened the file, not the address. Run `serve.py` and open the link it prints.'],
    ['"Could not start a browser"', 'Install Chrome, or run `npx playwright@1.65.1 install chromium`, or set `BRIEF2MOTION_CHROME`.'],
    ['"The page never set data-motion"', 'The page did not report its state. Call `signal()` from the kit when setup is done.'],
    ['The frame-time check fails', 'Usually layout properties being animated, an uncapped pixel ratio on a 3D canvas, or a loop running off screen. On a machine with no GPU, pass `--no-perf`.'],
    ['The reduced-motion check fails', 'Something still moves, or some text never becomes visible. Check each library\'s own switch.'],
    ['Sideways scroll at 320 px', 'The report names the element. Usually a row that does not wrap, or a grid track without `minmax(0, 1fr)`.'],
    ['The weight check fails', 'Pictures about 1200 px wide as WebP with a 720 px copy; a sequence about 960 px wide at quality 60 to 70.'],
    ['A dust portrait does not look like the person', 'A calm, front-facing photo from the shoulders up on a plain background, with halftone and an oval mask.'],
], ['34%', '66%']) + h2('Questions') + p(
    '**Does it cost anything?** The skill is free and MIT licensed. The agent runs on your own Claude Code or Codex plan, and the checks run on your machine.',
    '**Does it upload my files?** No. A built page loads its libraries from one CDN when a visitor opens it, and the first check downloads a browser driver once.',
    '**Which frameworks?** A plain static site is the default and the best tested. For React and Next.js the references cover Motion for React and React Three Fiber; those are built by your own bundler.',
    '**Can I use the scripts without an agent?** Yes: the router, the checker and the capture tool are ordinary command-line programs.',
    '**Can it make a video?** The capture tool makes a short loop of a scroll-through. For a finished, checked MP4, its sibling skill brief2mp4 is the tool.') + h2('Words used in this guide') + table(['Word', 'Meaning'], [
    ['Stack', 'the set of libraries a page uses for its motion'],
    ['Pin', 'holding a section still on screen while the page keeps scrolling'],
    ['Scrub', 'tying an animation\'s position to the scroll position, so scrolling back plays it backwards'],
    ['p95 frame time', 'the time that 95 in every 100 frames stay under'],
    ['Reduced motion', 'a system setting that asks sites for less movement'],
    ['Fallback', 'what a visitor sees when something the motion needs is missing'],
    ['Token', 'a named design value such as a colour, a radius or a shadow'],
    ['Spring', 'motion defined by stiffness and damping instead of a duration, so it can be interrupted'],
], ['24%', '76%']))

src_rows = []
seen = set()
for s in STYLES['styles']:
    for u in s['sources']:
        if u not in seen:
            seen.add(u)
            src_rows.append(u)
section('sources', 'Sources and what was verified', 'Reference', lead('What this guide rests on, and where its limits are.') + h2('Verified by running it') + ul([
    f'Every example passes `check_site.mjs`; the reports are in the repository. The numbers on the performance page are read from those reports when this guide is built.',
    'Each stack\'s pattern is exercised by a smoke test in a real browser, including test pages for React Three Fiber, Rive, and a three.js model with post-processing.',
    'The router, the kit\'s maths, the measuring code and the style data have unit tests.',
]) + h2('Not verified') + ul([
    'Windows and Linux. Real phones and tablets. Safari and Firefox: the checks ran in Chrome 157 only.',
    'Codex: the manifest is included, no run is recorded.',
    'Screen readers: the structure is checked mechanically, not by listening.',
    'React stacks inside a real bundled project: the React example and the React Three Fiber test page run from CDN modules.',
    'Some style entries are thinner than others, and say so. Aurora, maximalism and editorial are documented as trends or traditions, not as defined web styles.',
]) + h2('Published sources for the styles and the rules') + '<p class="src">' + '<br>'.join(E(u) for u in src_rows + [
    'https://www.nngroup.com/articles/homepage-design-principles/', 'https://www.nngroup.com/articles/scrolling-and-attention/', 'https://www.nngroup.com/articles/animation-duration/',
    'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html', 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html', 'https://web.dev/articles/vitals',
    'https://tailwindcss.com/docs/responsive-design', 'https://gsap.com/community/standard-license/', 'https://github.com/anthropics/skills']) + '</p>' + p(
    'The repositories studied, with licences and what was taken from each, are in `RESOURCES.md`. No code from another project is copied into brief2motion. Facts were checked on 17 November 2026.'))

# ---------------------------------------------------------------------------------------------------- assemble
toc = ''.join(f'<a href="#{sid}">{E(title)}</a>' for sid, title, _, _, in_toc in SECTIONS if in_toc)
cover = f'''<section class="cover"><div class="eyebrow">Qualixar<span>Field guide · version {VERSION}</span></div>
<h1>brief<i>2</i>motion</h1><div class="deck">The web motion guide</div>
<div class="strap">Write the brief. Choose the stack. Build the page. Check it in a real browser.<br>Scroll stories · 3D products · kinetic type · page transitions · data stories · interface motion · {N_STYLES} visual styles</div>
<img class="mark" src="../../assets/icon.png" alt="">
<div class="by">Varun Pratap Bhardwaj · github.com/qualixar/brief2motion · MIT licence · A companion to release {VERSION}, November 2026</div></section>'''
parts = [cover, f'<section id="contents"><div class="eyebrow">Contents<span>brief2motion {VERSION}</span></div><h1>Contents</h1><div class="toc">{toc}</div>'
         + note('How to use this guide', 'New machine: start with Setup. To shape a request: the brief pages. To understand a choice the agent made: Routing and the stack pages. '
                'To pick a look: the style pages. To judge a result: the checks.') + '</section>']
for sid, title, eyebrow, body, _ in SECTIONS:
    parts.append(f'<section id="{sid}"><div class="eyebrow">{E(eyebrow)}<span>brief2motion {VERSION}</span></div><h1>{E(title)}</h1>{body}</section>')
doc = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>brief2motion {VERSION}: the web motion guide</title>
<meta name="author" content="Varun Pratap Bhardwaj"><meta name="description" content="A field guide to brief2motion: writing a brief, the motion stacks, {N_STYLES} visual styles, accessibility, performance and the checks.">
<meta name="keywords" content="web animation, GSAP, three.js, Motion, View Transitions, design styles, accessibility, Claude Code skill">
<link rel="stylesheet" href="guide.css"></head><body>{''.join(parts)}</body></html>'''
(HERE / 'brief2motion-guide.html').write_text(doc)

# prose only (no code blocks), for the humanize gate
text = re.sub(r'<pre>.*?</pre>', ' ', doc, flags=re.S)
text = re.sub(r'<p class="src">.*?</p>', ' ', text, flags=re.S)
text = re.sub(r'</(p|h1|h2|h3|li|td|th|figcaption|div|a|section)>', '\n', text)
text = html.unescape(re.sub(r'<[^>]+>', '', text))
(HERE / 'guide-prose.txt').write_text('\n'.join(line.strip() for line in text.splitlines() if line.strip()) + '\n')
print(f'{len(SECTIONS) + 2} sections, {len(doc) // 1024} KB of HTML, {len(text.split())} words of prose')
