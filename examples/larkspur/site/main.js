// Larkspur (a made-up product). One script for all three pages.
// Motion plan (matches MOTION.md):
//   on load:  home only. The inbox drawing plays one arrival: a new message fades in (300 ms), then its owner chip changes
//             from "Unassigned" to "Ari has this" (1.3 s). About 1.6 s in all, once. Without this script, or with reduced
//             motion, the drawing is already in its finished state (the CSS default).
//   on scroll: nothing moves.
//   on input: buttons move 2 px while pressed (CSS, 100 ms). The trial form checks the entry, shows an error summary or a
//             thank-you, and moves focus to it.
//   reduced motion: the finished drawing, no travel, the same form behaviour.
import { reducedMotion, signal } from './kit/motion-core.js';

const $ = (sel) => document.querySelector(sel);

// ---- the arrival (head script in index.html has already set data-stage="pre" when motion is allowed) ----
function playArrival() {
  const root = document.documentElement;
  if (root.dataset.stage !== 'pre') return;
  setTimeout(() => { root.dataset.stage = 'arrived'; }, 300);
  setTimeout(() => { delete root.dataset.stage; }, 1300);
}

// ---- the trial form (a fixture: nothing is sent or stored) ----
function setupForm(form) {
  form.noValidate = true;   // the browser's own bubbles are replaced by the summary below, so the HTML works without this script
  const email = form.elements.email, summary = $('#error-summary'), result = $('#result');
  const plan = new URLSearchParams(location.search).get('plan');
  const radio = plan && form.querySelector(`input[name="plan"][value="${CSS.escape(plan)}"]`);
  if (radio) radio.checked = true;
  const clear = () => { summary.hidden = true; summary.replaceChildren(); email.removeAttribute('aria-invalid'); email.removeAttribute('aria-describedby'); $('#email-error')?.remove(); };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clear();
    const v = email.value.trim();
    const problem = !v ? 'Enter your work email.' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? 'Enter an email address with an @ in it, like name@company.test.' : '';
    if (problem) {
      const h = document.createElement('h2'); h.textContent = 'There is a problem';
      const a = document.createElement('a'); a.href = '#email'; a.textContent = problem;
      const li = document.createElement('li'); li.append(a);
      const ul = document.createElement('ul'); ul.append(li);
      summary.append(h, ul); summary.hidden = false;
      const msg = document.createElement('p'); msg.id = 'email-error'; msg.className = 'field-error';
      const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = 'Error: ';
      msg.append(sr, problem); email.before(msg);
      email.setAttribute('aria-invalid', 'true'); email.setAttribute('aria-describedby', 'email-error');
      a.addEventListener('click', (ev) => { ev.preventDefault(); email.focus(); });
      summary.focus();
      return;
    }
    form.hidden = true;
    const h = document.createElement('h2'); h.textContent = 'Thanks';
    const p = document.createElement('p'); p.textContent = 'That is the end of the demo: no email was sent and nothing was stored.';
    const back = document.createElement('p'), link = document.createElement('a'); link.href = '/'; link.textContent = 'Back to Larkspur'; back.append(link);
    result.append(h, p, back); result.focus();
  });
}

const form = $('#trial-form');
if (form) setupForm(form);
if (reducedMotion()) { delete document.documentElement.dataset.stage; signal('reduced'); }
else { playArrival(); signal('ready'); }
