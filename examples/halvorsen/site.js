// Halvorsen: page transitions with the View Transitions API. No animation library is loaded.
// Motion plan:
//   page to page   a normal link click. The browser cross-fades the two documents and morphs the clicked poster
//                  into the big poster on the next page (the CSS in style.css switches this on; this file only
//                  names the right card as the page leaves, and again when you come Back)
//   same page      the filter and sort buttons change the grid inside document.startViewTransition, so each card
//                  glides to its new place and cards that leave fade out
//   input          the size slider on a project page
// Browsers without the API, and visitors with reduced motion, get the same pages with instant changes.
import { signal, reducedMotion } from './kit/motion-core.js';
import { transition, sharedElementNav, supportsViewTransitions } from './kit/view-transitions.js';

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

sharedElementNav({ card: '[data-vt]', name: 'hero-media' });

// index: filter and sort
const grid = $('.grid');
if (grid) {
  const cards = $$('.card', grid), original = [...cards], status = $('.filter-status');
  let kind = 'all', newest = false;
  const apply = () => {
    const order = newest ? [...original].sort((a, b) => Number($('.card-meta', b).textContent.slice(-4)) - Number($('.card-meta', a).textContent.slice(-4))) : original;
    grid.append(...order);
    let shown = 0;
    for (const c of cards) { const on = kind === 'all' || c.dataset.kind === kind; c.hidden = !on; if (on) shown++; }
    status.textContent = `${shown} ${shown === 1 ? 'typeface' : 'typefaces'} shown${newest ? ', newest first' : ''}.`;
  };
  for (const b of $$('.filters button')) b.addEventListener('click', () => {
    if (b.hasAttribute('data-sort')) { newest = !newest; b.setAttribute('aria-pressed', String(newest)); }
    else { kind = b.dataset.filter; $$('.filters button[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }
    transition(apply);
  });
}

// project page: the size slider
const size = $('.tester-size input');
if (size) {
  const sample = $('.tester-sample'), out = $('.tester-size output');
  const set = () => { sample.style.setProperty('--size', `${size.value}px`); out.textContent = `${size.value} px`; };
  size.addEventListener('input', set); set();
}

signal(reducedMotion() ? 'reduced' : supportsViewTransitions() ? 'ready' : 'static');
