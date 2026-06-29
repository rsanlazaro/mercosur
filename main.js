/**
 * MERCOSUR Cámara de Comercio — main.js
 * ------------------------------------------------------------
 * Modules:
 *   1. Navigation — drawer burger (right 50%, with backdrop + close btn)
 *   2. Section reveal — alternating left/right slide-in per section
 *   3. Language toggle (ES / PT) — PT disabled
 *   4. Contact form — validation + confirmation
 *   5. URL params — pre-select contact tipo
 *   6. Init
 * ------------------------------------------------------------
 */

'use strict';

/* ── 1. Navigation drawer ─────────────────────────────────── */
const Nav = (() => {
  let drawer    = null;
  let backdrop  = null;
  let hamburger = null;

  /**
   * Build the drawer DOM once and inject it into <body>.
   * Clones desktop nav links so HTML files don't repeat them.
   */
  function buildDrawer() {
    // Backdrop — shadows the content behind
    backdrop = document.createElement('div');
    backdrop.className = 'nav__backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', closeDrawer);

    // Drawer panel — right 50% of screen
    drawer = document.createElement('nav');
    drawer.className = 'nav__drawer';
    drawer.setAttribute('aria-label', 'Menú de navegación');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('id', 'nav-drawer');

    // ── Close button (X) ──────────────────────────
    const closeBtn = document.createElement('button');
    closeBtn.className = 'nav__drawer-close';
    closeBtn.setAttribute('aria-label', 'Cerrar menú');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', closeDrawer);
    drawer.appendChild(closeBtn);

    // ── Cloned nav links ──────────────────────────
    const desktopLinks = document.querySelectorAll('.nav__links .nav__link');
    desktopLinks.forEach(link => {
      const clone = link.cloneNode(true);
      clone.addEventListener('click', closeDrawer);
      drawer.appendChild(clone);
    });

    // ── Cloned lang toggle (non-disabled buttons only) ──
    const desktopToggle = document.querySelector('.nav__right .lang-toggle');
    if (desktopToggle) {
      const toggleClone = desktopToggle.cloneNode(true);
      toggleClone.querySelectorAll('.lang-toggle__btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => LangToggle.applyLang(btn.dataset.lang));
      });
      drawer.appendChild(toggleClone);
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
  }

  function openDrawer() {
    document.body.classList.add('nav-open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    // Focus the close button for keyboard/screen-reader users
    setTimeout(() => drawer.querySelector('.nav__drawer-close')?.focus(), 60);
  }

  function closeDrawer() {
    document.body.classList.remove('nav-open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.focus();
  }

  /** Mark the current page link active in desktop + drawer nav */
  function setActiveLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(link => {
      const match = link.getAttribute('href') === current ||
                    (current === '' && link.getAttribute('href') === 'index.html');
      link.classList.toggle('is-active', match);
      link.setAttribute('aria-current', match ? 'page' : 'false');
    });
  }

  function init() {
    hamburger = document.getElementById('nav-hamburger');
    if (!hamburger) return;
    buildDrawer();
    hamburger.addEventListener('click', openDrawer);
    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeDrawer();
    });
    setActiveLink();
  }

  return { init, closeDrawer };
})();


/* ── 2. Section reveal — alternating left / right ─────────── */
const SectionReveal = (() => {
  /**
   * Every <section> and .callout gets data-reveal="left" or "right"
   * based on its order on the page (even=left, odd=right).
   * IntersectionObserver adds .is-revealed when the block enters
   * the viewport — the CSS transition animates the whole block at once.
   */

  function assignDirections() {
    // Animate page-level content blocks as whole units
    const blocks = Array.from(
      document.querySelectorAll('section, .callout')
    );

    blocks.forEach((block, i) => {
      block.setAttribute('data-reveal', i % 2 === 0 ? 'left' : 'right');
    });

    // Hero inner text: simple fade-up (not sideways — image is already there)
    const heroInner = document.querySelector('.hero__inner');
    if (heroInner) heroInner.setAttribute('data-reveal', 'up');
  }

  function observe() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target); // fire once only
        }
      });
    }, {
      threshold:   0.06,
      rootMargin: '0px 0px -48px 0px',
    });

    targets.forEach(el => io.observe(el));
  }

  function init() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('section, .callout, .hero__inner').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    assignDirections();
    // Two rAF passes: let browser layout settle first
    requestAnimationFrame(() => requestAnimationFrame(observe));
  }

  return { init };
})();


/* ── 3. Language toggle ───────────────────────────────────── */
const LangToggle = (() => {
  // PT is disabled per brief — structure ready for future activation
  const translations = {
    es: {
      'footer-desc': 'Asociación civil privada, independiente y sin fines de lucro, orientada a fortalecer el comercio, la inversión, la cooperación empresarial y la integración económica entre América Latina y el mundo.',
      'footer-independence': 'La Cámara de Comercio Mercosur es una entidad privada e independiente. No forma parte de la estructura política del MERCOSUR ni ejerce su representación.',
      'footer-copyright': '© 2025 Cámara de Comercio Mercosur. Todos los derechos reservados.',
    },
  };

  let currentLang = 'es';

  function applyLang(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('mc-lang', lang);

    const els = document.querySelectorAll('[data-i18n]');
    els.forEach(el => { el.style.transition = 'opacity 0.18s ease'; el.style.opacity = '0'; });
    setTimeout(() => {
      els.forEach(el => {
        const val = translations[lang][el.getAttribute('data-i18n')];
        if (val !== undefined) el.innerHTML = val;
        el.style.opacity = '1';
      });
    }, 180);

    document.querySelectorAll('.lang-toggle__btn').forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function init() {
    document.querySelectorAll('.lang-toggle__btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
    applyLang(currentLang);
  }

  return { init, applyLang };
})();


/* ── 4. Contact form ──────────────────────────────────────── */
const ContactForm = (() => {
  function init() {
    const form         = document.getElementById('contact-form');
    const confirmation = document.getElementById('form-confirmation');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

      // Simulated async — replace with real fetch() to Netlify Forms / backend
      setTimeout(() => {
        form.style.display = 'none';
        if (confirmation) {
          confirmation.classList.add('is-visible');
          confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 700);
    });
  }

  return { init };
})();


/* ── 5. URL params — pre-select contact tipo ──────────────── */
const URLParams = (() => {
  function init() {
    const tipo   = new URLSearchParams(window.location.search).get('tipo');
    const select = document.getElementById('motivo');
    if (!tipo || !select) return;
    for (const opt of select.options) {
      if (opt.value === tipo) { opt.selected = true; break; }
    }
  }

  return { init };
})();


/* ── 6. Init ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  SectionReveal.init();
  LangToggle.init();
  ContactForm.init();
  URLParams.init();
});
