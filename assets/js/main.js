// Cámara de Comercio Mercosur — site scripts
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Language switcher (ES / PT / EN active — FR coming soon) ---------- */
  var langSwitcher = document.querySelector('.lang-switcher');
  if (langSwitcher) {
    var langToggle = langSwitcher.querySelector('.lang-toggle');
    var langToggleLabel = langToggle.querySelector('span');
    var DICT = window.MERCOSUR_I18N || null;
    var STORAGE_KEY = 'mercosurLang';
    var AVAILABLE = ['es', 'pt', 'en'];

    function closeLangMenu() {
      langSwitcher.classList.remove('is-open');
      langToggle.setAttribute('aria-expanded', 'false');
    }

    function applyTranslations(lang) {
      if (!DICT || !DICT[lang]) return;
      var dict = DICT[lang];
      var esDict = DICT.es || {};

      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        var value = dict[key] !== undefined ? dict[key] : esDict[key];
        if (value !== undefined) el.textContent = value;
      });

      document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        var key = el.getAttribute('data-i18n-html');
        var value = dict[key] !== undefined ? dict[key] : esDict[key];
        if (value !== undefined) el.innerHTML = value;
      });
    }

    function setLanguage(lang, opts) {
      if (AVAILABLE.indexOf(lang) === -1) lang = 'es';
      var silent = opts && opts.silent;

      applyTranslations(lang);
      document.documentElement.setAttribute('lang', lang);
      langToggleLabel.textContent = lang.toUpperCase();

      langSwitcher.querySelectorAll('.lang-option').forEach(function (opt) {
        opt.classList.toggle('is-active', opt.getAttribute('data-lang') === lang);
      });

      if (!silent) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* storage unavailable */ }
      }
    }

    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = langSwitcher.classList.toggle('is-open');
      langToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    langSwitcher.querySelectorAll('.lang-option:not(:disabled)').forEach(function (opt) {
      opt.addEventListener('click', function () {
        setLanguage(opt.getAttribute('data-lang'));
        closeLangMenu();
      });
    });

    document.addEventListener('click', function (e) {
      if (!langSwitcher.contains(e.target)) closeLangMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLangMenu();
    });

    // Initialize from saved preference (defaults to Spanish).
    var savedLang = 'es';
    try { savedLang = localStorage.getItem(STORAGE_KEY) || 'es'; } catch (e) { /* storage unavailable */ }
    setLanguage(savedLang, { silent: true });
  }

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

  /* ---------- Governance cards (Comisión Directiva / Sindicatura) ---------- */
  document.querySelectorAll('.gov-head').forEach(function (card) {
    var trigger = card.querySelector('.gov-head-top');
    var panel = card.querySelector('.gov-head-panel');
    if (!trigger || !panel) return;

    // Starts open; height set explicitly so the CSS transition works both ways.
    panel.style.maxHeight = panel.scrollHeight + 'px';

    trigger.addEventListener('click', function () {
      var isOpen = card.classList.contains('is-open');
      if (isOpen) {
        card.classList.remove('is-open');
        panel.style.maxHeight = null;
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        card.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.gov-head.is-open .gov-head-panel').forEach(function (panel) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  });

  /* ---------- Team bio modal (Erik Aaron, Anthony Edouard, Federico) ---------- */
  (function () {
    var triggers = document.querySelectorAll('[data-bio-open]');
    if (!triggers.length) return;

    var TEAM_BIOS = {
      'erik-aaron-lara-riveros': {
        name: 'Erik Aaron Lara Riveros',
        image: 'assets/images/team-4.jpg',
        role: { es: 'Presidente', en: 'President', pt: 'Presidente' },
        body: {
          es: [
            'Erik Aaron Lara Riveros es un ejecutivo internacional chileno con más de veinte años de experiencia en banca, inversión, mercados regulados, gobernanza corporativa y relaciones institucionales.',
            'Ha desempeñado funciones directivas y de consejo en entidades financieras reguladas de Europa y Oriente Medio, así como responsabilidades ejecutivas en compañías cotizadas en Norteamérica. Actualmente participa en el desarrollo de iniciativas internacionales vinculadas a minerales críticos, financiación, inversión y cadenas estratégicas de suministro entre América Latina y Norteamérica. Como presidente de la Cámara, impulsa la integración empresarial, la cooperación institucional y la proyección internacional del espacio Mercosur.'
          ]
        }
      },
      'anthony-edouard-toffoli': {
        name: 'Anthony Edouard A. Toffoli',
        image: 'assets/images/team-3.jpg',
        role: { es: 'Vicepresidente', en: 'Vice President', pt: 'Vice-Presidente' },
        body: {
          es: [
            'Anthony Edouard André Toffoli es un ejecutivo francés con más de veinticinco años de experiencia en retail, turismo médico, inmobiliario y medios de comunicación.',
            'Actúa activamente en varias empresas europeas, y tiene responsabilidades ejecutivas en compañías en Norteamérica. Actualmente participa en el desarrollo de varias clínicas de fertilidad humana, brindando soluciones para pacientes europeos en América Latina.',
            'Como vicepresidente de la Cámara, lucha incansablemente para las empresas, siempre a favor de la cooperación institucional y la expansión internacional más allá del espacio Mercosur.'
          ]
        }
      },
      'nicole-peters': {
        name: 'Nicole M. Peters',
        image: 'assets/images/team-1.jpg',
        role: { es: 'Prosecretaria', en: 'Deputy Secretary', pt: 'Secretária-Adjunta' },
        body: {
          es: [
            'Nicole Peters es abogada por la Universidad de Buenos Aires (UBA), con MBA y formación de posgrado en Políticas Públicas, Agenda 2030, Asuntos Públicos, marketing político y Derecho Público.',
            'Actualmente cursa la Maestría Internacional en Ciencias Políticas con especialización en Cooperación Internacional en la Universidad Europea del Atlántico.',
            'Cuenta con más de ocho años de experiencia en consultoría estratégica, coaching y gestión de proyectos.',
            'Es Coordinadora del Instituto de Estudios Estratégicos y Relaciones Internacionales, así como fundadora y presidenta de la Organización Internacional de Asuntos Públicos.',
            'Ha representado a Argentina en Brasil (AIESEC), Uruguay (Mercosur) y en Rusia (World Youth Festival), así como a Iberoamérica en España (Fundación Carolina) y al Cono Sur en la Organización de los Estados Americanos (OEA).',
            'Sus iniciativas y experiencias profesionales hacen de ella una pieza fundamental de la Cámara de Comercio Mercosur.'
          ],
          en: [
            'Nicole Peters holds a law degree from the University of Buenos Aires (UBA), along with an MBA and postgraduate training in Public Policy, the 2030 Agenda, Public Affairs, political marketing, and Public Law.',
            'She is currently pursuing an International Master\'s Degree in Political Science with a specialization in International Cooperation at Universidad Europea del Atlántico.',
            'She has more than eight years of experience in strategic consulting, coaching, and project management.',
            'She is Coordinator of the Institute of Strategic Studies and International Relations, as well as founder and president of the International Organization for Public Affairs.',
            'She has represented Argentina in Brazil (AIESEC), Uruguay (Mercosur), and Russia (World Youth Festival), as well as Ibero-America in Spain (Fundación Carolina) and the Southern Cone at the Organization of American States (OAS).',
            'Her initiatives and professional experience make her a fundamental part of the Mercosur Chamber of Commerce.'
          ],
          pt: [
            'Nicole Peters é advogada pela Universidade de Buenos Aires (UBA), com MBA e formação de pós-graduação em Políticas Públicas, Agenda 2030, Assuntos Públicos, marketing político e Direito Público.',
            'Atualmente cursa o Mestrado Internacional em Ciências Políticas com especialização em Cooperação Internacional na Universidade Europeia do Atlântico.',
            'Conta com mais de oito anos de experiência em consultoria estratégica, coaching e gestão de projetos.',
            'É Coordenadora do Instituto de Estudos Estratégicos e Relações Internacionais, além de fundadora e presidente da Organização Internacional de Assuntos Públicos.',
            'Representou a Argentina no Brasil (AIESEC), no Uruguai (Mercosul) e na Rússia (World Youth Festival), além da Ibero-América na Espanha (Fundação Carolina) e do Cone Sul na Organização dos Estados Americanos (OEA).',
            'Suas iniciativas e experiências profissionais fazem dela uma peça fundamental da Câmara de Comércio Mercosul.'
          ]
        }
      },
      'ramon-ricardo-martinelli': {
        name: 'Ramón R. Martinelli',
        image: 'assets/images/team-2.jpg',
        role: { es: 'Tesorero', en: 'Treasurer', pt: 'Tesoureiro' },
        body: {
          es: [
            'Ramón Ricardo Martinelli es un ejecutivo panameño con más de 17 años de experiencia en hidrocarburos, logística operativa y desarrollo de negocios energéticos.',
            'Fue Diputado del Parlamento Centroamericano fortaleciendo su visión estratégica sobre cooperación, integración económica y relaciones regionales.',
            'Sigue hoy liderando varias empresas en el mercado energético.',
            'Su experiencia comercial, liderazgo institucional y visión regional son valores fundamentales para la Cámara de Comercio Mercosur.'
          ]
        }
      },
      'walber-castillo-castellano': {
        name: 'Walber Castillo Castellano',
        image: 'assets/images/team-5.webp',
        role: { es: 'Secretario General', en: 'Secretary General', pt: 'Secretário-Geral' },
        body: {
          es: [
            'Walber Castillo Castellano es un empresario colombiano e ingeniero civil con amplia trayectoria en educación técnica, infraestructura, hidrocarburos, innovación tecnológica y desarrollo empresarial.',
            'Entre sus principales iniciativas empresariales se destacan varios grupos internacionales y ha sido distinguido como Colombiano Estrella, empresario destacado en el Exterior, empresario del Año en Perú y Excelencia Educativa ODAEE.',
            'Su visión empresarial, su integridad y compromiso son las bases de su implicación en la Cámara de Comercio Mercosur.'
          ]
        }
      },
      'federico-andres-brugge': {
        name: 'Federico Andrés Brügge',
        image: 'assets/images/team-6.jpg',
        role: { es: 'Síndico Titular', en: 'Principal Auditor', pt: 'Conselheiro Fiscal Titular' },
        body: {
          es: [
            'Federico Andrés Brügge es analista de mercados financieros e inversor, dedicado al estudio de la macroeconomía, los mercados internacionales y el mercado de divisas, con foco en el análisis y la operativa de XAU/USD (oro).',
            'Es Analista Global de Inversiones (AGI) por el Instituto de Capacitación Bursátil (ICB) de Buenos Aires y Técnico Analista de Mercados y Estrategias de Comercialización. Actualmente profundiza su especialización en el análisis del mercado del oro y las divisas, y en su interacción con la política monetaria, la macroeconomía y los mercados financieros. Mantiene vinculaciones comerciales e institucionales en Argentina, Estados Unidos y Europa.'
          ]
        }
      }
    };

    function currentLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return lang;
    }

    var overlay = null;

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'bio-modal-title');
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeBio();
      });
      return overlay;
    }

    function openBio(id) {
      var person = TEAM_BIOS[id];
      if (!person) return;
      var lang = currentLang();
      var role = person.role[lang] || person.role.es;
      var body = (person.body[lang] && person.body[lang].length) ? person.body[lang] : person.body.es;
      var ov = buildOverlay();
      var bodyHTML = body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
      ov.innerHTML =
        '<div class="privacy-modal bio-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          '<div class="bio-modal-header">' +
            '<div class="bio-modal-photo"><img src="' + person.image + '" alt="' + person.name + '"></div>' +
            '<div>' +
              '<p class="privacy-eyebrow">' + role + '</p>' +
              '<h2 id="bio-modal-title">' + person.name + '</h2>' +
            '</div>' +
          '</div>' +
          bodyHTML +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closeBio);
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeBio() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeBio();
    });

    triggers.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openBio(link.getAttribute('data-bio-open'));
      });
    });
  })();

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
    var motivoSelect = contactForm.querySelector('#c-motivo');
    if (motivoSelect) {
      var motivoParam = new URLSearchParams(window.location.search).get('motivo');
      if (motivoParam) {
        var normalized = motivoParam.trim().toLowerCase();
        var matchOption = Array.prototype.find.call(motivoSelect.options, function (opt) {
          var optValue = (opt.getAttribute('value') || opt.textContent).trim().toLowerCase();
          return optValue === normalized;
        });
        if (matchOption) {
          matchOption.selected = true;
        }
      }
    }

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

  /* ---------- Blog news: data, pagination, and "Read More" modal ---------- */
  (function () {
    var grid = document.querySelector('#news-grid');
    var pager = document.querySelector('#news-pagination');
    if (!grid) return;

    var PER_PAGE = 4;
    var currentPage = 1;

    var NEWS_ITEMS = [
      {
        id: 'uruguay-presidencia-mercosur',
        title: 'Uruguay asume la presidencia de MERCOSUR',
        date: '7/1/26',
        image: 'assets/images/news-uruguay-presidencia.jpg',
        teaser: 'Uruguay asume el liderazgo con una agenda de apertura y modernización.',
        body: [
          'Uruguay asumió la presidencia pro témpore del Mercosur durante la 68ª Cumbre de Jefes de Estado y Estados Asociados, realizada en Luque, Paraguay, con una agenda centrada en modernizar el bloque, fortalecer la integración regional y acelerar la concreción de acuerdos comerciales que generen resultados tangibles para los países miembros.',
          'Al recibir la conducción del organismo, el presidente Yamandú Orsi sostuvo que el escenario internacional demanda mayor cooperación y no respuestas aisladas. En ese sentido, afirmó que el diálogo y la construcción de consensos son herramientas indispensables para enfrentar los desafíos actuales y recordó que el Mercosur nació hace 35 años con el propósito de transformar intereses comunes en oportunidades de crecimiento conjunto.',
          'El mandatario aseguró que Uruguay buscará consolidar los avances alcanzados por el bloque reafirmando principios como la democracia, los derechos humanos, las libertades fundamentales y el Estado de derecho, pilares que consideró esenciales para fortalecer la confianza entre los socios. Además, expresó la solidaridad de Uruguay con Venezuela por los recientes terremotos y felicitó a los nuevos presidentes electos de Perú y Colombia.',
          'La estrategia uruguaya fue complementada por el canciller Mario Lubetkin, quien anunció que durante este semestre se impulsará la implementación de los acuerdos comerciales ya alcanzados con la Unión Europea, la Asociación Europea de Libre Comercio (EFTA) y Singapur. Asimismo, Uruguay organizará en diciembre el primer Consejo del Acuerdo Interino Mercosur-Unión Europea y un Foro Empresarial para potenciar los vínculos económicos.',
          'Uruguay ejercerá la presidencia pro témpore del Mercosur hasta diciembre con el objetivo de consolidar un bloque más dinámico, abierto al mundo y orientado a generar beneficios concretos para la región.'
        ],
        source: 'Portada. (2026, 30 de junio). <em>Uruguay asume la presidencia del Mercosur con la promesa de impulsar un bloque más moderno y orientado a resultados</em>. <a href="https://www.portada.com.uy/uruguay-asume-la-presidencia-del-mercosur-con-la-promesa-de-impulsar-un-bloque-mas-moderno-y-orientado-a-resultados-93879" target="_blank" rel="noopener">Portada</a>.'
      },
      {
        id: 'balance-presidencia-paraguaya',
        title: 'Lo que dejó la presidencia paraguaya del MERCOSUR',
        date: '7/1/26',
        image: 'assets/images/news-presidencia-paraguaya-balance.jpg',
        teaser: 'El bloque regional impulsa acuerdos históricos para facilitar trámites, conectividad y movilidad.',
        body: [
          'La Presidencia Pro Tempore de Paraguay en 2026 concluyó con importantes avances para la integración regional del MERCOSUR, destacándose un acuerdo histórico sobre reconocimiento de firma digital entre los Estados parte. Esta medida permitirá agilizar trámites, reducir costos y facilitar operaciones comerciales y administrativas entre los países miembros. Además, se avanzó en iniciativas de transformación digital que buscan modernizar los servicios públicos y fortalecer la cooperación tecnológica dentro del bloque.',
          'En materia de integración fronteriza, el MERCOSUR impulsó acciones orientadas a mejorar la movilidad de personas y mercancías, optimizar controles y fortalecer la coordinación entre autoridades de frontera. Estos avances buscan hacer más eficiente la circulación regional y favorecer el desarrollo económico y social de las comunidades fronterizas, consolidando una agenda de integración más práctica y cercana a la ciudadanía. Los resultados obtenidos durante la presidencia paraguaya reflejan el objetivo de construir un MERCOSUR más conectado, competitivo y moderno.'
        ],
        source: 'MERCOSUR. (2026, 1 de julio). <em>Un acuerdo histórico, avances en integración digital y fronteriza: lo que nos deja la Presidencia Paraguaya 2026 del MERCOSUR</em>. <a href="https://www.mercosur.int/un-acuerdo-historico-avances-en-integracion-digital-y-fronteriza-lo-que-nos-deja-la-presidencia-paraguaya-2026-del-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
      },
      {
        id: 'delegaciones-reuniones-cumbre',
        title: 'Delegaciones del MERCOSUR realizan reuniones para la Cumbre',
        date: '6/29/26',
        image: 'assets/images/news-delegaciones-cumbre.jpg',
        teaser: 'Los países miembros avanzan en acuerdos que serán presentados a los jefes de Estado.',
        body: [
          'Las delegaciones de Argentina, Brasil, Paraguay y Uruguay iniciaron en Asunción las reuniones preparatorias para la Cumbre del MERCOSUR, bajo la Presidencia Pro Tempore de Paraguay. Durante estos encuentros se analizan y consensúan proyectos de resoluciones, decisiones y recomendaciones que serán sometidos a consideración del Grupo Mercado Común (GMC) y del Consejo del Mercado Común (CMC), principales órganos encargados de la conducción política y ejecutiva del bloque. Estas sesiones buscan garantizar que los temas prioritarios lleguen con acuerdos previos a la reunión de los jefes de Estado.',
          'Las reuniones preparatorias forman parte del proceso de coordinación que antecede a la Cumbre del MERCOSUR, donde se definirán políticas relacionadas con la integración regional, el comercio y la cooperación entre los países miembros. El trabajo técnico y diplomático realizado por las delegaciones permite fortalecer el proceso de toma de decisiones y contribuir al desarrollo de iniciativas que impulsen el crecimiento económico y la integración del bloque.'
        ],
        source: 'MERCOSUR. (2026, 29 de junio). <em>Preparatorias para la Cumbre del MERCOSUR</em>. <a href="https://www.mercosur.int/preparatorias-para-la-cumbre-del-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
      },
      {
        id: 'concurso-foto-video',
        title: 'Concurso del MERCOSUR de fotografía y vídeo',
        date: '6/29/26',
        image: 'assets/images/news-concurso-foto-video.jpg',
        teaser: 'La convocatoria invita a retratar la convivencia y diversidad cultural.',
        body: [
          'El MERCOSUR abrió la convocatoria para la octava edición de su Concurso de Fotografía y la segunda edición del Concurso de Reels, cuya temática de este año es "Integración Fronteriza". La iniciativa busca que los participantes capturen, a través de imágenes y videos, la convivencia cotidiana entre las comunidades fronterizas, resaltando tradiciones, costumbres, expresiones culturales y formas de vida compartidas que fortalecen la identidad regional.',
          'El concurso está dirigido a personas mayores de 18 años que sean ciudadanas de Argentina, Bolivia, Brasil, Paraguay o Uruguay. Las inscripciones son gratuitas y permanecerán abiertas hasta el 10 de agosto de 2026. Se premiarán las obras que destaquen por su creatividad, autenticidad y calidad artística, además de reconocer la capacidad de reflejar la riqueza humana y cultural presente en las zonas fronterizas del MERCOSUR. En la categoría de reels también se otorgará un Premio del Público, elegido mediante votación en la cuenta oficial de Instagram del bloque.',
          'Para presentar su fotografía o video, así como acceder a las bases y condiciones completas, ya pueden ingresar al sitio web <a href="https://www.mercosur.int/concursofotoreel" target="_blank" rel="noopener">mercosur.int/concursofotoreel</a>, hasta el 10 de agosto de 2026.'
        ],
        source: 'MERCOSUR. (2026, 29 de junio). <em>El concurso de fotografías y videos del MERCOSUR de este año está abierto y es sobre integración fronteriza</em>. <a href="https://www.mercosur.int/el-concurso-de-fotografias-y-videos-del-mercosur-de-este-ano-esta-abierto-y-es-sobre-integracion-fronteriza" target="_blank" rel="noopener">Secretaría del Mercosur</a>.'
      },
      {
        id: 'concluye-presidencia-paraguaya',
        title: 'Concluye la presidencia paraguaya del MERCOSUR',
        date: '6/25/26',
        image: 'assets/images/news-concluye-presidencia-paraguaya.jpg',
        teaser: 'Paraguay cierra su gestión destacando avances en comercio, digitalización y cooperación regional.',
        body: [
          'La Presidencia Pro Tempore de Paraguay culminó con la realización de la Cumbre del MERCOSUR en Asunción, donde se reunieron los jefes de Estado, cancilleres y delegaciones de los países miembros y asociados para evaluar los resultados del semestre. Durante la gestión paraguaya se llevaron a cabo más de 360 reuniones en distintos niveles institucionales, permitiendo avanzar en áreas estratégicas como la facilitación del comercio, la agenda digital, el fortalecimiento de los controles integrados en fronteras y el relacionamiento internacional del bloque.',
          'Con el cierre de esta etapa, Uruguay asumió la Presidencia Pro Tempore del MERCOSUR por los siguientes seis meses, dando continuidad a la rotación establecida entre los Estados Parte. La cumbre marcó el fin de una gestión orientada a consolidar la integración regional mediante el diálogo político, la cooperación y el desarrollo de iniciativas que fortalezcan la competitividad y la coordinación entre los países miembros.'
        ],
        source: 'MERCOSUR. (2026, 25 de junio). <em>Cierra la presidencia paraguaya del MERCOSUR</em>. <a href="https://www.mercosur.int/cierra-la-presidencia-paraguaya-del-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
      },
      {
        id: 'focem-avance-proyectos',
        title: 'Avance de Proyectos FOCEM en el Cierre de la Presidencia Paraguaya',
        date: '6/22/26',
        image: 'assets/images/news-focem-avance.jpg',
        teaser: 'La CRPM evalúa avances en proyectos del FOCEM antes del cierre de la gestión paraguaya.',
        body: [
          'La Comisión de Representantes Permanentes del MERCOSUR (CRPM) concluyó la gestión paraguaya de la Presidencia Pro Tempore, evaluando avances significativos en proyectos del Fondo para la Convergencia Estructural (FOCEM), incluyendo saneamiento básico para comunidades indígenas y el Parque Tecnológico de Sant\'Ana do Livramento. El encuentro también analizó informes semestrales de gestión presupuestaria, comunicación y formación interna del bloque.'
        ],
        source: 'MERCOSUR. (2026, 22 de junio). <em>Avance de nuevos proyectos del fondo del MERCOSUR y últimos informes de trabajo analizados por Representantes Permanentes en la Presidencia Pro Tempore Paraguaya saliente</em>. <a href="https://www.mercosur.int/avance-de-nuevos-proyectos-del-fondo-del-mercosur-y-ultimos-informes-de-trabajo-analizados-por-representantes-permanentes-en-la-presidencia-pro-tempore-paraguaya-saliente" target="_blank" rel="noopener">Secretaría del Mercosur</a>.'
      },
      {
        id: 'efta-tratado-avances',
        title: 'Avances en Tratado de Libre Comercio entre el MERCOSUR y la EFTA',
        date: '6/18/26',
        image: 'assets/images/news-efta-tratado.jpg',
        teaser: 'Los congresos de Brasil y Uruguay aprueban de forma simultánea el proyecto de ley.',
        body: [
          'Las asambleas legislativas de Brasil y Uruguay aprobaron la ratificación oficial del Tratado de Libre Comercio que fue suscrito originalmente entre el MERCOSUR y los Estados de la Asociación Europea de Libre Comercio (EFTA). Esta alianza económica estratégica involucra de forma directa la cooperación de Islandia, Liechtenstein, Noruega y Suiza. El avance legislativo faculta la reducción progresiva de barreras aduaneras de importación y optimiza el flujo de inversiones tecnológicas recíprocas en Sudamérica. El resto de los parlamentos de los Estados Partes continúa gestionando sus respectivos procesos constitucionales internos para lograr la vigencia plena y conjunta de la norma arancelaria.'
        ],
        source: 'Secretaría del MERCOSUR. (2026, 18 de junio). <em>Avanza el proceso de ratificación del Acuerdo de Libre Comercio entre el MERCOSUR y la EFTA</em>. <a href="https://www.mercosur.int/tema/relacionamiento-externo" target="_blank" rel="noopener">Página Oficial del MERCOSUR</a>.'
      },
      {
        id: 'japon-acuerdo-economico',
        title: 'Futuro impulso económico entre Sudamérica y Asia',
        date: '6/17/26',
        image: 'assets/images/news-japon-acuerdo.jpg',
        teaser: 'El bloque sudamericano busca fortalecer el comercio y la inversión con una de las economías principales de Asia.',
        body: [
          'El MERCOSUR y Japón anunciaron el inicio de las negociaciones para un Acuerdo de Asociación Económica (AAE), una iniciativa que busca fortalecer las relaciones comerciales, ampliar el acceso a los mercados e impulsar las inversiones entre ambas partes. El anuncio representa un paso importante en la estrategia del bloque sudamericano para diversificar sus vínculos económicos y consolidar su presencia en la región Asia-Pacífico.',
          'Las negociaciones abarcarán temas relacionados con el comercio de bienes y servicios, la cooperación económica y la promoción de inversiones. Japón figura entre los principales socios comerciales del MERCOSUR, por lo que el acuerdo podría generar nuevas oportunidades para las empresas de ambas regiones, incrementar el intercambio comercial y fortalecer la integración económica internacional del bloque.'
        ],
        source: 'MERCOSUR. (2026, 30 de junio). <em>Lanzamiento de las negociaciones para un Acuerdo de Asociación Económica entre los Estados Partes del MERCOSUR y Japón</em>. <a href="https://www.mercosur.int/mercosur-y-japon-anuncian-el-inicio-de-negociaciones-para-un-acuerdo-de-asociacion-economica" target="_blank" rel="noopener">Secretaría del Mercosur</a>.'
      },
      {
        id: 'agricultura-familiar-reaf',
        title: 'Diálogo que impulsa el fortalecimiento de la agricultura familiar en el MERCOSUR',
        date: '6/12/26',
        image: 'assets/images/news-agricultura-familiar.jpg',
        teaser: 'Representantes acordaron promover políticas para apoyar a los pequeños productores y el desarrollo rural.',
        body: [
          'La Reunión Especializada de Agricultura Familiar (REAF) del MERCOSUR reunió a autoridades gubernamentales, organizaciones de productores y organismos internacionales para fortalecer el diálogo regional sobre el futuro de la agricultura familiar. Durante el encuentro se analizaron temas prioritarios como el acceso a mercados, el financiamiento, la asistencia técnica y el intercambio de experiencias, con el objetivo de impulsar políticas públicas que favorezcan el desarrollo sostenible de los pequeños productores y mejoren su calidad de vida.',
          'Los participantes destacaron que la agricultura familiar desempeña un papel fundamental en la seguridad alimentaria, la reducción de las desigualdades y el desarrollo económico de las zonas rurales. Asimismo, reafirmaron el compromiso de los países del MERCOSUR de fortalecer la cooperación regional y generar recomendaciones conjuntas que permitan consolidar un sector agrícola más inclusivo, resiliente y competitivo frente a los desafíos actuales.'
        ],
        source: 'MERCOSUR. (2026, 12 de junio). <em>Diálogo regional para fortalecer la agricultura familiar en el MERCOSUR</em>. <a href="https://www.mercosur.int/dialogo-regional-para-fortalecer-la-agricultura-familiar-en-el-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
      },
      {
        id: 'cooperacion-espanola-aecid',
        title: 'MERCOSUR y la cooperación española fortalecen su alianza',
        date: '6/10/26',
        image: 'assets/images/news-cooperacion-espanola.jpg',
        teaser: 'Un nuevo acuerdo promoverá proyectos conjuntos, capacitación e intercambio de conocimientos.',
        body: [
          'El MERCOSUR y la Agencia Española de Cooperación Internacional para el Desarrollo (AECID) firmaron un Memorando de Entendimiento con el objetivo de fortalecer la cooperación institucional y apoyar el proceso de integración regional. El acuerdo establece un marco para desarrollar iniciativas conjuntas enfocadas en el fortalecimiento de las instituciones, el intercambio de conocimientos, la capacitación y la ejecución de proyectos de interés común que contribuyan al desarrollo sostenible de los Estados Parte.',
          'Durante la firma, representantes del MERCOSUR y de España destacaron que la cooperación internacional es una herramienta clave para enfrentar desafíos compartidos y consolidar una integración más sólida. El memorando también busca promover buenas prácticas, asistencia técnica y el desarrollo de capacidades, reafirmando el compromiso de ambas partes con una agenda de cooperación basada en el respeto mutuo, la solidaridad y el beneficio compartido.'
        ],
        source: 'MERCOSUR. (2026, 10 de junio). <em>El MERCOSUR y la cooperación española acordaron fortalecer su trabajo conjunto en apoyo a la integración regional</em>. <a href="https://www.mercosur.int/el-mercosur-y-la-cooperacion-espanola-acordaron-fortalecer-su-trabajo-conjunto-en-apoyo-a-la-integracion-regional" target="_blank" rel="noopener">Secretaria del MERCOSUR</a>.'
      }
    ];

    var totalPages = Math.ceil(NEWS_ITEMS.length / PER_PAGE);

    function cardHTML(item) {
      return (
        '<article class="post-card">' +
          '<a href="#" class="post-thumb" data-news-open="' + item.id + '"><img src="' + item.image + '" alt="' + item.title + '"></a>' +
          '<div class="post-body">' +
            '<div class="post-meta"><span>' + item.date + '</span></div>' +
            '<h3>' + item.title + '</h3>' +
            '<p>' + item.teaser + '</p>' +
            '<a href="#" class="post-link" data-news-open="' + item.id + '">Read More</a>' +
          '</div>' +
        '</article>'
      );
    }

    function renderGrid(page) {
      var start = (page - 1) * PER_PAGE;
      var items = NEWS_ITEMS.slice(start, start + PER_PAGE);
      grid.innerHTML = items.map(cardHTML).join('');
    }

    function renderPager(page) {
      var html = '';
      html += '<button type="button" class="pagination-btn" data-page="prev"' + (page === 1 ? ' disabled' : '') + ' aria-label="Página anterior">←</button>';
      for (var i = 1; i <= totalPages; i++) {
        html += '<button type="button" class="pagination-btn' + (i === page ? ' is-active' : '') + '" data-page="' + i + '"' + (i === page ? ' aria-current="page"' : '') + '>' + i + '</button>';
      }
      html += '<button type="button" class="pagination-btn" data-page="next"' + (page === totalPages ? ' disabled' : '') + ' aria-label="Página siguiente">→</button>';
      pager.innerHTML = html;
    }

    function goToPage(page) {
      page = Math.max(1, Math.min(totalPages, page));
      currentPage = page;
      renderGrid(currentPage);
      renderPager(currentPage);
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    pager.addEventListener('click', function (e) {
      var btn = e.target.closest('.pagination-btn');
      if (!btn || btn.disabled) return;
      var target = btn.getAttribute('data-page');
      if (target === 'prev') goToPage(currentPage - 1);
      else if (target === 'next') goToPage(currentPage + 1);
      else goToPage(parseInt(target, 10));
    });

    /* ---- Read More modal ---- */
    var overlay = null;

    function findItem(id) {
      for (var i = 0; i < NEWS_ITEMS.length; i++) {
        if (NEWS_ITEMS[i].id === id) return NEWS_ITEMS[i];
      }
      return null;
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'news-modal-title');
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeNews();
      });
      return overlay;
    }

    function openNews(id) {
      var item = findItem(id);
      if (!item) return;
      var ov = buildOverlay();
      var bodyHTML = item.body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
      ov.innerHTML =
        '<div class="privacy-modal news-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          '<div class="news-modal-image"><img src="' + item.image + '" alt="' + item.title + '"></div>' +
          '<div class="news-modal-content">' +
            '<p class="news-modal-meta">' + item.date + '</p>' +
            '<h2 id="news-modal-title">' + item.title + '</h2>' +
            bodyHTML +
            '<p class="news-modal-source">' + item.source + '</p>' +
          '</div>' +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closeNews);
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeNews() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeNews();
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-news-open]');
      if (!trigger) return;
      e.preventDefault();
      openNews(trigger.getAttribute('data-news-open'));
    });

    goToPage(1);
  })();

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

  /* ---------- Privacy Policy modal ---------- */
  (function () {
    var triggers = document.querySelectorAll('.js-privacy-link');
    if (!triggers.length) return;

    var overlay = null;

    var privacyHTML =
      '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
      '<h2 id="privacy-modal-title">Política de Privacidad</h2>' +

      '<p>La Cámara de Comercio Mercosur reconoce la protección de los datos personales como una condición esencial para construir relaciones de confianza con empresas, cámaras de comercio, instituciones, asociados, colaboradores y usuarios de su sitio web. Esta Política explica de forma clara qué información podemos tratar, para qué la utilizamos, con quién puede compartirse, durante cuánto tiempo se conserva y cómo pueden ejercerse los derechos reconocidos por la normativa aplicable.</p>' +

      '<h3>1. Identidad y alcance</h3>' +
      '<p>La responsable del tratamiento es la Cámara de Comercio Mercosur, asociación internacional uruguaya con domicilio en Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay. Las consultas relacionadas con privacidad o protección de datos pueden dirigirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
      '<p>Esta Política se aplica a los datos personales tratados a través del sitio web, sus formularios, las comunicaciones electrónicas y los demás canales digitales vinculados a la actividad institucional de la Cámara. Comprende, entre otras, las consultas generales, manifestaciones de interés, solicitudes de asociación, propuestas de cooperación, presentación de iniciativas empresariales, consultas sobre comercio, internacionalización, inversión o financiación, comunicaciones de prensa, privacidad, cumplimiento e integridad, y suscripciones voluntarias a comunicaciones institucionales.</p>' +
      '<p>Cuando una actividad, evento, relación contractual, investigación de integridad u otro tratamiento requiera información adicional, la Cámara podrá proporcionar una cláusula o aviso específico que complemente esta Política.</p>' +

      '<h3>2. Marco normativo y principios</h3>' +
      '<p>El tratamiento de datos personales se rige principalmente por la Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data de la República Oriental del Uruguay, su Decreto Reglamentario N.º 414/009, el Decreto N.º 64/020 y las demás normas modificativas, reglamentarias y concordantes. Cuando una normativa extranjera resulte aplicable por razón del territorio, de la persona afectada o de la actividad desarrollada, la Cámara aplicará las garantías adicionales que correspondan.</p>' +
      '<p>La Cámara trata los datos conforme a los principios de legalidad, lealtad, transparencia, finalidad determinada, proporcionalidad, minimización, exactitud, seguridad, confidencialidad, conservación limitada y responsabilidad institucional. Solo recabamos la información que resulta necesaria para la finalidad informada y procuramos mantenerla actualizada y protegida.</p>' +

      '<h3>3. Datos que tratamos y su procedencia</h3>' +
      '<p>Dependiendo de la relación o consulta, podemos tratar datos de identificación y contacto, información profesional e institucional, país, sector, organización, cargo, sitio web, contenido de los mensajes, preferencias de comunicación, constancia de consentimientos y datos técnicos básicos relacionados con la navegación y la seguridad del sitio.</p>' +
      '<p>También podemos tratar la información necesaria para evaluar solicitudes de asociación, cooperación o presentación de iniciativas, así como datos destinados a prevenir fraude, suplantación, uso no autorizado de la identidad institucional, accesos indebidos o incidentes de seguridad.</p>' +
      '<p>Los datos pueden proceder directamente de la persona interesada, de la organización a la que representa, de comunicaciones profesionales, de terceros que cuenten con una base legítima para facilitarlos o de fuentes accesibles al público, siempre que su utilización sea compatible con la finalidad para la que fueron publicados, resulte pertinente y esté permitida por la normativa.</p>' +
      '<p>Cuando una persona facilite datos de terceros, deberá contar con una base legítima para hacerlo e informarles cuando corresponda. La Cámara podrá solicitar acreditación de esa autorización, proporcionar directamente la información de privacidad o abstenerse de tratar los datos si no puede verificarse su legitimidad.</p>' +
      '<p>Salvo solicitud expresa y mediante un canal adecuado, no deben enviarse documentos de identidad, datos bancarios, información médica, datos políticos, religiosos o sindicales, antecedentes penales, secretos empresariales, expedientes completos de inversión ni otra información especialmente sensible o altamente confidencial mediante formularios abiertos.</p>' +

      '<h3>4. Finalidades del tratamiento</h3>' +
      '<p>Tratamos los datos para recibir, clasificar y responder consultas; gestionar manifestaciones de interés; evaluar solicitudes de asociación; analizar propuestas de cooperación; realizar una valoración inicial de iniciativas empresariales; orientar consultas hacia cámaras, instituciones o especialistas relevantes; gestionar relaciones institucionales; enviar comunicaciones cuando exista autorización; proteger el nombre, la marca y los activos digitales de la Cámara; atender comunicaciones de privacidad, cumplimiento e integridad; garantizar la seguridad del sitio; prevenir fraude y suplantación; cumplir obligaciones legales y atender requerimientos válidos de autoridades.</p>' +
      '<p>La presentación de una consulta, iniciativa o solicitud no implica su aceptación, la admisión como asociado, el otorgamiento de representación, la obtención de financiación ni la creación automática de una relación contractual.</p>' +

      '<h3>5. Bases jurídicas</h3>' +
      '<p>El tratamiento se realizará sobre la base del consentimiento de la persona interesada, la atención de una solicitud o la adopción de medidas previas a una posible relación institucional o contractual, la ejecución de una relación válidamente establecida, el cumplimiento de obligaciones legales o los supuestos en los que la normativa permita o exceptúe el tratamiento sin consentimiento.</p>' +
      '<p>Cuando el tratamiento se base en el consentimiento, este podrá retirarse en cualquier momento mediante una comunicación a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, sin afectar la licitud del tratamiento realizado con anterioridad.</p>' +

      '<h3>6. Formularios y carácter de los datos</h3>' +
      '<p>Los campos identificados como obligatorios son necesarios para gestionar la consulta o solicitud. Si no se facilitan, la Cámara puede no estar en condiciones de atenderla adecuadamente. Los campos opcionales permiten aportar contexto adicional y pueden dejarse en blanco.</p>' +
      '<p>La persona interesada debe procurar que la información sea exacta, actual y pertinente. La Cámara podrá solicitar aclaraciones cuando los datos resulten insuficientes, contradictorios o inadecuados para la finalidad declarada.</p>' +

      '<h3>7. Comunicaciones institucionales</h3>' +
      '<p>La Cámara solo enviará boletines, novedades, invitaciones u otras comunicaciones institucionales periódicas cuando exista una base jurídica suficiente. Cuando se solicite consentimiento, la casilla será separada, opcional y no aparecerá premarcada.</p>' +
      '<p>La persona podrá darse de baja en cualquier momento mediante el enlace incluido en la comunicación o escribiendo a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>. La retirada del consentimiento no afectará a otras comunicaciones necesarias para gestionar una relación o solicitud existente.</p>' +

      '<h3>8. Destinatarios y proveedores</h3>' +
      '<p>La Cámara no vende datos personales ni los utiliza para finalidades comerciales ajenas a su actividad institucional.</p>' +
      '<p>Podemos recurrir a proveedores tecnológicos, profesionales y de servicios que actúen por cuenta de la Cámara, como servicios de alojamiento, correo electrónico, formularios, almacenamiento, mantenimiento, seguridad, analítica, gestión de contactos o comunicaciones. Estos proveedores deberán tratar los datos conforme a instrucciones documentadas, guardar confidencialidad y aplicar medidas de seguridad adecuadas.</p>' +
      '<p>Los datos también podrán comunicarse a otras cámaras de comercio, asociaciones, instituciones, profesionales, entidades financieras, inversores, organismos de desarrollo, autoridades o asesores cuando la persona haya solicitado expresamente esa actuación, haya prestado su consentimiento informado o la comunicación se encuentre autorizada por la normativa aplicable.</p>' +
      '<p>Cuando la comunicación no sea estrictamente necesaria para atender una solicitud expresamente formulada ni esté amparada por otra base legal, la Cámara solicitará autorización previa e informará sobre el destinatario y la finalidad de la comunicación.</p>' +

      '<h3>9. Transferencias internacionales</h3>' +
      '<p>La naturaleza internacional de la Cámara y el uso de servicios tecnológicos pueden implicar el tratamiento o acceso a datos desde países distintos de Uruguay.</p>' +
      '<p>Las transferencias internacionales se realizarán conforme al artículo 23 de la Ley N.º 18.331, hacia países u organizaciones con nivel adecuado de protección o mediante las autorizaciones, excepciones, cláusulas contractuales u otras garantías reconocidas por la normativa y por la Unidad Reguladora y de Control de Datos Personales.</p>' +
      '<p>La información sobre proveedores y lugares de tratamiento podrá actualizarse cuando se definan o modifiquen las herramientas tecnológicas utilizadas.</p>' +

      '<h3>10. Conservación de los datos</h3>' +
      '<p>Los datos se conservarán durante el tiempo necesario para cumplir la finalidad para la que fueron recogidos y atender obligaciones legales, institucionales o de defensa. Las consultas generales se mantendrán durante su gestión y un periodo razonable de seguimiento; las solicitudes de asociación, cooperación o participación durante su evaluación y el tiempo necesario para documentar la decisión; y las iniciativas empresariales durante su análisis, desarrollo o cierre y mientras puedan derivarse responsabilidades.</p>' +
      '<p>Los datos utilizados para comunicaciones institucionales se conservarán hasta que se retire el consentimiento o se solicite la baja. Las comunicaciones de integridad se mantendrán durante su análisis, investigación y los plazos legales aplicables. Los registros técnicos y de seguridad se conservarán durante periodos proporcionales a su finalidad.</p>' +
      '<p>Cuando los datos dejen de ser necesarios, serán eliminados, anonimizados o bloqueados durante los plazos de responsabilidad que correspondan.</p>' +

      '<h3>11. Seguridad e incidentes</h3>' +
      '<p>La Cámara aplica medidas técnicas y organizativas razonables para proteger los datos frente a pérdida, alteración, acceso, divulgación o tratamiento no autorizado. Estas medidas pueden incluir controles de acceso, gestión de permisos, cifrado en tránsito, copias de seguridad, actualización de sistemas, obligaciones de confidencialidad, selección de proveedores y procedimientos de respuesta ante incidentes.</p>' +
      '<p>Ningún sistema es completamente infalible. Cuando la Cámara tome conocimiento de una vulneración de seguridad, adoptará inmediatamente las medidas necesarias para contenerla, investigarla y documentarla, y realizará las comunicaciones a la Unidad Reguladora y de Control de Datos Personales y a las personas afectadas en los términos exigidos por la normativa aplicable.</p>' +

      '<h3>12. Derechos de las personas</h3>' +
      '<p>Las personas pueden conocer si la Cámara trata sus datos, acceder a ellos, solicitar su rectificación, actualización, inclusión o supresión cuando corresponda, revocar el consentimiento y formular consultas u observaciones relacionadas con el tratamiento. También pueden impugnar valoraciones personales que afecten significativamente a sus derechos o intereses y que se basen exclusivamente o principalmente en tratamientos de datos personales, cuando resulte aplicable.</p>' +
      '<p>Los derechos pueden ejercerse gratuitamente mediante una comunicación a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, indicando el derecho que se desea ejercer y aportando información suficiente para verificar la identidad de manera proporcional.</p>' +
      '<p>La Cámara responderá las solicitudes de acceso, rectificación, actualización, inclusión o supresión dentro del plazo máximo de cinco días hábiles desde su recepción, sin perjuicio de otros plazos que puedan resultar aplicables según la naturaleza de la solicitud. Cuando corresponda, podrá solicitar información adicional para confirmar la identidad o precisar el alcance de la petición.</p>' +
      '<p>Las personas también pueden formular consultas o presentar denuncias ante la Unidad Reguladora y de Control de Datos Personales de Uruguay: <a href="https://www.gub.uy/unidad-reguladora-control-datos-personales/" target="_blank" rel="noopener">www.gub.uy/unidad-reguladora-control-datos-personales</a>.</p>' +

      '<h3>13. Cookies, enlaces y menores</h3>' +
      '<p>El sitio puede utilizar cookies y tecnologías similares para permitir su funcionamiento, mantener la seguridad, recordar preferencias y, cuando corresponda, obtener información estadística. Las cookies estrictamente necesarias podrán utilizarse sin consentimiento cuando así lo permita la normativa. Las cookies analíticas, publicitarias o de terceros estarán sujetas a la información y autorización que correspondan.</p>' +
      '<p>La información detallada sobre las tecnologías efectivamente instaladas, sus proveedores, duración y finalidad se incluirá en la Política de Cookies y en el panel de preferencias del sitio.</p>' +
      '<p>El sitio puede contener enlaces a páginas de terceros, incluido el sitio oficial del MERCOSUR u otras organizaciones. La Cámara no controla sus prácticas de privacidad y recomienda consultar las políticas aplicables antes de facilitar datos personales.</p>' +
      '<p>El sitio y los servicios generales de la Cámara no están dirigidos a menores de edad. La Cámara no recopila conscientemente datos de menores mediante los formularios generales. Si detectara que ha recibido datos de un menor sin una base legítima, adoptará las medidas razonables para su eliminación o regularización.</p>' +

      '<h3>14. Canal de Integridad y decisiones automatizadas</h3>' +
      '<p>Las comunicaciones relacionadas con fraude, corrupción, conflictos de interés, suplantación, uso indebido de la marca u otros incumplimientos se tratarán con acceso restringido y conforme al procedimiento institucional aplicable. La confidencialidad se protegerá dentro de los límites legales y operativos. La Cámara no garantiza el anonimato salvo que el canal y el procedimiento utilizado permitan asegurarlo efectivamente.</p>' +
      '<p>La Cámara no adopta decisiones que produzcan efectos jurídicos o consecuencias similares basadas exclusivamente en el tratamiento automatizado de datos personales. Si en el futuro se implementaran sistemas de evaluación automatizada, se informará previamente sobre su lógica, alcance y garantías cuando la normativa lo exija.</p>' +

      '<h3>15. Actualizaciones y contacto</h3>' +
      '<p>La Cámara puede actualizar esta Política para adaptarla a cambios normativos, tecnológicos, organizativos o derivados de sus actividades. La versión vigente estará disponible en el sitio e indicará su fecha de publicación. Cuando los cambios sean relevantes, se procurará informarlos por medios razonables.</p>' +
      '<p>Para cualquier consulta sobre esta Política o sobre el tratamiento de datos personales, puede escribir a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +

      '<p class="privacy-signature">Cámara de Comercio Mercosur. Asociación internacional uruguaya. Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay.</p>' +
      '<p style="font-size:.8rem;">Marco normativo de referencia: Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data; Decreto N.º 414/009; Decreto N.º 64/020; normas modificativas y criterios de la Unidad Reguladora y de Control de Datos Personales de Uruguay.</p>';

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'privacy-modal-title');
      overlay.innerHTML =
        '<div class="privacy-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          privacyHTML +
        '</div>';
      document.body.appendChild(overlay);

      overlay.querySelector('.privacy-close').addEventListener('click', closePrivacy);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePrivacy();
      });
      return overlay;
    }

    function openPrivacy() {
      var ov = buildOverlay();
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closePrivacy() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closePrivacy();
    });

    triggers.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openPrivacy();
      });
    });
  })();

  /* ---------- Cookie preferences modal ---------- */
  (function () {
    var triggers = document.querySelectorAll('.js-cookies-link');
    if (!triggers.length) return;

    var STORAGE_KEY = 'mercosurCookiePrefs';
    var overlay = null;

    function readPrefs() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { analytics: false };
        var parsed = JSON.parse(raw);
        return { analytics: !!parsed.analytics };
      } catch (e) {
        return { analytics: false };
      }
    }

    function savePrefs(prefs) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch (e) { /* storage unavailable — ignore */ }
    }

    var cookiesHTML =
      '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
      '<h2 id="cookies-modal-title">Configurar Cookies</h2>' +
      '<p>Utilizamos cookies estrictamente necesarias para el funcionamiento del sitio y, de forma opcional, cookies analíticas para entender cómo se utiliza. Puedes activar o desactivar las categorías opcionales y guardar tu preferencia en cualquier momento.</p>' +
      '<div class="cookie-option">' +
        '<div class="cookie-option-head">' +
          '<label for="cookie-necessary">Cookies necesarias</label>' +
          '<input type="checkbox" id="cookie-necessary" checked disabled>' +
        '</div>' +
        '<p>Imprescindibles para la navegación, la seguridad y el funcionamiento básico del sitio. No pueden desactivarse.</p>' +
      '</div>' +
      '<div class="cookie-option">' +
        '<div class="cookie-option-head">' +
          '<label for="cookie-analytics">Cookies analíticas</label>' +
          '<input type="checkbox" id="cookie-analytics">' +
        '</div>' +
        '<p>Nos ayudan a entender de forma agregada y anónima cómo se utiliza el sitio, para mejorar contenidos y navegación.</p>' +
      '</div>' +
      '<div class="cookie-actions">' +
        '<button type="button" class="btn btn-outline-blue" data-cookie-action="reject">Rechazar opcionales</button>' +
        '<button type="button" class="btn btn-primary" data-cookie-action="save">Guardar preferencias</button>' +
      '</div>' +
      '<p class="cookie-status" role="status" aria-live="polite"></p>';

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'cookies-modal-title');
      overlay.innerHTML =
        '<div class="privacy-modal cookies-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          cookiesHTML +
        '</div>';
      document.body.appendChild(overlay);

      var analyticsBox = overlay.querySelector('#cookie-analytics');
      var status = overlay.querySelector('.cookie-status');
      analyticsBox.checked = readPrefs().analytics;

      function setStatus(text) {
        status.textContent = text;
      }

      overlay.querySelector('[data-cookie-action="save"]').addEventListener('click', function () {
        savePrefs({ analytics: analyticsBox.checked });
        setStatus('Preferencias guardadas.');
        window.setTimeout(closeCookies, 900);
      });

      overlay.querySelector('[data-cookie-action="reject"]').addEventListener('click', function () {
        analyticsBox.checked = false;
        savePrefs({ analytics: false });
        setStatus('Solo se usarán las cookies necesarias.');
        window.setTimeout(closeCookies, 900);
      });

      overlay.querySelector('.privacy-close').addEventListener('click', closeCookies);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeCookies();
      });
      return overlay;
    }

    function openCookies() {
      var ov = buildOverlay();
      ov.querySelector('#cookie-analytics').checked = readPrefs().analytics;
      ov.querySelector('.cookie-status').textContent = '';
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeCookies() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeCookies();
    });

    triggers.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openCookies();
      });
    });
  })();

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
          '<ul class="notice-links-grid">' +
            '<li><a href="https://help.unicef.org/lac/venezuela/emergenciavenezuela" target="_blank" rel="noopener">UNICEF - ONU</a></li>' +
            '<li><a href="https://sharethemeal.org/campaigns/venezuela1" target="_blank" rel="noopener">Share The Meal</a></li>' +
            '<li><a href="http://www.caritasvenezuela.org/donaciones" target="_blank" rel="noopener">Caritas Venezuela</a></li>' +
            '<li><a href="http://www.globalgiving.org" target="_blank" rel="noopener">Global Giving (@globalgiving)</a></li>' +
          '</ul>' +
        '</div>' +
        '<p class="notice-signature">Cámara de Comercio Mercosur</p>' +
        '<div class="notice-flag" aria-hidden="true">' +
          '<div class="notice-flag-yellow"></div>' +
          '<div class="notice-flag-blue">' +
            '<span class="notice-flag-stars">' +
              '<span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>' +
            '</span>' +
          '</div>' +
          '<div class="notice-flag-red"></div>' +
        '</div>' +
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