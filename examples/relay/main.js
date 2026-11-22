// Relay: kinetic type with Motion (motion.dev, MIT), loaded as an ES module from the CDN, no build step.
// Motion plan, in one place:
//   load    the headline sets itself word by word; an amber block wipes in behind "one person."; the alert travels to Tomás
//   scroll  three rows of words slide sideways with the scroll; the section headings set word by word once
//   input   the rota highlight springs to the person on call for the day you pick; log lines print when first seen
// With reduced motion, or if the CDN is blocked, the page is the finished layout and nothing moves.
import { signal, reducedMotion, scrollThrough, inView as kitInView } from './kit/motion-core.js';
import { splitText } from './kit/split-text.js';

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
// splitText keeps the sentence for screen readers in a first, visually hidden span; name it with the page's own
// .sr-only class so a layout check can tell that hidden copy from text that is cut off by mistake
const markHidden = (el) => el.firstElementChild?.classList.add('sr-only');

/* ---- content that does not need the library: the rota (works with motion off) ---- */
const ROTA = [0, 0, 1, 1, 2, 2, 1];            // who is on call each night, Monday to Sunday
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const NAMES = ['Ines', 'Tomás', 'Wren'];
const people = $$('.rota-people li[data-person]'), highlight = $('.rota-highlight'), status = $('.rota-status');
let moveHighlight = (y) => highlight.style.setProperty('--y', `${y}px`);   // replaced by a spring once Motion loads
function setDay(day, announce = true) {
  const on = ROTA[day];
  $$('.rota-days button').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.day) === day)));
  people.forEach((li, i) => {
    li.classList.toggle('is-on', i === on);
    $('.rota-state', li).textContent = i === on ? 'On call tonight' : i === ROTA[(day + 1) % 7] && i !== on ? 'On tomorrow' : 'Off';
  });
  moveHighlight(people[on].offsetTop);
  if (announce) status.textContent = `${DAYS[day]} night: ${NAMES[on]} is on call.`;
}
$$('.rota-days button').forEach((b) => b.addEventListener('click', () => setDay(Number(b.dataset.day))));
setDay(0, false);
addEventListener('resize', () => setDay(Number($('.rota-days button[aria-pressed="true"]').dataset.day), false), { passive: true });

// log lines get coloured spans (time, verb) whether or not they animate
for (const pre of $$('[data-log]')) {
  const code = $('code', pre);
  code.innerHTML = code.textContent.split('\n').map((l) => {
    const m = l.match(/^(\S+)\s+(\S+)\s+(.*)$/); if (!m) return `<span class="ln">${l}</span>`;
    return `<span class="ln"><span class="t">${m[1]}</span>  <span class="k">${m[2].padEnd(7)}</span> ${m[3].replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
  }).join('');
}

/* ---- motion ---- */
async function start() {
  if (reducedMotion()) { signal('reduced'); return; }
  let M;
  try { M = await import('motion'); } catch (err) { console.warn('Motion did not load; the page stays still.', err); signal('static'); return; }
  const { animate, stagger, scroll, spring } = M;

  // 1. hero: split into words; the <mark> words are tagged so the amber block can wipe in behind them
  const title = $('.hero-title');
  const markText = $('mark', title).textContent.trim().split(/\s+/);
  const split = splitText(title, { by: 'words' }); markHidden(title);
  const first = split.words.findIndex((w, i) => markText.every((m, k) => split.words[i + k]?.textContent === m));
  const marked = first >= 0 ? split.words.slice(first, first + markText.length) : [];
  marked.forEach((w) => { w.classList.add('is-marked'); w.style.setProperty('--wipe', 0); });
  const heroIn = animate(split.words, { opacity: [0, 1], y: ['0.55em', '0em'], rotate: [4, 0] }, { duration: 0.9, delay: stagger(0.055, { startDelay: 0.1 }), ease: [0.2, 0.8, 0.2, 1] });
  marked.forEach((w, i) => animate(w, { '--wipe': [0, 1] }, { duration: 0.5, delay: 0.95 + i * 0.12, ease: [0.7, 0, 0.2, 1] }));
  animate('.hero-sub, .hero-actions', { opacity: [0, 1], y: [16, 0] }, { duration: 0.7, delay: stagger(0.12, { startDelay: 0.9 }) });

  // 2. the alert travels along the live line to the person on call (CSS motion path, driven by Motion)
  const pulse = $('.route-pulse'), live = $('.route-live');
  const liveLen = live.getTotalLength(); live.style.strokeDasharray = liveLen;   // the svg-draw rule: measured length
  animate(live, { strokeDashoffset: [liveLen, 0] }, { duration: 1.1, delay: 1.3, ease: 'easeInOut' });
  animate(pulse, { offsetDistance: ['0%', '100%'], scale: [0.6, 1] }, { duration: 1.1, delay: 1.3, ease: 'easeInOut' });
  animate('.node-b', { scale: [1, 1.08, 1] }, { duration: 0.5, delay: 2.35, type: spring, bounce: 0.5 });
  animate('.node', { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.08, { startDelay: 1.0 }) });

  // 3. word band: each row slides with scroll. Motion's scroll() hands us progress; the kit keeps it to one write per frame.
  for (const row of $$('.band-row')) {
    const dir = Number(row.dataset.dir);
    scrollThrough(row, (p) => row.style.setProperty('--x', `${dir * p * Math.min(innerWidth * 0.5, 620)}px`));
  }

  // 4. section headings set word by word, once, when first seen
  for (const h of $$('h2[data-split]')) {
    const s = splitText(h, { by: 'words' }); markHidden(h);
    s.words.forEach((w) => { w.style.opacity = 0; });
    kitInView(h, () => animate(s.words, { opacity: [0, 1], y: ['0.5em', '0em'] }, { duration: 0.8, delay: stagger(0.06), ease: [0.2, 0.8, 0.2, 1] }), { amount: 0.5 });
  }

  // 5. log lines print one after another the first time each log is seen
  for (const pre of $$('[data-log]')) {
    const lines = $$('.ln', pre); lines.forEach((l) => { l.style.opacity = 0; });
    kitInView(pre, () => animate(lines, { opacity: [0, 1], x: [-10, 0] }, { duration: 0.35, delay: stagger(0.32) }), { amount: 0.6 });
  }

  // 6. the rota highlight is a spring: it answers the click, and it can be interrupted mid-flight
  let y = people[ROTA[0]].offsetTop;
  moveHighlight = (to) => { animate(y, to, { type: spring, stiffness: 420, damping: 30, onUpdate: (v) => { y = v; highlight.style.setProperty('--y', `${v}px`); } }); };

  // scroll progress bar on the nav border: Motion's scroll() linked to a scaleX
  const bar = Object.assign(document.createElement('div'), { className: 'nav-progress' });
  bar.style.cssText = 'position:absolute;left:0;right:0;bottom:-2px;height:3px;background:#ffb000;transform-origin:left;transform:scaleX(0)';
  bar.setAttribute('aria-hidden', 'true'); $('.nav').append(bar);
  scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));

  await heroIn.finished.catch(() => {});   // "ready" means the headline has settled, so a check reads the resting page, not a fade
  signal('ready');
}
start();
