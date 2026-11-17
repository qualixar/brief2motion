// brief2motion: renders the landing page from cfg.page (copy and sections live in config.js only).
// Our own code. MIT. Sections: nav · hero copy · story chapters · details · process · call to action · footer.
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function nav(p) {
  const links = (p.nav?.links || []).map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
  <header class="nav" data-nav>
    <a class="brand" href="#top">${esc(p.brand)}</a>
    <nav class="links">${links}</nav>
    ${p.nav?.cta ? `<a class="btn btn-small" href="${esc(p.nav.cta.href)}">${esc(p.nav.cta.label)}</a>` : ''}
  </header>`;
}

function heroCopy(p) {
  const h = p.hero || {};
  const ctas = (h.ctas || []).map((c, i) => `<a class="btn ${i ? 'btn-ghost' : ''}" href="${esc(c.href)}">${esc(c.label)}</a>`).join('');
  return `${h.kicker ? `<p class="kicker">${esc(h.kicker)}</p>` : ''}
    <h1>${esc(h.headline)}</h1>
    ${h.subline ? `<p class="lede">${esc(h.subline)}</p>` : ''}
    ${ctas ? `<div class="ctas">${ctas}</div>` : ''}`;
}

// One <img>. `srcset` ("a-720.jpg 720w, a-1200.jpg 1200w") lets phones download the small file.
function picture(src, alt, srcset, sizes) {
  const set = srcset ? ` srcset="${esc(srcset)}" sizes="${esc(sizes)}"` : '';
  return `<img src="${esc(src)}"${set} alt="${esc(alt || '')}" loading="lazy" decoding="async">`;
}

function chapters(p) {
  if (!p.chapters?.length) return '';
  const total = String(p.chapters.length).padStart(2, '0');
  const items = p.chapters.map((c, i) => {
    const n = String(i + 1).padStart(2, '0');
    const art = c.image
      ? picture(c.image, c.alt || c.title, c.srcset, c.sizes || '(max-width: 860px) 100vw, 50vw')
      : `<div class="swatch" style="--s:${esc(c.colour || 'var(--accent)')}"></div>`;
    return `
    <article class="chapter ${i % 2 ? 'flip' : ''}" id="${esc(c.id || `chapter-${i + 1}`)}">
      <figure class="chapter-art" data-reveal>
        <div class="frame">${art}</div>
      </figure>
      <div class="chapter-copy" data-reveal>
        <p class="chapter-num" aria-hidden="true">${n}</p>
        ${c.kicker ? `<p class="kicker">${esc(c.kicker)}</p>` : ''}
        <h2>${esc(c.title)}</h2>
        <p class="body">${esc(c.body)}</p>
      </div>
    </article>`;
  }).join('');
  return `<section class="chapters" id="${esc(p.chaptersId || 'story')}">${items}</section>`;
}

function collection(p) {
  const c = p.collection;
  if (!c?.items?.length) return '';
  const cards = c.items.map((x) => `<li data-reveal><div class="bottle">
      <div class="bottle-art">${x.image ? picture(x.image, x.alt || x.name, x.srcset, x.sizes || '(max-width: 760px) 100vw, 33vw') : `<div class="swatch" style="--s:${esc(x.colour || 'var(--accent)')}"></div>`}</div>
      <div class="bottle-copy"><h3><span class="dot" style="--c:${esc(x.colour || 'var(--accent)')}" aria-hidden="true"></span>${esc(x.name)}</h3><p>${esc(x.scent)}</p></div>
    </div></li>`).join('');
  return `<section class="collection" id="${esc(c.id || 'collection')}">
    ${c.title ? `<div class="section-head" data-reveal>${c.kicker ? `<p class="kicker">${esc(c.kicker)}</p>` : ''}<h2>${esc(c.title)}</h2></div>` : ''}
    <ul class="bottle-grid">${cards}</ul>
  </section>`;
}

function details(p) {
  const d = p.details;
  if (!d?.items?.length) return '';
  const items = d.items.map((x) => `<div class="detail" data-reveal><p class="detail-value">${esc(x.value)}</p><p class="detail-label">${esc(x.label)}</p></div>`).join('');
  return `<section class="details" id="${esc(d.id || 'details')}">
    ${d.title ? `<div class="section-head" data-reveal>${d.kicker ? `<p class="kicker">${esc(d.kicker)}</p>` : ''}<h2>${esc(d.title)}</h2></div>` : ''}
    <div class="detail-grid">${items}</div>
  </section>`;
}

function process(p) {
  const s = p.process;
  if (!s?.steps?.length) return '';
  const steps = s.steps.map((x, i) => `<li data-reveal><span class="step-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></li>`).join('');
  return `<section class="process" id="${esc(s.id || 'process')}">
    ${s.title ? `<div class="section-head" data-reveal>${s.kicker ? `<p class="kicker">${esc(s.kicker)}</p>` : ''}<h2>${esc(s.title)}</h2></div>` : ''}
    <ol>${steps}</ol>
  </section>`;
}

function cta(p) {
  const c = p.cta;
  if (!c) return '';
  return `<div class="cta-wrap"><section class="cta-band" id="${esc(c.id || 'reserve')}" data-reveal>
    ${c.kicker ? `<p class="kicker">${esc(c.kicker)}</p>` : ''}
    <h2>${esc(c.title)}</h2>
    ${c.body ? `<p>${esc(c.body)}</p>` : ''}
    ${c.button ? `<a class="btn" href="${esc(c.button.href)}">${esc(c.button.label)}</a>` : ''}
  </section></div>`;
}

function footer(p) {
  const f = p.footer || {};
  const credit = f.credit === undefined ? 'Built from one brief with brief2motion' : f.credit;
  return `<div class="footer-wrap"><footer class="footer">
    <p class="brand">${esc(p.brand)}</p>
    <p class="tag">${esc(f.text || '')}</p>
    ${credit ? `<p class="credit">${esc(credit)}</p>` : ''}
  </footer></div>`;
}

function setMeta(attr, key, value) {
  if (!value) return;
  let m = document.querySelector(`meta[${attr}="${key}"]`);
  if (!m) { m = document.createElement('meta'); m.setAttribute(attr, key); document.head.appendChild(m); }
  m.content = value;
}

export function renderPage(cfg) {
  const p = cfg.page;
  if (!p) return () => {};
  document.title = p.title || p.brand || document.title;
  document.body.insertAdjacentHTML('afterbegin', nav(p));
  const copy = document.querySelector('.hero-copy');
  if (copy) copy.innerHTML = heroCopy(p);
  const main = document.querySelector('main');
  main.id = 'main';
  main.innerHTML = chapters(p) + collection(p) + details(p) + process(p) + cta(p);
  main.insertAdjacentHTML('afterend', footer(p));
  setMeta('name', 'description', p.description);
  setMeta('property', 'og:title', p.title || p.brand);
  setMeta('property', 'og:description', p.description);
  const navEl = document.querySelector('[data-nav]');
  const solid = () => navEl.classList.toggle('solid', scrollY > 80);   // plain scroll event: works with Lenis, GSAP and reduced motion
  addEventListener('scroll', solid, { passive: true }); solid();
  const alt = p.hero?.alt || p.brand;
  document.querySelectorAll('#hero canvas, #hero .fallback').forEach((el) => el.setAttribute(el.tagName === 'IMG' ? 'alt' : 'aria-label', alt));
  return () => removeEventListener('scroll', solid);
}

// Gentle reveals as sections enter. Skipped entirely for reduced motion (content is visible by default in CSS).
export function revealOnScroll() {
  const { gsap } = window;
  if (!gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(window.ScrollTrigger);
  document.documentElement.classList.add('js-reveal');
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { autoAlpha: 0, y: 28 }, {
      autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
  // Gentle parallax inside each image card (the image is taller than its frame, so it never shows an edge).
  gsap.utils.toArray('.frame img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -5 }, { yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

// Step captions: a card (kicker, title, line) per sequence step, and a tint the whole hero grades into.
// config: assemble.captions = [null | 'Title' | { kicker, n, title, body, tint }, ...], one per sequence step.
export function sequenceCaptions(hero, captions) {
  const caps = (captions || []).map((c) => (typeof c === 'string' ? (c ? { title: c } : null) : c));
  if (!caps.length) return () => {};
  const notes = caps.filter((c) => c?.n).length;
  const card = document.createElement('div');
  card.className = 'seq-card';
  card.setAttribute('aria-live', 'polite');
  hero.appendChild(card);
  const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  let last = -1;
  const onStep = (e) => {
    const { step, moving } = e.detail;
    hero.classList.toggle('stepping', moving);   // the headline leaves as soon as the first burst starts
    if (!moving) card.classList.remove('on');
    if (step === last) return;
    last = step;
    const c = caps[step];
    document.documentElement.style.setProperty('--tint', c?.tint || paper);
    card.classList.remove('on');
    if (!c) return;
    card.innerHTML = `${c.kicker ? `<p class="seq-kicker">${c.n ? `<span>${esc(c.n)} / ${String(notes).padStart(2, '0')}</span>` : ''}${esc(c.kicker)}</p>` : ''}
      <h2 class="seq-title">${esc(c.title)}</h2>${c.body ? `<p class="seq-body">${esc(c.body)}</p>` : ''}
      <div class="seq-bar" aria-hidden="true">${caps.map((_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).slice(1).join('')}</div>`;
    requestAnimationFrame(() => { if (last === step) card.classList.add('on'); });   // skip if a newer step arrived
  };
  addEventListener('b2m-step', onStep);
  return () => { removeEventListener('b2m-step', onStep); card.remove(); };
}
