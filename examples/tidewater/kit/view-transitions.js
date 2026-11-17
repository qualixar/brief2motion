// brief2motion kit: view-transitions.js. MIT. No dependencies.
// The View Transitions API animates between two states of a page, or between two pages, in the browser itself.
// Two helpers. Both do nothing extra where the API is missing or the visitor asked for reduced motion: the
// change simply happens, which is the correct fallback.
import { reducedMotion } from './motion-core.js';

export const supportsViewTransitions = () => typeof document !== 'undefined' && 'startViewTransition' in document;

// Same page: run update() (it changes the DOM) inside a transition. Returns a promise that settles when it is over.
//   await transition(() => grid.replaceChildren(...sorted));
export function transition(update, { types = [] } = {}) {
  if (!supportsViewTransitions() || reducedMotion()) { return Promise.resolve(update()); }
  let t;
  try { t = types.length ? document.startViewTransition({ update, types }) : document.startViewTransition(update); }
  catch { t = document.startViewTransition(update); }      // older browsers take only the callback form
  return t.finished.catch(() => {});
}

// Page to page (a normal multi-page site; the CSS needs `@view-transition { navigation: auto; }` on both pages).
// To morph one thumbnail into the next page's hero, only that one pair may share a view-transition-name.
// This sets the name on the clicked card as the old page leaves, and on the matching card when a page is
// shown again by Back. `key(url)` turns a URL into the id of its card, for example the file name of a project.
export function sharedElementNav({ card = '[data-vt]', name = 'hero-media', key = (url) => new URL(url).pathname.split('/').pop().replace(/\.html$/, '') } = {}) {
  if (!('onpageswap' in window)) return;
  const find = (id) => [...document.querySelectorAll(card)].find((el) => el.dataset.vt === id);
  addEventListener('pageswap', (e) => {
    if (!e.viewTransition) return;
    const to = e.activation?.entry?.url; const el = to && find(key(to));
    if (el) { el.style.viewTransitionName = name; e.viewTransition.finished.finally(() => { el.style.viewTransitionName = ''; }); }
  });
  addEventListener('pagereveal', (e) => {
    if (!e.viewTransition) return;
    const from = window.navigation?.activation?.from?.url; const el = from && find(key(from));
    if (el) { el.style.viewTransitionName = name; e.viewTransition.ready.finally(() => { el.style.viewTransitionName = ''; }); }
  });
}
