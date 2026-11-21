// _steps.mjs: the small step language shared by journeys.json and a route's declared states (routes.json).
// A target says how a person would find the thing: by role and accessible name, by label, by visible text.
//   { "role": "link", "name": "Start free trial" }     { "label": "Work email" }     { "text": "Check your inbox" }
//   optional "nth": 1 picks the second match (the first is the default); "css" is the last resort. A role can also say
//   { "role": "status", "contains": "Check your inbox" } for things such as live regions, which have no name of their own.
// A step is one of: { click: target } { fill: target, value } { press: "Enter", target? } { check: target }
//   { select: target, value } { hover: target } { wait: ms (at most 2000) }.
// An expectation is { url: "/start/" } (the path), { text: "..." } or { role, name } (visible), { focus: target }, or a list of them.

const STEP_KEYS = ['click', 'fill', 'press', 'check', 'select', 'hover', 'wait'];

export function locator(page, t) {
  if (!t || typeof t !== 'object') throw new Error('a step needs a target such as { "role": "button", "name": "Send" }');
  let loc;
  if (t.role) { loc = page.getByRole(t.role, t.name ? { name: t.name, exact: t.exact !== false } : {}); if (t.contains) loc = loc.filter({ hasText: t.contains }); }
  else if (t.label) loc = page.getByLabel(t.label, { exact: t.exact !== false });
  else if (t.text) loc = page.getByText(t.text, { exact: t.exact === true });
  else if (t.placeholder) loc = page.getByPlaceholder(t.placeholder, { exact: true });
  else if (t.css) loc = page.locator(t.css);
  else throw new Error(`target has none of role, label, text, placeholder or css: ${JSON.stringify(t)}`);
  return loc.nth(Number.isInteger(t.nth) ? t.nth : 0);
}

export const describe = (t) => (t ? (t.role ? `${t.role} "${t.name ?? t.contains ?? ''}"` : t.label ? `field "${t.label}"` : t.text ? `text "${t.text}"` : t.css ? t.css : JSON.stringify(t)) : '');

// Runs the steps in order. Stops at the first one that cannot be done and says which.
export async function runSteps(page, steps = [], { timeout = 4000 } = {}) {
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i], key = STEP_KEYS.find((k) => k in s);
    if (!key) return { ok: false, failedAt: i, error: `step ${i + 1}: needs one of ${STEP_KEYS.join(', ')}` };
    try {
      if (key === 'wait') { await page.waitForTimeout(Math.min(2000, Number(s.wait) || 0)); continue; }
      if (key === 'press' && !s.target) { await page.keyboard.press(s.press); continue; }
      const loc = locator(page, key === 'press' ? s.target : s[key]);
      if (key === 'click') await loc.click({ timeout });
      else if (key === 'fill') await loc.fill(String(s.value ?? ''), { timeout });
      else if (key === 'press') await loc.press(s.press, { timeout });
      else if (key === 'check') await loc.check({ timeout });
      else if (key === 'select') await loc.selectOption(String(s.value), { timeout });
      else if (key === 'hover') await loc.hover({ timeout });
    } catch (e) {
      const why = e.name === 'TimeoutError' ? `could not find it, or it was not usable, within ${timeout / 1000} s` : String(e.message || e).split('\n')[0].slice(0, 160);
      return { ok: false, failedAt: i, error: `step ${i + 1} (${key} ${describe(key === 'press' ? s.target : s[key])}): ${why}` };
    }
  }
  return { ok: true, failedAt: null, error: null };
}

// Checks one expectation (or a list of them) against the page now. Waits up to `timeout` ms for it to come true.
export async function checkExpect(page, expect, { timeout = 3000 } = {}) {
  for (const e of [].concat(expect || [])) {
    try {
      if (e.url) await page.waitForFunction((p) => location.pathname === p, e.url, { timeout });
      else if (e.focus) await page.waitForFunction(() => !!document.activeElement && document.activeElement !== document.body, null, { timeout }).then(async () => {
        const want = await locator(page, e.focus).elementHandle({ timeout });
        const same = await page.evaluate((el) => el === document.activeElement, want);
        if (!same) throw new Error(`focus is not on ${describe(e.focus)}`);
      });
      else await locator(page, e).waitFor({ state: 'visible', timeout });
    } catch (err) { return { ok: false, reason: `expected ${e.url ? `path ${e.url}` : e.focus ? `focus on ${describe(e.focus)}` : describe(e)}${e.url ? ` (page is at ${await page.evaluate(() => location.pathname)})` : ' to be visible'}` }; }
  }
  return { ok: true, reason: '' };
}

// ---- page readiness, shared by the site-mode checkers ----

// Waits (without failing) for the page to say its motion is set up, then for fonts and two frames, plus a pause.
// A page with no script at all has no motion to wait for.
export async function ready(page, { ms = 600, waitMotion = true } = {}) {
  if (waitMotion && await page.evaluate(() => document.scripts.length > 0).catch(() => false)) await page.waitForFunction(() => document.documentElement.dataset.motion, null, { timeout: 6000 }).catch(() => {});
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null)).catch(() => {});
  await page.waitForTimeout(ms);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))).catch(() => {});
}

// Opens a route and, for a declared state, performs its steps. Returns { ok, error }.
export async function openTarget(page, base, target, opts = {}) {
  await page.goto(new URL(target.path, base).href, { waitUntil: 'load', timeout: 45000 });
  await ready(page, opts);
  if (target.state?.steps?.length) {
    const r = await runSteps(page, target.state.steps);
    if (!r.ok) return { ok: false, error: r.error };
    await page.waitForTimeout(450);
  }
  return { ok: true, error: null };
}
