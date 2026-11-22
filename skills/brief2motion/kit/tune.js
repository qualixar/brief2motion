// brief2motion kit: tune.js. MIT. DEV ONLY: never part of a shipped page.
// A tuning panel for easing, duration, stagger and colour, built on Tweakpane (cocopon, MIT, https://tweakpane.github.io/docs/).
// It loads only when the address has ?tune (for example http://localhost:8421/?tune). Without it, tune() returns at once and
// makes no request. Before delivery, scripts/strip_tune.mjs removes this file and the lines between the tune:start and
// tune:end markers, and check_site.mjs fails any page that still asks for Tweakpane or still carries the file.
//
//   /* tune:start */
//   if (new URLSearchParams(location.search).has('tune')) import('./kit/tune.js').then(({ tune }) =>
//     tune(P, { duration: { min: 0.2, max: 2 }, ease: { options: ['power3.out', 'expo.out', 'power2.inOut'] } }, { onChange: replay }));
//   /* tune:end */
//
// `P` is a plain object of the numbers, strings and colours the motion reads. The panel edits it in place, calls
// onChange(P, key) so the page can replay, and "Copy values" puts the result in the clipboard and the console as JSON,
// ready to paste back into the code as the new defaults.

export const TWEAKPANE = Object.freeze({
  version: '4.0.5',
  url: 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js',
  integrity: 'sha384-Dt9sd/AA7KNs3M8XRJs7rNwUZ9bRWhsKjVz4UpCle+pCI/lqdylOH3mcYcKRBPKF',
});

export const tuneRequested = (search = globalThis.location?.search ?? '') => new URLSearchParams(search).has('tune');

// Pure, unit-tested. A slider range for a number when the caller gave none: 0 to four times the value (at least 1),
// symmetric for a negative value, and a step that suits its size.
export function guessRange(value) {
  if (!Number.isFinite(value)) return {};
  const mag = Math.abs(value);
  const max = Math.max(1, mag * 4);
  const step = mag >= 100 ? 1 : mag >= 10 ? 0.5 : mag >= 1 ? 0.05 : 0.01;
  return { min: value < 0 ? -max : 0, max, step };
}
// Pure, unit-tested. The values as JSON text, to paste back into the code.
export const snapshot = (params) => JSON.stringify(params, null, 2);

// The file is fetched with its integrity hash checked by the browser, then imported from a blob: a dynamic import()
// cannot carry a hash itself.
let loading = null;
const loadTweakpane = () => (loading ||= (async () => {
  const res = await fetch(TWEAKPANE.url, { integrity: TWEAKPANE.integrity, mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const url = URL.createObjectURL(new Blob([await res.text()], { type: 'text/javascript' }));
  try { return await import(url); } finally { URL.revokeObjectURL(url); }
})().catch((e) => { loading = null; throw e; }));

export async function tune(params, spec = {}, { title = 'Tuning (dev only)', onChange = null } = {}) {
  if (!tuneRequested()) return { params, pane: null };
  let tp;
  try { tp = await loadTweakpane(); } catch (e) { console.warn(`tune: Tweakpane did not load (${e.message}). The page keeps its built-in values.`); return { params, pane: null }; }
  const pane = new tp.Pane({ title });
  for (const [key, value] of Object.entries(params)) {
    const own = spec[key] || {};
    const options = Array.isArray(own.options) ? Object.fromEntries(own.options.map((o) => [String(o), o])) : own.options;
    const opts = { ...(typeof value === 'number' ? guessRange(value) : {}), ...own, ...(options ? { options } : {}) };
    pane.addBinding(params, key, opts).on('change', () => onChange?.(params, key));
  }
  pane.addButton({ title: 'Copy values' }).on('click', async () => {
    const text = snapshot(params);
    console.log(text);
    try { await navigator.clipboard.writeText(text); } catch { /* the console has it */ }
  });
  return { params, pane };
}
