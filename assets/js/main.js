// Cámara de Comercio Mercosur — site scripts
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var header = document.querySelector('.site-header');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.querySelectorAll('.main-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('nav-open');
      });
    });
  }

  /* ---------- Active nav link ---------- */
  var current = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a').forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.accordion').forEach(function (acc) {
    var firstItem = acc.querySelector('.accordion-item');
    if (firstItem) {
      firstItem.classList.add('is-open');
      var panel = firstItem.querySelector('.accordion-panel');
      panel.style.maxHeight = panel.scrollHeight + 'px';
      firstItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'true');
    }
  });

  document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.accordion-item');
      var panel = item.querySelector('.accordion-panel');
      var isOpen = item.classList.contains('is-open');

      item.closest('.accordion').querySelectorAll('.accordion-item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.accordion-panel').style.maxHeight = null;
          openItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.accordion-item.is-open .accordion-panel').forEach(function (panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------- Carousels ---------- */
  document.querySelectorAll('.carousel-wrap').forEach(function (wrap) {
    var track = wrap.querySelector('.carousel-track');
    var prevBtn = wrap.querySelector('.carousel-prev');
    var nextBtn = wrap.querySelector('.carousel-next');
    if (!track) return;
    var loop = wrap.classList.contains('carousel-wrap--loop');

    function cardStep() {
      var card = track.querySelector(':scope > *');
      if (!card) return 300;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || 24);
      return card.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
      return track.scrollWidth - track.clientWidth - 4;
    }

    function updateButtons() {
      if (!prevBtn || !nextBtn) return;
      if (loop) {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        return;
      }
      var max = maxScroll();
      prevBtn.disabled = track.scrollLeft <= 4;
      nextBtn.disabled = track.scrollLeft >= max;
    }

    if (prevBtn) prevBtn.addEventListener('click', function () {
      if (loop && track.scrollLeft <= 4) {
        track.scrollTo({ left: maxScroll(), behavior: 'smooth' });
        return;
      }
      track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      if (loop && track.scrollLeft >= maxScroll() - 4) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      track.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });
    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  });

  /* ---------- Back to top ---------- */
  var backBtn = document.querySelector('.back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('is-visible', window.scrollY > 640);
    }, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Contact form (submits via FormSubmit to info@camaracomerciomercosur.org) ---------- */
  var contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      var msg = contactForm.querySelector('.form-msg');
      if (!contactForm.checkValidity()) {
        e.preventDefault();
        contactForm.reportValidity();
        return;
      }
      if (msg) {
        msg.textContent = 'Enviando tu consulta…';
        msg.className = 'form-msg';
      }
      // Native form submission proceeds to FormSubmit, which emails
      // info@camaracomerciomercosur.org and returns a confirmation page.
    });
  }

  /* ---------- Newsletter form (front-end only) ---------- */
  var newsletterForm = document.querySelector('#newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      var msg = newsletterForm.querySelector('.form-msg');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!emailOk) {
        msg.textContent = 'Ingresa un correo electrónico válido.';
        msg.className = 'form-msg err';
        return;
      }
      msg.textContent = '¡Listo! Te avisaremos de próximas novedades.';
      msg.className = 'form-msg ok';
      newsletterForm.reset();
    });
  }

  /* ---------- Propuesta / interest form (Participación page) ---------- */
  var proposalForm = document.querySelector('#proposal-form');
  if (proposalForm) {
    proposalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = proposalForm.querySelector('.form-msg');
      if (!proposalForm.checkValidity()) {
        proposalForm.reportValidity();
        return;
      }
      msg.textContent = 'Tu propuesta fue enviada. El equipo institucional la revisará y se contactará contigo.';
      msg.className = 'form-msg ok';
      proposalForm.reset();
    });
  }

  /* ---------- Institutional notice modal (shown once per session) ---------- */
  (function () {
    if (sessionStorage.getItem('mercosurNoticeShown') === '1') return;

    var overlay = document.createElement('div');
    overlay.className = 'notice-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'notice-title');
    overlay.innerHTML =
      '<div class="notice-modal">' +
        '<button type="button" class="notice-close" aria-label="Cerrar">&times;</button>' +
        '<p class="notice-eyebrow">Comunicado institucional</p>' +
        '<h2 id="notice-title">La Cámara de Comercio Mercosur expresa su solidaridad con el pueblo venezolano</h2>' +
        '<p>Desde la Cámara de Comercio Mercosur manifestamos nuestra más profunda solidaridad con el pueblo de la República Bolivariana de Venezuela ante la tragedia provocada por el devastador terremoto que ha afectado a miles de familias, dejando una profunda huella humana, social y económica.</p>' +
        '<p>En estos momentos de enorme dolor, extendemos nuestras condolencias a quienes han perdido seres queridos y expresamos nuestro reconocimiento a los equipos de rescate, personal sanitario, voluntarios y organismos nacionales e internacionales que trabajan incansablemente para salvar vidas y asistir a las comunidades afectadas.</p>' +
        '<p>Las crisis también ponen a prueba la capacidad de nuestras instituciones para actuar con responsabilidad, coordinación y solidaridad.</p>' +
        '<p>Reafirmamos que la recuperación de una tragedia de esta magnitud requiere del esfuerzo conjunto de todos los sectores: gobiernos, empresas, cámaras de comercio, organizaciones de la sociedad civil, organismos internacionales y ciudadanos.</p>' +
        '<p>Por lo expuesto, hacemos un llamado a nuestra comunidad empresarial, a las instituciones asociadas y a todos los actores del ecosistema económico a colaborar, dentro de sus posibilidades, con las iniciativas humanitarias y los mecanismos de asistencia que se encuentren oficialmente habilitados para acompañar al pueblo venezolano.</p>' +
        '<p>El Mercosur y nuestra región se fortalecen cuando la solidaridad trasciende las fronteras y se convierte en un compromiso compartido.</p>' +
        '<p>Asimismo, difundimos enlaces de instituciones oficiales que se encuentran recibiendo donaciones. Aclaramos que no nos encontramos vinculadas a dichas entidades, sino que compartimos esta información a modo de difusión, habiendo verificado su validez con colegas venezolanos, destacando la importancia de que las donaciones lleguen efectivamente a los lugares y a las personas que más lo necesitan.</p>' +
        '<div class="notice-links">' +
          '<p>Enlaces de instituciones oficiales</p>' +
          '<ul>' +
            '<li><a href="https://help.unicef.org/lac/venezuela/emergenciavenezuela" target="_blank" rel="noopener">UNICEF – ONU</a></li>' +
            '<li><a href="http://www.caritasvenezuela.org/donaciones" target="_blank" rel="noopener">Caritas Venezuela</a></li>' +
            '<li><a href="http://www.globalgiving.org" target="_blank" rel="noopener">Global Giving (@globalgiving)</a></li>' +
            '<li><a href="https://sharethemeal.org/campaigns/venezuela1" target="_blank" rel="noopener">Share The Meal</a></li>' +
          '</ul>' +
        '</div>' +
        '<p class="notice-signature">Cámara de Comercio Mercosur</p>' +
      '</div>';
    document.body.appendChild(overlay);

    function closeNotice() {
      overlay.classList.remove('is-open');
      sessionStorage.setItem('mercosurNoticeShown', '1');
      window.setTimeout(function () {
        overlay.remove();
      }, 260);
    }

    overlay.querySelector('.notice-close').addEventListener('click', closeNotice);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeNotice();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeNotice();
    });

    window.requestAnimationFrame(function () {
      overlay.classList.add('is-open');
    });
  })();

});
