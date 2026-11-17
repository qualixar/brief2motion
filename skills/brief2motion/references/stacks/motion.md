# Motion (vanilla) and Motion for React

Motion is the library that used to be Framer Motion (MIT). It has two faces: a small JavaScript API for any page, and components for React. Use it for interface feel: springs, gestures, layout changes, items entering and leaving, values tied to scroll.

Worked examples: `examples/relay/` (vanilla, kinetic type) and `examples/mise/` (React).

## Vanilla: `motion`

```html
<script type="importmap">{ "imports": { "motion": "https://cdn.jsdelivr.net/npm/motion@14.14.0/+esm" } }</script>
```

```js
import { signal, reducedMotion } from './kit/motion-core.js';

async function start() {
  if (reducedMotion()) { signal('reduced'); return; }
  let M;
  try { M = await import('motion'); } catch { signal('static'); return; }     // CDN blocked: the page stays still and complete
  const { animate, stagger, scroll, inView, spring, hover, press } = M;
  // ...
  signal('ready');
}
start();
```

### Stagger a split headline

```js
import { splitText } from './kit/split-text.js';
const { words } = splitText(title, { by: 'words' });
animate(words, { opacity: [0, 1], y: ['0.55em', '0em'], rotate: [4, 0] },
  { duration: 0.9, delay: stagger(0.055, { startDelay: 0.1 }), ease: [0.2, 0.8, 0.2, 1] });
```

### Animate a CSS variable, an SVG attribute, a motion path

```js
animate(word, { '--wipe': [0, 1] }, { duration: 0.5, ease: [0.7, 0, 0.2, 1] });     // a highlight that wipes in
animate(path, { strokeDashoffset: [1, 0] }, { duration: 1.1 });                      // with pathLength="1" on the path
animate(dot, { offsetDistance: ['0%', '100%'] }, { duration: 1.1 });                 // dot has offset-path: path("...")
```

### A spring that follows clicks and can be interrupted

```js
let y = 0;
const moveTo = (to) => animate(y, to, { type: spring, stiffness: 420, damping: 30,
  onUpdate: (v) => { y = v; highlight.style.setProperty('--y', `${v}px`); } });
```

Animating a plain number with `onUpdate` lets you drive anything. Starting a new animation from the current value keeps the motion continuous.

### Scroll-linked

```js
scroll(animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));                         // page progress
scroll(animate(card, { opacity: [0, 1] }), { target: card, offset: ['start end', 'start 60%'] });
```

`scroll()` uses the browser's ScrollTimeline where it can, so these run off the main thread.

### In view, hover, press

```js
inView('.log', (el) => { animate(el.querySelectorAll('.ln'), { opacity: [0, 1], x: [-10, 0] }, { delay: stagger(0.3) }); });
hover('.card', (el) => { animate(el, { y: -4 }); return () => animate(el, { y: 0 }); });
press('button', (el) => { animate(el, { scale: 0.96 }); return () => animate(el, { scale: 1 }); });   // keyboard too
```

## React: `motion/react`

In a real project: `npm i motion`, then `import { motion, AnimatePresence } from 'motion/react'`. Framer Motion's old import path still exists; new code should use this one. Next.js: a file that uses these needs `"use client"`.

```jsx
import { motion, AnimatePresence, LayoutGroup, MotionConfig, Reorder, useSpring, useTransform, useDragControls } from 'motion/react';

const spring = { type: 'spring', stiffness: 520, damping: 38 };

<MotionConfig reducedMotion="user">          {/* transform and layout animation off for visitors who asked */}
  <LayoutGroup>
    {/* 1. one marker, shared between tabs */}
    {tabs.map((t) => (
      <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
        {tab === t.id && <motion.span layoutId="tab-marker" className="tab-marker" transition={spring} />}
        {t.label}
      </button>
    ))}

    {/* 2. a list you can reorder: ids as values, so they are stable between renders */}
    <Reorder.Group as="ol" axis="y" values={ids} onReorder={setIds}>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <Reorder.Item key={item.id} value={item.id} layout whileDrag={{ scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={spring} />
        ))}
      </AnimatePresence>
    </Reorder.Group>

    {/* 3. an item that moves between two lists keeps one layoutId */}
    <motion.li layout layoutId={`item-${name}`} transition={spring} />

    {/* 4. height that opens and closes */}
    <AnimatePresence initial={false}>
      {open && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} />}
    </AnimatePresence>
  </LayoutGroup>
</MotionConfig>
```

A number on a spring:

```jsx
function Count({ value }) {
  const s = useSpring(value, { stiffness: 260, damping: 26 });
  const text = useTransform(s, (v) => Math.round(v));
  useEffect(() => { s.set(value); }, [value]);
  return <motion.span>{text}</motion.span>;       // updates without re-rendering React
}
```

Things that bit while building `examples/mise`:

- `Reorder.Group` tracks rows by their `values`. Objects created during render look new every time and the order never changes. Pass ids.
- `Reorder.Item` is a keyboard stop: Space picks a row up, the arrow keys move it, Space drops it. Say so in its `aria-label`.
- To drag by a handle only: `dragListener={false} dragControls={controls}` on the item and `onPointerDown={(e) => controls.start(e)}` on the handle. Give the handle `touch-action: none`.
- `layout` animates with transforms, so text can look stretched mid-flight; put `layout="position"` on text-heavy children.
- Wrap conditional children in `AnimatePresence` and give each a `key`, or `exit` never runs.

## No build step?

`examples/mise` runs React, Motion and htm as ES modules from the CDN, which suits a demo. It depends on the CDN resolving one copy of React for every package, so pin exact versions, and for anything real use the project's bundler. The router says so whenever it picks a React stack.

## Rules

- Springs for things people drag or interrupt; tweens with an ease for entrances.
- Animate `x`, `y`, `scale`, `rotate`, `opacity`. Motion composes independent transforms for you.
- Motion in an interface answers input. If nothing was pressed, nothing moves.
- State is never shown by motion alone: update the text, the `aria-` attribute and a live region as well.
