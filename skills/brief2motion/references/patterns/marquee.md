# Marquee

A single row of words, logos or tags drifts sideways in a loop.

**Use when:** a strip of partner names the brief supplies, a ribbon of keywords, a kinetic divider between sections.
**Not when:** the row carries information people must read (a marquee is unreadable by design), or when you would invent logos or clients.
**Stack:** CSS only (`vanilla`). No JavaScript is needed.
**Brief words:** marquee, ticker, scrolling strip, logo wall that moves, infinite scroll text, ribbon.
**Study:** `web-references.md` sections 2 (Magic UI and Aceternity marquees) and 3.

## Sketch

```html
<div class="marquee" role="group" aria-label="Technologies we use">
  <ul class="marquee-track">
    <li>Rust</li><li>Postgres</li><li>WebAssembly</li><li>Kubernetes</li>
  </ul>
  <ul class="marquee-track" aria-hidden="true">
    <li>Rust</li><li>Postgres</li><li>WebAssembly</li><li>Kubernetes</li>
  </ul>
</div>
```

```css
.marquee { display: flex; overflow: hidden; gap: 3rem; padding-block: 1rem; }
.marquee-track { display: flex; flex: 0 0 auto; gap: 3rem; margin: 0; padding: 0; list-style: none; min-width: 100%; justify-content: space-around; }
@media (prefers-reduced-motion: no-preference) {
  .marquee-track { animation: marquee 28s linear infinite; }
  .marquee:hover .marquee-track, .marquee:focus-within .marquee-track { animation-play-state: paused; }
}
@keyframes marquee { to { transform: translateX(calc(-100% - 3rem)); } }
@media (prefers-reduced-motion: reduce) { .marquee { flex-wrap: wrap; } .marquee-track[aria-hidden] { display: none; } }
```

The second list is a copy, hidden from assistive technology, so the loop has no gap. The track moves exactly its own width plus the gap, which makes the loop seamless. Linear easing is right here: it is a constant motion.

## Budget

One compositor-only animation (`transform`) per marquee; at most two on a page. Speed 20 to 40 s per loop. Pause on hover and on keyboard focus. Anything that moves for more than 5 seconds needs a way to stop it (WCAG 2.2.2): hover and focus pause covers pointer and keyboard users, and reduced motion removes it.

## Reduced motion

The animation is only declared inside `no-preference`. In the reduced case the row wraps and the copy list is hidden: a still, complete list.

## Checks

`check_site.mjs`: reduced-motion run (nothing animating over 250 ms, picture holds still, text visible); no sideways scroll at 320 px (the `overflow: hidden` wrapper must contain the track); tap targets of 24 px if items are links; phone p95 40 ms or less. By eye: no gap or jump at the loop point.
