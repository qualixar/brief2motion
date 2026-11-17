// Sprout: illustration motion with no animation library on the page itself.
// Motion plan:
//   load    the stem draws from the pot upward, then each leaf grows out of the stem in order (Web Animations API)
//   idle    the grown plant sways slightly (one CSS animation); three Lottie icons loop, but only while on screen
//   scroll  the pots fill with water: CSS animation-timeline: view(), written in style.css, no script at all
// The Lottie player (lottie-web, MIT) is fetched from the CDN only when the first icon is about to be seen.
// Reduced motion: the plant is drawn complete, the icons show one still frame, the pots are full.
import { signal, reducedMotion } from './kit/motion-core.js';
import { prepareDraw, animateDraw } from './kit/svg-draw.js';
import { mountLottie } from './kit/players.js';

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const still = reducedMotion();

// the plant
const plant = $('.plant'), stem = prepareDraw($('.stem')), leaves = $$('.leaf');
if (!still && 'animate' in Element.prototype) {
  const [draw] = animateDraw(stem, { duration: 1500, delay: 200, easing: 'cubic-bezier(.5,0,.2,1)' });
  const grown = leaves.map((leaf, i) => leaf.animate(
    [{ transform: 'scale(0) rotate(-25deg)', opacity: 0 }, { transform: 'scale(1.08) rotate(3deg)', opacity: 1, offset: 0.7 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }],
    { duration: 700, delay: 500 + i * 190, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }));
  Promise.all([draw.finished, ...grown.map((a) => a.finished)]).then(() => plant.classList.add('is-grown')).catch(() => {});
}

// the icons. Still frames chosen so a paused icon still reads: the drop mid-fall, the sun, the finished tick.
const STILL = { 'assets/water.json': 22, 'assets/sun.json': 0, 'assets/reminder.json': 60 };
for (const el of $$('[data-lottie]')) mountLottie(el, { path: el.dataset.lottie }, { loop: true, stillFrame: STILL[el.dataset.lottie] });

signal(still ? 'reduced' : 'ready');
