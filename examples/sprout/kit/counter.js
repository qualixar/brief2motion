// brief2motion kit: counter.js. MIT. No dependencies.
// A number that counts up to its real value when it scrolls into view. The real value is in the HTML from the
// start (so it is there without JavaScript and for screen readers); only a visual copy counts.
import { inView, reducedMotion, ease as E } from './motion-core.js';

// Pure, unit-tested: the value shown at time t (0..1), and its text.
export const valueAt = (from, to, t, easing = E.outExpo) => from + (to - from) * easing(Math.min(1, Math.max(0, t)));
export function formatNumber(v, { decimals = 0, locale = 'en-US', prefix = '', suffix = '' } = {}) {
  return prefix + v.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}

// <span data-count data-to="1234.5" data-decimals="1" data-prefix="$" data-suffix=" ppm">1,234.5 ppm</span>
export function countUp(el, { duration = 1600, from = 0 } = {}) {
  const to = Number(el.dataset.to);
  if (!Number.isFinite(to) || reducedMotion()) return () => {};
  const fmt = { decimals: Number(el.dataset.decimals || 0), prefix: el.dataset.prefix || '', suffix: el.dataset.suffix || '', locale: el.dataset.locale || 'en-US' };
  const finalText = el.textContent;
  // the final text stays for assistive tech; a twin shows the count. Fixed-width digits stop the line from wobbling.
  const sr = document.createElement('span');
  sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
  sr.textContent = finalText;
  const live = document.createElement('span'); live.setAttribute('aria-hidden', 'true'); live.style.fontVariantNumeric = 'tabular-nums';
  live.textContent = formatNumber(from, fmt);
  el.replaceChildren(sr, live);
  let raf = 0;
  const stop = inView(el, () => {
    const t0 = performance.now();
    const step = (now) => {
      const t = (now - t0) / duration;
      live.textContent = t >= 1 ? finalText : formatNumber(valueAt(from, to, t), fmt);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }, { amount: 0.6 });
  return () => { stop(); cancelAnimationFrame(raf); el.textContent = finalText; };
}
