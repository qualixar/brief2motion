// Mise: interface motion with React 19 and Motion for React (motion/react, MIT), written with htm instead of JSX
// so the page needs no build step. In a real project this is ordinary JSX in Vite or Next.js; the Motion code is the same.
// Motion plan (all of it answers input):
//   tabs       one marker with a layoutId travels between tabs
//   week       Reorder.Group: drag a row by its handle and the others step aside. Reorder.Item is also a keyboard
//              stop: Space picks a row up, the arrow keys move it, Space drops it. A row opening pushes the rest down
//              AnimatePresence: a removed row shrinks out, a new one grows in
//   shop       ticking moves an item between "to buy" and "bought" (shared layout); the tick draws itself
//   counter    the number left to buy rides a spring
// <MotionConfig reducedMotion="user"> turns transform and layout animation off for visitors who asked for less motion.
import { signal, reducedMotion } from './kit/motion-core.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const MEALS = [
  { id: 'dal', name: 'Lentil dal with rice', needs: ['Red lentils', 'Rice', 'Onion', 'Ginger'] },
  { id: 'squash', name: 'Roast squash and feta tray', needs: ['Squash', 'Feta', 'Red onion'] },
  { id: 'soup', name: 'Tomato and white bean soup', needs: ['Tinned tomatoes', 'White beans', 'Onion', 'Bread'] },
  { id: 'rice', name: 'Egg fried rice', needs: ['Rice', 'Eggs', 'Spring onions', 'Frozen peas'] },
  { id: 'ragu', name: 'Mushroom ragù with pasta', needs: ['Mushrooms', 'Pasta', 'Tinned tomatoes', 'Parmesan'] },
];
const SPARE = [
  { id: 'tacos', name: 'Black bean tacos', needs: ['Black beans', 'Tortillas', 'Lime', 'Red onion'] },
  { id: 'curry', name: 'Chickpea and spinach curry', needs: ['Chickpeas', 'Spinach', 'Coconut milk', 'Rice'] },
];

async function start() {
  let React, createRoot, M, htm;
  try {
    [React, { createRoot }, M, { default: htm }] = await Promise.all([import('react'), import('react-dom/client'), import('motion/react'), import('htm')]);
  } catch (err) { console.warn('The planner did not load; the plain list stays.', err); signal('static'); return; }
  const { useState, useMemo, useEffect, useId } = React;
  const { motion, AnimatePresence, Reorder, MotionConfig, LayoutGroup, useSpring, useTransform, useDragControls } = M;
  const html = htm.bind(React.createElement);
  const spring = { type: 'spring', stiffness: 520, damping: 38 };

  const Icon = ({ d }) => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d=${d} /></svg>`;

  function Count({ value }) {                               // a number that rides a spring to its new value
    const s = useSpring(value, { stiffness: 260, damping: 26 });
    const text = useTransform(s, (v) => Math.round(v));
    useEffect(() => { s.set(value); }, [value]);
    return html`<${motion.span} className="left">${text}<//>`;
  }

  function MealRow({ meal, day, open, onToggle, onRemove, onMove }) {
    const controls = useDragControls();
    const panel = useId();
    return html`
      <${Reorder.Item} value=${meal.id} as="li" className="row" dragListener=${false} dragControls=${controls}
        whileDrag=${{ scale: 1.02, boxShadow: '0 18px 30px -18px rgba(36,20,59,.6)', borderColor: '#24143b' }}
        aria-label=${`${day}: ${meal.name}. Press Space to pick up, arrow keys to move, Space to drop.`}
        layout initial=${{ opacity: 0, scale: 0.92 }} animate=${{ opacity: 1, scale: 1 }} exit=${{ opacity: 0, scale: 0.9 }} transition=${spring}>
        <div className="row-top">
          <button type="button" className="handle" aria-label=${`Drag to move ${meal.name}`} tabIndex=${-1} onPointerDown=${(e) => controls.start(e)}><${Icon} d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" /></button>
          <button type="button" className="row-main" aria-expanded=${open} aria-controls=${panel} onClick=${onToggle}>
            <span className="row-day">${day}</span><span className="row-name">${meal.name}</span>
          </button>
          <button type="button" className="icon-btn" aria-label=${`Move ${meal.name} up`} onClick=${() => onMove(-1)}><${Icon} d="M12 19V5M6 11l6-6 6 6" /></button>
          <button type="button" className="icon-btn" aria-label=${`Remove ${meal.name}`} onClick=${onRemove}><${Icon} d="M6 6l12 12M18 6L6 18" /></button>
        </div>
        <${AnimatePresence} initial=${false}>
          ${open && html`<${motion.div} key="more" id=${panel} className="row-more" initial=${{ opacity: 0, height: 0 }} animate=${{ opacity: 1, height: 'auto' }} exit=${{ opacity: 0, height: 0 }} transition=${spring}>
            You need:<ul>${meal.needs.map((n) => html`<li key=${n}>${n}</li>`)}</ul>
          <//>`}
        <//>
      <//>`;
  }

  function App() {
    const [tab, setTab] = useState('week');
    const [meals, setMeals] = useState(MEALS);
    const [open, setOpen] = useState(null);
    const [bought, setBought] = useState(() => new Set());
    const spare = SPARE.filter((s) => !meals.some((m) => m.id === s.id));

    // the shopping list is derived from the week: change a dinner and the list follows
    const list = useMemo(() => {
      const map = new Map();
      meals.forEach((m) => m.needs.forEach((n) => map.set(n, [...(map.get(n) || []), m.name.split(' ').slice(0, 2).join(' ')])));
      return [...map].map(([name, forMeals]) => ({ name, forMeals }));
    }, [meals]);
    const todo = list.filter((i) => !bought.has(i.name)), done = list.filter((i) => bought.has(i.name));
    const toggle = (name) => setBought((b) => { const n = new Set(b); n.has(name) ? n.delete(name) : n.add(name); return n; });
    const move = (id, dir) => setMeals((ms) => { const i = ms.findIndex((m) => m.id === id), j = i + dir; if (j < 0 || j >= ms.length) return ms; const c = [...ms]; [c[i], c[j]] = [c[j], c[i]]; return c; });
    // Reorder tracks rows by value, so the values must be stable between renders: ids, not freshly made objects
    const ids = meals.map((m) => m.id);
    const reorder = (next) => setMeals((ms) => next.map((id) => ms.find((m) => m.id === id)));

    const Item = ({ item, isDone }) => html`
      <${motion.li} layout layoutId=${`shop-${item.name}`} key=${item.name} transition=${spring} initial=${{ opacity: 0 }} animate=${{ opacity: 1 }} exit=${{ opacity: 0, scale: 0.9 }} style=${{ listStyle: 'none' }}>
        <button type="button" className=${`shop-item${isDone ? ' is-done' : ''}`} role="checkbox" aria-checked=${isDone} onClick=${() => toggle(item.name)}>
          <span className="box">${isDone && html`<svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><${motion.path} d="M5 12.5l4.5 4.5L19 7.5" initial=${{ pathLength: 0 }} animate=${{ pathLength: 1 }} transition=${{ duration: 0.25 }} /></svg>`}</span>
          <span>${item.name}</span><span className="shop-for">${item.forMeals.length > 1 ? `${item.forMeals.length} dinners` : item.forMeals[0]}</span>
        </button>
      <//>`;

    return html`
      <${MotionConfig} reducedMotion="user">
        <${LayoutGroup}>
          <div className="tabs" role="tablist" aria-label="Mise">
            ${[['week', 'This week'], ['shop', 'Shopping']].map(([id, label]) => html`
              <button key=${id} type="button" role="tab" id=${`tab-${id}`} aria-selected=${tab === id} aria-controls=${`panel-${id}`} className="tab" onClick=${() => setTab(id)}>
                ${tab === id && html`<${motion.span} layoutId="tab-marker" className="tab-marker" transition=${spring} />`}
                ${label}${id === 'shop' && html`<span className="badge" aria-label=${`${todo.length} left to buy`}><${Count} value=${todo.length} /></span>`}
              </button>`)}
          </div>

          ${tab === 'week' && html`
            <div className="panel" role="tabpanel" id="panel-week" aria-labelledby="tab-week">
              <div className="panel-head"><h2>This week</h2><p>${meals.length} dinners</p></div>
              <${Reorder.Group} as="ol" axis="y" values=${ids} onReorder=${reorder} className="rows">
                <${AnimatePresence} initial=${false}>
                  ${meals.map((m, i) => html`<${MealRow} key=${m.id} meal=${m} onMove=${(dir) => move(m.id, dir)} day=${DAYS[i] || 'Spare'} open=${open === m.id} onToggle=${() => setOpen(open === m.id ? null : m.id)} onRemove=${() => setMeals((ms) => ms.filter((x) => x.id !== m.id))} />`)}
                <//>
              <//>
              <${motion.button} layout transition=${spring} type="button" className="add" disabled=${!spare.length} onClick=${() => spare[0] && setMeals((ms) => [...ms, spare[0]])}>
                ${spare.length ? `Add ${spare[0].name}` : 'Nothing left to add'}
              <//>
            </div>`}

          ${tab === 'shop' && html`
            <div className="panel" role="tabpanel" id="panel-shop" aria-labelledby="tab-shop">
              <div className="panel-head"><h2>Shopping</h2><p aria-live="polite">${todo.length} left to buy</p></div>
              ${list.length === 0 && html`<p className="empty">No dinners planned, so nothing to buy.</p>`}
              <ul className="shop"><${AnimatePresence} initial=${false}>${todo.map((item) => Item({ item, isDone: false }))}<//></ul>
              ${done.length > 0 && html`<${motion.p} layout className="shop-title">Bought<//>`}
              <ul className="shop"><${AnimatePresence} initial=${false}>${done.map((item) => Item({ item, isDone: true }))}<//></ul>
            </div>`}
        <//>
      <//>`;
  }

  const root = document.getElementById('app');
  root.replaceChildren();                                  // the static list has done its job
  createRoot(root).render(html`<${App} />`);
  signal(reducedMotion() ? 'reduced' : 'ready');
}
start();
