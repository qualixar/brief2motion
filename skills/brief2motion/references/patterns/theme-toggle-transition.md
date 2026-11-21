# Theme toggle transition

Switching between light and dark crossfades the whole page, or wipes from the button, instead of flashing.

**Use when:** the brief asks for a dark or light switch, and the page supports both.
**Not when:** the page has one theme, or the colour change would flash large areas for people sensitive to light (keep it a soft crossfade, never a strobe).
**Stack:** the View Transitions API, same-document, with a plain fallback (`view-transitions`).
**Brief words:** dark mode toggle, theme switch, light and dark, theme animation, mode switch.
**Study:** `web-references.md` section 3 (View Transitions); `design-fundamentals.md` section 5 (light default, `prefers-color-scheme`).

## Sketch

```html
<button type="button" id="theme" aria-pressed="false">Dark mode</button>
```

```css
:root { color-scheme: light dark; --bg: #fbfaf7; --fg: #1d1b18; }
:root[data-theme="dark"] { --bg: #141311; --fg: #f1ede5; }
body { background: var(--bg); color: var(--fg); }
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root), ::view-transition-new(root) { animation-duration: 320ms; animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
}
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';
import { supportsViewTransitions } from './kit/view-transitions.js';

const root = document.documentElement, btn = document.getElementById('theme');
const set = (theme) => { root.dataset.theme = theme; btn.setAttribute('aria-pressed', String(theme === 'dark')); try { localStorage.setItem('theme', theme); } catch { /* private mode */ } };
btn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  if (supportsViewTransitions() && !reducedMotion()) document.startViewTransition(() => set(next)); else set(next);
});
set((() => { try { return localStorage.getItem('theme'); } catch { return null; } })() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
signal(reducedMotion() ? 'reduced' : 'ready');
```

A plain 320 ms crossfade says "this continues": the same page, a different palette (`motion-doctrine.md`, rule 8). A circular wipe from the button is possible with `t.ready` and a `clip-path` animation on `::view-transition-new(root)`, but it is a loud effect: use it once, or not at all.

## Budget

Under 400 ms; the browser takes two pictures of the page. Both themes pass contrast (4.5:1 text, 3:1 large text and control edges). Set the stored theme before first paint (in `<head>`) to avoid a flash on load: keep that script tiny and synchronous.

## Reduced motion

`set(next)` runs directly: an instant switch.

## Checks

`check_site.mjs` checks the default theme only. Switch the theme, then run `capture_site.mjs` or check the other theme's contrast by hand: both palettes need their pairs checked before code (SPEC.md design plan). Reduced-motion run, keyboard focus on the button, and `aria-pressed` correct are all visible in the report.
