// Keeling: a scroll-driven chart ("scrollytelling"). One SVG, drawn by hand with D3 scales and a D3 line
// generator (d3-scale, d3-shape, ISC), and five states that the text switches between as you read.
// Motion plan:
//   scroll  the paragraph nearest the middle of the screen is the active step; the chart moves to that step's state
//           0 a dot at 1959   1 line to 1988, the 350 mark   2 line to 2015, the 400 mark   3 line to 2025   4 bars
//   the line is revealed by widening a clip rectangle, so the visible part always ends exactly on the right year
// Reduced motion: the same five states, switched at once with no travel. JavaScript off: text, sources and a note.
import { signal, reducedMotion, ease, lerp, onScroll } from './kit/motion-core.js';
import { countUp, formatNumber } from './kit/counter.js';
import { CO2 } from './data.js';

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, parent = null, text = null) => { const n = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (text !== null) n.textContent = text; parent?.append(n); return n; };

// the table is plain DOM and needs no library
$('#rows').append(...CO2.map(([y, v]) => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${y}</td><td>${v.toFixed(2)}</td>`; return tr; }));

// average rise per year over each span of the record, straight from the data
const at = (year) => CO2.find(([y]) => y === year)[1];
const SPANS = [[1959, 1969, '1960s'], [1969, 1979, '1970s'], [1979, 1989, '1980s'], [1989, 1999, '1990s'], [1999, 2009, '2000s'], [2009, 2019, '2010s'], [2019, 2025, '2019–25']];
const RATES = SPANS.map(([a, b, label]) => ({ label, rate: (at(b) - at(a)) / (b - a) }));
// step -> the year the line is drawn up to
const UPTO = [1959, 1988, 2015, 2025, 2025];

async function start() {
  let d3s, d3h;
  try { [d3s, d3h] = await Promise.all([import('d3-scale'), import('d3-shape')]); }
  catch (err) { console.warn('D3 did not load; the page keeps its text and data table.', err); signal('static'); return; }
  const still = reducedMotion();
  const svg = $('.chart svg'), W = 720, H = 520, M = { t: 24, r: 28, b: 44, l: 56 };
  const x = d3s.scaleLinear().domain([1959, 2025]).range([M.l, W - M.r]);
  const y = d3s.scaleLinear().domain([300, 440]).range([H - M.b, M.t]);

  // ---- line chart ----
  const plotLine = el('g', { class: 'plot-line' }, svg);
  const grid = el('g', { class: 'grid' }, plotLine);
  for (const v of y.ticks(7)) { el('line', { x1: M.l, x2: W - M.r, y1: y(v), y2: y(v) }, grid); el('text', { x: M.l - 10, y: y(v) + 5, 'text-anchor': 'end' }, grid, v); }
  const ax = el('g', { class: 'axis-x' }, plotLine);
  el('line', { x1: M.l, x2: W - M.r, y1: H - M.b, y2: H - M.b }, ax);
  for (const yr of [1960, 1970, 1980, 1990, 2000, 2010, 2020]) { el('line', { x1: x(yr), x2: x(yr), y1: H - M.b, y2: H - M.b + 6 }, ax); el('text', { x: x(yr), y: H - M.b + 26, 'text-anchor': 'middle' }, ax, yr); }
  const clipId = 'reveal';
  const clip = el('rect', { x: 0, y: 0, width: x(1959) + 1, height: H }, el('clipPath', { id: clipId }, el('defs', {}, svg)));
  const line = d3h.line().x((d) => x(d[0])).y((d) => y(d[1])).curve(d3h.curveMonotoneX);
  const area = d3h.area().x((d) => x(d[0])).y0(H - M.b).y1((d) => y(d[1])).curve(d3h.curveMonotoneX);
  const drawn = el('g', { 'clip-path': `url(#${clipId})` }, plotLine);
  el('path', { class: 'area', d: area(CO2) }, drawn);
  el('path', { class: 'line', d: line(CO2) }, drawn);
  const thresholds = [350, 400].map((v, i) => { const g = el('g', { class: 'threshold', opacity: 0 }, plotLine); el('line', { x1: M.l, x2: W - M.r, y1: y(v), y2: y(v) }, g); el('text', { x: W - M.r, y: y(v) - 8, 'text-anchor': 'end' }, g, `${v} ppm`); return { g, from: i + 1 }; });
  const dot = el('circle', { class: 'dot', r: 8, cx: x(1959), cy: y(at(1959)) }, plotLine);

  // ---- bars: average rise per year, by decade ----
  const plotBars = el('g', { class: 'plot-bars', opacity: 0 }, svg);
  const bx = d3s.scaleBand().domain(RATES.map((r) => r.label)).range([M.l, W - M.r]).padding(0.28);
  const by = d3s.scaleLinear().domain([0, 3]).range([H - M.b, M.t + 30]);
  el('line', { x1: M.l, x2: W - M.r, y1: H - M.b, y2: H - M.b, stroke: 'currentColor', 'stroke-width': 1.5 }, plotBars);
  el('text', { x: M.l, y: M.t + 6, class: 'bar-title', style: 'font: 600 16px system-ui, sans-serif; fill: #555b63' }, plotBars, 'Average rise per year, ppm');
  const bars = el('g', { class: 'bars' }, plotBars), labels = el('g', { class: 'bar-labels' }, plotBars), values = el('g', { class: 'bar-values' }, plotBars);
  const barEls = RATES.map((r) => {
    el('text', { x: bx(r.label) + bx.bandwidth() / 2, y: H - M.b + 26, 'text-anchor': 'middle' }, labels, r.label);
    const val = el('text', { x: bx(r.label) + bx.bandwidth() / 2, y: by(r.rate) - 10, 'text-anchor': 'middle' }, values, r.rate.toFixed(2));
    const rect = el('rect', { x: bx(r.label), width: bx.bandwidth(), y: by(r.rate), height: by(0) - by(r.rate) }, bars);
    rect.style.transformBox = 'fill-box'; rect.style.transformOrigin = 'bottom';
    return { rect, val };
  });

  // ---- state machine ----
  const yearEl = $('.readout-year'), valueEl = $('.readout-value b'), unit = $('.readout-value');
  let shownYear = 1959, tweenRaf = 0, step = -1;
  const setYear = (yr) => {                               // yr may be fractional while travelling
    shownYear = yr;
    const i = Math.min(CO2.length - 2, Math.max(0, Math.floor(yr - 1959))), f = Math.min(1, Math.max(0, yr - 1959 - i));
    const v = lerp(CO2[i][1], CO2[i + 1][1], f);
    clip.setAttribute('width', x(yr) + 1.5);
    dot.setAttribute('cx', x(yr)); dot.setAttribute('cy', y(v));
    yearEl.textContent = Math.round(yr); valueEl.textContent = formatNumber(v, { decimals: 2 });
  };
  const travel = (to) => {
    cancelAnimationFrame(tweenRaf);
    if (still) { setYear(to); return; }
    const from = shownYear, t0 = performance.now(), ms = 500 + Math.abs(to - from) * 26;
    const tick = (now) => { const k = Math.min(1, (now - t0) / ms); setYear(lerp(from, to, ease.inOutCubic(k))); if (k < 1) tweenRaf = requestAnimationFrame(tick); };
    tweenRaf = requestAnimationFrame(tick);
  };
  const go = (s) => {
    if (s === step) return; const was = step; step = s;
    $$('.step').forEach((a, i) => a.classList.toggle('is-active', i === s));
    travel(UPTO[s]);
    thresholds.forEach(({ g, from }) => g.setAttribute('opacity', s >= from && s < 4 ? 1 : 0));
    const barsOn = s === 4;
    plotLine.style.opacity = barsOn ? 0 : 1; plotBars.style.opacity = barsOn ? 1 : 0;
    unit.style.visibility = yearEl.style.visibility = barsOn ? 'hidden' : 'visible';
    if (barsOn && was !== 4 && !still) barEls.forEach(({ rect, val }, i) => {
      rect.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 700, delay: i * 80, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      val.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 500 + i * 80, fill: 'backwards' });
    });
  };

  // the active step is the one whose middle is closest to a line 55% down the screen (the scrollama idea, in 10 lines)
  document.documentElement.classList.add('js-story');
  const steps = $$('.step');
  onScroll((vh) => {
    const mark = vh * 0.55; let best = 0, bestD = Infinity;
    steps.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs((r.top + r.bottom) / 2 - mark); if (d < bestD) { bestD = d; best = i; } });
    go(best);
  });
  // the kit keeps the real number in a hidden first span; naming it .sr-only lets a layout check tell it from cut-off text
  $$('[data-count]').forEach((n) => { countUp(n, { duration: 1400 }); n.firstElementChild?.classList.add('sr-only'); });
  signal(still ? 'reduced' : 'ready');
}
start();
