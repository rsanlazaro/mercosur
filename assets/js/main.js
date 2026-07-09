// Cámara de Comercio Mercosur — site scripts
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Shared helper: translate a status/warning message on demand ---------- */
  function mercosurText(key, fallback) {
    try {
      var lang = localStorage.getItem('mercosurLang') || 'es';
      var dict = window.MERCOSUR_I18N && window.MERCOSUR_I18N[lang];
      if (dict && dict[key]) return dict[key];
    } catch (e) { /* storage or dict unavailable */ }
    return fallback;
  }

  /* ---------- Language switcher (ES / PT / EN active — FR coming soon) ---------- */
  var langSwitcher = document.querySelector('.lang-switcher');
  if (langSwitcher) {
    var langToggle = langSwitcher.querySelector('.lang-toggle');
    var langToggleLabel = langToggle.querySelector('span');
    var DICT = window.MERCOSUR_I18N || null;
    var STORAGE_KEY = 'mercosurLang';
    var AVAILABLE = ['es', 'pt', 'en', 'fr'];

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

      document.dispatchEvent(new CustomEvent('mercosur:langchange', { detail: { lang: lang } }));
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
        role: { es: 'Presidente', en: 'President', pt: 'Presidente', fr: 'Président' },
        body: {
          es: [
            'Erik Aaron Lara Riveros es un ejecutivo internacional chileno con más de veinte años de experiencia en banca, inversión, mercados regulados, gobernanza corporativa y relaciones institucionales.',
            'Ha desempeñado funciones directivas y de consejo en entidades financieras reguladas de Europa y Oriente Medio, así como responsabilidades ejecutivas en compañías cotizadas en Norteamérica. Actualmente participa en el desarrollo de iniciativas internacionales vinculadas a minerales críticos, financiación, inversión y cadenas estratégicas de suministro entre América Latina y Norteamérica. Como presidente de la Cámara, impulsa la integración empresarial, la cooperación institucional y la proyección internacional del espacio Mercosur.'
          ],
          en: [
            'Erik Aaron Lara Riveros is a Chilean international executive with more than twenty years of experience in banking, investment, regulated markets, corporate governance, and institutional relations.',
            'He has held executive and board positions at regulated financial institutions in Europe and the Middle East, as well as executive leadership roles in publicly traded companies in North America. He is currently involved in developing international initiatives related to critical minerals, financing, investment, and strategic supply chains between Latin America and North America. As President of the Chamber, he promotes business integration, institutional cooperation, and the international presence of the Mercosur region.'
          ],
          pt: [
            'Erik Aaron Lara Riveros é um executivo internacional chileno com mais de vinte anos de experiência no setor bancário, de investimentos, mercados regulados, governança corporativa e relações institucionais.',
            'Exerceu cargos de direção e de conselho em instituições financeiras reguladas na Europa e no Oriente Médio, além de responsabilidades executivas em empresas de capital aberto na América do Norte. Atualmente, participa do desenvolvimento de iniciativas internacionais relacionadas a minerais críticos, financiamento, investimentos e cadeias estratégicas de suprimentos entre a América Latina e a América do Norte. Como Presidente da Câmara, promove a integração empresarial, a cooperação institucional e a projeção internacional do espaço Mercosul.'
          ],
          fr: [
            'Erik Aaron Lara Riveros est un dirigeant international chilien possédant plus de vingt ans d\'expérience dans les secteurs bancaire, de l\'investissement, des marchés réglementés, de la gouvernance d\'entreprise et des relations institutionnelles.',
            'Il a occupé des postes de direction et d\'administrateur au sein d\'institutions financières réglementées en Europe et au Moyen-Orient, ainsi que des responsabilités exécutives dans des sociétés cotées en bourse en Amérique du Nord. Il participe actuellement au développement d\'initiatives internationales liées aux minéraux critiques, au financement, à l\'investissement et aux chaînes d\'approvisionnement stratégiques entre l\'Amérique Latine et l\'Amérique du Nord. En tant que président de la Chambre, il favorise l\'intégration des entreprises, la coopération institutionnelle et la projection internationale de l\'espace Mercosur.'
          ]
        }
      },
      'anthony-edouard-toffoli': {
        name: 'Anthony Edouard A. Toffoli',
        image: 'assets/images/team-3.jpg',
        role: { es: 'Vicepresidente', en: 'Vice President', pt: 'Vice-Presidente', fr: 'Vice-président' },
        body: {
          es: [
            'Anthony Edouard André Toffoli es un ejecutivo francés con más de veinticinco años de experiencia en retail, turismo médico, sector inmobiliario y medios de comunicación.',
            'Participa activamente en varias empresas europeas y ejerce responsabilidades ejecutivas en compañías de Norteamérica. Actualmente participa en el desarrollo de varias clínicas de fertilidad, brindando soluciones para pacientes europeos en América Latina.',
            'Como vicepresidente de la Cámara, trabaja incansablemente en favor de las empresas, promoviendo la cooperación institucional y la expansión internacional más allá del espacio Mercosur.'
          ],
          en: [
            'Anthony Edouard André Toffoli is a French executive with more than twenty-five years of experience in the retail, medical tourism, real estate, and media sectors.',
            'He is actively involved with several European companies and holds executive positions in companies across North America. He is currently involved in the development of fertility clinics, providing solutions for European patients seeking treatment in Latin America.',
            'As Vice President of the Chamber, he works tirelessly to support businesses, promote institutional cooperation, and expand international opportunities beyond the Mercosur region.'
          ],
          pt: [
            'Anthony Edouard André Toffoli é um executivo francês com mais de vinte e cinco anos de experiência nos setores de varejo, turismo médico, mercado imobiliário e mídia.',
            'Atua ativamente em diversas empresas europeias e exerce funções executivas em companhias na América do Norte. Atualmente, participa do desenvolvimento de diversas clínicas de fertilidade humana, oferecendo soluções para pacientes europeus na América Latina.',
            'Como Vice-Presidente da Câmara, trabalha incansavelmente em favor das empresas, promovendo a cooperação institucional e a expansão internacional para além do espaço Mercosul.'
          ],
          fr: [
            'Anthony Edouard André Toffoli est un dirigeant français avec plus de vingt-cinq ans d\'expérience dans le commerce de détail, le tourisme médical, l\'immobilier et les médias.',
            'Il est activement impliqué dans plusieurs entreprises européennes et occupe des postes de direction dans des sociétés en Amérique du Nord. Il participe actuellement au développement de plusieurs cliniques de fertilité humaine, offrant des solutions à des patients européens en Amérique Latine.',
            'En tant que vice-président de la Chambre, il se bat sans relâche pour les entreprises, toujours en faveur de la coopération institutionnelle et de l\'expansion internationale au-delà de l\'espace Mercosur.'
          ]
        }
      },
      'nicole-peters': {
        name: 'Nicole M. Peters',
        image: 'assets/images/team-1.jpg',
        role: { es: 'Prosecretaria', en: 'Deputy Secretary', pt: 'Secretária-Adjunta', fr: 'Prosecrétaire' },
        body: {
          es: [
            'Nicole Peters es abogada por la Universidad de Buenos Aires (UBA), con MBA y formación de posgrado en Políticas Públicas, Agenda 2030, Asuntos Públicos, marketing político y Derecho Público.',
            'Actualmente cursa la Maestría Internacional en Ciencias Políticas con especialización en Cooperación Internacional en la Universidad Europea del Atlántico.',
            'Cuenta con más de ocho años de experiencia en consultoría estratégica, coaching y gestión de proyectos.',
            'Es Coordinadora del Instituto de Estudios Estratégicos y Relaciones Internacionales, así como fundadora y presidenta de la Organización Internacional de Asuntos Públicos.',
            'Ha representado a Argentina en Brasil (AIESEC), Uruguay (Mercosur) y en Rusia (World Youth Festival), así como a Iberoamérica en España (Fundación Carolina) y al Cono Sur en la Organización de los Estados Americanos (OEA), así como Youth Leader en el ONU-ECOSOC.',
            'Sus iniciativas y experiencias profesionales hacen de ella una pieza fundamental de la Cámara de Comercio Mercosur.'
          ],
          en: [
            'Nicole Peters is a lawyer graduated from the University of Buenos Aires (UBA), with an MBA and postgraduate studies in Public Policy, the 2030 Agenda, Public Affairs, Political Marketing, and Public Law.',
            'She is currently pursuing an International Master\'s Degree in Political Science, specializing in International Cooperation, at the European University of the Atlantic.',
            'She has more than eight years of experience in strategic consulting, coaching, and project management.',
            'She serves as Coordinator of the Institute for Strategic Studies and International Relations and is the founder and president of the International Organization for Public Affairs.',
            'She has represented Argentina in Brazil (AIESEC), Uruguay (MERCOSUR), and Russia (World Youth Festival), as well as Ibero-America in Spain (Fundación Carolina) and the Southern Cone at the Organization of American States (OAS), as well as serving as a Youth Leader at the UN-ECOSOC.',
            'Her initiatives and professional experience make her a key member of the Mercosur Chamber of Commerce.'
          ],
          pt: [
            'Nicole Peters é advogada formada pela Universidade de Buenos Aires (UBA), com MBA e formação de pós-graduação em Políticas Públicas, Agenda 2030, Assuntos Públicos, marketing político e Direito Público.',
            'Atualmente, cursa o Mestrado Internacional em Ciência Política, com especialização em Cooperação Internacional, na Universidade Europeia do Atlântico.',
            'Possui mais de oito anos de experiência em consultoria estratégica, coaching e gestão de projetos.',
            'É Coordenadora do Instituto de Estudos Estratégicos e Relações Internacionais, além de fundadora e presidente da Organização Internacional de Assuntos Públicos.',
            'Representou a Argentina no Brasil (AIESEC), no Uruguai (Mercosul) e na Rússia (World Youth Festival), assim como a Ibero-América na Espanha (Fundación Carolina) e o Cone Sul na Organização dos Estados Americanos (OEA), além de atuar como Youth Leader na ONU-ECOSOC.',
            'Suas iniciativas e sua trajetória profissional fazem dela uma peça fundamental da Câmara de Comércio Mercosul.'
          ],
          fr: [
            'Nicole Peters est avocate diplômée de l\'Université de Buenos Aires (UBA), titulaire d\'un MBA et d\'une formation post-universitaire en Politiques Publiques, Agenda 2030, Affaires Publiques, marketing politique et Droit Public.',
            'Elle poursuit actuellement un Master International en Sciences Politiques avec une spécialisation en Coopération Internationale à l\'Université Européenne de l\'Atlantique.',
            'Elle possède plus de huit ans d\'expérience en conseil stratégique, en coaching et en gestion de projet.',
            'Elle est Coordinatrice de l\'Institut d\'Études Stratégiques et des Relations Internationales, ainsi que fondatrice et présidente de l\'Organisation internationale des Affaires Publiques.',
            'Elle a représenté l\'Argentine au Brésil (AIESEC), l\'Uruguay (Mercosur) et en Russie (Festival Mondial de la Jeunesse), ainsi que l\'Amérique Latine en Espagne (Fondation Carolina) et le Cône Sud au sein de l\'Organisation des États Américains (OEA), ainsi qu\'en tant que Youth Leader à l\'ONU-ECOSOC.',
            'Ses initiatives et expériences professionnelles font d\'elle un élément fondamental de la Chambre de Commerce du Mercosur.'
          ]
        }
      },
      'ramon-ricardo-martinelli': {
        name: 'Ramón R. Martinelli',
        image: 'assets/images/team-2.jpg',
        role: { es: 'Tesorero', en: 'Treasurer', pt: 'Tesoureiro', fr: 'Trésorier' },
        body: {
          es: [
            'Ramón Ricardo Martinelli es un ejecutivo panameño con más de 17 años de experiencia en hidrocarburos, logística operativa y desarrollo de negocios energéticos.',
            'Fue Diputado del Parlamento Centroamericano fortaleciendo su visión estratégica sobre cooperación, integración económica y relaciones regionales.',
            'Sigue hoy liderando varias empresas en el mercado energético.',
            'Su experiencia comercial, liderazgo institucional y visión regional son valores fundamentales para la Cámara de Comercio Mercosur.'
          ],
          en: [
            'Ramón Ricardo Martinelli is a Panamanian executive with more than 17 years of experience in hydrocarbons, operational logistics, and energy business development.',
            'He was a Deputy of the Central American Parliament, strengthening his strategic vision of cooperation, economic integration, and regional relations.',
            'He currently continues to lead several companies in the energy sector.',
            'His business experience, institutional leadership, and regional vision are fundamental values for the Mercosur Chamber of Commerce.'
          ],
          pt: [
            'Ramón Ricardo Martinelli é um executivo panamenho com mais de 17 anos de experiência nos setores de hidrocarbonetos, logística operacional e desenvolvimento de negócios no setor de energia.',
            'Foi Deputado do Parlamento Centro-Americano, fortalecendo sua visão estratégica sobre cooperação, integração econômica e relações regionais.',
            'Atualmente, continua liderando diversas empresas no mercado de energia.',
            'Sua experiência empresarial, liderança institucional e visão regional são valores fundamentais para a Câmara de Comércio Mercosul.'
          ],
          fr: [
            'Ramón Ricardo Martinelli est un dirigeant panaméen avec plus de 17 ans d\'expérience dans les secteurs des hydrocarbures, de la logistique opérationnelle et du développement d\'entreprises énergétiques.',
            'Il fut Député du Parlement Centraméricain, ce qui renforça sa vision stratégique en matière de coopération, d\'intégration économique et de relations régionales.',
            'Il continue aujourd\'hui à diriger plusieurs entreprises du marché de l\'énergie.',
            'Son expérience commerciale, leadership institutionnel et vision régionale sont des valeurs fondamentales pour la Chambre de Commerce du Mercosur.'
          ]
        }
      },
      'walber-castillo-castellano': {
        name: 'Walber Castillo Castellano',
        image: 'assets/images/team-5.webp',
        role: { es: 'Secretario General', en: 'Secretary General', pt: 'Secretário-Geral', fr: 'Secrétaire général' },
        body: {
          es: [
            'Walber Castillo Castellano es un empresario colombiano e ingeniero civil con amplia trayectoria en educación técnica, infraestructura, hidrocarburos, innovación tecnológica y desarrollo empresarial.',
            'Entre sus principales iniciativas empresariales se destacan varios grupos internacionales y ha sido distinguido como Colombiano Estrella, empresario destacado en el Exterior, empresario del Año en Perú y Excelencia Educativa ODAEE.',
            'Su visión empresarial, su integridad y compromiso son las bases de su implicación en la Cámara de Comercio Mercosur.'
          ],
          en: [
            'Walber Castillo Castellano is a Colombian entrepreneur and civil engineer with extensive experience in technical education, infrastructure, hydrocarbons, technological innovation, and business development.',
            'Among his main business initiatives are several international business groups. He has received the distinctions of Colombiano Estrella, Outstanding Colombian Abroad, Businessperson of the Year in Peru, and the ODAEE Educational Excellence Award.',
            'His business vision, integrity, and commitment are the foundations of his work with the Mercosur Chamber of Commerce.'
          ],
          pt: [
            'Walber Castillo Castellano é um empresário colombiano e engenheiro civil, com ampla trajetória nas áreas de educação técnica, infraestrutura, hidrocarbonetos, inovação tecnológica e desenvolvimento empresarial.',
            'Entre suas principais iniciativas empresariais destacam-se diversos grupos internacionais. Foi reconhecido com as distinções Colombiano Estrella, Empresário Destaque no Exterior, Empresário do Ano no Peru e Excelência Educativa ODAEE.',
            'Sua visão empresarial, integridade e compromisso constituem os pilares de sua atuação na Câmara de Comércio Mercosul.'
          ],
          fr: [
            'Walber Castillo Castellano est un homme d\'affaires colombien et ingénieur civil possédant une vaste expérience dans les domaines de l\'enseignement technique, des infrastructures, des hydrocarbures, de l\'innovation technologique et du développement commercial.',
            'Parmi ses principales initiatives commerciales figurent plusieurs groupes internationaux et il a été distingué comme "Colombien Étoile", homme d\'affaires exceptionnel à l\'étranger, homme d\'affaires de l\'année au Pérou et Excellence Éducative ODAEE.',
            'Sa vision des affaires, son intégrité et son engagement sont les fondements de son implication au sein de la Chambre de Commerce du Mercosur.'
          ]
        }
      },
      'federico-andres-brugge': {
        name: 'Federico Andrés Brügge',
        image: 'assets/images/team-6.jpg',
        role: { es: 'Síndico Titular', en: 'Principal Auditor', pt: 'Conselheiro Fiscal Titular', fr: 'Syndic titulaire' },
        body: {
          es: [
            'Federico Andrés Brügge es analista de mercados financieros e inversor, dedicado al estudio de la macroeconomía, los mercados internacionales y el mercado de divisas, con foco en el análisis y la operativa de XAU/USD (oro). Es Analista Global de Inversiones (AGI) por el Instituto de Capacitación Bursátil (ICB) de Buenos Aires y Técnico Analista de Mercados y Estrategias de Comercialización. Actualmente profundiza su especialización en el análisis del mercado del oro y las divisas, y en su interacción con la política monetaria, la macroeconomía y los mercados financieros. Mantiene vinculaciones comerciales e institucionales en Argentina, Estados Unidos y Europa.'
          ],
          en: [
            'Federico Andrés Brügge is a financial markets analyst and investor dedicated to the study of macroeconomics, international markets, and the foreign exchange market, with a focus on the analysis and trading of XAU/USD (gold). He is a Global Investment Analyst (AGI) certified by the Instituto de Capacitación Bursátil (ICB) in Buenos Aires and a Market and Commercial Strategy Analyst Technician. He is currently expanding his expertise in the analysis of the gold and foreign exchange markets, as well as their interaction with monetary policy, macroeconomics, and financial markets. He maintains business and institutional relationships in Argentina, the United States, and Europe.'
          ],
          pt: [
            'Federico Andrés Brügge é analista de mercados financeiros e investidor, dedicado ao estudo da macroeconomia, dos mercados internacionais e do mercado cambial, com foco na análise e na operação de XAU/USD (ouro). É Analista Global de Investimentos (AGI) pelo Instituto de Capacitação Bursátil (ICB) de Buenos Aires e Técnico Analista de Mercados e Estratégias de Comercialização. Atualmente, aprofunda sua especialização na análise do mercado de ouro e de câmbio, bem como em sua interação com a política monetária, a macroeconomia e os mercados financeiros. Mantém relações comerciais e institucionais na Argentina, nos Estados Unidos e na Europa.'
          ],
          fr: [
            'Federico Andrés Brügge est analyste de marchés financiers et investisseur, spécialisé dans l\'étude de la macroéconomie, les marchés internationaux et le marché des devises, avec une expertise particulière dans l\'analyse et l\'opération de XAU/USD (or). Il est Analyste Global d\'Investissement (AGI) de l\'Institut de Formation de la Bourse (ICB) de Buenos Aires et est Analyste Technique de Marchés et Stratégies de Commercialisation. Il approfondit actuellement son expertise dans l\'analyse du marché de l\'or et des devises, ainsi que dans son interaction avec la politique monétaire, la macroéconomie et les marchés financiers. Il entretient des relations commerciales et institutionnelles en Argentine, aux États-Unis et en Europe.'
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
      e.preventDefault();
      var msg = contactForm.querySelector('.form-msg');
      var submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (msg) {
        msg.textContent = mercosurText('contact.form.sending', 'Enviando tu consulta…');
        msg.className = 'form-msg';
      }
      if (submitBtn) submitBtn.disabled = true;

      var formData = new FormData(contactForm);

      fetch('https://formsubmit.co/ajax/info@camaracomerciomercosur.org', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          return res.json();
        })
        .then(function () {
          if (msg) {
            msg.textContent = mercosurText('contact.form.success', 'Tu consulta fue enviada. Nos pondremos en contacto a la brevedad.');
            msg.className = 'form-msg ok';
          }
          contactForm.reset();
        })
        .catch(function () {
          if (msg) {
            msg.textContent = mercosurText('contact.form.error', 'No pudimos enviar tu consulta. Intenta nuevamente.');
            msg.className = 'form-msg err';
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
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
        date: '7/1/26',
        image: 'assets/images/news-uruguay-presidencia.jpg',
        content: {
          es: {
            title: 'Uruguay asume la presidencia de MERCOSUR',
            teaser: 'Uruguay asume el liderazgo con una agenda de apertura y modernización.',
            body: [
              'Uruguay asumió la presidencia pro témpore del Mercosur durante la 68ª Cumbre de Jefes de Estado y Estados Asociados, realizada en Luque, Paraguay, con una agenda centrada en modernizar el bloque, fortalecer la integración regional y acelerar la concreción de acuerdos comerciales que generen resultados tangibles para los países miembros.',
              'Al recibir la conducción del organismo, el presidente Yamandú Orsi sostuvo que el escenario internacional demanda mayor cooperación y no respuestas aisladas. En ese sentido, afirmó que el diálogo y la construcción de consensos son herramientas indispensables para enfrentar los desafíos actuales y recordó que el Mercosur nació hace 35 años con el propósito de transformar intereses comunes en oportunidades de crecimiento conjunto.',
              'El mandatario aseguró que Uruguay buscará consolidar los avances alcanzados por el bloque reafirmando principios como la democracia, los derechos humanos, las libertades fundamentales y el Estado de derecho, pilares que consideró esenciales para fortalecer la confianza entre los socios. Además, expresó la solidaridad de Uruguay con Venezuela por los recientes terremotos y felicitó a los nuevos presidentes electos de Perú y Colombia.',
              'La estrategia uruguaya fue complementada por el canciller Mario Lubetkin, quien anunció que durante este semestre se impulsará la implementación de los acuerdos comerciales ya alcanzados con la Unión Europea, la Asociación Europea de Libre Comercio (EFTA) y Singapur. Asimismo, Uruguay organizará en diciembre el primer Consejo del Acuerdo Interino Mercosur-Unión Europea y un Foro Empresarial para potenciar los vínculos económicos.',
              'Uruguay ejercerá la presidencia pro témpore del Mercosur hasta diciembre con el objetivo de consolidar un bloque más dinámico, abierto al mundo y orientado a generar beneficios concretos para la región.',
            ],
            source: 'Portada. (2026, 30 de junio). <em>Uruguay asume la presidencia del Mercosur con la promesa de impulsar un bloque más moderno y orientado a resultados</em>. <a href="https://www.portada.com.uy/uruguay-asume-la-presidencia-del-mercosur-con-la-promesa-de-impulsar-un-bloque-mas-moderno-y-orientado-a-resultados-93879" target="_blank" rel="noopener">Portada</a>.'
          },
          fr: {
            title: 'L\'Uruguay assume la présidence du MERCOSUR',
            teaser: 'L\'Uruguay prend le leadership avec un programme d\'ouverture et de modernisation.',
            body: [
              'L\'Uruguay a assumé la présidence pro tempore du Mercosur lors du 68e Sommet des Chefs d\'État et d\'États Associés, qui s\'est tenu à Luque, au Paraguay, avec un programme axé sur la modernisation du bloc, le renforcement de l\'intégration régionale et l\'accélération de la réalisation d\'accords commerciaux générant des résultats concrets pour les pays membres.',
              'Lors de sa prise de fonction à la tête de l\'organisation, le président Yamandú Orsi a déclaré que le contexte international exigeait une coopération renforcée, et non des réponses isolées. En ce sens, il a affirmé que le dialogue et la recherche de consensus étaient des outils essentiels pour relever les défis actuels et a rappelé que le Mercosur avait été fondé il y a 35 ans dans le but de transformer les intérêts communs en opportunités de croissance mutuelle.',
              'Le président a affirmé que l\'Uruguay cherchera à consolider les progrès accomplis par le bloc en réaffirmant des principes tels que la démocratie, les droits de l\'homme, les libertés fondamentales et l\'État de droit, piliers qu\'il considère essentiels pour renforcer la confiance entre les membres. Il a également exprimé la solidarité de l\'Uruguay avec le Venezuela suite aux récents séismes et a félicité les nouveaux présidents élus du Pérou et de la Colombie.',
              'La stratégie de l\'Uruguay a été complétée par le chancelier Mario Lubetkin, qui a annoncé que, durant ce semestre, la mise en œuvre des accords commerciaux déjà conclus avec l\'Union européenne, l\'Association Européenne de Libre-Échange (AELE) et Singapour serait encouragée. Par ailleurs, l\'Uruguay organisera en décembre la première réunion du Conseil de l\'Accord Intérimaire Mercosur-Union Européenne ainsi qu\'un Forum d\'Affaires afin de renforcer les liens économiques.',
              'L\'Uruguay assurera la présidence pro tempore du Mercosur jusqu\'en décembre, dans le but de consolider un bloc plus dynamique, ouvert sur le monde et axé sur la génération de bénéfices concrets pour la région.',
            ],
            source: 'Portada. (30 juin 2026). <em>L\'Uruguay prend la présidence du Mercosur avec la promesse d\'impulser un bloc plus moderne et axé sur les résultats</em>. Portada.'
          }
        }
      },
      {
        id: 'balance-presidencia-paraguaya',
        date: '7/1/26',
        image: 'assets/images/news-presidencia-paraguaya-balance.jpg',
        content: {
          es: {
            title: 'Lo que dejó la presidencia paraguaya del MERCOSUR',
            teaser: 'El bloque regional impulsa acuerdos históricos para facilitar trámites, conectividad y movilidad.',
            body: [
              'La Presidencia Pro Tempore de Paraguay en 2026 concluyó con importantes avances para la integración regional del MERCOSUR, destacándose un acuerdo histórico sobre reconocimiento de firma digital entre los Estados parte. Esta medida permitirá agilizar trámites, reducir costos y facilitar operaciones comerciales y administrativas entre los países miembros. Además, se avanzó en iniciativas de transformación digital que buscan modernizar los servicios públicos y fortalecer la cooperación tecnológica dentro del bloque.',
              'En materia de integración fronteriza, el MERCOSUR impulsó acciones orientadas a mejorar la movilidad de personas y mercancías, optimizar controles y fortalecer la coordinación entre autoridades de frontera. Estos avances buscan hacer más eficiente la circulación regional y favorecer el desarrollo económico y social de las comunidades fronterizas, consolidando una agenda de integración más práctica y cercana a la ciudadanía. Los resultados obtenidos durante la presidencia paraguaya reflejan el objetivo de construir un MERCOSUR más conectado, competitivo y moderno.',
            ],
            source: 'MERCOSUR. (2026, 1 de julio). <em>Un acuerdo histórico, avances en integración digital y fronteriza: lo que nos deja la Presidencia Paraguaya 2026 del MERCOSUR</em>. <a href="https://www.mercosur.int/un-acuerdo-historico-avances-en-integracion-digital-y-fronteriza-lo-que-nos-deja-la-presidencia-paraguaya-2026-del-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
          },
          fr: {
            title: 'Ce qu\'a laissé la présidence paraguayenne du MERCOSUR',
            teaser: 'Le bloc régional promeut des accords historiques pour faciliter les procédures, la connectivité et la mobilité.',
            body: [
              'La Présidence Pro Tempore du Paraguay en 2026 s\'est conclue par des progrès significatifs en matière d\'intégration régionale du MERCOSUR, notamment un accord historique sur la reconnaissance des signatures numériques entre les États membres. Cette mesure permettra de simplifier les procédures, de réduire les coûts et de faciliter les opérations commerciales et administratives entre les pays membres. Par ailleurs, des avancées ont été réalisées concernant les initiatives de transformation numérique visant à moderniser les services publics et à renforcer la coopération technologique au sein du bloc.',
              'Dans le domaine de l\'intégration frontalière, le MERCOSUR a promu des actions visant à améliorer la circulation de personnes et de marchandises, à optimiser les contrôles et à renforcer la coordination entre les autorités frontalières. Ces avancées cherchent à rendre la circulation régionale plus efficace et à favoriser le développement économique et social des communautés frontalières, consolidant ainsi un programme d\'intégration plus pratique et plus proche des citoyens. Les résultats obtenus sous la présidence paraguayenne témoignent de l\'objectif de construire un MERCOSUR plus connecté, plus compétitif et plus moderne.',
            ],
            source: 'MERCOSUR. (1er juillet 2026). <em>Un accord historique, des progrès en matière d\'intégration numérique et frontalière : l\'héritage de la Présidence paraguayenne du MERCOSUR 2026</em>. Secrétariat du MERCOSUR.'
          }
        }
      },
      {
        id: 'delegaciones-reuniones-cumbre',
        date: '6/29/26',
        image: 'assets/images/news-delegaciones-cumbre.jpg',
        content: {
          es: {
            title: 'Delegaciones del MERCOSUR realizan reuniones para la Cumbre',
            teaser: 'Los países miembros avanzan en acuerdos que serán presentados a los jefes de Estado.',
            body: [
              'Las delegaciones de Argentina, Brasil, Paraguay y Uruguay iniciaron en Asunción las reuniones preparatorias para la Cumbre del MERCOSUR, bajo la Presidencia Pro Tempore de Paraguay. Durante estos encuentros se analizan y consensúan proyectos de resoluciones, decisiones y recomendaciones que serán sometidos a consideración del Grupo Mercado Común (GMC) y del Consejo del Mercado Común (CMC), principales órganos encargados de la conducción política y ejecutiva del bloque. Estas sesiones buscan garantizar que los temas prioritarios lleguen con acuerdos previos a la reunión de los jefes de Estado.',
              'Las reuniones preparatorias forman parte del proceso de coordinación que antecede a la Cumbre del MERCOSUR, donde se definirán políticas relacionadas con la integración regional, el comercio y la cooperación entre los países miembros. El trabajo técnico y diplomático realizado por las delegaciones permite fortalecer el proceso de toma de decisiones y contribuir al desarrollo de iniciativas que impulsen el crecimiento económico y la integración del bloque.',
            ],
            source: 'MERCOSUR. (2026, 29 de junio). <em>Preparatorias para la Cumbre del MERCOSUR</em>. <a href="https://www.mercosur.int/preparatorias-para-la-cumbre-del-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
          },
          fr: {
            title: 'Les délégations du MERCOSUR tiennent des réunions au Sommet',
            teaser: 'Les pays membres progressent sur les accords qui seront présentés aux chefs d\'État.',
            body: [
              'Les délégations d\'Argentine, du Brésil, du Paraguay et d\'Uruguay ont entamé à Asunción des réunions préparatoires au Sommet du MERCOSUR, sous la Présidence Pro Tempore du Paraguay. Ces réunions permettent d\'analyser et de convenir de projets de résolutions, de décisions et de recommandations avant leur soumission au Groupe du Marché commun (GMC) et au Conseil du Marché Commun (CMC), principaux organes responsables de la direction politique et exécutive du bloc. Ces sessions cherchent à garantir un consensus sur les questions prioritaires avant la réunion des chefs d\'État.',
              'Les réunions préparatoires font partie du processus de coordination précédant le Sommet du MERCOSUR, où seront définies les politiques relatives à l\'intégration régionale, au commerce et à la coopération entre les pays membres. Le travail technique et diplomatique mené par les délégations permet de renforcer le processus décisionnel et contribue au développement d\'initiatives favorisant la croissance économique et l\'intégration du bloc.',
            ],
            source: 'MERCOSUR. (29 juin 2026). <em>Préparatifs pour le Sommet du MERCOSUR</em>. Secrétariat du MERCOSUR.'
          }
        }
      },
      {
        id: 'concurso-foto-video',
        date: '6/29/26',
        image: 'assets/images/news-concurso-foto-video.jpg',
        content: {
          es: {
            title: 'Concurso del MERCOSUR de fotografía y vídeo',
            teaser: 'La convocatoria invita a retratar la convivencia y diversidad cultural.',
            body: [
              'El MERCOSUR abrió la convocatoria para la octava edición de su Concurso de Fotografía y la segunda edición del Concurso de Reels, cuya temática de este año es "Integración Fronteriza". La iniciativa busca que los participantes capturen, a través de imágenes y videos, la convivencia cotidiana entre las comunidades fronterizas, resaltando tradiciones, costumbres, expresiones culturales y formas de vida compartidas que fortalecen la identidad regional.',
              'El concurso está dirigido a personas mayores de 18 años que sean ciudadanas de Argentina, Bolivia, Brasil, Paraguay o Uruguay. Las inscripciones son gratuitas y permanecerán abiertas hasta el 10 de agosto de 2026. Se premiarán las obras que destaquen por su creatividad, autenticidad y calidad artística, además de reconocer la capacidad de reflejar la riqueza humana y cultural presente en las zonas fronterizas del MERCOSUR. En la categoría de reels también se otorgará un Premio del Público, elegido mediante votación en la cuenta oficial de Instagram del bloque.',
              'Para presentar su fotografía o video, así como acceder a las bases y condiciones completas, ya pueden ingresar al sitio web <a href="https://www.mercosur.int/concursofotoreel" target="_blank" rel="noopener">mercosur.int/concursofotoreel</a>, hasta el 10 de agosto de 2026.',
            ],
            source: 'MERCOSUR. (2026, 29 de junio). <em>El concurso de fotografías y videos del MERCOSUR de este año está abierto y es sobre integración fronteriza</em>. <a href="https://www.mercosur.int/el-concurso-de-fotografias-y-videos-del-mercosur-de-este-ano-esta-abierto-y-es-sobre-integracion-fronteriza" target="_blank" rel="noopener">Secretaría del Mercosur</a>.'
          },
          fr: {
            title: 'Concours de photographie et de vidéo du MERCOSUR',
            teaser: 'L\'appel à candidatures invite à illustrer la coexistence et la diversité culturelle.',
            body: [
              'Le MERCOSUR a lancé l\'appel à candidatures pour la huitième édition de son Concours de Photographie et la deuxième édition de son Concours de Vidéos, dont le thème cette année est « L\'intégration Frontalière ». L\'initiative vise à permettre aux participants de capturer, à travers des images et vidéos, la cohabitation quotidienne des communautés frontalières, en mettant en lumière les traditions, coutumes, expressions culturelles et modes de vie partagés qui renforcent l\'identité régionale.',
              'Le concours est ouvert aux personnes âgées de 18 ans et plus, citoyennes d\'Argentine, de Bolivie, du Brésil, du Paraguay ou d\'Uruguay. L\'inscription est gratuite et restera ouverte jusqu\'au 10 août 2026. Les œuvres se distinguant par leur créativité, leur authenticité et leur qualité artistique seront primées, en plus de reconnaître la capacité à refléter la richesse humaine et culturelle présente dans les régions frontalières du MERCOSUR. Dans la catégorie « reels », un Prix du Public sera également décerné, suite à un vote sur le compte Instagram officiel du bloc.',
              'Pour soumettre votre photo ou vidéo, ainsi que pour accéder au règlement et conditions complètes, vous pouvez dès maintenant visiter le site web <a href="https://www.mercosur.int/concursofotoreel" target="_blank" rel="noopener">mercosur.int/concursofotoreel</a>, jusqu\'au 10 août 2026.',
            ],
            source: 'MERCOSUR. (29 juin 2026). <em>Le concours de photos et vidéos du MERCOSUR de cette année est ouvert et porte sur l\'intégration transfrontalière</em>. Secrétariat du Mercosur.'
          }
        }
      },
      {
        id: 'concluye-presidencia-paraguaya',
        date: '6/25/26',
        image: 'assets/images/news-concluye-presidencia-paraguaya.jpg',
        content: {
          es: {
            title: 'Concluye la presidencia paraguaya del MERCOSUR',
            teaser: 'Paraguay cierra su gestión destacando avances en comercio, digitalización y cooperación regional.',
            body: [
              'La Presidencia Pro Tempore de Paraguay culminó con la realización de la Cumbre del MERCOSUR en Asunción, donde se reunieron los jefes de Estado, cancilleres y delegaciones de los países miembros y asociados para evaluar los resultados del semestre. Durante la gestión paraguaya se llevaron a cabo más de 360 reuniones en distintos niveles institucionales, permitiendo avanzar en áreas estratégicas como la facilitación del comercio, la agenda digital, el fortalecimiento de los controles integrados en fronteras y el relacionamiento internacional del bloque.',
              'Con el cierre de esta etapa, Uruguay asumió la Presidencia Pro Tempore del MERCOSUR por los siguientes seis meses, dando continuidad a la rotación establecida entre los Estados Parte. La cumbre marcó el fin de una gestión orientada a consolidar la integración regional mediante el diálogo político, la cooperación y el desarrollo de iniciativas que fortalezcan la competitividad y la coordinación entre los países miembros.',
            ],
            source: 'MERCOSUR. (2026, 25 de junio). <em>Cierra la presidencia paraguaya del MERCOSUR</em>. <a href="https://www.mercosur.int/cierra-la-presidencia-paraguaya-del-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
          },
          fr: {
            title: 'La présidence paraguayenne du MERCOSUR prend fin',
            teaser: 'Le Paraguay conclut son mandat en soulignant les progrès réalisés dans le commerce, la numérisation et la coopération régionale.',
            body: [
              'La Présidence Pro Tempore du Paraguay s\'est conclue avec la réalisation du Sommet du MERCOSUR à Asunción, où chefs d\'État, ministres des Affaires étrangères et délégations des pays membres et associés se sont réunis pour évaluer les résultats du semestre. Durant ce mandat, plus de 360 réunions ont eu lieu à différents niveaux institutionnels, permettant des progrès dans des domaines stratégiques tels que la facilitation des échanges, la stratégie numérique, le renforcement des contrôles intégrés aux frontières et les relations internationales du bloc.',
              'À l\'issue de cette phase, l\'Uruguay a assumé la Présidence Pro Tempore du MERCOSUR pour les six prochains mois, perpétuant ainsi la rotation établie entre les États Membres. Le Sommet a marqué la fin d\'une période consacrée à la consolidation de l\'intégration régionale par le dialogue politique, la coopération et le développement d\'initiatives renforçant la compétitivité et la coordination entre les pays membres.',
            ],
            source: 'MERCOSUR. (25 juin 2026). <em>La présidence paraguayenne du MERCOSUR prend fin</em>. Secrétariat du MERCOSUR.'
          }
        }
      },
      {
        id: 'focem-avance-proyectos',
        date: '6/22/26',
        image: 'assets/images/news-focem-avance.jpg',
        content: {
          es: {
            title: 'Avance de Proyectos FOCEM en el Cierre de la Presidencia Paraguaya',
            teaser: 'La CRPM evalúa avances en proyectos del FOCEM antes del cierre de la gestión paraguaya.',
            body: [
              'La Comisión de Representantes Permanentes del MERCOSUR (CRPM) concluyó la gestión paraguaya de la Presidencia Pro Tempore, evaluando avances significativos en proyectos del Fondo para la Convergencia Estructural (FOCEM), incluyendo saneamiento básico para comunidades indígenas y el Parque Tecnológico de Sant\\\'Ana do Livramento. El encuentro también analizó informes semestrales de gestión presupuestaria, comunicación y formación interna del bloque.',
            ],
            source: 'MERCOSUR. (2026, 22 de junio). <em>Avance de nuevos proyectos del fondo del MERCOSUR y últimos informes de trabajo analizados por Representantes Permanentes en la Presidencia Pro Tempore Paraguaya saliente</em>. <a href="https://www.mercosur.int/avance-de-nuevos-proyectos-del-fondo-del-mercosur-y-ultimos-informes-de-trabajo-analizados-por-representantes-permanentes-en-la-presidencia-pro-tempore-paraguaya-saliente" target="_blank" rel="noopener">Secretaría del Mercosur</a>.'
          },
          fr: {
            title: 'Avancement des Projets du FOCEM à la Fermeture de la Présidence Paraguayenne',
            teaser: 'La CRPM évalue les progrès accomplis dans le cadre des projets FOCEM avant la fin de la gestion paraguayenne.',
            body: [
              'La Commission des Représentants Permanents du MERCOSUR (CRPM) a conclu la gestion paraguayenne de la Présidence Pro Tempore, en évaluant les progrès significatifs accomplis dans les projets du Fonds pour la Convergence Structurelle (FOCEM), notamment l\'assainissement de base pour les communautés autochtones et le Parc Technologique de Sant\'Ana do Livramento. La réunion a également examiné les rapports semestriels de gestion budgétaire, la communication et la formation interne au sein du bloc.',
            ],
            source: 'MERCOSUR. (22 juin 2026). <em>Avancement de nouveaux projets du fond du MERCOSUR et derniers rapports d\'activité analysés par les Représentants Permanents à la Présidence Pro Tempore Paraguayenne sortante</em>. Secrétariat du Mercosur.'
          }
        }
      },
      {
        id: 'efta-tratado-avances',
        date: '6/18/26',
        image: 'assets/images/news-efta-tratado.jpg',
        content: {
          es: {
            title: 'Avances en Tratado de Libre Comercio entre el MERCOSUR y la EFTA',
            teaser: 'Los congresos de Brasil y Uruguay aprueban de forma simultánea el proyecto de ley.',
            body: [
              'Las asambleas legislativas de Brasil y Uruguay aprobaron la ratificación oficial del Tratado de Libre Comercio que fue suscrito originalmente entre el MERCOSUR y los Estados de la Asociación Europea de Libre Comercio (EFTA). Esta alianza económica estratégica involucra de forma directa la cooperación de Islandia, Liechtenstein, Noruega y Suiza. El avance legislativo faculta la reducción progresiva de barreras aduaneras de importación y optimiza el flujo de inversiones tecnológicas recíprocas en Sudamérica. El resto de los parlamentos de los Estados Partes continúa gestionando sus respectivos procesos constitucionales internos para lograr la vigencia plena y conjunta de la norma arancelaria.',
            ],
            source: 'Secretaría del MERCOSUR. (2026, 18 de junio). <em>Avanza el proceso de ratificación del Acuerdo de Libre Comercio entre el MERCOSUR y la EFTA</em>. <a href="https://www.mercosur.int/tema/relacionamiento-externo" target="_blank" rel="noopener">Página Oficial del MERCOSUR</a>.'
          },
          fr: {
            title: 'Progrès sur l\'Accord de Libre-Échange entre le MERCOSUR et l\'AELE',
            teaser: 'Les congrès du Brésil et de l\'Uruguay approuvent simultanément le projet de loi.',
            body: [
              'Les assemblées législatives du Brésil et de l\'Uruguay ont officiellement ratifié l\'Accord de Libre-Échange initialement signé entre le MERCOSUR et les États de l\'Association Européenne de Libre-Échange (AELE). Cette alliance économique stratégique implique directement la coopération de l\'Islande, du Liechtenstein, de la Norvège et de la Suisse. Cette avancée législative permet la réduction progressive des droits de douane à l\'importation et optimise les flux d\'investissements technologiques réciproques en Amérique du Sud. Les parlements des autres États Membres poursuivent leurs processus constitutionnels internes respectifs afin de parvenir à la pleine et entière mise en œuvre de l\'accord tarifaire.',
            ],
            source: 'Secrétariat du MERCOSUR. (18 juin 2026). <em>Le processus de ratification de l\'Accord de Libre-Échange entre le MERCOSUR et l\'AELE est en cours</em>. Site officiel du MERCOSUR.'
          }
        }
      },
      {
        id: 'japon-acuerdo-economico',
        date: '6/17/26',
        image: 'assets/images/news-japon-acuerdo.jpg',
        content: {
          es: {
            title: 'Futuro impulso económico entre Sudamérica y Asia',
            teaser: 'El bloque sudamericano busca fortalecer el comercio y la inversión con una de las economías principales de Asia.',
            body: [
              'El MERCOSUR y Japón anunciaron el inicio de las negociaciones para un Acuerdo de Asociación Económica (AAE), una iniciativa que busca fortalecer las relaciones comerciales, ampliar el acceso a los mercados e impulsar las inversiones entre ambas partes. El anuncio representa un paso importante en la estrategia del bloque sudamericano para diversificar sus vínculos económicos y consolidar su presencia en la región Asia-Pacífico.',
              'Las negociaciones abarcarán temas relacionados con el comercio de bienes y servicios, la cooperación económica y la promoción de inversiones. Japón figura entre los principales socios comerciales del MERCOSUR, por lo que el acuerdo podría generar nuevas oportunidades para las empresas de ambas regiones, incrementar el intercambio comercial y fortalecer la integración económica internacional del bloque.',
            ],
            source: 'MERCOSUR. (2026, 30 de junio). <em>Lanzamiento de las negociaciones para un Acuerdo de Asociación Económica entre los Estados Partes del MERCOSUR y Japón</em>. <a href="https://www.mercosur.int/mercosur-y-japon-anuncian-el-inicio-de-negociaciones-para-un-acuerdo-de-asociacion-economica" target="_blank" rel="noopener">Secretaría del Mercosur</a>.'
          },
          fr: {
            title: 'Future impulsion économique entre l\'Amérique du Sud et l\'Asie',
            teaser: 'Le bloc sud-américain cherche à renforcer les échanges commerciaux et l\'investissement avec l\'une des principales économies d\'Asie.',
            body: [
              'Le MERCOSUR et le Japon ont annoncé l\'ouverture de négociations en vue d\'un Accord de Partenariat Économique (APE), une initiative visant à renforcer les relations commerciales, à élargir l\'accès aux marchés et à stimuler les investissements entre les deux parties. Cette annonce constitue une étape importante dans la stratégie du bloc sud-américain pour diversifier ses liens économiques et consolider sa présence dans la région Asie-Pacifique.',
              'Les négociations porteront sur des thèmes en lien avec le commerce des biens et des services, la coopération économique et la promotion des investissements. Le Japon étant l\'un des principaux partenaires commerciaux du MERCOSUR, cet accord pourrait créer de nouvelles opportunités pour les entreprises des deux régions, dynamiser les échanges commerciaux et renforcer l\'intégration économique internationale du bloc.',
            ],
            source: 'MERCOSUR. (30 juin 2026). <em>Lancement des négociations en vue d\'un Accord de Partenariat Économique entre les États Membres du MERCOSUR et le Japon</em>. Secrétariat du Mercosur.'
          }
        }
      },
      {
        id: 'agricultura-familiar-reaf',
        date: '6/12/26',
        image: 'assets/images/news-agricultura-familiar.jpg',
        content: {
          es: {
            title: 'Diálogo que impulsa el fortalecimiento de la agricultura familiar en el MERCOSUR',
            teaser: 'Representantes acordaron promover políticas para apoyar a los pequeños productores y el desarrollo rural.',
            body: [
              'La Reunión Especializada de Agricultura Familiar (REAF) del MERCOSUR reunió a autoridades gubernamentales, organizaciones de productores y organismos internacionales para fortalecer el diálogo regional sobre el futuro de la agricultura familiar. Durante el encuentro se analizaron temas prioritarios como el acceso a mercados, el financiamiento, la asistencia técnica y el intercambio de experiencias, con el objetivo de impulsar políticas públicas que favorezcan el desarrollo sostenible de los pequeños productores y mejoren su calidad de vida.',
              'Los participantes destacaron que la agricultura familiar desempeña un papel fundamental en la seguridad alimentaria, la reducción de las desigualdades y el desarrollo económico de las zonas rurales. Asimismo, reafirmaron el compromiso de los países del MERCOSUR de fortalecer la cooperación regional y generar recomendaciones conjuntas que permitan consolidar un sector agrícola más inclusivo, resiliente y competitivo frente a los desafíos actuales.',
            ],
            source: 'MERCOSUR. (2026, 12 de junio). <em>Diálogo regional para fortalecer la agricultura familiar en el MERCOSUR</em>. <a href="https://www.mercosur.int/dialogo-regional-para-fortalecer-la-agricultura-familiar-en-el-mercosur" target="_blank" rel="noopener">Secretaría de MERCOSUR</a>.'
          },
          fr: {
            title: 'Dialogue visant à promouvoir le renforcement de l\'agriculture familiale au MERCOSUR',
            teaser: 'Les représentants se sont engagés à promouvoir des politiques de soutien aux petits producteurs et au développement rural.',
            body: [
              'La Réunion Spécialisée sur l\'Agriculture Familiale (REAF) du MERCOSUR a réuni des autorités gouvernementales, des organisations de producteurs et des instances internationales afin de renforcer le dialogue régional sur l\'avenir de l\'agriculture familiale. Lors de cette réunion, des questions prioritaires telles que l\'accès aux marchés, le financement, l\'assistance technique et l\'échange d\'expériences ont été analysées, dans le but de promouvoir des politiques publiques favorisant le développement durable des petits producteurs et améliorant leurs conditions de vie.',
              'Les participants ont souligné le rôle fondamental de l\'agriculture familiale dans la sécurité alimentaire, la réduction des inégalités et le développement économique des zones rurales. Ils ont également réaffirmé l\'engagement des pays du MERCOSUR à renforcer la coopération régionale et à élaborer des recommandations communes pour consolider un secteur agricole plus inclusif, résilient et compétitif face aux défis actuels.',
            ],
            source: 'MERCOSUR. (12 juin 2026). <em>Dialogue régional pour renforcer l\'agriculture familiale au MERCOSUR</em>. Secrétariat du MERCOSUR.'
          }
        }
      },
      {
        id: 'cooperacion-espanola-aecid',
        date: '6/10/26',
        image: 'assets/images/news-cooperacion-espanola.jpg',
        content: {
          es: {
            title: 'MERCOSUR y la cooperación española fortalecen su alianza',
            teaser: 'Un nuevo acuerdo promoverá proyectos conjuntos, capacitación e intercambio de conocimientos.',
            body: [
              'El MERCOSUR y la Agencia Española de Cooperación Internacional para el Desarrollo (AECID) firmaron un Memorando de Entendimiento con el objetivo de fortalecer la cooperación institucional y apoyar el proceso de integración regional. El acuerdo establece un marco para desarrollar iniciativas conjuntas enfocadas en el fortalecimiento de las instituciones, el intercambio de conocimientos, la capacitación y la ejecución de proyectos de interés común que contribuyan al desarrollo sostenible de los Estados Parte.',
              'Durante la firma, representantes del MERCOSUR y de España destacaron que la cooperación internacional es una herramienta clave para enfrentar desafíos compartidos y consolidar una integración más sólida. El memorando también busca promover buenas prácticas, asistencia técnica y el desarrollo de capacidades, reafirmando el compromiso de ambas partes con una agenda de cooperación basada en el respeto mutuo, la solidaridad y el beneficio compartido.',
            ],
            source: 'MERCOSUR. (2026, 10 de junio). <em>El MERCOSUR y la cooperación española acordaron fortalecer su trabajo conjunto en apoyo a la integración regional</em>. <a href="https://www.mercosur.int/el-mercosur-y-la-cooperacion-espanola-acordaron-fortalecer-su-trabajo-conjunto-en-apoyo-a-la-integracion-regional" target="_blank" rel="noopener">Secretaria del MERCOSUR</a>.'
          },
          fr: {
            title: 'Le MERCOSUR et la coopération espagnole renforcent leur alliance',
            teaser: 'Un nouvel accord favorisera les projets conjoints, la formation et le partage des connaissances.',
            body: [
              'Le MERCOSUR et l\'Agence Espagnole de Coopération Internationale pour le Développement (AECID) ont signé un Mémorandum d\'Entente visant à renforcer la coopération institutionnelle et à soutenir le processus d\'intégration régionale. L\'accord établit un cadre pour le développement d\'initiatives conjointes axées sur le renforcement des institutions, l\'échange de connaissances, la formation et la mise en œuvre de projets d\'intérêt commun contribuant au développement durable des États Membres.',
              'Lors de la signature, les représentants du MERCOSUR et d\'Espagne ont souligné que la coopération internationale est un outil essentiel pour relever les défis communs et consolider une intégration plus forte. Le mémorandum vise également à promouvoir les meilleures pratiques, l\'assistance technique et le développement des capacités, réaffirmant ainsi l\'engagement des deux parties en faveur d\'une coopération fondée sur le respect mutuel, la solidarité et l\'intérêt partagé.',
            ],
            source: 'MERCOSUR. (10 juin 2026). <em>Le MERCOSUR et la coopération espagnole ont convenu de renforcer leur action conjointe en soutien à l\'intégration régionale</em>. Secrétariat du MERCOSUR.'
          }
        }
      }
    ];

    var totalPages = Math.ceil(NEWS_ITEMS.length / PER_PAGE);

    function newsLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return lang;
    }

    function newsContent(item) {
      var lang = newsLang();
      return item.content[lang] || item.content.es;
    }

    function cardHTML(item) {
      var t = newsContent(item);
      var readMore = mercosurText('team.readMore', 'Read More');
      return (
        '<article class="post-card">' +
          '<a href="#" class="post-thumb" data-news-open="' + item.id + '"><img src="' + item.image + '" alt="' + t.title + '"></a>' +
          '<div class="post-body">' +
            '<div class="post-meta"><span>' + item.date + '</span></div>' +
            '<h3>' + t.title + '</h3>' +
            '<p>' + t.teaser + '</p>' +
            '<a href="#" class="post-link" data-news-open="' + item.id + '">' + readMore + '</a>' +
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

    function goToPage(page, scroll) {
      page = Math.max(1, Math.min(totalPages, page));
      currentPage = page;
      renderGrid(currentPage);
      renderPager(currentPage);
      if (scroll) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    pager.addEventListener('click', function (e) {
      var btn = e.target.closest('.pagination-btn');
      if (!btn || btn.disabled) return;
      var target = btn.getAttribute('data-page');
      if (target === 'prev') goToPage(currentPage - 1, true);
      else if (target === 'next') goToPage(currentPage + 1, true);
      else goToPage(parseInt(target, 10), true);
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
      var t = newsContent(item);
      var ov = buildOverlay();
      var bodyHTML = t.body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
      ov.innerHTML =
        '<div class="privacy-modal news-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          '<div class="news-modal-image"><img src="' + item.image + '" alt="' + t.title + '"></div>' +
          '<div class="news-modal-content">' +
            '<p class="news-modal-meta">' + item.date + '</p>' +
            '<h2 id="news-modal-title">' + t.title + '</h2>' +
            bodyHTML +
            '<p class="news-modal-source">' + t.source + '</p>' +
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

    document.addEventListener('mercosur:langchange', function () {
      renderGrid(currentPage);
    });

    goToPage(1);
  })();

  /* ---------- Newsletter form (delivers to info@camaracomerciomercosur.org via FormSubmit) ---------- */
  var newsletterForm = document.querySelector('#newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      var msg = newsletterForm.querySelector('.form-msg');
      var submitBtn = newsletterForm.querySelector('button[type="submit"]');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());

      if (!emailOk) {
        msg.textContent = mercosurText('newsletter.invalidEmail', 'Ingresa un correo electrónico válido.');
        msg.className = 'form-msg err';
        return;
      }

      msg.textContent = mercosurText('newsletter.sending', 'Enviando…');
      msg.className = 'form-msg';
      if (submitBtn) submitBtn.disabled = true;

      fetch('https://formsubmit.co/ajax/info@camaracomerciomercosur.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: input.value.trim(),
          _subject: 'Nueva suscripción al newsletter — Cámara de Comercio Mercosur'
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          return res.json();
        })
        .then(function () {
          msg.textContent = mercosurText('newsletter.success', '¡Listo! Te avisaremos de próximas novedades.');
          msg.className = 'form-msg ok';
          newsletterForm.reset();
        })
        .catch(function () {
          msg.textContent = mercosurText('newsletter.error', 'No pudimos procesar tu suscripción. Intenta nuevamente.');
          msg.className = 'form-msg err';
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
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
      msg.textContent = mercosurText('participation.proposal.success', 'Tu propuesta fue enviada. El equipo institucional la revisará y se contactará contigo.');
      msg.className = 'form-msg ok';
      proposalForm.reset();
    });
  }

  /* ---------- Privacy Policy modal ---------- */
  (function () {
    if (!document.querySelector('.js-privacy-link')) return;

    var overlay = null;

    var PRIVACY_CONTENT = {
      es:
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
        '<p style="font-size:.8rem;">Marco normativo de referencia: Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data; Decreto N.º 414/009; Decreto N.º 64/020; normas modificativas y criterios de la Unidad Reguladora y de Control de Datos Personales de Uruguay.</p>',

      en:
        '<p class="privacy-eyebrow">Mercosur Chamber of Commerce</p>' +
        '<h2 id="privacy-modal-title">Privacy Policy</h2>' +

        '<p>The Mercosur Chamber of Commerce recognizes the protection of personal data as an essential condition for building trusted relationships with companies, chambers of commerce, institutions, members, partners, and visitors to its website. This Privacy Policy clearly explains what information we may process, the purposes for which we use it, with whom it may be shared, how long it is retained, and how individuals may exercise the rights granted under applicable data protection laws.</p>' +

        '<h3>1. Identity and Scope of Application</h3>' +
        '<p>The Mercosur Chamber of Commerce, an international Uruguayan association headquartered at Carlos Quijano Street 1290, Suite 101, 11100 Montevideo, Uruguay, is the data controller responsible for the processing of personal data. Any questions regarding privacy or data protection may be sent to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>This Privacy Policy applies to personal data processed through the Chamber\'s website, its forms, electronic communications, and other digital channels related to the Chamber\'s institutional activities. It covers, among other things, general inquiries, expressions of interest, membership applications, cooperation proposals, business initiative submissions, inquiries regarding trade, internationalization, investment or financing, communications related to the press, privacy, compliance and integrity, as well as voluntary subscriptions to institutional communications.</p>' +
        '<p>Whenever an activity, event, contractual relationship, integrity investigation, or any other type of data processing requires additional information, the Chamber may provide a specific privacy notice or clause to supplement this Privacy Policy.</p>' +

        '<h3>2. Legal Framework and Principles</h3>' +
        '<p>The processing of personal data is governed primarily by Law No. 18,331 on Personal Data Protection and the Habeas Data Action of the Oriental Republic of Uruguay, its Regulatory Decree No. 414/009, Decree No. 64/020, and all other applicable complementary, regulatory, and related legal provisions. Whenever foreign legislation applies due to the territory, the data subject, or the nature of the activity, the Chamber will implement any additional safeguards required under the applicable legal framework.</p>' +
        '<p>The Chamber processes personal data in accordance with the principles of lawfulness, fairness, transparency, purpose limitation, proportionality, data minimization, accuracy, security, confidentiality, limited retention, and institutional accountability. We collect only the information necessary for the stated purposes and make every reasonable effort to keep it accurate, up to date, and secure.</p>' +

        '<h3>3. Data We Process and Their Sources</h3>' +
        '<p>Depending on the nature of the relationship or inquiry, we may process identification and contact information, professional and institutional details, country, business sector, organization, position, website, message content, communication preferences, records of consent, and basic technical data related to website navigation and security.</p>' +
        '<p>We may also process the information necessary to evaluate membership applications, cooperation proposals, or business initiatives, as well as data intended to prevent fraud, identity impersonation, unauthorized use of the Chamber\'s institutional identity, unauthorized access, or security incidents.</p>' +
        '<p>Personal data may be obtained directly from the data subject, from the organization they represent, through professional communications, from third parties with a legitimate legal basis to provide such information, or from publicly available sources, provided that their use is compatible with the purpose for which the information was made public, is relevant, and is permitted under applicable law.</p>' +
        '<p>When a person provides personal data relating to a third party, they must have a valid legal basis for doing so and, where applicable, inform the third party accordingly. The Chamber may request proof of such authorization, provide the privacy information directly to the data subject, or refrain from processing the data if its legitimacy cannot be verified.</p>' +
        '<p>Unless expressly requested and submitted through an appropriate channel, identity documents, banking information, medical records, political, religious, or trade union information, criminal records, trade secrets, complete investment files, or any other particularly sensitive or highly confidential information should not be sent through open forms.</p>' +

        '<h3>4. Purposes of Data Processing</h3>' +
        '<p>We process personal data to receive, classify, and respond to inquiries; manage expressions of interest; evaluate membership applications; review cooperation proposals; carry out an initial assessment of business initiatives; direct inquiries to relevant chambers of commerce, institutions, or specialists; manage institutional relationships; send communications when authorized; protect the Chamber\'s name, brand, and digital assets; handle communications related to privacy, compliance, and integrity; ensure the security of the website; prevent fraud and identity impersonation; comply with legal obligations; and respond to lawful requests from competent authorities.</p>' +
        '<p>The submission of an inquiry, initiative, or application does not imply its acceptance, admission as a member, the granting of any representative status, the approval of funding, or the automatic creation of a contractual relationship.</p>' +

        '<h3>5. Legal Basis for Processing</h3>' +
        '<p>Personal data will be processed based on the data subject\'s consent, the handling of a request, the implementation of preliminary measures related to a potential institutional or contractual relationship, the performance of a validly established relationship, compliance with legal obligations, or in any other circumstances where applicable law permits or exempts the processing of personal data without the need for consent.</p>' +
        '<p>Where processing is based on consent, such consent may be withdrawn at any time by contacting <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, without affecting the lawfulness of any processing carried out prior to its withdrawal.</p>' +

        '<h3>6. Forms and Nature of the Data</h3>' +
        '<p>Fields marked as required are necessary to process and respond to an inquiry or application. If they are not completed, the Chamber may be unable to handle the request properly. Optional fields allow users to provide additional context and may be left blank.</p>' +
        '<p>The data subject is responsible for ensuring that the information provided is accurate, up to date, and relevant. The Chamber may request additional information or clarification whenever the data provided is insufficient, inconsistent, or unsuitable for the stated purpose.</p>' +

        '<h3>7. Institutional Communications</h3>' +
        '<p>The Chamber will send newsletters, updates, invitations, and other periodic institutional communications only when there is a valid legal basis to do so. Whenever consent is required, the corresponding option will be presented separately, will be optional, and will not be pre-selected.</p>' +
        '<p>Individuals may unsubscribe at any time by using the link included in the communication or by sending an email to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>. Withdrawal of consent will not affect other communications that are necessary to manage an existing relationship or request.</p>' +

        '<h3>8. Recipients and Service Providers</h3>' +
        '<p>The Chamber does not sell personal data or use it for commercial purposes unrelated to its institutional activities.</p>' +
        '<p>We may use technology, professional, and specialized service providers acting on behalf of the Chamber, including hosting, email, online forms, data storage, maintenance, security, data analytics, contact management, and communication services. These providers must process personal data according to documented instructions, maintain confidentiality, and implement appropriate security measures.</p>' +
        '<p>Personal data may also be shared with other chambers of commerce, associations, institutions, professionals, financial institutions, investors, development organizations, public authorities, or advisors when the individual has expressly requested such action, has given informed consent, or when the disclosure is authorized by applicable law.</p>' +
        '<p>When the disclosure is not strictly necessary to process an expressly submitted request and is not supported by another legal basis, the Chamber will request prior authorization and will inform the individual of the recipient and the purpose of the disclosure.</p>' +

        '<h3>9. International Data Transfers</h3>' +
        '<p>The international nature of the Chamber and the use of technology services may involve the processing of or access to personal data from countries other than Uruguay.</p>' +
        '<p>International data transfers will be carried out in accordance with Article 23 of Law No. 18,331, to countries or organizations that provide an adequate level of data protection, or through the authorizations, exceptions, contractual clauses, or other safeguards recognized by applicable law and by the Regulatory and Supervisory Unit for Personal Data Protection.</p>' +
        '<p>Information about service providers and processing locations may be updated whenever the technological tools used are defined or modified.</p>' +

        '<h3>10. Data Retention</h3>' +
        '<p>Personal data will be retained for as long as necessary to fulfill the purposes for which it was collected and to comply with legal, institutional, or legal defense obligations. General inquiries will be kept during their processing and for a reasonable follow-up period. Membership, cooperation, or participation requests will be retained during their evaluation and for the time necessary to document the decision. Business initiatives will be retained during their review, development, or completion, and for as long as liabilities may arise.</p>' +
        '<p>Data used for institutional communications will be retained until consent is withdrawn or an unsubscribe request is received. Integrity-related communications will be retained throughout their review, investigation, and for the applicable legal retention periods. Technical and security logs will be retained for periods proportionate to their purpose.</p>' +
        '<p>When personal data is no longer needed, it will be deleted, anonymized, or blocked for the applicable legal retention periods.</p>' +

        '<h3>11. Security and Incidents</h3>' +
        '<p>The Chamber adopts reasonable technical and organizational measures to protect personal data against loss, alteration, unauthorized access, disclosure, or processing. These measures may include access controls, permission management, encryption in transit, backups, system updates, confidentiality obligations, service provider selection, and incident response procedures.</p>' +
        '<p>No system is completely secure. If the Chamber becomes aware of a security breach, it will immediately take the necessary measures to contain, investigate, and document the incident, and will notify the Regulatory and Supervisory Unit for Personal Data Protection and the affected individuals, as required by applicable law.</p>' +

        '<h3>12. Individual Rights</h3>' +
        '<p>Individuals have the right to know whether the Chamber processes their personal data, to access it, request its correction, updating, inclusion, or deletion where applicable, withdraw consent, and submit inquiries or observations regarding the processing of their data. They may also challenge personal assessments that significantly affect their rights or interests and that are based exclusively or primarily on the processing of personal data, where applicable.</p>' +
        '<p>These rights may be exercised free of charge by contacting <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, specifying the right to be exercised and providing sufficient information to verify the individual\'s identity in a proportionate manner.</p>' +
        '<p>The Chamber will respond to requests for access, correction, updating, inclusion, or deletion within a maximum of five business days from receipt, without prejudice to any other deadlines that may apply depending on the nature of the request. When necessary, additional information may be requested to confirm the individual\'s identity or clarify the scope of the request.</p>' +
        '<p>Individuals may also submit inquiries or file complaints with the Regulatory and Supervisory Unit for Personal Data Protection of Uruguay: <a href="https://www.gub.uy/unidad-reguladora-control-datos-personales/" target="_blank" rel="noopener">www.gub.uy/unidad-reguladora-control-datos-personales</a>.</p>' +

        '<h3>13. Cookies, Links, and Minors</h3>' +
        '<p>The website may use cookies and similar technologies to enable its operation, maintain security, remember user preferences, and, where applicable, collect statistical information. Strictly necessary cookies may be used without consent where permitted by law. Analytical, advertising, or third-party cookies will be subject to the corresponding information and authorization requirements.</p>' +
        '<p>Detailed information about the technologies actually used, their providers, storage periods, and purposes will be available in the Cookie Policy and in the website\'s cookie preference panel.</p>' +
        '<p>The website may contain links to third-party websites, including the official MERCOSUR website and other organizations. The Chamber does not control the privacy practices of those websites and recommends reviewing their privacy policies before providing any personal data.</p>' +
        '<p>The website and the Chamber\'s general services are not intended for minors. The Chamber does not knowingly collect personal data from minors through its general forms. If it becomes aware that it has received personal data from a minor without a valid legal basis, it will take reasonable steps to delete or regularize such data.</p>' +

        '<h3>14. Integrity Channel and Automated Decision-Making</h3>' +
        '<p>Communications related to fraud, corruption, conflicts of interest, identity impersonation, unauthorized use of the Chamber\'s brand, or other institutional violations will be handled with restricted access and in accordance with the applicable institutional procedures. Confidentiality will be preserved within legal and operational limits. The Chamber does not guarantee anonymity unless the reporting channel and the procedure used are specifically designed to ensure it.</p>' +
        '<p>The Chamber does not make decisions that produce legal effects or similarly significant consequences based solely on the automated processing of personal data. If automated assessment systems are implemented in the future, the Chamber will provide prior information about their logic, scope, and safeguards whenever required by applicable law.</p>' +

        '<h3>15. Updates and Contact</h3>' +
        '<p>The Chamber may update this Privacy Policy to reflect legal, technological, organizational, or operational changes. The current version will always be available on the website and will indicate its publication date. Whenever significant changes are made, the Chamber will make reasonable efforts to inform users.</p>' +
        '<p>For any questions regarding this Privacy Policy or the processing of personal data, please contact <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +

        '<p class="privacy-signature">Mercosur Chamber of Commerce. Uruguayan International Association. Carlos Quijano Street 1290, Suite 101, 11100 Montevideo, Uruguay.</p>' +
        '<p style="font-size:.8rem;">Legal Framework: Law No. 18,331 on Personal Data Protection and Habeas Data; Decree No. 414/009; Decree No. 64/020; related regulations; and the guidelines issued by the Regulatory and Supervisory Unit for Personal Data Protection of Uruguay.</p>',

      pt:
        '<p class="privacy-eyebrow">Câmara de Comércio Mercosul</p>' +
        '<h2 id="privacy-modal-title">Política de Privacidade</h2>' +

        '<p>A Câmara de Comércio Mercosul reconhece a proteção dos dados pessoais como uma condição essencial para construir relações de confiança com empresas, câmaras de comércio, instituições, associados, colaboradores e usuários do site. Esta Política explica, de forma clara, quais informações podemos tratar, para quais finalidades as utilizamos, com quem elas podem ser compartilhadas, por quanto tempo são conservadas e como podem ser exercidos os direitos reconhecidos pela legislação aplicável.</p>' +

        '<h3>1. Identidade e Âmbito de Aplicação</h3>' +
        '<p>A responsável pelo tratamento dos dados é a Câmara de Comércio Mercosul, associação internacional uruguaia com sede na Rua Carlos Quijano 1290, Sala 101, 11.100, Montevidéu, Uruguai. As consultas relacionadas à privacidade ou à proteção de dados podem ser encaminhadas para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Esta Política aplica-se aos dados pessoais tratados por meio do site, de seus formulários, das comunicações eletrônicas e dos demais canais digitais vinculados às atividades institucionais da Câmara. Abrange, entre outros, consultas gerais, manifestações de interesse, solicitações de associação, propostas de cooperação, apresentação de iniciativas empresariais, consultas sobre comércio, internacionalização, investimentos ou financiamento, comunicações relacionadas à imprensa, privacidade, conformidade e integridade, bem como inscrições voluntárias para o recebimento de comunicações institucionais.</p>' +
        '<p>Sempre que uma atividade, evento, relação contratual, investigação de integridade ou outro tratamento exigir informações adicionais, a Câmara poderá fornecer uma cláusula ou aviso específico que complemente esta Política.</p>' +

        '<h3>2. Marco Legal e Princípios</h3>' +
        '<p>O tratamento de dados pessoais é regido, principalmente, pela Lei nº 18.331 de Proteção de Dados Pessoais e Ação de Habeas Data da República Oriental do Uruguai, por seu Decreto Regulamentador nº 414/009, pelo Decreto nº 64/020 e pelas demais normas complementares, regulamentares e correlatas. Quando uma legislação estrangeira for aplicável em razão do território, da pessoa envolvida ou da atividade desenvolvida, a Câmara adotará as garantias adicionais que forem pertinentes.</p>' +
        '<p>A Câmara trata os dados em conformidade com os princípios da legalidade, lealdade, transparência, finalidade específica, proporcionalidade, minimização, exatidão, segurança, confidencialidade, conservação limitada e responsabilidade institucional. Coletamos apenas as informações necessárias para a finalidade informada e buscamos mantê-las atualizadas e protegidas.</p>' +

        '<h3>3. Dados que Tratamos e sua Origem</h3>' +
        '<p>Dependendo da relação estabelecida ou da consulta realizada, podemos tratar dados de identificação e contato, informações profissionais e institucionais, país, setor de atuação, organização, cargo, site, conteúdo das mensagens, preferências de comunicação, registros de consentimento e dados técnicos básicos relacionados à navegação e à segurança do site.</p>' +
        '<p>Também podemos tratar as informações necessárias para avaliar solicitações de associação, cooperação ou apresentação de iniciativas, bem como dados destinados à prevenção de fraudes, falsificação de identidade, uso não autorizado da identidade institucional, acessos indevidos ou incidentes de segurança.</p>' +
        '<p>Os dados podem ser fornecidos diretamente pelo titular, pela organização que ele representa, por meio de comunicações profissionais, por terceiros que possuam base legítima para fornecê-los ou por fontes acessíveis ao público, desde que sua utilização seja compatível com a finalidade para a qual foram publicados, seja pertinente e esteja autorizada pela legislação aplicável.</p>' +
        '<p>Quando uma pessoa fornecer dados de terceiros, deverá possuir uma base legal legítima para fazê-lo e informá-los, quando cabível. A Câmara poderá solicitar comprovação dessa autorização, fornecer diretamente as informações sobre privacidade ou abster-se de tratar os dados caso não seja possível verificar sua legitimidade.</p>' +
        '<p>Salvo solicitação expressa e por meio de um canal apropriado, não devem ser enviados documentos de identidade, dados bancários, informações médicas, dados políticos, religiosos ou sindicais, antecedentes criminais, segredos empresariais, dossiês completos de investimento nem qualquer outra informação especialmente sensível ou altamente confidencial por meio de formulários abertos.</p>' +

        '<h3>4. Finalidades do Tratamento</h3>' +
        '<p>Tratamos os dados para receber, classificar e responder consultas; gerenciar manifestações de interesse; avaliar solicitações de associação; analisar propostas de cooperação; realizar uma avaliação inicial de iniciativas empresariais; direcionar consultas para câmaras, instituições ou especialistas relevantes; administrar relações institucionais; enviar comunicações quando houver autorização; proteger o nome, a marca e os ativos digitais da Câmara; atender comunicações relacionadas à privacidade, conformidade e integridade; garantir a segurança do site; prevenir fraudes e falsificação de identidade; cumprir obrigações legais e atender solicitações válidas de autoridades competentes.</p>' +
        '<p>A apresentação de uma consulta, iniciativa ou solicitação não implica sua aceitação, a admissão como associado, a concessão de representação, a obtenção de financiamento nem a criação automática de uma relação contratual.</p>' +

        '<h3>5. Bases Legais</h3>' +
        '<p>O tratamento será realizado com base no consentimento da pessoa interessada, no atendimento de uma solicitação ou na adoção de medidas preliminares para uma possível relação institucional ou contratual, na execução de uma relação validamente estabelecida, no cumprimento de obrigações legais ou nas hipóteses em que a legislação permita ou dispense o tratamento sem a necessidade de consentimento.</p>' +
        '<p>Quando o tratamento estiver fundamentado no consentimento, este poderá ser revogado a qualquer momento mediante comunicação para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, sem prejuízo da licitude do tratamento realizado anteriormente.</p>' +

        '<h3>6. Formulários e Natureza dos Dados</h3>' +
        '<p>Os campos identificados como obrigatórios são necessários para processar a consulta ou solicitação. Caso não sejam preenchidos, a Câmara poderá não estar em condições de atendê-la adequadamente. Os campos opcionais permitem fornecer informações adicionais de contexto e podem permanecer em branco.</p>' +
        '<p>A pessoa interessada deve assegurar que as informações fornecidas sejam exatas, atualizadas e pertinentes. A Câmara poderá solicitar esclarecimentos quando os dados forem insuficientes, contraditórios ou inadequados para a finalidade informada.</p>' +

        '<h3>7. Comunicações Institucionais</h3>' +
        '<p>A Câmara enviará boletins informativos, novidades, convites ou outras comunicações institucionais periódicas somente quando houver uma base legal suficiente para isso. Sempre que for necessário o consentimento, a respectiva opção será apresentada em campo separado, será facultativa e não aparecerá previamente marcada.</p>' +
        '<p>A pessoa poderá cancelar sua inscrição a qualquer momento por meio do link incluído na comunicação ou enviando um e-mail para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>. A revogação do consentimento não afetará outras comunicações necessárias para a gestão de uma relação ou solicitação já existente.</p>' +

        '<h3>8. Destinatários e Prestadores de Serviços</h3>' +
        '<p>A Câmara não comercializa dados pessoais nem os utiliza para finalidades comerciais alheias às suas atividades institucionais.</p>' +
        '<p>Podemos recorrer a prestadores de serviços tecnológicos, profissionais e especialistas que atuem em nome da Câmara, como serviços de hospedagem, correio eletrônico, formulários, armazenamento, manutenção, segurança, análise de dados, gestão de contatos ou comunicações. Esses prestadores deverão tratar os dados de acordo com instruções documentadas, manter a confidencialidade e adotar medidas de segurança adequadas.</p>' +
        '<p>Os dados também poderão ser compartilhados com outras câmaras de comércio, associações, instituições, profissionais, instituições financeiras, investidores, organismos de desenvolvimento, autoridades ou assessores quando a pessoa tiver solicitado expressamente essa atuação, tiver concedido seu consentimento informado ou quando o compartilhamento estiver autorizado pela legislação aplicável.</p>' +
        '<p>Quando o compartilhamento não for estritamente necessário para atender a uma solicitação expressamente formulada nem estiver amparado por outra base legal, a Câmara solicitará autorização prévia e informará o destinatário e a finalidade do compartilhamento.</p>' +

        '<h3>9. Transferências Internacionais</h3>' +
        '<p>A natureza internacional da Câmara e a utilização de serviços tecnológicos podem implicar o tratamento ou o acesso aos dados a partir de países diferentes do Uruguai.</p>' +
        '<p>As transferências internacionais serão realizadas em conformidade com o artigo 23 da Lei nº 18.331, para países ou organizações que ofereçam nível adequado de proteção ou mediante as autorizações, exceções, cláusulas contratuais ou outras garantias reconhecidas pela legislação aplicável e pela Unidade Reguladora e de Controle de Dados Pessoais.</p>' +
        '<p>As informações sobre prestadores de serviços e locais de tratamento poderão ser atualizadas sempre que as ferramentas tecnológicas utilizadas forem definidas ou modificadas.</p>' +

        '<h3>10. Conservação dos Dados</h3>' +
        '<p>Os dados serão conservados pelo tempo necessário para cumprir a finalidade para a qual foram coletados e para atender às obrigações legais, institucionais ou de defesa de direitos. As consultas gerais serão mantidas durante sua tramitação e por um período razoável de acompanhamento; as solicitações de associação, cooperação ou participação serão conservadas durante sua avaliação e pelo tempo necessário para documentar a decisão; e as iniciativas empresariais serão mantidas durante sua análise, desenvolvimento ou encerramento, bem como enquanto puderem decorrer responsabilidades.</p>' +
        '<p>Os dados utilizados para comunicações institucionais serão conservados até que o consentimento seja revogado ou seja solicitada a exclusão da inscrição. As comunicações relacionadas à integridade serão mantidas durante sua análise, investigação e pelos prazos legais aplicáveis. Os registros técnicos e de segurança serão conservados por períodos proporcionais à sua finalidade.</p>' +
        '<p>Quando os dados deixarem de ser necessários, serão eliminados, anonimizados ou bloqueados durante os prazos de responsabilidade aplicáveis.</p>' +

        '<h3>11. Segurança e Incidentes</h3>' +
        '<p>A Câmara adota medidas técnicas e organizacionais razoáveis para proteger os dados contra perda, alteração, acesso, divulgação ou tratamento não autorizado. Essas medidas podem incluir controles de acesso, gestão de permissões, criptografia em trânsito, cópias de segurança, atualização de sistemas, obrigações de confidencialidade, seleção de prestadores de serviços e procedimentos de resposta a incidentes.</p>' +
        '<p>Nenhum sistema é completamente infalível. Caso a Câmara tome conhecimento de uma violação de segurança, adotará imediatamente as medidas necessárias para contê-la, investigá-la e documentá-la, bem como realizará as comunicações à Unidade Reguladora e de Controle de Dados Pessoais e às pessoas afetadas, nos termos exigidos pela legislação aplicável.</p>' +

        '<h3>12. Direitos dos Usuários</h3>' +
        '<p>Os usuários podem verificar se a Câmara trata seus dados, acessá-los, solicitar sua retificação, atualização, inclusão ou exclusão, quando cabível, revogar o consentimento e apresentar consultas ou observações relacionadas ao tratamento. Também podem contestar avaliações pessoais que afetem significativamente seus direitos ou interesses e que se baseiem exclusiva ou principalmente em tratamentos de dados pessoais, quando aplicável.</p>' +
        '<p>Os direitos podem ser exercidos gratuitamente mediante comunicação para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, indicando o direito que se deseja exercer e fornecendo informações suficientes para verificar a identidade de forma adequada.</p>' +
        '<p>A Câmara responderá às solicitações de acesso, retificação, atualização, inclusão ou exclusão no prazo máximo de cinco dias úteis a partir de seu recebimento, sem prejuízo de outros prazos que possam ser aplicáveis conforme a natureza da solicitação. Quando necessário, poderá solicitar informações adicionais para confirmar a identidade ou esclarecer o alcance do pedido.</p>' +
        '<p>As pessoas também poderão apresentar consultas ou registrar reclamações perante a Unidade Reguladora e de Controle de Dados Pessoais do Uruguai: <a href="https://www.gub.uy/unidad-reguladora-control-datos-personales/" target="_blank" rel="noopener">www.gub.uy/unidad-reguladora-control-datos-personales</a>.</p>' +

        '<h3>13. Cookies, Links e Menores de Idade</h3>' +
        '<p>O site poderá utilizar cookies e tecnologias semelhantes para permitir seu funcionamento, manter a segurança, lembrar preferências e, quando aplicável, obter informações estatísticas. Os cookies estritamente necessários poderão ser utilizados sem consentimento quando a legislação assim o permitir. Os cookies analíticos, publicitários ou de terceiros estarão sujeitos às informações e à autorização correspondentes.</p>' +
        '<p>As informações detalhadas sobre as tecnologias efetivamente utilizadas, seus fornecedores, período de armazenamento e finalidade serão apresentadas na Política de Cookies e no painel de preferências do site.</p>' +
        '<p>O site poderá conter links para páginas de terceiros, incluindo o site oficial do MERCOSUL ou de outras organizações. A Câmara não controla as práticas de privacidade desses sites e recomenda que suas respectivas políticas sejam consultadas antes do fornecimento de dados pessoais.</p>' +
        '<p>O site e os serviços gerais da Câmara não são destinados a menores de idade. A Câmara não coleta conscientemente dados de menores por meio de seus formulários gerais. Caso identifique que recebeu dados de um menor sem uma base legal legítima, adotará medidas razoáveis para sua exclusão ou regularização.</p>' +

        '<h3>14. Canal de Integridade e Decisões Automatizadas</h3>' +
        '<p>As comunicações relacionadas a fraude, corrupção, conflitos de interesse, falsificação de identidade, uso indevido da marca ou outros descumprimentos institucionais serão tratadas com acesso restrito e de acordo com o procedimento institucional aplicável. A confidencialidade será preservada dentro dos limites legais e operacionais. A Câmara não garante o anonimato, salvo quando o canal e o procedimento utilizado permitirem assegurá-lo de forma efetiva.</p>' +
        '<p>A Câmara não adota decisões que produzam efeitos jurídicos ou consequências semelhantes com base exclusivamente no tratamento automatizado de dados pessoais. Caso, no futuro, sejam implementados sistemas de avaliação automatizada, a Câmara informará previamente sobre sua lógica, alcance e garantias, quando assim exigido pela legislação aplicável.</p>' +

        '<h3>15. Atualizações e Contato</h3>' +
        '<p>A Câmara poderá atualizar esta Política para adaptá-la a alterações legais, tecnológicas, organizacionais ou decorrentes de suas atividades. A versão vigente estará disponível no site e indicará sua data de publicação. Quando as alterações forem relevantes, a Câmara procurará comunicá-las por meios razoáveis.</p>' +
        '<p>Para qualquer consulta sobre esta Política ou sobre o tratamento de dados pessoais, entre em contato pelo e-mail <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +

        '<p class="privacy-signature">Câmara de Comércio Mercosul. Associação Internacional Uruguaia. Rua Carlos Quijano 1290, Sala 101, 11.100, Montevidéu, Uruguai.</p>' +
        '<p style="font-size:.8rem;">Marco legal de referência: Lei nº 18.331 de Proteção de Dados Pessoais e Ação de Habeas Data; Decreto nº 414/009; Decreto nº 64/020; demais normas complementares e critérios da Unidade Reguladora e de Controle de Dados Pessoais do Uruguai.</p>',
      fr:
        '<p class="privacy-eyebrow">Chambre de Commerce du Mercosur</p>' +
        '<h2 id="privacy-modal-title">Politique de Confidentialité</h2>' +

        '<p>La Chambre de Commerce du Mercosur reconnaît la protection des données personnelles comme une condition essentielle pour construire des relations de confiance avec les entreprises, chambres de commerce, institutions, partenaires, collaborateurs et les utilisateurs de son site web. Cette politique explique clairement quelles informations nous sommes susceptibles de traiter, à quelles fins nous les utilisons, avec qui elles peuvent être partagées, combien de temps elles sont conservées et comment peuvent s\'exercer les droits reconnus par la législation applicable.</p>' +

        '<h3>1. Identité et étendue</h3>' +
        '<p>La responsable du traitement est la Chambre de Commerce du Mercosur, association internationale uruguayenne située Calle Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay. Les questions relatives à la confidentialité ou protection des données peuvent être communiquées à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>La présente politique s\'applique aux données personnelles traitées par le biais du site web, de ses formulaires, des communications électroniques et autres canaux numériques liés à l\'activité institutionnelle de la Chambre. Elle concerne notamment les demandes d\'informations générales, les manifestations d\'intérêt, les demandes d\'adhésion, les propositions de coopération, les soumissions d\'initiatives commerciales, les demandes d\'informations sur le commerce, l\'internationalisation, l\'investissement ou le financement, les communiqués de presse, les questions de confidentialité, de conformité et d\'intégrité, ainsi que les abonnements volontaires à des communications institutionnelles.</p>' +
        '<p>Lorsqu\'une activité, un événement, une relation contractuelle, une enquête d\'intégrité ou tout autre traitement nécessite des informations supplémentaires, la Chambre pourra ajouter une clause ou un avis spécifique pour compléter la présente Politique.</p>' +

        '<h3>2. Cadre réglementaire et principes</h3>' +
        '<p>Le traitement des données personnelles est régi principalement par la Loi N° 18.331 de la Protection des Données Personnelles et Action de l\'Habeas Data de la République Orientale de l\'Uruguay, son Décret Réglementaire N° 414/009, le Décret N° 64/020, ainsi que par toute autre disposition modificative, réglementaire ou connexe. Lorsque la législation étrangère est applicable en raison du territoire, de la personne concernée ou de l\'activité exercée, la Chambre appliquera les garanties complémentaires correspondantes.</p>' +
        '<p>La Chambre traite les données conformément aux principes de légalité, d\'équité, de transparence, de finalité déterminée, de proportionnalité, de minimisation, d\'exactitude, de sécurité, de confidentialité, de conservation limitée et de responsabilité institutionnelle. Nous ne collectons que les informations nécessaires à la finalité déclarée et nous nous efforçons de les maintenir actualisées et protégées.</p>' +

        '<h3>3. Données que nous traitons et leur provenance</h3>' +
        '<p>Selon la nature de la relation ou de la demande, nous pouvons traiter des données d\'identification et de contact, des informations professionnelles et institutionnelles, le pays, le secteur, l\'organisation, le poste, le site web, le contenu des messages, les préférences de communication, la preuve du consentement et des données techniques de base relatives à la navigation et à la sécurité du site.</p>' +
        '<p>Nous pouvons également traiter les informations nécessaires pour évaluer des demandes de partenariat, de coopération ou de soumission d\'initiatives, ainsi que des données destinées à prévenir la fraude, l\'usurpation d\'identité, l\'utilisation non autorisée de l\'identité institutionnelle, des accès inappropriés ou des incidents de sécurité.</p>' +
        '<p>Les données peuvent provenir directement de la personne concernée, de l\'organisation qu\'elle représente, de communications professionnelles, de tiers ayant une base légitime pour les fournir ou de sources accessibles au public, à condition que leur utilisation soit compatible avec la finalité pour laquelle elles ont été publiées, qu\'elle soit pertinente et autorisée par la loi.</p>' +
        '<p>Lorsqu\'une personne fournit des données appartenant à des tiers, elle devra disposer d\'un fondement juridique légitime et les informer le cas échéant. La Chambre pourra exiger une preuve de cette autorisation, fournir directement les informations de protection des données ou s\'abstenir de traiter les données si leur légitimité ne peut être vérifiée.</p>' +
        '<p>Sauf demande expresse et par un canal approprié, les documents d\'identité, les coordonnées bancaires, les informations médicales, les données politiques, religieuses ou syndicales, les casiers judiciaires, les secrets commerciaux, les dossiers d\'investissement complets ou toute autre information particulièrement sensible ou hautement confidentielle ne doivent pas être transmis par le biais de formulaires ouverts.</p>' +

        '<h3>4. Finalités du traitement</h3>' +
        '<p>Nous traitons les données pour recevoir, classer et répondre aux demandes de renseignements ; gérer des manifestations d\'intérêt ; évaluer des demandes d\'adhésion ; analyser des propositions de coopération ; réaliser une évaluation initiale d\'initiatives commerciales ; orienter les demandes de renseignements vers les chambres, institutions ou spécialistes compétents ; gérer les relations institutionnelles ; envoyer des communications lorsque cela est autorisé ; protéger le nom, la marque et les actifs numériques de la Chambre ; gérer les communications relatives à la confidentialité, à la conformité et à l\'intégrité ; assurer la sécurité du site ; prévenir la fraude et l\'usurpation d\'identité ; respecter les obligations légales et répondre aux demandes valides des autorités.</p>' +
        '<p>Le fait de soumettre une demande de renseignements, une initiative ou une requête n\'implique pas son acceptation, son admission en tant qu\'associé, l\'octroi d\'une représentation, l\'obtention d\'un financement ni la création automatique d\'une relation contractuelle.</p>' +

        '<h3>5. Fondements juridiques</h3>' +
        '<p>Le traitement sera effectué sur la base du consentement de la personne concernée, du traitement d\'une demande ou de l\'adoption de mesures préalables à une éventuelle relation institutionnelle ou contractuelle, de l\'exécution d\'une relation valablement établie, du respect des obligations légales ou des cas dans lesquels la réglementation autorise ou exclut le traitement sans consentement.</p>' +
        '<p>Lorsque le traitement est fondé sur le consentement, celui-ci peut être retiré à tout moment en envoyant une communication à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, sans que cela n\'affecte la licéité du traitement effectué antérieurement.</p>' +

        '<h3>6. Formulaires et nature des données</h3>' +
        '<p>Les champs marqués comme obligatoires sont nécessaires au traitement de la demande. S\'ils ne sont pas remplis, la Chambre risque de ne pas pouvoir la traiter correctement. Les champs facultatifs permettent d\'apporter des précisions et peuvent être laissés vides.</p>' +
        '<p>La personne intéressée doit s\'assurer que les informations soient exactes, à jour et pertinentes. La Chambre pourra demander des précisions si les données sont insuffisantes, contradictoires ou inadaptées pour la finalité déclarée.</p>' +

        '<h3>7. Communications institutionnelles</h3>' +
        '<p>La Chambre n\'enverra de lettres d\'information, de mises à jour, d\'invitations ou autres communications institutionnelles périodiques que si elle dispose d\'une base légale suffisante. Lorsque le consentement est demandé, la case à cocher sera distincte, facultative et non pré-cochée.</p>' +
        '<p>La personne pourra se désinscrire à tout moment en utilisant le lien inclus dans la communication ou en écrivant à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>. Le retrait du consentement n\'aura aucune incidence sur les autres communications nécessaires à la gestion d\'une relation ou d\'une demande existante.</p>' +

        '<h3>8. Destinataires et fournisseurs</h3>' +
        '<p>La Chambre ne vend pas de données personnelles et ne les utilise pas à des fins commerciales sans lien avec son activité institutionnelle.</p>' +
        '<p>Nous pouvons faire appel à des prestataires de services technologiques, professionnels et autres agissant pour le compte de la Chambre, tels que ceux assurant l\'hébergement, la messagerie électronique, les formulaires, le stockage, la maintenance, la sécurité, l\'analyse de données, la gestion des contacts ou les communications. Ces prestataires seront tenus de traiter les données conformément aux instructions documentées, de garantir leur confidentialité et de mettre en œuvre des mesures de sécurité appropriées.</p>' +
        '<p>Les données pourront également être communiquées à d\'autres chambres de commerce, associations, institutions, professionnels, entités financières, investisseurs, organismes de développement, autorités ou conseillers lorsque la personne concernée en a fait expressément la demande, a donné son consentement éclairé ou lorsque la communication est autorisée par la réglementation applicable.</p>' +
        '<p>Lorsque la communication n\'est pas strictement nécessaire pour répondre à une demande expressément formulée ou n\'est pas couverte par un autre fondement juridique, la Chambre demandera une autorisation préalable et informera le destinataire et le but de la communication.</p>' +

        '<h3>9. Transferts internationaux</h3>' +
        '<p>Le caractère international de la Chambre et l\'utilisation de services technologiques peuvent impliquer le traitement ou l\'accès à des données depuis des pays autres que l\'Uruguay.</p>' +
        '<p>Les transferts internationaux seront effectués conformément à l\'article 23 de la Loi N° 18.331, vers des pays ou des organisations présentant un niveau de protection adéquat ou par le biais des autorisations, exceptions, clauses contractuelles ou autres garanties reconnues par la réglementation et par l\'Unité de Réglementation et de Contrôle des Données Personnelles.</p>' +
        '<p>Les informations relatives aux prestataires et aux lieux de traitement pourront être mises à jour lorsque les outils technologiques utilisés seront définis ou modifiés.</p>' +

        '<h3>10. Conservation des données</h3>' +
        '<p>Les données seront conservées aussi longtemps que nécessaire pour atteindre l\'objectif pour lequel elles ont été collectées et respecter les obligations légales, institutionnelles ou de défense. Les demandes générales seront conservées pendant la durée de leur traitement et une période de suivi raisonnable ; les demandes d\'association, de coopération ou de participation seront conservées pendant la durée de leur évaluation et le temps nécessaire à la documentation de la décision ; et les initiatives commerciales seront conservées pendant la durée de leur analyse, de leur développement ou de leur clôture, et aussi longtemps que des responsabilités pourraient en découler.</p>' +
        '<p>Les données utilisées pour les communications institutionnelles seront conservées jusqu\'au retrait du consentement ou à la demande de désabonnement. Les communications relatives à l\'intégrité seront conservées pendant la durée de leur analyse, de leur enquête et pendant les délais légaux applicables. Les documents techniques et de sécurité seront conservés pendant des durées proportionnées à leur finalité.</p>' +
        '<p>Lorsque les données ne seront plus nécessaires, elles seront supprimées, anonymisées ou bloquées pendant les périodes de responsabilité correspondantes.</p>' +

        '<h3>11. Sécurité et incidents</h3>' +
        '<p>La Chambre met en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les données contre la perte, l\'altération, l\'accès, la divulgation ou le traitement non autorisé. Ces mesures peuvent inclure des contrôles d\'accès, la gestion des autorisations, le chiffrement en transit, les sauvegardes, les mises à jour du système, les obligations de confidentialité, la sélection des fournisseurs et les procédures de réponse face aux incidents.</p>' +
        '<p>Aucun système n\'est complètement infaillible. Dès qu\'elle constate une faille de sécurité, la Chambre prend immédiatement les mesures nécessaires pour la contenir, enquêter dessus et la documenter, et en informera l\'Unité de Contrôle et de Réglementation des Données Personnelles ainsi que les personnes concernées, conformément aux termes exigés par la réglementation applicable.</p>' +

        '<h3>12. Droits des personnes</h3>' +
        '<p>Les personnes peuvent savoir si la Chambre traite leurs données, y accéder, en demander la rectification, la mise à jour, l\'ajout ou la suppression le cas échéant, retirer leur consentement et soumettre des demandes d\'informations ou des observations relatives au traitement. Elles peuvent également contester les décisions les concernant qui affectent significativement leurs droits ou leurs intérêts et qui sont fondées exclusivement ou principalement sur le traitement de données personnelles, le cas échéant.</p>' +
        '<p>Les droits peuvent être exercés gratuitement en envoyant un courrier à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, en indiquant le droit qui souhaite être exercé et en fournissant des informations suffisantes pour vérifier l\'identité de manière proportionnée.</p>' +
        '<p>La Chambre répondra aux demandes d\'accès, de rectification, de mise à jour, d\'ajout ou de suppression dans un délai maximal de cinq jours ouvrables à compter de leur réception, sans préjudice des autres délais pouvant s\'appliquer selon la nature de la demande. Le cas échéant, elle pourra demander des renseignements complémentaires afin de confirmer l\'identité ou de préciser la portée de la demande.</p>' +
        '<p>Les personnes peuvent également faire des demandes de renseignements ou déposer des plaintes auprès de l\'Unité de Réglementation et de Contrôle des Données Personnelles de l\'Uruguay : <a href="https://www.gub.uy/unidad-reguladora-control-datos-personales/" target="_blank" rel="noopener">www.gub.uy/unidad-reguladora-control-datos-personales</a>.</p>' +

        '<h3>13. Cookies, liens et mineurs</h3>' +
        '<p>Le site web peut utiliser des cookies et des technologies similaires pour permettre son fonctionnement, garantir la sécurité, mémoriser des préférences et, le cas échéant, recueillir des informations statistiques. Les cookies strictement nécessaires pourront être utilisés sans consentement lorsque la loi le permet. Les cookies analytiques, publicitaires ou tiers seront soumis aux informations et autorisations requises.</p>' +
        '<p>Les informations détaillées sur les technologies effectivement installées, leurs fournisseurs, leur durée et leur finalité seront incluses dans la Politique de Cookies et dans le panneau de préférences du site.</p>' +
        '<p>Le site peut contenir des liens vers des pages tierces, notamment le site officiel du MERCOSUR ou d\'autres organisations. La Chambre n\'exerce aucun contrôle sur leurs pratiques de confidentialité et recommande de consulter leurs politiques applicables avant de communiquer des données personnelles.</p>' +
        '<p>Le site web et les services généraux de la Chambre ne s\'adressent pas aux mineurs. La Chambre ne collecte pas sciemment de données auprès de mineurs via ses formulaires généraux. Si elle détecte avoir reçu des données d\'un mineur sans fondement légitime, elle prendra les mesures nécessaires pour leur suppression ou régularisation.</p>' +

        '<h3>14. Canal d\'Intégrité et décisions automatisées</h3>' +
        '<p>Les communications relatives à la fraude, la corruption, les conflits d\'intérêts, l\'usurpation d\'identité, l\'utilisation abusive de marques ou autres infractions seront traitées de manière confidentielle et conformément aux procédures institutionnelles applicables. La confidentialité sera assurée dans les limites légales et opérationnelles. La Chambre ne garantit l\'anonymat que si le canal et la procédure utilisés le permettent effectivement.</p>' +
        '<p>La Chambre n\'adopte pas de décisions produisant des effets juridiques ou des conséquences similaires fondées exclusivement sur le traitement automatisé de données personnelles. Si des systèmes d\'évaluation automatisée sont mis en œuvre à l\'avenir, un avis préalable sera donné concernant leur logique, leur portée et les garanties quand la réglementation l\'exige.</p>' +

        '<h3>15. Mises à jour et contact</h3>' +
        '<p>La Chambre peut mettre à jour la présente politique afin de l\'adapter aux changements réglementaires, technologiques, organisationnels ou dérivés de ses activités. La version en vigueur sera disponible sur le site web et indiquera sa date de publication. En cas de modifications importantes, la Chambre s\'efforcera d\'en informer ses membres par des moyens raisonnables.</p>' +
        '<p>Pour toute question concernant cette Politique ou le traitement des données personnelles, vous pouvez écrire à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +

        '<p class="privacy-signature">Chambre de Commerce du Mercosur. Association internationale uruguayenne. Rue Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay.</p>' +
        '<p style="font-size:.8rem;">Cadre réglementaire de référence : Loi N° 18.331 de Protection des Données Personnelles et d\'Action en Habeas Data ; Décret N° 414/009 ; Décret N° 64/020 ; règles de modifications et critères de l\'Unité de Réglementation et de Contrôle des Données Personnelles de l\'Uruguay.</p>'

    };

    function currentLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return PRIVACY_CONTENT[lang] ? lang : 'es';
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'privacy-modal-title');
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePrivacy();
      });
      return overlay;
    }

    function openPrivacy() {
      var ov = buildOverlay();
      ov.innerHTML =
        '<div class="privacy-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          PRIVACY_CONTENT[currentLang()] +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closePrivacy);
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

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-privacy-link');
      if (!trigger) return;
      e.preventDefault();
      openPrivacy();
    });
  })();

  /* ---------- Cookie Policy modal (footer link) ---------- */
  (function () {
    if (!document.querySelector('.js-cookies-policy-link')) return;

    var overlay = null;

    var cookiesPolicyHTML = {
      es:
        '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
        '<h2 id="cookies-policy-modal-title">Política de Cookies</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Julio de 2026 · Aplicable al sitio web institucional camaracomerciomercosur.org</p>' +
        '<h3>1. Objeto y alcance de esta Política</h3>' +
        '<p>La presente Política de Cookies informa sobre la utilización de cookies y tecnologías similares en el sitio web institucional de la Cámara de Comercio Mercosur. Su finalidad es explicar, con un lenguaje claro, qué funciones pueden desarrollar estas tecnologías, cómo se distinguen las herramientas indispensables de aquellas que requieren una decisión previa de la persona usuaria y de qué manera pueden administrarse, modificarse o retirarse las preferencias de navegación.</p>' +
        '<p>La Política se aplica al dominio institucional y, cuando corresponda, a sus subdominios, áreas restringidas, páginas de eventos, formularios integrados y demás servicios digitales incorporados directamente bajo control de la Cámara. Los portales o servicios externos a los que se acceda mediante enlaces se rigen por sus propias condiciones, salvo respecto de las tecnologías que se activen dentro de las páginas de la Cámara antes de abandonar el sitio.</p>' +
        '<p>Este documento complementa la Política de Privacidad. La Política de Privacidad regula el tratamiento general de datos personales, mientras que esta Política se concentra en el almacenamiento, recuperación, transmisión o utilización de información mediante navegadores, dispositivos y tecnologías equivalentes.</p>' +
        '<h3>2. Identificación institucional</h3>' +
        '<p>El responsable del sitio es la Cámara de Comercio Mercosur, asociación internacional uruguaya, con domicilio en Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay. Las consultas relacionadas con esta Política, con el funcionamiento del panel de preferencias o con el tratamiento de datos vinculado a cookies podrán dirigirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>3. Marco jurídico y principios aplicables</h3>' +
        '<p>Uruguay no cuenta con una norma autónoma dedicada exclusivamente a las cookies. Sin embargo, cuando estas tecnologías permiten recoger, almacenar, relacionar, transmitir o utilizar información vinculada con una persona, un navegador o un dispositivo, su empleo queda comprendido en la normativa uruguaya de protección de datos personales. En particular, resultan relevantes la Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data, el Decreto N.º 414/009, el Decreto N.º 64/020 y los criterios emitidos por la Unidad Reguladora y de Control de Datos Personales.</p>' +
        '<p>La Cámara aplicará los principios de información, finalidad, proporcionalidad, minimización, seguridad, confidencialidad, conservación limitada y responsabilidad. Cuando una tecnología no sea estrictamente necesaria para prestar una función solicitada o garantizar la seguridad del sitio, su activación dependerá de una elección previa, informada y revocable de la persona usuaria.</p>' +
        '<h3>4. Correspondencia entre la información y el funcionamiento técnico</h3>' +
        '<p>La transparencia exige que la información jurídica, el banner de cookies, el panel de configuración y el funcionamiento real del sitio coincidan. La Cámara adoptará medidas razonables para impedir la activación de tecnologías opcionales antes de una elección válida, asegurar que el rechazo produzca efectos reales, permitir la modificación posterior de las preferencias y corregir cualquier divergencia detectada entre esta Política y la configuración técnica.</p>' +
        '<p>La Cámara no considerará cumplida esta obligación mediante la mera publicación de un texto. El inventario de tecnologías, la clasificación de sus finalidades y la configuración del mecanismo de consentimiento se revisarán tanto cuando se incorporen nuevas herramientas o cambien proveedores como mediante comprobaciones periódicas razonables, aun cuando no se hayan identificado modificaciones aparentes en el sitio.</p>' +
        '<h3>5. Qué son las cookies y las tecnologías similares</h3>' +
        '<p>Una cookie es un pequeño archivo o fragmento de información que puede almacenarse en el navegador o dispositivo cuando una persona visita un sitio web. Según su finalidad, puede servir para mantener una sesión, proteger formularios, recordar preferencias, conservar una elección, mejorar el funcionamiento, medir el rendimiento o habilitar contenidos proporcionados por terceros.</p>' +
        '<p>No todas las cookies identifican directamente a una persona. No obstante, algunas pueden asociarse con direcciones IP, identificadores, dispositivos, navegadores, sesiones o patrones de navegación y, por tanto, llegar a constituir datos personales o permitir la individualización de una persona usuaria.</p>' +
        '<p>La expresión “cookies” se utiliza en esta Política en sentido amplio e incluye, cuando desarrollen funciones equivalentes, el almacenamiento local o de sesión, píxeles, etiquetas, balizas web, scripts, identificadores de dispositivo, herramientas de medición y otras tecnologías que puedan incorporarse al sitio.</p>' +
        '<h3>6. Clasificación según quién las gestione y su duración</h3>' +
        '<h4>Cookies propias y cookies de terceros</h4>' +
        '<p>Las cookies propias son gestionadas desde dominios, sistemas o servicios bajo control de la Cámara y pueden emplearse para seguridad, mantenimiento de sesión, protección de formularios, gestión de preferencias o funcionamiento técnico. Las cookies de terceros son administradas por proveedores externos cuyos servicios se integran en el sitio, por ejemplo, herramientas de medición, videos, mapas, redes sociales, calendarios, formularios, gestión de eventos, pasarelas de pago o servicios de seguridad.</p>' +
        '<p>Cuando intervenga un tercero, este podrá realizar tratamientos propios conforme a sus condiciones y políticas. La Cámara procurará seleccionar y configurar las integraciones de forma respetuosa con la privacidad, sin que ello sustituya la información que cada proveedor deba ofrecer respecto de sus propios tratamientos.</p>' +
        '<h4>Cookies de sesión y cookies persistentes</h4>' +
        '<p>Las cookies de sesión suelen eliminarse al cerrar el navegador o finalizar la sesión. Las cookies persistentes permanecen durante un periodo determinado o hasta que la persona usuaria las elimine. La duración concreta dependerá de la función y configuración de cada herramienta y deberá reflejarse en el inventario técnico cuando haya sido verificada.</p>' +
        '<h3>7. Clasificación según su finalidad</h3>' +
        '<h4>Cookies estrictamente necesarias</h4>' +
        '<p>Son las indispensables para permitir el funcionamiento esencial y seguro del sitio o prestar una función expresamente solicitada por la persona usuaria. Su utilización se limitará a supuestos en los que resulte necesaria para mantener la seguridad, gestionar una sesión, proteger formularios, equilibrar cargas, prevenir usos fraudulentos, conservar la elección sobre cookies o facilitar el acceso a áreas restringidas. Estas tecnologías podrán activarse sin una elección adicional únicamente cuando su función sea estrictamente técnica o necesaria para atender la solicitud de la persona usuaria; esta categoría no se utilizará para encubrir medición, publicidad, personalización o funciones de conveniencia.</p>' +
        '<p>La persona usuaria puede bloquearlas desde su navegador, aunque ello podría afectar sesiones, formularios, seguridad, preferencias o determinadas áreas del sitio.</p>' +
        '<h4>Cookies funcionales o de preferencias</h4>' +
        '<p>Estas tecnologías pueden recordar opciones como idioma, región, tamaño de texto, accesibilidad, configuración de reproducción u otras preferencias. Aunque mejoran la experiencia, no siempre son imprescindibles. Cuando no sean necesarias para una función solicitada, permanecerán desactivadas hasta que exista consentimiento.</p>' +
        '<h4>Cookies analíticas o de medición</h4>' +
        '<p>Las herramientas analíticas pueden ayudar a conocer el número de visitas, páginas consultadas, duración aproximada, origen general del tráfico, errores técnicos, rendimiento o interacción con contenidos. Aunque los resultados se presenten de forma agregada, pueden intervenir direcciones IP, identificadores o información del dispositivo. Como criterio general, las cookies analíticas no esenciales deberán permanecer desactivadas hasta que la persona las acepte.</p>' +
        '<h4>Cookies publicitarias y de elaboración de perfiles</h4>' +
        '<p>En la fecha de publicación de esta Política, el sitio no utilizará cookies destinadas a publicidad comportamental ni a la elaboración de perfiles, salvo que una auditoría técnica verifique lo contrario antes de su entrada en vigor. Si en el futuro se incorporaran estas finalidades, la Política y el panel deberán actualizarse previamente, las tecnologías correspondientes permanecerán desactivadas hasta obtener una elección específica y no se utilizarán para adoptar decisiones relevantes sobre personas sin las garantías legales aplicables.</p>' +
        '<h4>Cookies de redes sociales y contenidos externos</h4>' +
        '<p>Los videos, mapas, publicaciones incrustadas, botones sociales, calendarios, chats, formularios externos, herramientas de eventos, reservas o pagos pueden requerir tecnologías de terceros. Cuando estas no sean necesarias, el contenido permanecerá bloqueado hasta que la persona autorice la categoría correspondiente. Siempre que la implementación técnica lo permita, podrá ofrecerse una autorización contextual limitada al servicio concreto, sin exigir la aceptación global de otras categorías opcionales. Una vez activado el contenido, el proveedor puede recibir información sobre el navegador, dispositivo, dirección IP o interacción.</p>' +
        '<h3>8. Inventario de tecnologías utilizadas</h3>' +
        '<p>El inventario vigente de cookies y tecnologías similares deberá reflejar la configuración técnica efectiva del sitio. Para cada herramienta o grupo homogéneo se indicarán, cuando hayan sido comprobados, el proveedor, los nombres técnicos relevantes, la finalidad, la categoría, la condición de propia o de tercero, la duración, el momento de activación y la posible existencia de acceso internacional a información.</p>' +
        '<p>La Cámara no atribuirá al sitio herramientas, proveedores, duraciones o finalidades que no hayan sido verificados. Cuando varias cookies compartan proveedor, finalidad y categoría, podrán describirse de forma conjunta para facilitar la comprensión, siempre que no se omita información relevante. El inventario actualizado podrá mostrarse en el panel de preferencias o en la sección correspondiente del sitio y deberá revisarse antes de incorporar nuevas integraciones.</p>' +
        '<h3>9. Consentimiento y opciones disponibles</h3>' +
        '<p>Las cookies no necesarias solo deberán activarse después de un consentimiento previo, libre, informado, específico, inequívoco, verificable y revocable. La mera navegación, el desplazamiento por la página, la inactividad, el cierre del aviso o la utilización continuada del sitio no se interpretarán como aceptación. Tampoco se utilizarán casillas pre marcadas para categorías opcionales.</p>' +
        '<p>La primera capa informativa deberá ofrecer, con visibilidad comparable, las opciones de aceptar todas, rechazar las no necesarias y configurar preferencias, además de un acceso a esta Política. Las tecnologías estrictamente necesarias podrán funcionar automáticamente; las restantes dependerán de la elección realizada.</p>' +
        '<p>El diseño del aviso y del panel evitará fórmulas engañosas o manipulativas. No se dificultará el rechazo ni se destacará de forma desproporcionada la aceptación. Las categorías opcionales aparecerán desactivadas por defecto y solo se activarán después de una acción afirmativa válida.</p>' +
        '<p>Cuando la persona seleccione “Rechazar las no necesarias”, el sitio no activará cookies opcionales ni los scripts asociados a ellas, y mantendrá bloqueados los contenidos externos que dependan de esas tecnologías. Podrá conservarse únicamente la información técnica indispensable para recordar y respetar esa preferencia.</p>' +
        '<h3>10. Panel de preferencias y retirada del consentimiento</h3>' +
        '<p>El panel permitirá consultar las categorías, conocer sus finalidades, identificar los proveedores, revisar la duración disponible y activar o desactivar opciones. La persona podrá modificar su decisión en cualquier momento mediante un enlace permanente, icono de privacidad u opción accesible desde el pie de página.</p>' +
        '<p>La retirada deberá ser tan sencilla como la aceptación. No afectará a la licitud del tratamiento realizado antes de retirarse, pero impedirá futuras activaciones de las tecnologías opcionales. Cuando sea técnicamente posible, el gestor eliminará o desactivará las cookies opcionales ya instaladas; si alguna permanece almacenada en el dispositivo, la persona podrá eliminarla desde su navegador. Cualquier activación indebida detectada deberá investigarse y corregirse sin demoras injustificadas.</p>' +
        '<p>La modificación de preferencias podrá afectar exclusivamente a la categoría o servicio seleccionado. Cuando un contenido externo se haya autorizado de forma contextual, la persona deberá poder revocar esa autorización sin alterar necesariamente el resto de sus elecciones.</p>' +
        '<h3>11. Registro y duración de las preferencias</h3>' +
        '<p>El sitio podrá conservar una evidencia técnica mínima de la elección para recordar preferencias, respetar el rechazo, acreditar el consentimiento y evitar mostrar repetidamente el aviso. Este registro podrá incluir la fecha, la versión del aviso, las categorías seleccionadas, un identificador técnico limitado y la fecha de modificación o retirada.</p>' +
        '<p>La evidencia de consentimiento no se utilizará como una herramienta adicional de seguimiento ni contendrá información superior a la necesaria. Las preferencias podrán mantenerse durante un periodo razonable y volverán a solicitarse cuando expire el registro, cambien de forma sustancial las finalidades o proveedores, se incorporen nuevas categorías o exista una exigencia jurídica, técnica o de seguridad.</p>' +
        '<h3>12. Gestión desde el navegador</h3>' +
        '<p>La mayoría de los navegadores permite consultar, bloquear, limitar o eliminar cookies desde sus opciones de privacidad y seguridad. Esta posibilidad es complementaria al panel del sitio y no sustituye la obligación de respetar la elección de la persona usuaria. El bloqueo general de cookies puede afectar sesiones, formularios, preferencias, contenidos, áreas restringidas o funciones de seguridad.</p>' +
        '<h3>13. Datos personales, proveedores y transferencias internacionales</h3>' +
        '<p>Según la herramienta utilizada, las cookies pueden implicar el tratamiento de direcciones IP, identificadores, características del navegador o dispositivo, sistema operativo, idioma, páginas visitadas, fecha y hora, origen de navegación, interacciones, preferencias o errores técnicos. La información concreta dependerá de la configuración efectiva y deberá limitarse a la finalidad informada.</p>' +
        '<p>Algunos proveedores pueden almacenar, procesar o acceder a información desde otros países. Cuando corresponda, la Cámara informará sobre el proveedor, la naturaleza del servicio y las garantías aplicables, en coordinación con la Política de Privacidad. No se afirmará la inexistencia de transferencias internacionales sin haber verificado todos los servicios incorporados.</p>' +
        '<h3>14. Derechos de las personas</h3>' +
        '<p>Cuando las cookies impliquen tratamiento de datos personales, podrán ejercerse los derechos reconocidos por la normativa uruguaya, incluidos, cuando correspondan, los derechos de acceso, rectificación, actualización, inclusión y supresión y, si existieran valoraciones automatizadas o elaboración de perfiles, los derechos específicamente vinculados a esos tratamientos. Las solicitudes podrán dirigirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> y se gestionarán de acuerdo con la Política de Privacidad y la normativa aplicable.</p>' +
        '<p>Cuando un proveedor externo trate datos bajo su propia responsabilidad, también puede resultar necesario ejercer determinados derechos directamente ante ese proveedor. La Cámara facilitará la identificación del servicio cuando disponga de información suficiente para hacerlo.</p>' +
        '<h3>15. Menores de edad</h3>' +
        '<p>El sitio institucional no está diseñado específicamente para elaborar perfiles de menores, mostrarles publicidad comportamental ni recabar deliberadamente información mediante tecnologías opcionales dirigidas a ese público. Si en el futuro se incorporaran servicios destinados específicamente a menores, se adoptarán medidas reforzadas y se actualizarán la información y los mecanismos de consentimiento aplicables.</p>' +
        '<h3>16. Seguridad, control técnico y auditoría</h3>' +
        '<p>La Cámara adoptará medidas razonables para limitar tecnologías innecesarias, revisar scripts e integraciones, mantener actualizado el gestor de consentimiento, restringir accesos, respetar el rechazo y evitar reactivaciones no autorizadas. También revisará el inventario cuando se incorpore o elimine una herramienta, cambie un proveedor, aparezca una nueva cookie, varíe su duración o se modifique el sistema de consentimiento.</p>' +
        '<p>El inventario será objeto de revisiones periódicas razonables y de revisiones adicionales cuando se produzcan cambios técnicos relevantes. La automatización de esas comprobaciones dependerá de las capacidades del gestor utilizado, pero no sustituirá la responsabilidad de verificar que la información publicada y la configuración efectiva continúen siendo correctas. Cuando se detecte una divergencia, se adoptarán medidas para corregirla sin demoras indebidas.</p>' +
        '<h3>17. Cambios sustanciales y actualización de la Política</h3>' +
        '<p>La Cámara podrá actualizar esta Política por cambios legales, nuevos criterios de la Unidad Reguladora y de Control de Datos Personales, modificaciones tecnológicas, incorporación de proveedores, nuevas finalidades o cambios del sitio. La versión vigente será la publicada en la web.</p>' +
        '<p>Cuando la modificación afecte de forma relevante las finalidades, categorías, proveedores, elaboración de perfiles, publicidad, transferencias o naturaleza del tratamiento, podrá solicitarse una nueva elección. Un cambio sustancial no deberá aplicarse únicamente mediante una modificación silenciosa del texto cuando afecte al consentimiento previamente otorgado.</p>' +
        '<h3>18. Relación institucional y sitios del MERCOSUR</h3>' +
        '<p>El sitio al que se aplica esta Política pertenece a la Cámara de Comercio Mercosur y no constituye un portal oficial del MERCOSUR. La gestión de cookies corresponde a la Cámara y, en su caso, a los proveedores identificados. Esta Política no se extiende a portales oficiales del bloque ni a otros sitios externos enlazados desde la web.</p>' +
        '<h3>19. Coordinación documental</h3>' +
        '<p>Esta Política deberá interpretarse conjuntamente con la Política de Privacidad, los Términos de Uso, la Política de Uso de Marca, los avisos específicos de formularios y las condiciones de los servicios externos incorporados. La configuración técnica del panel deberá ser coherente con la información publicada. Si se detecta una contradicción, deberá revisarse la configuración o actualizarse la información sin demoras indebidas.</p>' +
        '<h3>20. Contacto</h3>' +
        '<p>Para formular consultas sobre esta Política, solicitar información sobre las cookies utilizadas o ejercer derechos relacionados con el tratamiento de datos personales, puede escribirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Cámara de Comercio Mercosur. Asociación internacional uruguaya. Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay.</p>' +
        '<p>Marco normativo de referencia: Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data; Decreto N.º 414/009; Decreto N.º 64/020; orientaciones de la Unidad Reguladora y de Control de Datos Personales sobre cookies y perfiles.</p>',
      en:
        '<p class="privacy-eyebrow">Mercosur Chamber of Commerce</p>' +
        '<h2 id="cookies-policy-modal-title">Cookie Policy</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">July 2026 · Applicable to the institutional website camaracomerciomercosur.org</p>' +
        '<h3>1. Purpose and Scope of this Policy</h3>' +
        '<p>This Cookie Policy explains the use of cookies and similar technologies on the Mercosur Chamber of Commerce\'s institutional website. Its purpose is to explain, in clear language, what these technologies do, how essential tools are different from those that require the user\'s prior choice, and how browsing preferences can be managed, changed, or withdrawn.</p>' +
        '<p>This Policy applies to the institutional domain and, where applicable, to its subdomains, restricted areas, event pages, integrated forms, and other digital services directly managed by the Chamber. External websites or services accessed through links are governed by their own policies and terms, except for technologies that operate on the Chamber\'s pages before the user leaves the website.</p>' +
        '<p>This document complements the Privacy Policy. The Privacy Policy explains the general processing of personal data, while this Cookie Policy focuses on the storage, collection, transmission, and use of information through browsers, devices, and similar technologies.</p>' +
        '<h3>2. Institutional Identification</h3>' +
        '<p>The website is managed by the Mercosur Chamber of Commerce, a Uruguayan international association, located at Carlos Quijano 1290, Office 101, Montevideo 11100, Uruguay. Questions about this Policy, the cookie preference panel, or the processing of data related to cookies may be sent to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>3. Legal Framework and Applicable Principles</h3>' +
        '<p>Uruguay does not have a law that deals only with cookies. However, when these technologies collect, store, connect, transmit, or use information related to a person, browser, or device, they are subject to Uruguay\'s personal data protection laws. These include Law No. 18.331 on Personal Data Protection and Habeas Data, Decree No. 414/009, Decree No. 64/020, and the guidelines issued by the Personal Data Regulatory and Control Unit.</p>' +
        '<p>The Chamber follows the principles of transparency, purpose, proportionality, data minimization, security, confidentiality, limited retention, and accountability. When a technology is not strictly necessary to provide a requested function or to ensure the security of the website, it will only be activated after the user has made an informed and revocable choice.</p>' +
        '<h3>4. Consistency Between Information and Technical Operation</h3>' +
        '<p>Transparency requires that the legal information, the cookie banner, the preference panel, and the actual operation of the website are consistent with each other. The Chamber will take reasonable measures to prevent optional technologies from being activated before a valid choice is made, ensure that rejecting them has a real effect, allow users to change their preferences later, and correct any differences between this Policy and the website\'s technical configuration.</p>' +
        '<p>The Chamber will not consider this obligation fulfilled simply by publishing this Policy. The list of technologies used, their purposes, and the consent mechanism will be reviewed whenever new tools are added, service providers change, or through regular reviews, even if no visible changes to the website have been identified.</p>' +
        '<h3>5. What Are Cookies and Similar Technologies</h3>' +
        '<p>A cookie is a small file or piece of information that may be stored in a browser or device when a person visits a website. Depending on its purpose, it may be used to keep a session active, protect forms, remember preferences, save a user\'s choice, improve the website\'s performance, measure its performance, or provide content from third parties.</p>' +
        '<p>Not all cookies identify a person directly. However, some may be linked to IP addresses, identifiers, devices, browsers, sessions, or browsing patterns and may therefore be considered personal data or make it possible to identify a user.</p>' +
        '<p>In this Policy, the term "cookies" is used in a broad sense and also includes, when they perform similar functions, local or session storage, pixels, tags, web beacons, scripts, device identifiers, measurement tools, and other technologies that may be used on the website.</p>' +
        '<h3>6. Classification by Management and Duration</h3>' +
        '<h4>First-Party and Third-Party Cookies</h4>' +
        '<p>First-party cookies are managed through domains, systems, or services controlled by the Chamber. They may be used for security, session management, form protection, preference management, or the technical operation of the website. Third-party cookies are managed by external service providers whose services are integrated into the website, such as analytics tools, videos, maps, social media, calendars, forms, event management services, payment services, or security services.</p>' +
        '<p>When third parties are involved, they may process data according to their own terms and privacy policies. The Chamber will seek to select and configure these integrations in a privacy-friendly way, but this does not replace the information that each provider must give about its own data processing.</p>' +
        '<h4>Session Cookies and Persistent Cookies</h4>' +
        '<p>Session cookies are usually deleted when the browser is closed or the session ends. Persistent cookies remain stored for a specific period or until the user deletes them. The exact duration depends on the purpose and settings of each tool and should be included in the technical inventory once it has been verified.</p>' +
        '<h3>7. Classification by Purpose</h3>' +
        '<h4>Strictly Necessary Cookies</h4>' +
        '<p>These cookies are essential for the safe and proper operation of the website or to provide a function specifically requested by the user. They are used only when necessary to maintain security, manage user sessions, protect forms, balance system traffic, prevent fraudulent use, save cookie preferences, or allow access to restricted areas. These technologies may be activated without additional consent only when they are strictly technical or necessary to provide the requested service. This category will not be used for analytics, advertising, personalization, or convenience features.</p>' +
        '<p>Users may block these cookies through their browser settings, although doing so may affect sessions, forms, security features, saved preferences, or access to certain parts of the website.</p>' +
        '<h4>Functional or Preference Cookies</h4>' +
        '<p>These technologies may remember options such as language, region, text size, accessibility settings, playback settings, or other user preferences. Although they improve the user experience, they are not always essential. When they are not necessary to provide a requested function, they will remain disabled until the user gives consent.</p>' +
        '<h4>Analytics or Measurement Cookies</h4>' +
        '<p>Analytics tools help measure the number of visits, pages viewed, approximate visit duration, general traffic sources, technical errors, website performance, and user interaction with content. Although the results are usually presented in an aggregated form, they may involve IP addresses, identifiers, or device information. As a general rule, non-essential analytics cookies will remain disabled until the user accepts them.</p>' +
        '<h4>Advertising and Profiling Cookies</h4>' +
        '<p>At the time this Policy is published, the website does not use cookies for behavioral advertising or user profiling, unless a technical audit confirms otherwise before this Policy takes effect. If these purposes are introduced in the future, this Policy and the preference panel will be updated in advance, the related technologies will remain disabled until specific consent is obtained, and they will not be used to make important decisions about individuals without the legal safeguards required by law.</p>' +
        '<h4>Social Media and External Content Cookies</h4>' +
        '<p>Videos, maps, embedded posts, social media buttons, calendars, chats, external forms, event tools, booking services, or payment services may require third-party technologies. When these technologies are not necessary, the content will remain blocked until the user allows the relevant category. Whenever technically possible, users may give permission only for a specific service without accepting all optional categories. Once the content is activated, the provider may receive information about the user\'s browser, device, IP address, or interaction.</p>' +
        '<h3>8. Inventory of Technologies Used</h3>' +
        '<p>The current inventory of cookies and similar technologies must reflect the website\'s actual technical configuration. For each tool or group of similar tools, the Chamber will identify, when verified, the provider, the main technical names, the purpose, the category, whether it is a first-party or third-party technology, its duration, the activation time, and whether international access to information may occur.</p>' +
        '<p>The Chamber will not list tools, providers, storage periods, or purposes that have not been verified. When several cookies share the same provider, purpose, and category, they may be described together to make the information easier to understand, provided that no important information is omitted. The updated inventory may be available in the preference panel or in the relevant section of the website and will be reviewed before new integrations are added.</p>' +
        '<h3>9. Consent and Available Choices</h3>' +
        '<p>Non-essential cookies will only be activated after the user has given prior, free, informed, specific, clear, verifiable, and withdrawable consent. Simply browsing the website, scrolling the page, remaining inactive, closing the notice, or continuing to use the website will not be considered consent. Pre-selected boxes will not be used for optional cookie categories.</p>' +
        '<p>The first layer of the cookie notice must clearly present the options to Accept All, Reject Non-Essential Cookies, and Manage Preferences, together with access to this Policy. Strictly necessary cookies may work automatically, while all other cookies depend on the user\'s choice.</p>' +
        '<p>The cookie notice and preference panel will avoid misleading or manipulative design. Rejecting cookies will not be made more difficult than accepting them, and optional categories will remain disabled by default until the user takes a valid affirmative action.</p>' +
        '<p>If the user chooses "Reject Non-Essential Cookies," the website will not activate optional cookies or the related scripts, and external content that depends on those technologies will remain blocked. Only the technical information required to remember and respect that choice may be stored.</p>' +
        '<h3>10. Preference Panel and Withdrawal of Consent</h3>' +
        '<p>The preference panel allows users to view the cookie categories, understand their purposes, identify the providers, review the available storage period, and enable or disable each option. Users may change their decision at any time through a permanent link, a privacy icon, or an option available in the website footer.</p>' +
        '<p>Withdrawing consent must be as easy as giving it. The withdrawal will not affect the lawfulness of processing carried out before consent was withdrawn, but it will prevent any future activation of optional technologies. Whenever technically possible, the system will remove or disable optional cookies that have already been installed. If any remain on the device, users may delete them through their browser settings. Any improper activation that is detected will be investigated and corrected without unnecessary delay.</p>' +
        '<p>Changing preferences may affect only the selected category or service. When permission has been given for a specific external service, users must be able to withdraw that permission without changing their other choices.</p>' +
        '<h3>11. Record and Duration of Preferences</h3>' +
        '<p>The website may keep a minimum technical record of the user\'s choice to remember preferences, respect rejected options, demonstrate consent, and avoid showing the cookie notice repeatedly. This record may include the date, the notice version, the selected categories, a limited technical identifier, and the date when the choice was changed or withdrawn.</p>' +
        '<p>The consent record will not be used as an additional tracking tool and will not contain more information than necessary. Preferences may be stored for a reasonable period and will be requested again when the record expires, when there are significant changes to the purposes or providers, when new cookie categories are introduced, or when required for legal, technical, or security reasons.</p>' +
        '<h3>12. Browser Settings</h3>' +
        '<p>Most web browsers allow users to view, block, limit, or delete cookies through their privacy and security settings. This option complements the website\'s preference panel and does not replace the obligation to respect the user\'s choice. Blocking all cookies may affect sessions, forms, preferences, content, restricted areas, or security features.</p>' +
        '<h3>13. Personal Data, Service Providers, and International Transfers</h3>' +
        '<p>Depending on the technology used, cookies may process IP addresses, identifiers, browser or device characteristics, operating systems, language settings, visited pages, date and time, traffic sources, user interactions, preferences, or technical errors. The information processed will depend on the website\'s actual configuration and will be limited to the stated purpose.</p>' +
        '<p>Some service providers may store, process, or access information from other countries. When applicable, the Chamber will identify the provider, explain the nature of the service, and describe the applicable safeguards, in coordination with the Privacy Policy. The Chamber will not state that there are no international data transfers unless all integrated services have been verified.</p>' +
        '<h3>14. Users\' Rights</h3>' +
        '<p>When cookies involve the processing of personal data, users may exercise the rights provided by Uruguayan law, including, where applicable, the rights of access, correction, update, inclusion, and deletion. If automated assessments or profiling are used, users may also exercise the rights specifically related to those activities. Requests may be sent to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> and will be handled in accordance with the Privacy Policy and applicable law.</p>' +
        '<p>When an external service provider processes data under its own responsibility, users may also need to exercise certain rights directly with that provider. The Chamber will help identify the service whenever sufficient information is available.</p>' +
        '<h3>15. Minors</h3>' +
        '<p>The institutional website is not designed to create profiles of minors, display behavioral advertising to them, or intentionally collect information through optional technologies directed at children. If services specifically designed for minors are introduced in the future, additional safeguards will be adopted, and the relevant information and consent mechanisms will be updated.</p>' +
        '<h3>16. Security, Technical Control, and Audits</h3>' +
        '<p>The Chamber will take reasonable measures to limit unnecessary technologies, review scripts and integrations, keep the consent management system updated, restrict access, respect users\' choices to reject cookies, and prevent unauthorized activations. The cookie inventory will also be reviewed whenever a tool is added or removed, a provider changes, a new cookie appears, its storage period changes, or the consent system is updated.</p>' +
        '<p>The inventory will be reviewed regularly and whenever important technical changes occur. Automated checks will depend on the capabilities of the consent management system but will not replace the Chamber\'s responsibility to ensure that the published information and the website\'s actual configuration remain accurate. If any inconsistency is found, it will be corrected without unnecessary delay.</p>' +
        '<h3>17. Important Changes and Policy Updates</h3>' +
        '<p>The Chamber may update this Policy because of legal changes, new guidance from the Personal Data Regulatory and Control Unit, technological developments, new service providers, new purposes, or changes to the website. The current version will always be the one published on the website.</p>' +
        '<p>If an update significantly changes the purposes, categories, providers, profiling activities, advertising, international transfers, or the nature of the processing, users may be asked to provide new consent. Important changes will not be introduced only by silently updating this Policy if they affect previously given consent.</p>' +
        '<h3>18. Institutional Relationship and MERCOSUR Websites</h3>' +
        '<p>The website covered by this Policy belongs to the Mercosur Chamber of Commerce and is not an official MERCOSUR website. Cookie management is the responsibility of the Chamber and, when applicable, of the identified service providers. This Policy does not apply to official MERCOSUR websites or to external websites accessed through links on this website.</p>' +
        '<h3>19. Related Documents</h3>' +
        '<p>This Policy should be read together with the Privacy Policy, the Terms of Use, the Trademark Use Policy, the specific notices included in forms, and the terms of the external services used on the website. The technical settings of the preference panel must match the published information. If any inconsistency is found, the settings or the published information will be updated without unnecessary delay.</p>' +
        '<h3>20. Contact</h3>' +
        '<p>If you have questions about this Policy, would like information about the cookies used on this website, or wish to exercise your rights related to the processing of personal data, please contact <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Mercosur Chamber of Commerce</p>' +
        '<p>Uruguayan International Association.</p>' +
        '<p>Carlos Quijano 1290, Office 101, Montevideo 11.100, Uruguay.</p>' +
        '<p>Legal framework: Law No. 18.331 on Personal Data Protection and Habeas Data; Decree No. 414/009; Decree No. 64/020; and the guidelines of the Personal Data Regulatory and Control Unit regarding cookies and profiling.</p>',
      pt:
        '<p class="privacy-eyebrow">Câmara de Comércio Mercosul</p>' +
        '<h2 id="cookies-policy-modal-title">Política de Cookies</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Julho de 2026 · Aplicável ao site institucional camaracomerciomercosur.org</p>' +
        '<h3>1. Objeto e Âmbito de Aplicação desta Política</h3>' +
        '<p>A presente Política de Cookies informa sobre a utilização de cookies e tecnologias semelhantes no site institucional da Câmara de Comércio Mercosul. Sua finalidade é explicar, em linguagem clara, quais funções essas tecnologias podem desempenhar, como se diferenciam as ferramentas indispensáveis daquelas que exigem uma decisão prévia do usuário e de que forma as preferências de navegação podem ser gerenciadas, alteradas ou revogadas.</p>' +
        '<p>Esta Política aplica-se ao domínio institucional e, quando aplicável, aos seus subdomínios, áreas restritas, páginas de eventos, formulários integrados e demais serviços digitais incorporados diretamente sob o controle da Câmara. Os portais ou serviços externos acessados por meio de links são regidos por suas próprias políticas e condições, exceto no que se refere às tecnologias ativadas nas páginas da Câmara antes que o usuário deixe o site.</p>' +
        '<p>Este documento complementa a Política de Privacidade. A Política de Privacidade regula o tratamento geral de dados pessoais, enquanto esta Política se concentra no armazenamento, coleta, transmissão e utilização de informações por meio de navegadores, dispositivos e tecnologias equivalentes.</p>' +
        '<h3>2. Identificação Institucional</h3>' +
        '<p>O responsável pelo site é a Câmara de Comércio Mercosul, associação internacional uruguaia, com sede na Rua Carlos Quijano 1290, Sala 101, 11.100, Montevidéu, Uruguai.</p>' +
        '<p>As consultas relacionadas a esta Política, ao funcionamento do painel de preferências ou ao tratamento de dados vinculado aos cookies podem ser encaminhadas para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>3. Marco legal e princípios aplicáveis</h3>' +
        '<p>O Uruguai não possui uma legislação específica dedicada exclusivamente aos cookies. No entanto, quando essas tecnologias permitem coletar, armazenar, relacionar, transmitir ou utilizar informações vinculadas a uma pessoa, navegador ou dispositivo, sua utilização está sujeita à legislação uruguaia de proteção de dados pessoais. Em especial, aplicam-se a Lei nº 18.331 de Proteção de Dados Pessoais e Ação de Habeas Data, o Decreto nº 414/009, o Decreto nº 64/020 e os critérios estabelecidos pela Unidade Reguladora e de Controle de Dados Pessoais.</p>' +
        '<p>A Câmara aplicará os princípios da informação, finalidade, proporcionalidade, minimização, segurança, confidencialidade, conservação limitada e responsabilidade institucional. Quando uma tecnologia não for estritamente necessária para fornecer uma funcionalidade solicitada ou garantir a segurança do site, sua ativação dependerá de uma escolha prévia, informada e revogável do usuário.</p>' +
        '<h3>4. Correspondência entre as informações e o funcionamento técnico</h3>' +
        '<p>A transparência exige que as informações jurídicas, o banner de cookies, o painel de configuração e o funcionamento efetivo do site estejam em conformidade entre si. A Câmara adotará medidas razoáveis para impedir a ativação de tecnologias opcionais antes de uma escolha válida, assegurar que a recusa produza efeitos reais, permitir a alteração posterior das preferências e corrigir qualquer divergência identificada entre esta Política e a configuração técnica.</p>' +
        '<p>A Câmara não considerará essa obrigação cumprida apenas pela publicação deste texto. O inventário das tecnologias utilizadas, a classificação de suas finalidades e a configuração do mecanismo de consentimento serão revisados sempre que novas ferramentas forem incorporadas, houver mudança de fornecedores ou mediante verificações periódicas razoáveis, mesmo quando não forem identificadas alterações aparentes no site.</p>' +
        '<h3>5. O que são cookies e tecnologias semelhantes</h3>' +
        '<p>Um cookie é um pequeno arquivo ou fragmento de informação que pode ser armazenado no navegador ou dispositivo quando uma pessoa visita um site. Dependendo de sua finalidade, ele pode ser utilizado para manter uma sessão ativa, proteger formulários, lembrar preferências, registrar uma escolha, melhorar o funcionamento do site, medir seu desempenho ou disponibilizar conteúdos fornecidos por terceiros.</p>' +
        '<p>Nem todos os cookies identificam diretamente uma pessoa. No entanto, alguns podem estar associados a endereços IP, identificadores, dispositivos, navegadores, sessões ou padrões de navegação e, portanto, podem constituir dados pessoais ou permitir a identificação de um usuário.</p>' +
        '<p>Nesta Política, o termo "cookies" é utilizado em sentido amplo e inclui, sempre que desempenhem funções equivalentes, armazenamento local ou de sessão, pixels, tags, web beacons, scripts, identificadores de dispositivos, ferramentas de medição e outras tecnologias que possam ser incorporadas ao site.</p>' +
        '<h3>6. Classificação conforme o responsável pelo gerenciamento e sua duração</h3>' +
        '<h4>Cookies próprios e cookies de terceiros</h4>' +
        '<p>Os cookies próprios são gerenciados por domínios, sistemas ou serviços sob o controle da Câmara e podem ser utilizados para segurança, manutenção de sessão, proteção de formulários, gerenciamento de preferências ou funcionamento técnico do site. Os cookies de terceiros são administrados por prestadores externos cujos serviços estão integrados ao site, como ferramentas de medição, vídeos, mapas, redes sociais, calendários, formulários, gestão de eventos, meios de pagamento ou serviços de segurança.</p>' +
        '<p>Quando houver participação de um terceiro, este poderá realizar seus próprios tratamentos de dados de acordo com suas políticas e condições. A Câmara buscará selecionar e configurar essas integrações de forma compatível com a privacidade, sem que isso substitua as informações que cada fornecedor deve fornecer sobre seus próprios tratamentos.</p>' +
        '<h4>Cookies de sessão e cookies persistentes</h4>' +
        '<p>Os cookies de sessão normalmente são excluídos quando o navegador é fechado ou a sessão é encerrada. Os cookies persistentes permanecem armazenados por um período determinado ou até que o usuário os exclua. A duração de cada cookie dependerá da finalidade e da configuração de cada ferramenta e deverá constar do inventário técnico quando essa informação tiver sido verificada.</p>' +
        '<h3>7. Classificação conforme a finalidade</h3>' +
        '<h4>Cookies estritamente necessários</h4>' +
        '<p>São os cookies indispensáveis para permitir o funcionamento essencial e seguro do site ou para fornecer uma funcionalidade expressamente solicitada pelo usuário. Sua utilização será limitada às situações em que forem necessários para manter a segurança, gerenciar sessões, proteger formulários, distribuir a carga do sistema, prevenir usos fraudulentos, registrar a escolha sobre cookies ou permitir o acesso a áreas restritas. Essas tecnologias poderão ser ativadas sem consentimento adicional apenas quando sua finalidade for estritamente técnica ou necessária para atender à solicitação do usuário. Essa categoria não será utilizada para encobrir atividades de medição, publicidade, personalização ou funcionalidades de conveniência.</p>' +
        '<p>O usuário pode bloqueá-los por meio das configurações de seu navegador, embora isso possa afetar o funcionamento das sessões, formulários, recursos de segurança, preferências ou determinadas áreas do site.</p>' +
        '<h4>Cookies funcionais ou de preferência</h4>' +
        '<p>Essas tecnologias podem lembrar opções como idioma, região, tamanho do texto, recursos de acessibilidade, configurações de reprodução ou outras preferências. Embora melhorem a experiência do usuário, nem sempre são indispensáveis. Quando não forem necessárias para uma funcionalidade solicitada, permanecerão desativadas até que o usuário forneça seu consentimento.</p>' +
        '<h4>Cookies analíticos ou de medição</h4>' +
        '<p>As ferramentas analíticas podem ajudar a identificar o número de visitas, as páginas acessadas, o tempo aproximado de permanência, a origem geral do tráfego, erros técnicos, desempenho do site e a interação com seus conteúdos. Embora os resultados sejam apresentados de forma agregada, podem envolver endereços IP, identificadores ou informações do dispositivo. Como regra geral, os cookies analíticos que não sejam essenciais permanecerão desativados até que o usuário os aceite.</p>' +
        '<h4>Cookies publicitários e de criação de perfis</h4>' +
        '<p>Na data de publicação desta Política, o site não utiliza cookies destinados à publicidade comportamental nem à criação de perfis, salvo se uma auditoria técnica verificar o contrário antes de sua entrada em vigor. Caso essas finalidades sejam incorporadas futuramente, esta Política e o painel de preferências serão atualizados previamente, as respectivas tecnologias permanecerão desativadas até a obtenção de um consentimento específico e não serão utilizadas para tomar decisões relevantes sobre pessoas sem as garantias legais aplicáveis.</p>' +
        '<h4>Cookies de redes sociais e conteúdos externos</h4>' +
        '<p>Vídeos, mapas, publicações incorporadas, botões de redes sociais, calendários, chats, formulários externos, ferramentas de eventos, reservas ou meios de pagamento podem exigir tecnologias de terceiros. Quando essas tecnologias não forem necessárias, o conteúdo permanecerá bloqueado até que o usuário autorize a categoria correspondente. Sempre que a implementação técnica permitir, poderá ser oferecida uma autorização específica para determinado serviço, sem exigir a aceitação de todas as demais categorias opcionais. Após a ativação do conteúdo, o fornecedor poderá receber informações sobre o navegador, dispositivo, endereço IP ou interação do usuário.</p>' +
        '<h3>8. Inventário das tecnologias utilizadas</h3>' +
        '<p>O inventário vigente de cookies e tecnologias semelhantes deverá refletir a configuração técnica efetiva do site. Para cada ferramenta ou grupo de ferramentas semelhantes, serão informados, quando verificados, o fornecedor, os principais nomes técnicos, a finalidade, a categoria, a classificação como cookie próprio ou de terceiros, a duração, o momento de ativação e a eventual existência de acesso internacional às informações.</p>' +
        '<p>A Câmara não atribuirá ao site ferramentas, fornecedores, períodos de armazenamento ou finalidades que não tenham sido previamente verificados. Quando vários cookies compartilharem o mesmo fornecedor, finalidade e categoria, eles poderão ser descritos em conjunto para facilitar a compreensão, desde que nenhuma informação relevante seja omitida. O inventário atualizado poderá ser disponibilizado no painel de preferências ou na seção correspondente do site e deverá ser revisado antes da inclusão de novas integrações.</p>' +
        '<h3>9. Consentimento e opções disponíveis</h3>' +
        '<p>Os cookies não essenciais somente poderão ser ativados após um consentimento prévio, livre, informado, específico, inequívoco, verificável e revogável. A simples navegação, a rolagem da página, a inatividade, o fechamento do aviso ou o uso contínuo do site não serão interpretados como consentimento. Da mesma forma, não serão utilizadas caixas previamente marcadas para categorias opcionais.</p>' +
        '<p>A primeira camada de informação deverá apresentar, com igual destaque, as opções de aceitar todos os cookies, rejeitar os não essenciais e configurar as preferências, além de disponibilizar acesso a esta Política. Os cookies estritamente necessários poderão funcionar automaticamente; os demais dependerão da escolha do usuário.</p>' +
        '<p>O design do aviso e do painel evitará práticas enganosas ou manipulativas. A opção de rejeição não será dificultada nem a aceitação será destacada de forma desproporcional. As categorias opcionais permanecerão desativadas por padrão e somente serão ativadas após uma ação afirmativa válida.</p>' +
        '<p>Quando o usuário selecionar "Rejeitar os não essenciais", o site não ativará cookies opcionais nem os scripts relacionados a eles e manterá bloqueados os conteúdos externos que dependam dessas tecnologias. Apenas as informações técnicas indispensáveis para registrar e respeitar essa escolha poderão ser armazenadas.</p>' +
        '<h3>10. Painel de preferências e revogação do consentimento</h3>' +
        '<p>O painel permitirá consultar as categorias de cookies, conhecer suas finalidades, identificar os fornecedores, verificar o período de armazenamento disponível e ativar ou desativar as opções. O usuário poderá alterar sua decisão a qualquer momento por meio de um link permanente, ícone de privacidade ou opção acessível no rodapé do site.</p>' +
        '<p>A revogação do consentimento será tão simples quanto sua concessão. Ela não afetará a licitude do tratamento realizado anteriormente, mas impedirá novas ativações das tecnologias opcionais. Sempre que tecnicamente possível, o sistema removerá ou desativará os cookies opcionais já instalados; caso algum permaneça armazenado no dispositivo, o usuário poderá excluí-lo diretamente pelo navegador. Qualquer ativação indevida identificada será investigada e corrigida sem demora injustificada.</p>' +
        '<p>A alteração das preferências poderá afetar apenas a categoria ou o serviço selecionado. Quando um conteúdo externo tiver sido autorizado de forma específica, o usuário poderá revogar essa autorização sem necessidade de alterar as demais escolhas realizadas.</p>' +
        '<h3>11. Registro e duração das preferências</h3>' +
        '<p>O site poderá manter um registro técnico mínimo da escolha do usuário para lembrar suas preferências, respeitar a rejeição, comprovar o consentimento e evitar a exibição repetida do aviso. Esse registro poderá incluir a data, a versão do aviso, as categorias selecionadas, um identificador técnico limitado e a data de alteração ou revogação.</p>' +
        '<p>O registro do consentimento não será utilizado como ferramenta adicional de rastreamento nem conterá informações além das estritamente necessárias. As preferências poderão ser mantidas por um período razoável e serão solicitadas novamente quando esse registro expirar, quando houver mudanças relevantes nas finalidades ou nos fornecedores, quando novas categorias forem incorporadas ou quando houver exigência legal, técnica ou de segurança.</p>' +
        '<h3>12. Gerenciamento pelo navegador</h3>' +
        '<p>A maioria dos navegadores permite visualizar, bloquear, limitar ou excluir cookies por meio de suas configurações de privacidade e segurança. Essa possibilidade complementa o painel de preferências do site e não substitui a obrigação de respeitar a escolha do usuário. O bloqueio geral de cookies pode afetar sessões, formulários, preferências, conteúdos, áreas restritas ou recursos de segurança.</p>' +
        '<h3>13. Dados pessoais, prestadores de serviços e transferências internacionais</h3>' +
        '<p>Dependendo da tecnologia utilizada, os cookies podem envolver o tratamento de endereços IP, identificadores, características do navegador ou do dispositivo, sistema operacional, idioma, páginas visitadas, data e hora, origem da navegação, interações, preferências ou erros técnicos. As informações efetivamente tratadas dependerão da configuração do site e serão limitadas à finalidade informada.</p>' +
        '<p>Alguns prestadores de serviços podem armazenar, processar ou acessar informações a partir de outros países. Quando aplicável, a Câmara informará o fornecedor, a natureza do serviço e as garantias aplicáveis, em conformidade com a Política de Privacidade. A inexistência de transferências internacionais não será declarada sem que todos os serviços incorporados tenham sido previamente verificados.</p>' +
        '<h3>14. Direitos das pessoas</h3>' +
        '<p>Quando os cookies envolverem o tratamento de dados pessoais, poderão ser exercidos os direitos previstos pela legislação uruguaia, incluindo, quando cabíveis, os direitos de acesso, retificação, atualização, inclusão e exclusão e, caso existam avaliações automatizadas ou criação de perfis, os direitos específicos relacionados a esses tratamentos. As solicitações poderão ser encaminhadas para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> e serão tratadas de acordo com a Política de Privacidade e a legislação aplicável.</p>' +
        '<p>Quando um prestador de serviços externo tratar dados sob sua própria responsabilidade, também poderá ser necessário exercer determinados direitos diretamente perante esse fornecedor. A Câmara facilitará a identificação do serviço sempre que dispuser de informações suficientes para isso.</p>' +
        '<h3>15. Menores de idade</h3>' +
        '<p>O site institucional não foi desenvolvido especificamente para criar perfis de menores de idade, exibir publicidade comportamental ou coletar deliberadamente informações por meio de tecnologias opcionais direcionadas a esse público. Caso, no futuro, sejam incorporados serviços destinados especificamente a menores, serão adotadas medidas reforçadas e as informações e os mecanismos de consentimento aplicáveis serão atualizados.</p>' +
        '<h3>16. Segurança, controle técnico e auditoria</h3>' +
        '<p>A Câmara adotará medidas razoáveis para limitar tecnologias desnecessárias, revisar scripts e integrações, manter atualizado o gerenciador de consentimento, restringir acessos, respeitar as escolhas de rejeição e evitar ativações não autorizadas. Também revisará o inventário sempre que uma ferramenta for adicionada ou removida, houver mudança de fornecedor, surgir um novo cookie, sua duração for alterada ou o sistema de consentimento for modificado.</p>' +
        '<p>O inventário será revisado periodicamente e também sempre que ocorrerem mudanças técnicas relevantes. A automatização dessas verificações dependerá dos recursos do sistema de gerenciamento utilizado, mas não substituirá a responsabilidade de verificar que as informações publicadas e a configuração efetiva do site permaneçam corretas. Caso seja identificada qualquer divergência, serão adotadas medidas para corrigi-la sem demora injustificada.</p>' +
        '<h3>17. Alterações relevantes e atualização da Política</h3>' +
        '<p>A Câmara poderá atualizar esta Política em razão de alterações legais, novos critérios da Unidade Reguladora e de Controle de Dados Pessoais, mudanças tecnológicas, inclusão de novos fornecedores, novas finalidades ou modificações no site. A versão vigente será sempre a publicada no site.</p>' +
        '<p>Quando a alteração afetar de forma significativa as finalidades, categorias, fornecedores, criação de perfis, publicidade, transferências internacionais ou a natureza do tratamento, poderá ser solicitado um novo consentimento. Uma alteração relevante não deverá ser implementada apenas por meio da atualização silenciosa deste texto quando afetar o consentimento previamente concedido.</p>' +
        '<h3>18. Relação institucional e sites do MERCOSUL</h3>' +
        '<p>O site ao qual esta Política se aplica pertence à Câmara de Comércio Mercosul e não constitui um portal oficial do MERCOSUL. O gerenciamento dos cookies é de responsabilidade da Câmara e, quando aplicável, dos prestadores de serviços identificados. Esta Política não se estende aos portais oficiais do MERCOSUL nem a outros sites externos acessados por meio de links disponíveis neste site.</p>' +
        '<h3>19. Coordenação documental</h3>' +
        '<p>Esta Política deverá ser interpretada em conjunto com a Política de Privacidade, os Termos de Uso, a Política de Uso da Marca, os avisos específicos dos formulários e as condições dos serviços externos incorporados. A configuração técnica do painel de preferências deverá ser compatível com as informações publicadas. Caso seja identificada qualquer inconsistência, a configuração deverá ser revisada ou as informações atualizadas sem demora injustificada.</p>' +
        '<h3>20. Contato</h3>' +
        '<p>Para esclarecer dúvidas sobre esta Política, solicitar informações sobre os cookies utilizados ou exercer direitos relacionados ao tratamento de dados pessoais, entre em contato pelo e-mail <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Câmara de Comércio Mercosul</p>' +
        '<p>Associação Internacional Uruguaia.</p>' +
        '<p>Rua Carlos Quijano 1290, Sala 101, 11.100, Montevidéu, Uruguai.</p>' +
        '<p>Marco legal de referência: Lei nº 18.331 de Proteção de Dados Pessoais e Ação de Habeas Data; Decreto nº 414/009; Decreto nº 64/020; orientações da Unidade Reguladora e de Controle de Dados Pessoais sobre cookies e criação de perfis.</p>',
      fr:
        '<p class="privacy-eyebrow">Chambre de Commerce du Mercosur</p>' +
        '<h2 id="cookies-policy-modal-title">Politique de Cookies</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Juillet 2026 · Applicable au site web institutionnel camaracomerciomercosur.org</p>' +
        '<h3>1. Objet et portée de la présente politique</h3>' +
        '<p>La présente Politique relative aux Cookies vous informe de l\'utilisation des cookies et des technologies similaires sur le site internet institutionnel de la Chambre de Commerce du Mercosur. Elle a pour but d\'expliquer clairement les fonctions que peuvent développer ces technologies, la distinction entre les outils essentiels et ceux nécessitant un consentement préalable de l\'usager, ainsi que la manière de gérer, modifier ou retirer vos préférences de navigation.</p>' +
        '<p>La Politique s\'applique au domaine institutionnel et, le cas échéant, à ses sous-domaines, zones restreintes, pages d\'événements, formulaires intégrés et autres services numériques incorporés directement sous le contrôle de la Chambre. Les portails ou services externes accessibles par liens sont régis par leurs propres conditions générales, à l\'exception des technologies activées dans les pages de la Chambre avant de quitter le site.</p>' +
        '<p>Ce document complète la Politique de Confidentialité. La Politique de Confidentialité régule le traitement général des données personnelles, tandis que la présente Politique porte sur le stockage, la récupération, la transmission ou l\'utilisation d\'informations via les navigateurs, les appareils et les technologies équivalentes.</p>' +
        '<h3>2. Identification institutionnelle</h3>' +
        '<p>Le responsable du site web est la Chambre de Commerce du Mercosur, association internationale uruguayenne, située Calle Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay. Pour toute question concernant cette Politique, le fonctionnement du panneau de préférences ou le traitement des données relatives aux cookies, vous pouvez contacter <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>3. Cadre juridique et principes applicables</h3>' +
        '<p>L\'Uruguay ne dispose pas de loi spécifique consacrée exclusivement aux cookies. Cependant, lorsque ces technologies permettent la collecte, le stockage, l\'association, la transmission ou l\'utilisation d\'informations relatives à une personne, un navigateur ou un appareil, leur utilisation relève de la réglementation uruguayenne en matière de protection des données personnelles. Plus précisément, la Loi N° 18.331 relative à la Protection des Données Personnelles et Action d\'Habeas Data, le Décret N° 414/009, le Décret N° 64/020 et les critères édictés par l\'Unité de Réglementation et de Contrôle des Données Personnelles.</p>' +
        '<p>La Chambre appliquera les principes d\'information, de finalité, de proportionnalité, de minimisation, de sécurité, de confidentialité, de conservation limitée et de responsabilité. Lorsqu\'une technologie n\'est pas strictement nécessaire à la fourniture d\'une fonction demandée ou à garantir la sécurité du site, son activation dépendra d\'un choix préalable, éclairé et révocable de l\'utilisateur.</p>' +
        '<h3>4. Correspondance entre l\'information et le fonctionnement technique</h3>' +
        '<p>La transparence exige que les mentions légales, la bannière relative aux cookies, le panneau de configuration et le fonctionnement réel du site soient cohérents. La Chambre prendra les mesures nécessaires pour empêcher l\'activation des technologies optionnelles avant qu\'un choix valide n\'ait été fait, s\'assurer que le refus soit effectif, permettre la modification ultérieure des préférences et corriger toute divergence détectée entre la présente Politique et la configuration technique.</p>' +
        '<p>La Chambre ne considérera pas cette obligation comme remplie par la simple publication d\'un texte. L\'inventaire des technologies, la classification de leurs finalités et la configuration du mécanisme de consentement seront révisés à chaque intégration de nouveaux outils ou lors du changement de fournisseurs, ainsi que par des contrôles périodiques raisonnables, même en l\'absence de modifications apparentes sur le site.</p>' +
        '<h3>5. Que sont les cookies et les technologies similaires ?</h3>' +
        '<p>Un cookie est un petit fichier ou un élément d\'information qui peut être stocké dans le navigateur ou appareil lorsqu\'une personne visite un site web. Selon sa finalité, il peut servir à maintenir une session, protéger des formulaires, mémoriser des préférences, enregistrer un choix, améliorer les fonctionnalités, mesurer les performances ou permettre l\'affichage de contenu fourni par des tiers.</p>' +
        '<p>Tous les cookies n\'identifient pas directement une personne. Cependant, certains peuvent être associés à des adresses IP, des identifiants, des appareils, des navigateurs, des sessions ou des habitudes de navigation et constituent alors des données personnelles ou permettent l\'identification d\'un utilisateur.</p>' +
        '<p>Le terme « cookies » est utilisé dans la présente Politique au sens large et inclut, lorsqu\'ils remplissent des fonctions équivalentes, le stockage local ou de session, les pixels, les balises web, les étiquettes, les scripts, les identifiants d\'appareil, les outils de mesure et autres technologies pouvant être intégrées au site.</p>' +
        '<h3>6. Classification selon la personne qui les gère et leur durée</h3>' +
        '<h4>Cookies internes et cookies tiers</h4>' +
        '<p>Les cookies internes sont gérés par des domaines, systèmes ou services sous le contrôle de la Chambre et peuvent être utilisés à des fins de sécurité, de maintien de session, de protection des formulaires, de gestion des préférences ou de fonctionnement technique. Les cookies tiers sont gérés par des fournisseurs externes dont les services sont intégrés au site, tels que des outils de mesure, des vidéos, des cartes, des réseaux sociaux, des calendriers, des formulaires, la gestion d\'événements, des passerelles de paiement ou des services de sécurité.</p>' +
        '<p>Lorsqu\'un tiers intervient, celui-ci pourra effectuer son propre traitement conformément à ses conditions générales et politiques. La Chambre s\'efforcera de sélectionner et de configurer les intégrations dans le respect de la vie privée, sans pour autant se substituer aux informations que chaque prestataire est tenu de fournir concernant ses propres activités de traitement.</p>' +
        '<h4>Cookies de session et cookies persistants</h4>' +
        '<p>Les cookies de session sont généralement supprimés lorsque vous fermez votre navigateur ou que vous vous déconnectez. Les cookies persistants restent actifs pendant une durée déterminée ou jusqu\'à ce que l\'utilisateur les supprime. Cette durée dépend des fonctionnalités et de la configuration de chaque outil et doit être consignée dans l\'inventaire technique après vérification.</p>' +
        '<h3>7. Classification selon leur finalité</h3>' +
        '<h4>Cookies strictement nécessaires</h4>' +
        '<p>Ces cookies sont indispensables à la sécurité et au bon fonctionnement du site, ou permettent de fournir une fonction expressément demandée par l\'utilisateur. Leur utilisation sera limitée aux situations où elle est nécessaire pour maintenir la sécurité, gérer une session, protéger les formulaires, équilibrer la charge, prévenir les utilisations frauduleuses, conserver les préférences des cookies ou faciliter l\'accès aux zones restreintes. Ces technologies pourront être activées sans consentement supplémentaire uniquement lorsque leur fonction est strictement technique ou nécessaire pour répondre à la demande de l\'utilisateur ; cette catégorie ne sera pas utilisée à des fins de mesure d\'audience, de publicité, de personnalisation ou de confort d\'utilisation.</p>' +
        '<p>L\'utilisateur peut les bloquer depuis son navigateur, bien que cela pourrait affecter les sessions, les formulaires, la sécurité, les préférences ou certaines zones du site.</p>' +
        '<h4>Cookies fonctionnels ou de préférences</h4>' +
        '<p>Ces technologies peuvent mémoriser des options telles que la langue, la région, la taille du texte, l\'accessibilité, les paramètres de lecture ou d\'autres préférences. Bien qu\'elles améliorent l\'expérience, elles ne sont pas toujours indispensables. Lorsqu\'elles ne sont pas nécessaires à une fonction demandée, elles resteront désactivées jusqu\'à ce que le consentement soit donné.</p>' +
        '<h4>Cookies analytiques ou de mesure</h4>' +
        '<p>Les outils d\'analyse permettent de déterminer le nombre de visites, les pages consultées, la durée approximative, la source générale du trafic, les erreurs techniques, les performances et l\'interaction avec le contenu. Bien que les résultats soient présentés sous forme agrégée, les adresses IP, les identifiants ou les informations relatives à l\'appareil peuvent être inclus. En règle générale, les cookies d\'analyse non essentiels devront rester désactivés jusqu\'à ce que l\'utilisateur les accepte.</p>' +
        '<h4>Cookies publicitaires et d\'élaboration de profils</h4>' +
        '<p>À la date de publication de cette Politique, le site n\'utilisera pas de cookies à des fins de publicité comportementale ni de profilage, sauf si un audit technique affirme le contraire avant son entrée en vigueur. Si ces finalités sont intégrées ultérieurement, la Politique et le tableau de bord seront mis à jour au préalable, les technologies correspondantes resteront désactivées jusqu\'à ce qu\'un choix spécifique soit effectué, et elles ne seront pas utilisées pour prendre des décisions concernant des personnes sans garanties légales applicables.</p>' +
        '<h4>Cookies de réseaux sociaux et contenus externes</h4>' +
        '<p>Les vidéos, cartes, publications intégrées, boutons de réseaux sociaux, calendriers, messageries instantanées, formulaires externes, outils événementiels, services de réservation ou de paiement peuvent nécessiter des technologies tierces. Lorsque celles-ci ne sont pas requises, le contenu reste bloqué jusqu\'à ce que l\'utilisateur autorise la catégorie correspondante. Lorsque la mise en œuvre technique le permet, une autorisation contextuelle limitée au service concerné peut être proposée sans exiger l\'acceptation globale d\'autres catégories facultatives. Une fois le contenu activé, le fournisseur peut recevoir des informations relatives au navigateur, à l\'appareil, à l\'adresse IP ou à l\'interaction.</p>' +
        '<h3>8. Inventaire des technologies utilisées</h3>' +
        '<p>L\'inventaire actuel des cookies et technologies similaires doit refléter la configuration technique réelle du site. Pour chaque outil ou groupe homogène, les informations suivantes seront indiquées, après vérification : le fournisseur, les noms techniques pertinents, la finalité, la catégorie, s\'il s\'agit d\'un service interne ou de tiers, la durée, la date d\'activation et l\'éventuelle possibilité d\'accès international aux informations.</p>' +
        '<p>La Chambre n\'attribuera pas au site les outils, fournisseurs, durées ou finalités qui n\'ont pas été vérifiés. Lorsque plusieurs cookies partagent un fournisseur, une finalité et une catégorie, ils pourront être décrits ensemble pour plus de clarté, à condition qu\'aucune information pertinente ne soit omise. L\'inventaire mis à jour peut être affiché dans le panneau des préférences ou dans la section correspondante du site et devra être consulté avant toute nouvelle intégration.</p>' +
        '<h3>9. Consentement et options disponibles</h3>' +
        '<p>Les cookies non essentiels ne devront s\'activer qu\'après obtention d\'un consentement préalable, libre, éclairé, spécifique, univoque, vérifiable et révocable. La simple navigation, le défilement de la page, l\'inactivité, la fermeture de la notification ou l\'utilisation continue du site ne vaudront pas acceptation. Les cases pré-cochées pour les catégories facultatives ne seront pas utilisées.</p>' +
        '<p>Le premier niveau d\'information devra offrir, avec une visibilité comparable, les options d\'accepter toutes les demandes, de refuser celles qui ne sont pas nécessaires et de configurer les préférences, en plus d\'un accès à la présente Politique. Les technologies strictement nécessaires peuvent fonctionner automatiquement ; les autres dépendront du choix réalisé.</p>' +
        '<p>La conception de l\'avis et du panneau évitera tout langage trompeur ou manipulateur. Le refus ne sera pas difficile, et l\'acceptation ne sera pas indûment mise en avant. Les catégories facultatives apparaîtront désactivées par défaut et ne seront activées qu\'après une action positive valide.</p>' +
        '<p>Lorsqu\'un utilisateur sélectionne « Refuser les cookies non nécessaires », le site n\'activera pas les cookies optionnels ni leurs scripts associés et bloquera les contenus externes qui reposent sur ces technologies. Seules les informations techniques nécessaires pour mémoriser et respecter ce choix pourront être conservées.</p>' +
        '<h3>10. Panneau de préférences et retrait du consentement</h3>' +
        '<p>Ce panneau permettra de consulter les catégories, de découvrir leurs finalités, d\'identifier les prestataires, de vérifier la durée disponible et d\'activer ou de désactiver les options. La personne pourra modifier son choix à tout moment via un lien permanent, une icône de confidentialité ou une option accessible en bas de page.</p>' +
        '<p>Le retrait doit être aussi simple que l\'acceptation. Il n\'affectera pas la licéité du traitement effectué avant de se retirer, mais empêchera les futures activations des technologies optionnelles. Lorsque cela sera techniquement possible, le responsable du traitement supprimera ou désactivera les cookies optionnels déjà installés ; si certains restent stockés sur l\'appareil, l\'utilisateur pourra les supprimer depuis son navigateur. Toute activation non autorisée détectée devra faire l\'objet d\'une enquête et être corrigée sans retard injustifié.</p>' +
        '<p>La modification des préférences ne pourra affecter que la catégorie ou le service sélectionné. Lorsqu\'un contenu externe a été autorisé de manière contextuelle, l\'utilisateur doit pouvoir révoquer cette autorisation sans que cela n\'affecte nécessairement ses autres choix.</p>' +
        '<h3>11. Inscription et durée des préférences</h3>' +
        '<p>Le site pourra conserver des traces techniques minimales du choix afin de mémoriser les préférences, de respecter les refus, de documenter le consentement et d\'éviter l\'affichage répété de l\'avis. Ce registre pourra inclure la date, la version de l\'avis, les catégories sélectionnées, un identifiant technique limité et la date de modification ou de suppression.</p>' +
        '<p>La preuve du consentement ne sera pas utilisée comme un outil de suivi supplémentaire et ne contiendra pas plus d\'informations que nécessaire. Les préférences pourront être conservées pendant une durée raisonnable et seront sollicitées à nouveau à l\'expiration de l\'inscription, en cas de modification substantielle des finalités ou des fournisseurs, d\'ajout de nouvelles catégories ou en cas d\'exigence légale, technique ou de sécurité.</p>' +
        '<h3>12. Gestion depuis le navigateur</h3>' +
        '<p>La plupart des navigateurs permettent de consulter, bloquer, limiter ou supprimer les cookies depuis leurs paramètres de confidentialité et de sécurité. Cette option est complémentaire au panneau du site web et ne remplace pas l\'obligation de respecter les préférences de l\'utilisateur. Le blocage général des cookies peut affecter les sessions, les formulaires, les préférences, le contenu, les zones restreintes ou les fonctions de sécurité.</p>' +
        '<h3>13. Données personnelles, fournisseurs et transferts internationaux</h3>' +
        '<p>Selon l\'outil utilisé, les cookies peuvent impliquer le traitement d\'adresses IP, d\'identifiants, de caractéristiques du navigateur ou de l\'appareil, du système d\'exploitation, de la langue, des pages visitées, de la date et de l\'heure, de l\'origine de la navigation, des interactions, des préférences ou des erreurs techniques. Les informations précises dépendront de la configuration et devront se limiter à la finalité déclarée.</p>' +
        '<p>Certains prestataires peuvent stocker, traiter ou accéder à des informations provenant d\'autres pays. Le cas échéant, la Chambre fournira des informations sur le prestataire, la nature du service et les garanties applicables, conformément à la Politique de Confidentialité. L\'absence de transferts internationaux de données ne sera pas affirmée sans vérification préalable de tous les services intégrés.</p>' +
        '<h3>14. Droits des personnes</h3>' +
        '<p>Lorsque les cookies impliquent le traitement de données personnelles, les droits reconnus par la loi uruguayenne peuvent être exercés, notamment, le cas échéant, les droits d\'accès, de rectification, de mise à jour, d\'inclusion et d\'effacement, et, si des évaluations automatisées ou un profilage sont impliqués, les droits spécifiquement liés à ces traitements. Les demandes peuvent être envoyées à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> et seront traitées conformément à la Politique de Confidentialité et à la réglementation applicable.</p>' +
        '<p>Lorsqu\'un prestataire externe traite des données sous sa propre responsabilité, il peut être nécessaire d\'exercer certains droits directement auprès de ce prestataire. La Chambre fournira l\'identification du service dès qu\'elle disposera des informations suffisantes pour se faire.</p>' +
        '<h3>15. Mineurs</h3>' +
        '<p>Le site web institutionnel n\'est pas spécifiquement conçu pour profiler les mineurs, leur présenter des publicités ciblées ou collecter délibérément des informations au moyen de technologies optionnelles destinées à ce public. Si des services spécifiquement destinés aux mineurs sont intégrés ultérieurement, des mesures renforcées seront mises en œuvre et les informations et mécanismes de consentement applicables seront actualisés.</p>' +
        '<h3>16. Sécurité, contrôle technique et audit</h3>' +
        '<p>La Chambre prendra les mesures raisonnables pour limiter les technologies superflues, examiner les scripts et les intégrations, maintenir à jour le gestionnaire de consentement, restreindre l\'accès, respecter le refus et empêcher les réactivations non autorisées. Elle procédera également à un examen de l\'inventaire à chaque ajout ou suppression d\'outil, changement de fournisseur, apparition d\'un nouveau cookie, modification de sa durée de validité ou modification du système de consentement.</p>' +
        '<p>L\'inventaire fera l\'objet de révisions périodiques raisonnables et de révisions supplémentaires en cas de modifications techniques pertinentes. L\'automatisation de ces contrôles dépendra des capacités du système de gestion utilisé, mais ne substituera pas la responsabilité de vérifier l\'exactitude des informations publiées et de la configuration réelle. En cas de divergence, des mesures correctives seront prises sans délai.</p>' +
        '<h3>17. Changements importants et mise à jour de la Politique</h3>' +
        '<p>La Chambre peut mettre à jour la présente Politique en raison de modifications législatives, de nouveaux critères émanant de l\'Unité de Contrôle et de Réglementation des Données Personnelles, de modifications technologiques, de l\'ajout de fournisseurs, de nouveaux objectifs ou changements du site. La version en vigueur sera celle publiée sur le web.</p>' +
        '<p>Lorsque la modification affecte significativement les finalités, les catégories, les fournisseurs, le profilage, la publicité, les transferts ou la nature du traitement, un nouveau choix pourra être sollicité. Une modification substantielle ne devra pas être appliquée par une simple modification silencieuse du texte lorsqu\'elle concerne un consentement préalablement accordé.</p>' +
        '<h3>18. Relation institutionnelle et sites du MERCOSUR</h3>' +
        '<p>Le site auquel s\'applique cette Politique appartient à la Chambre de Commerce du Mercosur et n\'est pas un portail officiel du MERCOSUR. La gestion de cookies relève de la responsabilité de la Chambre et, le cas échéant, des fournisseurs identifiés. La présente Politique ne s\'applique pas aux portails officiels du bloc ni aux autres sites externes accessibles depuis ce site web.</p>' +
        '<h3>19. Coordination des documents</h3>' +
        '<p>La Politique devra s\'interpréter conjointement avec la Politique de Confidentialité, les Conditions d\'Utilisation, la Politique d\'Utilisation de la Marque, les avis spécifiques de formulaires et les conditions des services externes intégrés. La configuration technique du panneau devra être cohérente avec les informations publiées. En cas de divergence, la configuration devra être vérifiée ou les informations mises à jour sans délai.</p>' +
        '<h3>20. Contact</h3>' +
        '<p>Pour toute question concernant cette Politique, pour obtenir des informations sur les cookies utilisés ou pour exercer vos droits relatifs au traitement des données personnelles, vous pouvez écrire à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Chambre de Commerce du Mercosur. Association internationale uruguayenne. Rue Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay.</p>' +
        '<p style="font-size:.8rem;">Cadre réglementaire de référence : Loi N° 18.331 sur la Protection des Données Personnelles et l\'Action en Habeas Data ; Décret N° 414/009 ; Décret N° 64/020 ; lignes directrices de l\'Unité de Réglementation et de Contrôle des Données Personnelles sur les cookies et les profils.</p>'
    };

    function currentLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return cookiesPolicyHTML[lang] ? lang : 'es';
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'cookies-policy-modal-title');
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
      return overlay;
    }

    function openModal() {
      var ov = buildOverlay();
      ov.innerHTML =
        '<div class="privacy-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          cookiesPolicyHTML[currentLang()] +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closeModal);
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeModal() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-cookies-policy-link');
      if (!trigger) return;
      e.preventDefault();
      openModal();
    });
  })();


  /* ---------- Integrity Channel policy modal (footer link) ---------- */
  (function () {
    if (!document.querySelector('.js-integrity-link')) return;

    var overlay = null;

    var integrityHTML = {
      es:
        '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
        '<h2 id="integrity-modal-title">Política y Funcionamiento del Canal de Integridad</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Fecha de publicación: 5 de julio de 2026</p>' +
        '<p>La Cámara de Comercio Mercosur considera que la integridad institucional exige algo más que el cumplimiento formal de normas. Requiere mecanismos capaces de recibir alertas de buena fe, valorar los hechos con imparcialidad, proteger a las personas, preservar evidencia y adoptar medidas proporcionadas cuando exista un riesgo para la legalidad, los activos, la reputación o los fines de la institución. Esta Política explica el funcionamiento público del Canal de Integridad, delimita sus garantías y sus límites y establece los principios que deberán orientar su utilización, sin revelar los procedimientos operativos reservados que se desarrollarán en el Protocolo Interno correspondiente.</p>' +
        '<h3>1. Identidad institucional y canal de contacto</h3>' +
        '<p>La Cámara de Comercio Mercosur es una asociación internacional uruguaya con domicilio en Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay. El Canal de Integridad podrá utilizarse mediante el correo <a href="mailto:integridad@camaracomerciomercosur.org">integridad@camaracomerciomercosur.org</a>, que deberá mantenerse separado de las comunicaciones generales de la institución y bajo acceso restringido a personas formalmente designadas.</p>' +
        '<p>El acceso al buzón deberá administrarse mediante credenciales individuales, sin reenvíos automáticos a cuentas generales ni a personas ajenas a la gestión del Canal. Los permisos deberán revisarse periódicamente y revocarse de inmediato cuando cese una responsabilidad. La Cámara procurará mantener trazabilidad suficiente de los accesos y actuaciones, así como medidas razonables de seguridad, almacenamiento y respaldo acordes con la sensibilidad de la información recibida.</p>' +
        '<p>Cuando una comunicación afecte a una persona con acceso ordinario al Canal, al Responsable, a una autoridad que pueda influir en su gestión o a la mayoría del órgano competente, deberá utilizarse la vía alternativa que la Cámara habilite y publique específicamente para conflictos de interés. Hasta que exista un canal alternativo permanente, la comunicación deberá ser derivada sin demora a una instancia independiente y sin conflicto, conforme a lo previsto en esta Política.</p>' +
        '<h3>2. Naturaleza y finalidad del Canal</h3>' +
        '<p>El Canal de Integridad es un mecanismo voluntario de gobernanza institucional creado para recibir, registrar, evaluar y gestionar comunicaciones sobre posibles irregularidades vinculadas con la Cámara, sus órganos, su actividad, sus recursos, sus proyectos, sus eventos o su identidad institucional. Su finalidad es detectar riesgos, facilitar la corrección de incumplimientos, preservar evidencia, proteger a personas y activos, mejorar los controles internos y permitir que los órganos competentes adopten decisiones informadas.</p>' +
        '<p>El Canal no es un tribunal, una fiscalía, una autoridad policial o administrativa, ni sustituye los procedimientos judiciales, penales, laborales, civiles o regulatorios que puedan resultar aplicables. Tampoco constituye por sí mismo un procedimiento disciplinario autónomo ni garantiza que toda comunicación dará lugar a una investigación completa. La recepción de un mensaje no implica que los hechos sean ciertos, que exista responsabilidad ni que la Cámara adopte necesariamente medidas sancionadoras.</p>' +
        '<h3>3. Compromiso institucional</h3>' +
        '<p>La Cámara gestionará el Canal conforme a los principios de legalidad, buena fe, transparencia, independencia, imparcialidad, proporcionalidad, confidencialidad restringida, respeto, dignidad y responsabilidad. Se procurará proteger a quienes comuniquen hechos de buena fe sin perjudicar los derechos de la persona afectada, sin anticipar conclusiones y sin convertir el Canal en una herramienta de confrontación personal.</p>' +
        '<p>La creación del Canal responde a una decisión de buena gobernanza institucional. No debe interpretarse como una afirmación de que existe una obligación legal general y uniforme aplicable a todas las asociaciones civiles privadas uruguayas, sino como un compromiso voluntario de prevención, control, rendición de cuentas y mejora continua.</p>' +
        '<h3>4. Alcance institucional y relación con el MERCOSUR</h3>' +
        '<p>El Canal podrá recibir comunicaciones relacionadas con la Cámara, sus órganos, autoridades, asociados, empleados, asesores, proveedores, colaboradores, patrocinadores, panelistas, representantes, delegaciones, capítulos, eventos, programas, proyectos, fondos, activos, sistemas, documentos, certificados, credenciales, cuentas, datos, marca y cualquier actuación realizada o presentada como realizada en su nombre. No será necesario mantener una relación contractual previa, siempre que los hechos guarden una conexión razonable con la Cámara.</p>' +
        '<p>La Cámara desarrolla su actividad dentro del espacio económico, empresarial, social e institucional del MERCOSUR, pero no forma parte de la estructura política, gubernamental u orgánica oficial del bloque. Este Canal pertenece exclusivamente a la Cámara, no es un canal oficial del MERCOSUR, no investiga de forma general a Estados Partes, Estados Asociados, gobiernos u órganos oficiales y no sustituye los mecanismos institucionales del bloque. Una eventual inscripción futura en el Registro de Organizaciones y Movimientos Sociales del MERCOSUR —MOS— no alteraría esta naturaleza.</p>' +
        '<h3>5. Materias comprendidas</h3>' +
        '<p>Podrán comunicarse hechos relacionados con fraude, corrupción, soborno, apropiación indebida, utilización irregular de recursos, manipulación de registros, falsificación documental, ocultamiento de información relevante, conflictos de interés no declarados, incumplimientos graves de los Estatutos o de las políticas internas y cualquier actuación capaz de comprometer seriamente la legalidad o la integridad financiera de la Cámara.</p>' +
        '<p>También podrán comunicarse supuestos de suplantación, falsos representantes, uso indebido de cargos, credenciales vencidas, certificados alterados, perfiles o dominios confundibles, uso no autorizado de la marca y comunicaciones emitidas sin facultades. Quedan igualmente comprendidas la captación de fondos en nombre de la Cámara, la promoción de inversiones no autorizadas, el cobro de comisiones no aprobadas, las falsas promesas de respaldo, la utilización de documentos institucionales para legitimar operaciones privadas y la presentación de proyectos como aprobados sin autorización.</p>' +
        '<p>El Canal podrá utilizarse además para informar sobre abuso de autoridad, acoso, discriminación, violencia, trato degradante, represalias, incumplimientos de confidencialidad, utilización indebida de información, accesos no autorizados, filtraciones, pérdida de datos, manipulación de cuentas, incidentes de ciberseguridad y otras conductas que puedan afectar gravemente a las personas, los activos, la credibilidad o los fines institucionales.</p>' +
        '<h3>6. Materias excluidas y emergencias</h3>' +
        '<p>El Canal no está destinado a consultas comerciales generales, solicitudes de asociación, propuestas de cooperación, presentación ordinaria de proyectos, consultas de prensa, reclamaciones sobre tiempos de respuesta, desacuerdos menores sin dimensión institucional, opiniones políticas, consultas generales de privacidad o solicitudes ordinarias de ejercicio de derechos sobre datos personales. Las comunicaciones ajenas a su objeto podrán ser redirigidas, devueltas, archivadas o remitidas al área correspondiente.</p>' +
        '<p>El Canal tampoco es un servicio de emergencia. Cuando exista riesgo inmediato para una persona, peligro físico, un posible delito en curso, destrucción inminente de evidencia, pérdida inmediata de activos o un incidente crítico de seguridad, deberá contactarse directamente con la autoridad pública competente. La Cámara podrá comunicar información a la Policía, Fiscalía, tribunales, autoridades laborales, la Unidad Reguladora y de Control de Datos Personales u otros organismos cuando exista obligación legal, requerimiento válido, riesgo relevante o necesidad de proteger derechos.</p>' +
        '<h3>7. Presentación de una comunicación</h3>' +
        '<p>La comunicación debería describir los hechos de manera clara y, cuando sea posible, cronológica; indicar fechas aproximadas, personas o entidades involucradas, relación con la Cámara, documentos disponibles, posibles testigos, riesgos actuales, posibles represalias y cualquier medida urgente que pueda resultar necesaria. No se exige que la persona realice una investigación propia, aporte pruebas concluyentes o determine jurídicamente la infracción.</p>' +
        '<p>La información debe obtenerse de forma lícita. No deberán recopilarse pruebas mediante acceso ilícito, interceptación, sustracción, manipulación, vulneración de sistemas, invasión ilegítima de privacidad o cualquier otra conducta contraria a la ley. El Canal no legitima actuaciones ilícitas realizadas con el propósito de obtener evidencia.</p>' +
        '<h3>8. Comunicaciones identificadas, confidenciales y anónimas</h3>' +
        '<p>Las comunicaciones identificadas permiten mantener contacto con la persona, solicitar aclaraciones y, cuando resulte posible, informar sobre el estado o cierre. Cuando la identidad sea conocida, la Cámara limitará su acceso a quienes necesiten conocerla para gestionar el asunto.</p>' +
        '<p>También podrán admitirse comunicaciones anónimas cuando contengan información suficientemente concreta para una evaluación razonable. Sin embargo, el correo electrónico ordinario no garantiza anonimato técnico, la identidad puede inferirse del contenido o del contexto y la ausencia de contacto puede dificultar la revisión, impedir aclaraciones o limitar la información sobre el resultado. La Cámara no promete anonimato absoluto ni confidencialidad absoluta.</p>' +
        '<h3>9. Buena fe y prohibición de represalias</h3>' +
        '<p>Se considerará realizada de buena fe la comunicación basada en hechos que la persona considere razonablemente verdaderos al momento de informar, aunque posteriormente no puedan confirmarse. La falta de confirmación de los hechos no convierte por sí misma una comunicación en falsa, maliciosa o abusiva, ni se exige que la persona haya interpretado correctamente la normativa aplicable.</p>' +
        '<p>La Cámara prohíbe represalias internas contra quienes comuniquen hechos de buena fe, así como contra testigos, personas colaboradoras o quienes aporten documentación. Se considerarán represalias, entre otras, las amenazas, el hostigamiento, la exclusión injustificada, la retirada arbitraria de oportunidades, la presión para retirar la comunicación, el perjuicio reputacional, la terminación injustificada de relaciones o la revelación innecesaria de identidad.</p>' +
        '<p>Esta protección constituye un compromiso institucional y no una inmunidad absoluta frente a consecuencias legítimas derivadas de conductas propias ajenas a la comunicación. Tampoco protege las comunicaciones deliberadamente falsas o utilizadas como mecanismo de acoso, represalia, coacción o extorsión.</p>' +
        '<h3>10. Comunicaciones falsas o abusivas</h3>' +
        '<p>Debe distinguirse entre un error de buena fe, una comunicación no confirmada, una interpretación equivocada o una falta de evidencia suficiente y una comunicación deliberadamente falsa. Solo podrán dar lugar a medidas las comunicaciones formuladas con conocimiento de su falsedad, intención deliberada de perjudicar, documentación manipulada, ocultación consciente de hechos esenciales o utilización abusiva del Canal.</p>' +
        '<p>Esta cláusula deberá aplicarse de manera restrictiva y no podrá utilizarse para desalentar comunicaciones legítimas, sancionar errores razonables ni trasladar al comunicante la obligación de probar definitivamente los hechos.</p>' +
        '<h3>11. Recepción, confirmación y gestión diligente</h3>' +
        '<p>Cuando sea posible, la Cámara confirmará la recepción, asignará una referencia interna y podrá solicitar información adicional. Procurará realizar estas actuaciones en un plazo razonable y mantener una gestión diligente, atendiendo a la gravedad, urgencia, complejidad, disponibilidad de evidencia, riesgo de represalias y necesidad de intervención externa.</p>' +
        '<p>No se establece un plazo rígido de resolución, porque la duración dependerá de las circunstancias de cada asunto. Cuando una demora resulte significativa, la Cámara podrá informar de ello en términos generales, siempre que esa comunicación no perjudique la revisión, los derechos de terceros o la confidencialidad.</p>' +
        '<h3>12. Etapas de evaluación, revisión e investigación</h3>' +
        '<p>La evaluación inicial tiene por finalidad determinar si la materia entra dentro del Canal, si existe información mínima, si hay riesgo inmediato, si debe preservarse evidencia, si existe un conflicto de interés, si corresponde redirigir el asunto o si procede informar a una autoridad. Esta fase no implica la apertura de una investigación formal.</p>' +
        '<p>Cuando existan elementos suficientes, podrá iniciarse una revisión preliminar destinada a comprobar de manera proporcionada los hechos esenciales. Solo cuando la naturaleza, gravedad o consistencia de la información lo justifiquen se abrirá una investigación interna formal. Si de las conclusiones pudieran derivarse consecuencias estatutarias, contractuales o laborales, corresponderá al órgano competente iniciar el procedimiento específico aplicable, con las garantías correspondientes.</p>' +
        '<p>La Cámara podrá solicitar aclaraciones, acumular asuntos relacionados, archivar comunicaciones manifiestamente ajenas, adoptar medidas preventivas, solicitar asistencia externa o remitir los hechos a otro procedimiento. El archivo inicial no equivale necesariamente a negar la veracidad de lo comunicado.</p>' +
        '<h3>13. Gobernanza, independencia y conflictos de interés</h3>' +
        '<p>La Cámara preverá la existencia de un Responsable del Canal de Integridad, uno o más suplentes y un órgano competente para decidir las medidas que excedan la mera gestión operativa. El Responsable recibirá, registrará, protegerá, evaluará inicialmente y coordinará la tramitación, pero no podrá imponer sanciones ni adoptar decisiones que correspondan estatutariamente a otros órganos.</p>' +
        '<p>Ninguna persona podrá recibir, evaluar, investigar o decidir un asunto que se refiera a ella, afecte a una persona estrechamente vinculada, se relacione con una actuación propia, genere un interés personal o comprometa objetivamente su imparcialidad. Cuando exista conflicto, la gestión se asignará a una instancia alternativa, que podrá ser la Comisión Fiscal, una comisión ad hoc, un asesor jurídico externo, un investigador independiente u otra instancia sin conflicto. La existencia de un conflicto no paralizará el Canal.</p>' +
        '<h3>14. Revisión, investigación y preservación de evidencia</h3>' +
        '<p>La tramitación se regirá por la independencia, imparcialidad, diligencia, proporcionalidad, confidencialidad, trazabilidad, presunción de inocencia, derecho de defensa, minimización de datos y respeto de la dignidad de las personas. Podrá incluir revisión documental, entrevistas, solicitudes de aclaración, verificación de nombramientos, revisión de registros institucionales, análisis de correos o sistemas cuando sea legítimo, asesoramiento profesional y preservación de evidencia.</p>' +
        '<p>La Cámara deberá procurar que la evidencia relevante se conserve de forma íntegra, identificable y segura. El detalle de la cadena de custodia, los controles de acceso, los modelos de acta, la documentación de entrevistas y las reglas de aprobación de medidas se regularán en el Protocolo Interno del Canal de Integridad, de circulación restringida. Esta Política no describe métodos internos sensibles ni técnicas que puedan facilitar interferencias.</p>' +
        '<h3>15. Derechos de la persona afectada</h3>' +
        '<p>La persona señalada tendrá derecho a ser tratada con imparcialidad, no ser considerada responsable antes de una conclusión, conocer las alegaciones esenciales cuando sea procesalmente oportuno, presentar explicaciones, aportar documentos, proponer evidencia, formular observaciones y proteger su privacidad y reputación.</p>' +
        '<p>Determinada información podrá mantenerse reservada temporalmente cuando su comunicación inmediata pueda destruir evidencia, interferir con la revisión, exponer a una persona, frustrar medidas preventivas o afectar una investigación externa. Esta reserva no podrá utilizarse para negar indefinidamente el derecho de defensa.</p>' +
        '<h3>16. Asistencia, representación y colaboración</h3>' +
        '<p>Cuando la naturaleza del asunto lo justifique, la persona comunicante, la persona afectada o un testigo podrán solicitar ser acompañados por un asesor, representante o persona de confianza. La Cámara podrá limitar o rechazar esa participación cuando exista conflicto de interés, riesgo para la confidencialidad, interferencia con la revisión o perjuicio para derechos de terceros.</p>' +
        '<p>Las personas participantes deberán colaborar de buena fe, mantener la reserva que resulte razonablemente necesaria y evitar cualquier conducta que pueda alterar evidencia, influir indebidamente en testigos o perjudicar a otras personas. La asistencia permitida no convierte el Canal en un procedimiento judicial ni atribuye al acompañante facultades de dirección sobre la revisión.</p>' +
        '<h3>17. Retirada de la comunicación y continuidad de la actuación</h3>' +
        '<p>La persona comunicante podrá manifestar que no desea continuar colaborando o solicitar la retirada de su comunicación. La Cámara procurará respetar esa decisión en la medida posible, pero podrá continuar la evaluación o revisión cuando existan riesgos relevantes, otras personas potencialmente afectadas, evidencia que deba preservarse, obligaciones legales, posibles infracciones graves o razones suficientes de protección institucional.</p>' +
        '<p>La retirada de la comunicación no obliga a eliminar inmediatamente la información ya recibida ni impide comunicar hechos a las autoridades competentes cuando corresponda. Cualquier continuidad deberá ser proporcionada y respetar las reglas de protección de datos y confidencialidad.</p>' +
        '<h3>18. Medidas preventivas</h3>' +
        '<p>Antes de concluir una revisión, la Cámara podrá adoptar medidas temporales para proteger personas, preservar evidencia, limitar accesos, suspender credenciales, detener usos de marca, impedir comunicaciones engañosas, proteger activos o evitar nuevos perjuicios. Estas medidas no constituyen una declaración de responsabilidad.</p>' +
        '<p>Toda medida preventiva deberá ser proporcional, limitada en alcance y duración, revisada cuando corresponda y adoptada por el órgano competente de acuerdo con los Estatutos y las normas internas.</p>' +
        '<h3>19. Resultado y medidas institucionales</h3>' +
        '<p>Al finalizar la revisión, la Cámara podrá archivar el asunto, emitir recomendaciones, solicitar correcciones, reforzar controles, retirar contenidos, revocar autorizaciones, suspender accesos o credenciales, iniciar procedimientos estatutarios, terminar relaciones contractuales, reclamar activos, comunicar hechos a autoridades o ejercer acciones legales.</p>' +
        '<p>Las medidas respecto de asociados, autoridades o directivos deberán respetar los Estatutos, los reglamentos internos, las competencias del órgano correspondiente, el derecho de defensa, la proporcionalidad y la normativa aplicable. El Responsable del Canal no podrá imponer por sí mismo medidas que excedan sus facultades.</p>' +
        '<h3>20. Información a la persona comunicante</h3>' +
        '<p>La Cámara podrá confirmar la recepción, solicitar aclaraciones, proporcionar información general sobre el estado e informar del cierre en términos generales. No estará obligada a revelar datos personales de terceros, sanciones concretas, informes completos, deliberaciones internas, información laboral o contractual, estrategias legales, comunicaciones con autoridades ni otras materias protegidas.</p>' +
        '<p>La extensión de la información proporcionada dependerá de la naturaleza del asunto, los derechos de terceros, la confidencialidad, las restricciones legales y la necesidad de proteger la eficacia de la revisión.</p>' +
        '<h3>21. Protección de datos personales</h3>' +
        '<p>La Cámara de Comercio Mercosur será responsable del tratamiento de los datos personales gestionados a través del Canal. Los datos podrán utilizarse para recibir y evaluar comunicaciones, analizar hechos con alcance institucional, proteger personas y activos, adoptar medidas, preservar evidencia, cumplir obligaciones, ejercer o defender derechos y comunicar información a autoridades cuando proceda. Podrán acceder a ellos las personas responsables del Canal, los órganos competentes, asesores externos, investigadores o autoridades, únicamente cuando resulte necesario y jurídicamente procedente.</p>' +
        '<p>El tratamiento se regirá por la Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data, el Decreto N.º 414/009, el Decreto N.º 64/020, la Política de Privacidad y los criterios de la Unidad Reguladora y de Control de Datos Personales. Se aplicarán los principios de minimización, pertinencia, acceso restringido, seguridad, confidencialidad, exactitud, conservación limitada, trazabilidad y responsabilidad.</p>' +
        '<p>La evaluación realizada por la Cámara tendrá alcance exclusivamente institucional, preventivo, estatutario, laboral o contractual, según corresponda. La Cámara documentará hechos, alegaciones, evidencia, actuaciones y decisiones institucionales, pero no determinará responsabilidades penales, civiles o administrativas reservadas a las autoridades competentes, no creará una base privada de antecedentes ni mantendrá listas informales de personas denunciadas. Cuando se prevean transferencias internacionales o acceso desde otra jurisdicción, se aplicarán las garantías exigidas por la normativa y se informará conforme a la Política de Privacidad.</p>' +
        '<h3>22. Derechos en materia de datos</h3>' +
        '<p>Las personas podrán ejercer los derechos reconocidos por la normativa uruguaya mediante los mecanismos previstos en la Política de Privacidad. La Cámara podrá aplicar limitaciones temporales, proporcionales y jurídicamente justificadas cuando sean necesarias para preservar la revisión, proteger derechos de terceros, impedir la destrucción de evidencia, cumplir obligaciones o atender requerimientos de autoridades.</p>' +
        '<p>Toda limitación deberá revisarse cuando desaparezcan las razones que la justificaron. La rectificación de un dato inexacto no implicará necesariamente la eliminación de documentos cuya conservación sea necesaria para acreditar el desarrollo del procedimiento o defender derechos.</p>' +
        '<h3>23. Conservación, bloqueo y eliminación</h3>' +
        '<p>Las comunicaciones ajenas al Canal, aquellas sin información suficiente, los expedientes cerrados sin medidas, los casos con medidas, los asuntos remitidos a autoridades y la documentación necesaria para la defensa podrán requerir periodos de conservación diferentes. Los criterios aplicables deberán estar documentados en el Protocolo Interno y revisarse periódicamente atendiendo a la finalidad, la gravedad, los plazos de responsabilidad, las obligaciones legales y la necesidad de preservar evidencia.</p>' +
        '<p>Los datos se mantendrán únicamente durante el tiempo necesario para evaluar, revisar, adoptar medidas, cumplir obligaciones, atender plazos de responsabilidad, ejercer o defender derechos y preservar evidencia. Cuando ya no sean necesarios, deberán eliminarse, anonimizarse o bloquearse conforme corresponda. Quedan prohibidas la conservación indefinida, los expedientes informales, los registros paralelos, las listas de personas acusadas y la reutilización para finalidades ajenas.</p>' +
        '<h3>24. Seguridad digital y gestión de incidentes</h3>' +
        '<p>La Cámara aplicará medidas razonables para proteger el Canal frente a accesos no autorizados, pérdida, alteración, divulgación o destrucción de información. La documentación especialmente sensible deberá almacenarse de forma separada y compartirse únicamente mediante medios adecuados al riesgo. Se evitarán copias innecesarias, reenvíos indiscriminados y almacenamiento en dispositivos o cuentas personales.</p>' +
        '<p>Cuando se detecte un incidente de seguridad relacionado con el Canal, la Cámara deberá contenerlo, preservar evidencia, evaluar sus efectos, restringir accesos comprometidos y realizar las comunicaciones exigidas por la normativa aplicable. El Protocolo Interno desarrollará las responsabilidades y actuaciones concretas.</p>' +
        '<h3>25. Acoso, discriminación y violencia</h3>' +
        '<p>El Canal podrá recibir comunicaciones relacionadas con acoso, discriminación, violencia, abuso de autoridad, represalias y trato degradante. Estas materias pueden exigir medidas de protección, procedimientos laborales, investigación especializada, asistencia profesional o comunicación a autoridades.</p>' +
        '<p>Cuando los hechos se encuentren dentro de su ámbito específico, se tendrá en cuenta la Ley N.º 19.580, relativa al derecho de las mujeres a una vida libre de violencia basada en género, junto con las demás normas laborales, civiles, penales y antidiscriminatorias que correspondan. El Canal no sustituye los mecanismos legales, administrativos o judiciales de protección.</p>' +
        '<h3>26. Transparencia agregada y coordinación documental</h3>' +
        '<p>La Cámara podrá publicar información estadística general sobre el número de comunicaciones, categorías, estado general, tendencias de riesgo y mejoras implementadas. Nunca deberá divulgar datos que permitan identificar comunicantes, personas afectadas, testigos, proyectos, entidades, relaciones contractuales o hechos confidenciales.</p>' +
        '<p>Esta Política se interpretará conjuntamente con los Estatutos, los Términos de Uso, la Política de Privacidad, la Política de Cookies, la Política de Uso de Marca, los reglamentos internos, los contratos, los procedimientos laborales y el Protocolo Interno del Canal de Integridad. Prevalecerán las normas imperativas, los Estatutos y las competencias legalmente atribuidas a cada órgano.</p>' +
        '<h3>27. Modificaciones, legislación y jurisdicción</h3>' +
        '<p>La Cámara podrá actualizar esta Política para reflejar cambios normativos, experiencia práctica, evolución tecnológica, expansión territorial, nuevas delegaciones, identificación de riesgos o mejoras de control. La versión vigente será la publicada en el sitio web y las modificaciones no afectarán retroactivamente derechos consolidados.</p>' +
        '<p>La Política se regirá por las leyes de la República Oriental del Uruguay. Las diferencias relacionadas con su aplicación procurarán resolverse de buena fe y, cuando corresponda, serán sometidas a los tribunales competentes de Montevideo, sin perjuicio de las normas imperativas y de la intervención de autoridades públicas competentes.</p>' +
        '<h3>28. Contacto</h3>' +
        '<p>Para presentar una comunicación, aportar información adicional, informar una posible represalia o comunicar un conflicto de interés relacionado con el Canal, puede escribirse a <a href="mailto:integridad@camaracomerciomercosur.org">integridad@camaracomerciomercosur.org</a>.</p>' +
        '<p>Cámara de Comercio Mercosur. Asociación internacional uruguaya. Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay.</p>' +
        '<p>Marco normativo de referencia: Ley N.º 18.331 de Protección de Datos Personales y Acción de Habeas Data; Decreto N.º 414/009; Decreto N.º 64/020; Ley N.º 19.580, cuando resulte aplicable; Estatutos y demás normativa uruguaya pertinente.</p>',
      en:
        '<p class="privacy-eyebrow">Mercosur Chamber of Commerce</p>' +
        '<h2 id="integrity-modal-title">Integrity Channel Policy and Operation</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Publication date: July 5, 2026</p>' +
        '<p>The Mercosur Chamber of Commerce believes that institutional integrity requires more than formal compliance with rules. It also requires mechanisms that can receive reports made in good faith, assess facts fairly, protect people, preserve evidence, and take appropriate measures when there is a risk to legality, assets, reputation, or the institution’s purposes. This Policy explains how the Integrity Channel works, defines its guarantees and limits, and sets the principles that should guide its use, without revealing the confidential internal procedures that will be described in the Internal Protocol.</p>' +
        '<h3>1. Institutional Identification and Contact Channel</h3>' +
        '<p>The Mercosur Chamber of Commerce is a Uruguayan international association located at Carlos Quijano 1290, Office 101, Montevideo 11.100, Uruguay. The Integrity Channel may be used through the email <a href="mailto:integridad@camaracomerciomercosur.org">integridad@camaracomerciomercosur.org</a>, which must remain separate from the institution’s general communications and be accessible only to formally designated persons.</p>' +
        '<p>Access to the mailbox must be managed through individual credentials, without automatic forwarding to general accounts or to people who are not responsible for managing the Channel. Permissions must be reviewed regularly and revoked immediately when a responsibility ends. The Chamber will seek to maintain sufficient traceability of access and actions, as well as reasonable security, storage, and backup measures consistent with the sensitivity of the information received.</p>' +
        '<p>When a report involves a person who normally has access to the Channel, the Responsible Officer, an authority able to influence its management, or the majority of the competent body, the alternative reporting method that the Chamber may create and publish for conflicts of interest must be used. Until a permanent alternative channel exists, the report must be transferred without delay to an independent and conflict-free body, as provided in this Policy.</p>' +
        '<h3>2. Nature and Purpose of the Channel</h3>' +
        '<p>The Integrity Channel is a voluntary institutional governance mechanism created to receive, record, assess, and manage reports about possible irregularities related to the Chamber, its bodies, activities, resources, projects, events, or institutional identity. Its purpose is to identify risks, help correct non-compliance, preserve evidence, protect people and assets, improve internal controls, and allow the competent bodies to make informed decisions.</p>' +
        '<p>The Channel is not a court, a prosecutor’s office, a police authority, or an administrative authority, and it does not replace judicial, criminal, labor, civil, or regulatory procedures that may apply. It is also not an independent disciplinary procedure and does not guarantee that every report will lead to a full investigation. Receiving a message does not mean that the facts are true, that someone is responsible, or that the Chamber will necessarily apply sanctions.</p>' +
        '<h3>3. Institutional Commitment</h3>' +
        '<p>The Chamber will manage the Channel according to the principles of legality, good faith, transparency, independence, impartiality, proportionality, restricted confidentiality, respect, dignity, and accountability. It will seek to protect people who report facts in good faith, without harming the rights of the person mentioned, without reaching conclusions in advance, and without turning the Channel into a tool for personal conflict.</p>' +
        '<p>The creation of the Channel is a decision based on good institutional governance. It should not be interpreted as a statement that a general and uniform legal obligation exists for all private Uruguayan civil associations, but as a voluntary commitment to prevention, control, accountability, and continuous improvement.</p>' +
        '<h3>4. Institutional Scope and Relationship with MERCOSUR</h3>' +
        '<p>The Channel may receive reports related to the Chamber, its bodies, authorities, members, employees, advisors, suppliers, collaborators, sponsors, speakers, representatives, delegations, chapters, events, programs, projects, funds, assets, systems, documents, certificates, credentials, accounts, data, trademark, and any action carried out or presented as being carried out in its name. A previous contractual relationship is not required, provided that the facts have a reasonable connection with the Chamber.</p>' +
        '<p>The Chamber operates within the economic, business, social, and institutional space of MERCOSUR, but it is not part of the bloc’s official political, governmental, or organizational structure. This Channel belongs exclusively to the Chamber, is not an official MERCOSUR channel, does not generally investigate Member States, Associated States, governments, or official bodies, and does not replace the bloc’s institutional mechanisms. A future registration in the MERCOSUR Registry of Social Organizations and Movements (MOS) would not change this nature.</p>' +
        '<h3>5. Matters Covered</h3>' +
        '<p>Reports may include fraud, corruption, bribery, misuse of resources, irregular use of funds, manipulation of records, document forgery, concealment of relevant information, undeclared conflicts of interest, serious violations of the Bylaws or internal policies, and any conduct that may seriously affect the legality or financial integrity of the Chamber.</p>' +
        '<p>Reports may also include identity impersonation, false representatives, unauthorized use of positions, expired credentials, altered certificates, misleading profiles or domains, unauthorized use of the Chamber\'s trademark, and communications issued without proper authority. They may also include fundraising in the Chamber\'s name, unauthorized investment promotions, collection of unapproved commissions, false claims of institutional support, use of Chamber documents to support private activities, and presenting projects as approved without authorization.</p>' +
        '<p>The Channel may also be used to report abuse of authority, harassment, discrimination, violence, degrading treatment, retaliation, breaches of confidentiality, improper use of information, unauthorized access, data leaks, account manipulation, cybersecurity incidents, and any other conduct that may seriously affect people, assets, credibility, or the institutional purposes of the Chamber.</p>' +
        '<h3>6. Matters Not Covered and Emergencies</h3>' +
        '<p>The Channel is not intended for general business inquiries, membership applications, cooperation proposals, regular project submissions, press inquiries, complaints about response times, minor disagreements without institutional impact, political opinions, general privacy questions, or ordinary requests to exercise personal data rights. Communications outside the purpose of the Channel may be redirected, returned, archived, or sent to the appropriate department.</p>' +
        '<p>The Channel is also not an emergency service. If there is an immediate risk to a person, physical danger, a possible crime in progress, imminent destruction of evidence, immediate loss of assets, or a critical security incident, the appropriate public authority should be contacted directly. The Chamber may provide information to the Police, the Public Prosecutor\'s Office, the courts, labor authorities, the Personal Data Regulatory and Control Unit, or other authorities when required by law, by a valid request, because of a significant risk, or to protect rights.</p>' +
        '<h3>7. Submitting a Report</h3>' +
        '<p>The report should describe the facts clearly and, whenever possible, in chronological order. It should include approximate dates, the people or organizations involved, their relationship with the Chamber, available documents, possible witnesses, current risks, possible retaliation, and any urgent action that may be necessary. The person is not required to conduct an investigation, provide conclusive evidence, or make a legal assessment of the violation.</p>' +
        '<p>The information must be obtained legally. Evidence must not be collected through illegal access, interception, theft, manipulation, unauthorized access to systems, unlawful invasion of privacy, or any other illegal conduct. The Channel does not authorize unlawful actions to obtain evidence.</p>' +
        '<h3>8. Identified, Confidential, and Anonymous Reports</h3>' +
        '<p>Identified reports allow the Chamber to contact the person, request additional information, and, when possible, provide updates or information about the closure of the case. When the identity of the person is known, the Chamber will limit access to those who need this information to handle the case.</p>' +
        '<p>Anonymous reports may also be accepted if they contain enough specific information for a reasonable assessment. However, regular email does not guarantee technical anonymity, a person\'s identity may be inferred from the content or context, and the lack of contact may make the review more difficult, prevent requests for clarification, or limit information about the outcome. The Chamber does not guarantee complete anonymity or complete confidentiality.</p>' +
        '<h3>9. Good Faith and Protection Against Retaliation</h3>' +
        '<p>A report will be considered to have been made in good faith when it is based on facts that the person reasonably believes to be true at the time of reporting, even if they cannot later be confirmed. The fact that the information cannot be confirmed does not automatically make the report false, malicious, or abusive, and the person is not required to interpret the law correctly.</p>' +
        '<p>The Chamber prohibits internal retaliation against people who report in good faith, as well as against witnesses, collaborators, or people who provide documents. Retaliation includes threats, harassment, unjustified exclusion, unfair removal of opportunities, pressure to withdraw a report, reputational harm, unjustified termination of relationships, or unnecessary disclosure of a person\'s identity.</p>' +
        '<p>This protection is an institutional commitment and not absolute immunity from legitimate consequences arising from unrelated personal conduct. It also does not protect reports that are intentionally false or used for harassment, retaliation, coercion, or extortion.</p>' +
        '<h3>10. False or Abusive Reports</h3>' +
        '<p>A good-faith mistake, an unconfirmed report, an incorrect interpretation, or a lack of sufficient evidence must be distinguished from a deliberately false report. Measures may only be taken when a report is made knowing that it is false, with the deliberate intention of causing harm, by using manipulated documents, intentionally hiding essential facts, or abusing the Channel.</p>' +
        '<p>This provision must be applied carefully and must not discourage legitimate reports, punish reasonable mistakes, or require the reporting person to prove the facts completely.</p>' +
        '<h3>11. Receipt, Confirmation, and Diligent Handling</h3>' +
        '<p>Whenever possible, the Chamber will confirm receipt of the report, assign an internal reference number, and may request additional information. It will seek to handle reports within a reasonable time, considering the seriousness, urgency, complexity, available evidence, risk of retaliation, and possible need for external action.</p>' +
        '<p>No fixed deadline is established because the time required depends on the circumstances of each case. If there is a significant delay, the Chamber may provide general information about the status, provided this does not affect the review, the rights of third parties, or confidentiality.</p>' +
        '<h3>12. Assessment, Review, and Investigation</h3>' +
        '<p>The initial assessment is intended to determine whether the matter falls within the scope of the Channel, whether there is enough information, whether there is an immediate risk, whether evidence should be preserved, whether there is a conflict of interest, whether the matter should be redirected, or whether a public authority should be informed. This stage does not mean that a formal investigation has started.</p>' +
        '<p>If there is enough information, the Chamber may begin a preliminary review to verify the main facts in a reasonable and proportionate way. A formal internal investigation will only begin when the nature, seriousness, or consistency of the information justifies it. If the conclusions may lead to statutory, contractual, or employment consequences, the competent body will begin the appropriate procedure with the corresponding safeguards.</p>' +
        '<p>The Chamber may request additional information, combine related cases, archive reports that clearly fall outside the scope of the Channel, adopt preventive measures, request external assistance, or refer the matter to another procedure. An initial decision to close a case does not necessarily mean that the reported facts are false.</p>' +
        '<h3>13. Governance, Independence, and Conflicts of Interest</h3>' +
        '<p>The Chamber will appoint an Integrity Channel Officer, one or more deputies, and a competent body to decide on measures that go beyond the daily management of the Channel. The Officer will receive, register, protect, carry out the initial assessment, and coordinate the handling of reports, but may not impose sanctions or make decisions that, under the Bylaws, belong to other bodies.</p>' +
        '<p>No person may receive, assess, investigate, or decide a matter concerning themselves, a closely related person, their own actions, a personal interest, or any situation that objectively affects their impartiality. When a conflict of interest exists, the case will be assigned to an alternative body, which may be the Supervisory Committee, an ad hoc committee, an external legal advisor, an independent investigator, or another conflict-free body. The existence of a conflict of interest will not interrupt the operation of the Channel.</p>' +
        '<h3>14. Review, Investigation, and Preservation of Evidence</h3>' +
        '<p>The process will follow the principles of independence, impartiality, diligence, proportionality, confidentiality, traceability, presumption of innocence, right of defense, data minimization, and respect for people\'s dignity. It may include document reviews, interviews, requests for clarification, verification of appointments, review of institutional records, review of emails or systems when legally permitted, professional advice, and preservation of evidence.</p>' +
        '<p>The Chamber will seek to ensure that relevant evidence is kept complete, identifiable, and secure. Details about the chain of custody, access controls, report templates, interview records, and approval rules for measures will be established in the Internal Integrity Channel Protocol, which has restricted circulation. This Policy does not describe sensitive internal methods or techniques that could make interference easier.</p>' +
        '<h3>15. Rights of the Person Concerned</h3>' +
        '<p>The person concerned has the right to be treated fairly, not to be considered responsible before a conclusion is reached, to know the main allegations when appropriate, to provide explanations, submit documents, present evidence, make observations, and protect their privacy and reputation.</p>' +
        '<p>Some information may remain temporarily confidential when immediate disclosure could destroy evidence, interfere with the review, expose a person, prevent protective measures, or affect an external investigation. This confidentiality cannot be used to deny the right of defense indefinitely.</p>' +
        '<h3>16. Assistance, Representation, and Cooperation</h3>' +
        '<p>When appropriate, the reporting person, the person concerned, or a witness may request the support of an adviser, representative, or trusted person. The Chamber may limit or refuse this participation if there is a conflict of interest, a confidentiality risk, interference with the review, or harm to the rights of others.</p>' +
        '<p>Participants must cooperate in good faith, keep the necessary confidentiality, and avoid any action that could change evidence, improperly influence witnesses, or harm other people. This support does not turn the Integrity Channel into a court procedure or give the accompanying person authority over the review.</p>' +
        '<h3>17. Withdrawal of a Report and Continuation of the Process</h3>' +
        '<p>The reporting person may state that they no longer wish to cooperate or request the withdrawal of their report. The Chamber will try to respect this decision whenever possible, but it may continue the assessment or review if there are significant risks, other potentially affected people, evidence that must be preserved, legal obligations, possible serious violations, or sufficient reasons to protect the institution.</p>' +
        '<p>Withdrawing a report does not require the immediate deletion of information already received and does not prevent the Chamber from informing the competent authorities when necessary. Any continuation must be proportionate and comply with data protection and confidentiality rules.</p>' +
        '<h3>18. Preventive Measures</h3>' +
        '<p>Before completing the review, the Chamber may adopt temporary measures to protect people, preserve evidence, limit access, suspend credentials, stop unauthorized use of the brand, prevent misleading communications, protect assets, or avoid further harm. These measures do not mean that responsibility has been established.</p>' +
        '<p>Every preventive measure must be proportionate, limited in scope and duration, reviewed when necessary, and adopted by the competent body according to the Statutes and internal rules.</p>' +
        '<h3>19. Outcome and Institutional Measures</h3>' +
        '<p>After completing the review, the Chamber may close the case, issue recommendations, request corrective actions, strengthen controls, remove content, revoke authorizations, suspend access or credentials, start procedures under the Statutes, end contractual relationships, recover assets, report the facts to the authorities, or take legal action.</p>' +
        '<p>Measures concerning members, authorities, or directors must respect the Statutes, internal regulations, the powers of the competent body, the right of defense, proportionality, and applicable law. The Integrity Channel Officer cannot impose measures beyond their authority.</p>' +
        '<h3>20. Information for the Reporting Person</h3>' +
        '<p>The Chamber may confirm receipt of the report, request additional information, provide general updates about the case, and inform the reporting person when the case is closed. It is not required to disclose personal data of third parties, specific sanctions, complete reports, internal discussions, employment or contractual information, legal strategies, communications with authorities, or other protected information.</p>' +
        '<p>The amount of information provided will depend on the nature of the case, the rights of third parties, confidentiality, legal restrictions, and the need to protect the effectiveness of the review.</p>' +
        '<h3>21. Personal Data Protection</h3>' +
        '<p>The Mercosur Chamber of Commerce is responsible for processing the personal data handled through the Integrity Channel. The data may be used to receive and assess reports, review institutional matters, protect people and assets, adopt measures, preserve evidence, comply with legal obligations, exercise or defend rights, and communicate information to the authorities when necessary. Access will be limited to the people responsible for the Integrity Channel, competent bodies, external advisers, investigators, or authorities, only when necessary and legally allowed.</p>' +
        '<p>The processing of data will follow Law No. 18.331 on Personal Data Protection and Habeas Data, Decree No. 414/009, Decree No. 64/020, the Privacy Policy, and the guidance of the Personal Data Regulatory and Control Unit. The principles of data minimization, relevance, restricted access, security, confidentiality, accuracy, limited retention, traceability, and accountability will be applied.</p>' +
        '<p>The Chamber\'s assessment has only an institutional, preventive, statutory, employment, or contractual purpose, depending on the case. The Chamber may document facts, allegations, evidence, actions, and institutional decisions, but it will not determine criminal, civil, or administrative responsibility, create a private record of accusations, or maintain informal lists of reported persons. When international transfers or access from another country are expected, the legal safeguards will be applied, and the information will be provided according to the Privacy Policy.</p>' +
        '<h3>22. Data Rights</h3>' +
        '<p>People may exercise the rights provided by Uruguayan law through the procedures described in the Privacy Policy. The Chamber may apply temporary, proportionate, and legally justified restrictions when necessary to protect the review, the rights of third parties, evidence, legal obligations, or official requests.</p>' +
        '<p>Any restriction will be reviewed when the reasons for it no longer exist. Correcting inaccurate information does not necessarily require deleting documents that must be kept to demonstrate how the procedure was carried out or to defend legal rights.</p>' +
        '<h3>23. Retention, Blocking, and Deletion</h3>' +
        '<p>Reports outside the scope of the Integrity Channel, reports with insufficient information, closed cases without measures, cases with measures, matters referred to authorities, and documents needed for legal defense may require different retention periods. These rules will be documented in the Internal Protocol and reviewed regularly according to their purpose, seriousness, legal obligations, liability periods, and the need to preserve evidence.</p>' +
        '<p>Data will be kept only for as long as necessary to assess reports, conduct reviews, adopt measures, comply with legal obligations, meet liability periods, exercise or defend rights, and preserve evidence. When no longer needed, the data will be deleted, anonymized, or blocked, as appropriate. Indefinite retention, informal files, parallel records, lists of reported persons, and reuse of data for unrelated purposes are prohibited.</p>' +
        '<h3>24. Digital Security and Incident Management</h3>' +
        '<p>The Chamber will adopt reasonable measures to protect the Integrity Channel against unauthorized access, loss, alteration, disclosure, or destruction of information. Highly sensitive documents will be stored separately and shared only through secure methods appropriate to the level of risk. Unnecessary copies, indiscriminate forwarding, and storage on personal devices or accounts will be avoided.</p>' +
        '<p>If a security incident related to the Integrity Channel is identified, the Chamber will contain it, preserve the evidence, assess its effects, restrict compromised access, and make the notifications required by applicable law. The Internal Protocol will define the specific responsibilities and procedures.</p>' +
        '<h3>25. Harassment, Discrimination, and Violence</h3>' +
        '<p>The Integrity Channel may receive reports related to harassment, discrimination, violence, abuse of authority, retaliation, and degrading treatment. These matters may require protective measures, employment procedures, specialized investigations, professional assistance, or reporting to the competent authorities.</p>' +
        '<p>When the facts fall within its specific scope, Law No. 19.580, regarding the right of women to live free from gender-based violence, will be taken into account, together with other applicable employment, civil, criminal, and anti-discrimination laws. The Integrity Channel does not replace legal, administrative, or judicial protection mechanisms.</p>' +
        '<h3>26. Aggregated Transparency and Document Coordination</h3>' +
        '<p>The Chamber may publish general statistical information about the number of reports, categories, overall status, risk trends, and improvements that have been implemented. It will never publish information that could identify reporting persons, affected individuals, witnesses, projects, entities, contractual relationships, or confidential facts.</p>' +
        '<p>This Policy must be interpreted together with the Statutes, the Terms of Use, the Privacy Policy, the Cookie Policy, the Brand Use Policy, the internal regulations, contracts, employment procedures, and the Internal Integrity Channel Protocol. Mandatory legal rules, the Statutes, and the powers legally assigned to each governing body will prevail.</p>' +
        '<h3>27. Changes, Governing Law, and Jurisdiction</h3>' +
        '<p>The Chamber may update this Policy to reflect legal changes, practical experience, technological developments, territorial expansion, new delegations, identified risks, or improvements to its control systems. The current version will be the one published on the website, and any changes will not affect previously established rights.</p>' +
        '<p>This Policy is governed by the laws of the Oriental Republic of Uruguay. Any disputes related to its application should first be resolved in good faith and, when appropriate, will be submitted to the competent courts of Montevideo, without prejudice to mandatory legal provisions and the authority of the competent public bodies.</p>' +
        '<h3>28. Contact</h3>' +
        '<p>To submit a report, provide additional information, report possible retaliation, or report a conflict of interest related to the Integrity Channel, please email <a href="mailto:integridad@camaracomerciomercosur.org">integridad@camaracomerciomercosur.org</a>.</p>' +
        '<p>Mercosur Chamber of Commerce</p>' +
        '<p>Uruguayan International Association.</p>' +
        '<p>Carlos Quijano 1290, Office 101,</p>' +
        '<p>Montevideo 11.100, Uruguay.</p>' +
        '<p>Legal framework: Law No. 18.331 on Personal Data Protection and Habeas Data; Decree No. 414/009; Decree No. 64/020; Law No. 19.580, when applicable; the Statutes; and other relevant Uruguayan legislation.</p>',
      pt:
        '<p class="privacy-eyebrow">Câmara de Comércio Mercosul</p>' +
        '<h2 id="integrity-modal-title">Política e Funcionamento do Canal de Integridade</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Data de publicação: 5 de julho de 2026</p>' +
        '<p>A Câmara de Comércio Mercosul considera que a integridade institucional exige mais do que o simples cumprimento formal de normas. Exige mecanismos capazes de receber comunicações feitas de boa-fé, avaliar os fatos com imparcialidade, proteger as pessoas, preservar evidências e adotar medidas proporcionais quando houver risco à legalidade, aos ativos, à reputação ou às finalidades da instituição. Esta Política explica o funcionamento público do Canal de Integridade, define suas garantias e seus limites e estabelece os princípios que devem orientar sua utilização, sem revelar os procedimentos operacionais internos e reservados que serão desenvolvidos no respectivo Protocolo Interno.</p>' +
        '<h3>1. Identificação institucional e canal de contato</h3>' +
        '<p>A Câmara de Comércio Mercosul é uma associação internacional uruguaia com sede na Rua Carlos Quijano 1290, Sala 101, 11.100, Montevidéu, Uruguai. O Canal de Integridade poderá ser utilizado por meio do e-mail <a href="mailto:integridad@camaracomerciomercosur.org">integridad@camaracomerciomercosur.org</a>, que deverá permanecer separado das comunicações gerais da instituição e com acesso restrito às pessoas formalmente designadas.</p>' +
        '<p>O acesso à caixa de e-mail deverá ser administrado por meio de credenciais individuais, sem encaminhamento automático para contas gerais nem para pessoas não envolvidas na gestão do Canal. As permissões deverão ser revisadas periodicamente e revogadas imediatamente quando cessar a responsabilidade correspondente. A Câmara buscará manter rastreabilidade suficiente dos acessos e das ações realizadas, bem como medidas razoáveis de segurança, armazenamento e backup compatíveis com a sensibilidade das informações recebidas.</p>' +
        '<p>Quando uma comunicação envolver uma pessoa com acesso ordinário ao Canal, o Responsável, uma autoridade capaz de influenciar sua gestão ou a maioria do órgão competente, deverá ser utilizada a via alternativa que a Câmara vier a disponibilizar e divulgar especificamente para situações de conflito de interesses. Até que exista um canal alternativo permanente, a comunicação deverá ser encaminhada sem demora a uma instância independente e sem conflito, nos termos desta Política.</p>' +
        '<h3>2. Natureza e finalidade do Canal</h3>' +
        '<p>O Canal de Integridade é um mecanismo voluntário de governança institucional criado para receber, registrar, avaliar e tratar comunicações sobre possíveis irregularidades relacionadas à Câmara, aos seus órgãos, às suas atividades, aos seus recursos, projetos, eventos ou à sua identidade institucional. Sua finalidade é identificar riscos, facilitar a correção de descumprimentos, preservar evidências, proteger pessoas e ativos, aprimorar os controles internos e permitir que os órgãos competentes adotem decisões informadas.</p>' +
        '<p>O Canal não é um tribunal, um órgão de persecução, uma autoridade policial ou administrativa e não substitui procedimentos judiciais, penais, trabalhistas, civis ou regulatórios que possam ser aplicáveis. Também não constitui, por si só, um procedimento disciplinar autônomo nem garante que toda comunicação resultará em investigação completa. O recebimento de uma mensagem não significa que os fatos sejam verdadeiros, que exista responsabilidade ou que a Câmara necessariamente adotará medidas sancionatórias.</p>' +
        '<h3>3. Compromisso Institucional</h3>' +
        '<p>A Câmara administrará o Canal de acordo com os princípios da legalidade, boa-fé, transparência, independência, imparcialidade, proporcionalidade, confidencialidade restrita, respeito, dignidade e responsabilidade. Buscará proteger as pessoas que comunicarem fatos de boa-fé, sem prejudicar os direitos da pessoa mencionada, sem antecipar conclusões e sem transformar o Canal em instrumento de conflito pessoal.</p>' +
        '<p>A criação do Canal decorre de uma decisão de boa governança institucional. Não deve ser interpretada como afirmação de que exista uma obrigação legal geral e uniforme aplicável a todas as associações civis privadas uruguaias, mas sim como um compromisso voluntário de prevenção, controle, prestação de contas e melhoria contínua.</p>' +
        '<h3>4. Âmbito institucional e relação com o MERCOSUL</h3>' +
        '<p>O Canal poderá receber comunicações relacionadas à Câmara, seus órgãos, autoridades, associados, empregados, assessores, fornecedores, colaboradores, patrocinadores, palestrantes, representantes, delegações, capítulos, eventos, programas, projetos, fundos, ativos, sistemas, documentos, certificados, credenciais, contas, dados, marca e qualquer atuação realizada ou apresentada como realizada em seu nome. Não será necessário manter relação contratual prévia, desde que os fatos tenham conexão razoável com a Câmara.</p>' +
        '<p>A Câmara desenvolve suas atividades no espaço econômico, empresarial, social e institucional do MERCOSUL, mas não integra a estrutura política, governamental ou orgânica oficial do bloco. Este Canal pertence exclusivamente à Câmara, não é um canal oficial do MERCOSUL, não investiga de forma geral Estados Partes, Estados Associados, governos ou órgãos oficiais e não substitui os mecanismos institucionais do bloco. Uma eventual inscrição futura no Registro de Organizações e Movimentos Sociais do MERCOSUL — MOS — não alterará essa natureza.</p>' +
        '<h3>5. Matérias abrangidas</h3>' +
        '<p>Poderão ser comunicados fatos relacionados a fraude, corrupção, suborno, apropriação indevida, utilização irregular de recursos, manipulação de registros, falsificação de documentos, ocultação de informações relevantes, conflitos de interesse não declarados, descumprimentos graves do Estatuto ou das políticas internas e qualquer conduta capaz de comprometer seriamente a legalidade ou a integridade financeira da Câmara.</p>' +
        '<p>Também poderão ser comunicadas situações de falsidade de identidade, falsos representantes, uso indevido de cargos, credenciais vencidas, certificados adulterados, perfis ou domínios que possam causar confusão, uso não autorizado da marca e comunicações emitidas sem autorização. Também estão abrangidas a captação de recursos em nome da Câmara, a promoção de investimentos não autorizados, a cobrança de comissões não aprovadas, falsas promessas de apoio institucional, a utilização de documentos da Câmara para legitimar operações privadas e a apresentação de projetos como aprovados sem a devida autorização.</p>' +
        '<p>O Canal também poderá ser utilizado para informar sobre abuso de autoridade, assédio, discriminação, violência, tratamento degradante, retaliações, descumprimento da confidencialidade, uso indevido de informações, acessos não autorizados, vazamento de dados, manipulação de contas, incidentes de cibersegurança e outras condutas que possam afetar gravemente as pessoas, os ativos, a credibilidade ou as finalidades institucionais.</p>' +
        '<h3>6. Matérias excluídas e emergências</h3>' +
        '<p>O Canal não se destina a consultas comerciais gerais, solicitações de associação, propostas de cooperação, apresentação regular de projetos, consultas da imprensa, reclamações sobre prazos de resposta, divergências de menor relevância sem dimensão institucional, opiniões políticas, consultas gerais sobre privacidade ou solicitações comuns de exercício de direitos relacionados a dados pessoais. As comunicações que não se enquadrarem em sua finalidade poderão ser redirecionadas, devolvidas, arquivadas ou encaminhadas ao setor competente.</p>' +
        '<p>O Canal também não é um serviço de emergência. Quando houver risco imediato para uma pessoa, perigo físico, possível crime em andamento, destruição iminente de evidências, perda imediata de ativos ou incidente crítico de segurança, deverá ser contatada diretamente a autoridade pública competente. A Câmara poderá comunicar informações à Polícia, ao Ministério Público, aos tribunais, às autoridades trabalhistas, à Unidade Reguladora e de Controle de Dados Pessoais ou a outros órgãos quando houver obrigação legal, solicitação válida, risco relevante ou necessidade de proteger direitos.</p>' +
        '<h3>7. Apresentação de uma comunicação</h3>' +
        '<p>A comunicação deverá descrever os fatos de forma clara e, sempre que possível, em ordem cronológica; indicar datas aproximadas, pessoas ou entidades envolvidas, relação com a Câmara, documentos disponíveis, possíveis testemunhas, riscos atuais, eventuais retaliações e qualquer medida urgente que possa ser necessária. Não é exigido que a pessoa realize investigação própria, apresente provas conclusivas ou faça a qualificação jurídica da infração.</p>' +
        '<p>As informações deverão ser obtidas de forma lícita. Não deverão ser reunidas provas por meio de acesso ilegal, interceptação, subtração, manipulação, invasão de sistemas, violação indevida da privacidade ou qualquer outra conduta contrária à lei. O Canal não legitima práticas ilícitas realizadas com o objetivo de obter provas.</p>' +
        '<h3>8. Comunicações identificadas, confidenciais e anônimas</h3>' +
        '<p>As comunicações identificadas permitem manter contato com a pessoa, solicitar esclarecimentos e, quando possível, informar sobre o andamento ou o encerramento do caso. Quando a identidade for conhecida, a Câmara limitará seu acesso às pessoas que precisem conhecê-la para tratar do assunto.</p>' +
        '<p>Também poderão ser aceitas comunicações anônimas quando contiverem informações suficientemente concretas para uma avaliação razoável. Entretanto, o correio eletrônico comum não garante anonimato técnico, a identidade pode ser inferida pelo conteúdo ou pelo contexto e a ausência de contato pode dificultar a análise, impedir esclarecimentos ou limitar as informações sobre o resultado. A Câmara não garante anonimato absoluto nem confidencialidade absoluta.</p>' +
        '<h3>9. Boa-fé e proibição de retaliações</h3>' +
        '<p>Será considerada realizada de boa-fé a comunicação baseada em fatos que a pessoa considere razoavelmente verdadeiros no momento da comunicação, ainda que posteriormente não possam ser confirmados. A ausência de confirmação dos fatos não transforma, por si só, uma comunicação em falsa, maliciosa ou abusiva, nem exige que a pessoa tenha interpretado corretamente a legislação aplicável.</p>' +
        '<p>A Câmara proíbe retaliações internas contra quem comunicar fatos de boa-fé, bem como contra testemunhas, colaboradores ou pessoas que apresentem documentos. Serão consideradas retaliações, entre outras, ameaças, assédio, exclusão injustificada, retirada arbitrária de oportunidades, pressão para retirar a comunicação, prejuízo à reputação, encerramento injustificado de relações ou divulgação desnecessária da identidade.</p>' +
        '<p>Essa proteção constitui um compromisso institucional e não uma imunidade absoluta diante de consequências legítimas decorrentes de condutas próprias alheias à comunicação. Também não protege comunicações deliberadamente falsas ou utilizadas como instrumento de assédio, retaliação, coação ou extorsão.</p>' +
        '<h3>10. Comunicações falsas ou abusivas</h3>' +
        '<p>Deve-se distinguir um erro de boa-fé, uma comunicação não confirmada, uma interpretação equivocada ou a falta de provas suficientes de uma comunicação deliberadamente falsa. Somente poderão resultar em medidas as comunicações realizadas com conhecimento de sua falsidade, intenção deliberada de causar prejuízo, apresentação de documentos manipulados, ocultação consciente de fatos essenciais ou utilização abusiva do Canal.</p>' +
        '<p>Esta cláusula deverá ser aplicada de forma restritiva e não poderá ser utilizada para desencorajar comunicações legítimas, punir erros razoáveis nem transferir ao comunicante a obrigação de comprovar definitivamente os fatos.</p>' +
        '<h3>11. Recebimento, confirmação e gestão diligente</h3>' +
        '<p>Sempre que possível, a Câmara confirmará o recebimento da comunicação, atribuirá uma referência interna e poderá solicitar informações adicionais. Procurará realizar essas ações em prazo razoável e manter uma gestão diligente, considerando a gravidade, a urgência, a complexidade, a disponibilidade de provas, o risco de retaliações e a necessidade de intervenção externa.</p>' +
        '<p>Não é estabelecido um prazo fixo para conclusão, pois a duração dependerá das circunstâncias de cada caso. Quando houver demora significativa, a Câmara poderá informar essa situação de forma geral, desde que essa comunicação não prejudique a análise, os direitos de terceiros ou a confidencialidade.</p>' +
        '<h3>12. Etapas de avaliação, análise e investigação</h3>' +
        '<p>A avaliação inicial tem por finalidade verificar se o assunto está dentro do âmbito do Canal, se existe informação mínima suficiente, se há risco imediato, se é necessário preservar evidências, se existe conflito de interesses, se o caso deve ser encaminhado a outro setor ou se é necessário comunicar uma autoridade. Essa etapa não representa a abertura de investigação formal.</p>' +
        '<p>Quando houver elementos suficientes, poderá ser iniciada uma análise preliminar destinada a verificar, de forma proporcional, os fatos essenciais. Somente quando a natureza, a gravidade ou a consistência das informações o justificarem será aberta uma investigação interna formal. Se das conclusões puderem resultar consequências estatutárias, contratuais ou trabalhistas, caberá ao órgão competente iniciar o procedimento específico aplicável, com as respectivas garantias.</p>' +
        '<p>A Câmara poderá solicitar esclarecimentos, reunir casos relacionados, arquivar comunicações manifestamente alheias ao objeto do Canal, adotar medidas preventivas, solicitar assistência externa ou encaminhar os fatos para outro procedimento. O arquivamento inicial não significa, necessariamente, negar a veracidade do que foi comunicado.</p>' +
        '<h3>13. Governança, independência e conflitos de interesse</h3>' +
        '<p>A Câmara preverá a existência de um Responsável pelo Canal de Integridade, um ou mais suplentes e um órgão competente para decidir medidas que ultrapassem a mera gestão operacional. O Responsável receberá, registrará, protegerá, realizará a avaliação inicial e coordenará o processamento das comunicações, mas não poderá aplicar sanções nem adotar decisões que, nos termos do Estatuto, competem a outros órgãos.</p>' +
        '<p>Nenhuma pessoa poderá receber, avaliar, investigar ou decidir um assunto que diga respeito a ela própria, envolva pessoa com vínculo próximo, esteja relacionado a atuação de sua responsabilidade, gere interesse pessoal ou comprometa objetivamente sua imparcialidade. Quando houver conflito de interesses, a gestão será atribuída a uma instância alternativa, que poderá ser a Comissão Fiscal, uma comissão ad hoc, um assessor jurídico externo, um investigador independente ou outra instância livre de conflito. A existência de conflito de interesses não interromperá o funcionamento do Canal.</p>' +
        '<h3>14. Revisão, investigação e preservação de evidências</h3>' +
        '<p>A tramitação será conduzida de acordo com os princípios da independência, imparcialidade, diligência, proporcionalidade, confidencialidade, rastreabilidade, presunção de inocência, direito de defesa, minimização de dados e respeito à dignidade das pessoas. Poderá incluir análise de documentos, entrevistas, solicitações de esclarecimentos, verificação de nomeações, revisão de registros institucionais, análise de e-mails ou sistemas quando isso for legítimo, assessoria profissional e preservação de evidências.</p>' +
        '<p>A Câmara deverá procurar garantir que as evidências relevantes sejam preservadas de forma íntegra, identificável e segura. Os detalhes sobre a cadeia de custódia, os controles de acesso, os modelos de atas, a documentação de entrevistas e as regras para aprovação de medidas serão definidos no Protocolo Interno do Canal de Integridade, de circulação restrita. Esta Política não descreve métodos internos sensíveis nem técnicas que possam facilitar interferências.</p>' +
        '<h3>15. Direitos da pessoa envolvida</h3>' +
        '<p>A pessoa mencionada terá o direito de ser tratada com imparcialidade, de não ser considerada responsável antes de uma conclusão, de conhecer as alegações essenciais quando isso for processualmente adequado, de apresentar explicações, fornecer documentos, indicar evidências, apresentar observações e proteger sua privacidade e reputação.</p>' +
        '<p>Determinadas informações poderão permanecer temporariamente restritas quando sua divulgação imediata puder destruir evidências, interferir na análise, expor uma pessoa, comprometer medidas preventivas ou prejudicar uma investigação externa. Essa restrição não poderá ser utilizada para negar indefinidamente o direito de defesa.</p>' +
        '<h3>16. Assistência, representação e colaboração</h3>' +
        '<p>Quando a natureza do assunto justificar, a pessoa comunicante, a pessoa envolvida ou uma testemunha poderão solicitar o acompanhamento de um assessor, representante ou pessoa de confiança. A Câmara poderá limitar ou recusar essa participação quando houver conflito de interesses, risco para a confidencialidade, interferência na análise ou prejuízo aos direitos de terceiros.</p>' +
        '<p>As pessoas participantes deverão colaborar de boa-fé, manter a confidencialidade que seja razoavelmente necessária e evitar qualquer conduta que possa alterar evidências, influenciar indevidamente testemunhas ou prejudicar outras pessoas. A assistência permitida não transforma o Canal em um procedimento judicial nem concede ao acompanhante poderes de direção sobre a análise.</p>' +
        '<h3>17. Retirada da comunicação e continuidade da atuação</h3>' +
        '<p>A pessoa comunicante poderá informar que não deseja continuar colaborando ou solicitar a retirada de sua comunicação. A Câmara procurará respeitar essa decisão sempre que possível, mas poderá continuar a avaliação ou a análise quando existirem riscos relevantes, outras pessoas potencialmente afetadas, evidências que devam ser preservadas, obrigações legais, possíveis infrações graves ou razões suficientes de proteção institucional.</p>' +
        '<p>A retirada da comunicação não obriga a eliminação imediata das informações já recebidas nem impede a comunicação dos fatos às autoridades competentes quando isso for necessário. Qualquer continuidade deverá ser proporcional e respeitar as normas de proteção de dados e confidencialidade.</p>' +
        '<h3>18. Medidas preventivas</h3>' +
        '<p>Antes da conclusão da análise, a Câmara poderá adotar medidas temporárias para proteger pessoas, preservar evidências, limitar acessos, suspender credenciais, interromper usos da marca, impedir comunicações enganosas, proteger ativos ou evitar novos prejuízos. Essas medidas não constituem uma declaração de responsabilidade.</p>' +
        '<p>Toda medida preventiva deverá ser proporcional, limitada em seu alcance e duração, revisada quando necessário e adotada pelo órgão competente, de acordo com o Estatuto e as normas internas.</p>' +
        '<h3>19. Resultado e medidas institucionais</h3>' +
        '<p>Ao final da análise, a Câmara poderá arquivar o caso, emitir recomendações, solicitar correções, reforçar controles, remover conteúdos, revogar autorizações, suspender acessos ou credenciais, iniciar procedimentos estatutários, encerrar relações contratuais, recuperar ativos, comunicar os fatos às autoridades ou adotar medidas judiciais.</p>' +
        '<p>As medidas relacionadas a associados, autoridades ou dirigentes deverão respeitar o Estatuto, os regulamentos internos, as competências do órgão responsável, o direito de defesa, a proporcionalidade e a legislação aplicável. O Responsável pelo Canal não poderá, por si só, aplicar medidas que ultrapassem suas atribuições.</p>' +
        '<h3>20. Informações à pessoa comunicante</h3>' +
        '<p>A Câmara poderá confirmar o recebimento da comunicação, solicitar esclarecimentos, fornecer informações gerais sobre o andamento do caso e informar seu encerramento de forma geral. Não será obrigada a divulgar dados pessoais de terceiros, sanções específicas, relatórios completos, deliberações internas, informações trabalhistas ou contratuais, estratégias jurídicas, comunicações com autoridades ou outras informações protegidas.</p>' +
        '<p>O nível de informação fornecido dependerá da natureza do caso, dos direitos de terceiros, da confidencialidade, das restrições legais e da necessidade de preservar a eficácia da análise.</p>' +
        '<h3>21. Proteção de dados pessoais</h3>' +
        '<p>A Câmara de Comércio Mercosul será responsável pelo tratamento dos dados pessoais processados por meio do Canal. Esses dados poderão ser utilizados para receber e avaliar comunicações, analisar fatos de interesse institucional, proteger pessoas e ativos, adotar medidas, preservar evidências, cumprir obrigações, exercer ou defender direitos e comunicar informações às autoridades quando necessário. O acesso será permitido apenas às pessoas responsáveis pelo Canal, aos órgãos competentes, assessores externos, investigadores ou autoridades, quando isso for necessário e legalmente permitido.</p>' +
        '<p>O tratamento será realizado de acordo com a Lei nº 18.331 de Proteção de Dados Pessoais e Ação de Habeas Data, o Decreto nº 414/009, o Decreto nº 64/020, a Política de Privacidade e os critérios da Unidade Reguladora e de Controle de Dados Pessoais. Serão aplicados os princípios de minimização, pertinência, acesso restrito, segurança, confidencialidade, exatidão, conservação limitada, rastreabilidade e responsabilidade.</p>' +
        '<p>A avaliação realizada pela Câmara terá finalidade exclusivamente institucional, preventiva, estatutária, trabalhista ou contratual, conforme o caso. A Câmara documentará fatos, alegações, evidências, procedimentos e decisões institucionais, mas não determinará responsabilidades penais, civis ou administrativas reservadas às autoridades competentes, não criará um cadastro privado de antecedentes nem manterá listas informais de pessoas denunciadas. Quando houver transferências internacionais ou acesso aos dados a partir de outra jurisdição, serão aplicadas as garantias previstas na legislação e as informações serão fornecidas conforme a Política de Privacidade.</p>' +
        '<h3>22. Direitos relacionados aos dados</h3>' +
        '<p>As pessoas poderão exercer os direitos previstos na legislação uruguaia pelos meios indicados na Política de Privacidade. A Câmara poderá aplicar limitações temporárias, proporcionais e legalmente justificadas quando forem necessárias para preservar a análise, proteger direitos de terceiros, evitar a destruição de evidências, cumprir obrigações ou atender solicitações de autoridades.</p>' +
        '<p>Toda limitação deverá ser revista quando deixarem de existir os motivos que a justificaram. A correção de um dado incorreto não implicará necessariamente a eliminação de documentos cuja conservação seja necessária para comprovar o desenvolvimento do procedimento ou defender direitos.</p>' +
        '<h3>23. Conservação, bloqueio e eliminação</h3>' +
        '<p>Comunicações que não pertençam ao Canal, comunicações sem informações suficientes, processos encerrados sem medidas, casos com medidas adotadas, assuntos encaminhados às autoridades e documentos necessários para defesa poderão exigir diferentes períodos de conservação. Os critérios aplicáveis deverão estar documentados no Protocolo Interno e revisados periodicamente conforme a finalidade, a gravidade, os prazos de responsabilidade, as obrigações legais e a necessidade de preservar evidências.</p>' +
        '<p>Os dados serão mantidos apenas pelo tempo necessário para avaliar, analisar, adotar medidas, cumprir obrigações, atender prazos de responsabilidade, exercer ou defender direitos e preservar evidências. Quando deixarem de ser necessários, deverão ser eliminados, anonimizados ou bloqueados, conforme o caso. É proibida a conservação por tempo indeterminado, a manutenção de arquivos informais, registros paralelos, listas de pessoas denunciadas e a reutilização das informações para finalidades diferentes.</p>' +
        '<h3>24. Segurança digital e gestão de incidentes</h3>' +
        '<p>A Câmara adotará medidas razoáveis para proteger o Canal contra acessos não autorizados, perda, alteração, divulgação ou destruição de informações. Documentos especialmente sensíveis deverão ser armazenados separadamente e compartilhados apenas por meios compatíveis com o nível de risco. Serão evitadas cópias desnecessárias, encaminhamentos indiscriminados e armazenamento em dispositivos ou contas pessoais.</p>' +
        '<p>Quando for identificado um incidente de segurança relacionado ao Canal, a Câmara deverá contê-lo, preservar as evidências, avaliar seus efeitos, restringir acessos comprometidos e realizar as comunicações exigidas pela legislação aplicável. O Protocolo Interno estabelecerá as responsabilidades e os procedimentos específicos.</p>' +
        '<h3>25. Assédio, discriminação e violência</h3>' +
        '<p>O Canal poderá receber comunicações relacionadas a assédio, discriminação, violência, abuso de autoridade, retaliações e tratamento degradante. Esses assuntos poderão exigir medidas de proteção, procedimentos trabalhistas, investigação especializada, assistência profissional ou comunicação às autoridades.</p>' +
        '<p>Quando os fatos estiverem dentro de seu âmbito específico, será considerada a Lei nº 19.580, relativa ao direito das mulheres a uma vida livre de violência baseada em gênero, juntamente com as demais normas trabalhistas, civis, penais e antidiscriminatórias aplicáveis. O Canal não substitui os mecanismos legais, administrativos ou judiciais de proteção.</p>' +
        '<h3>26. Transparência agregada e coordenação documental</h3>' +
        '<p>A Câmara poderá publicar informações estatísticas gerais sobre o número de comunicações, categorias, situação geral, tendências de risco e melhorias implementadas. Nunca deverão ser divulgados dados que permitam identificar comunicantes, pessoas envolvidas, testemunhas, projetos, entidades, relações contratuais ou fatos confidenciais.</p>' +
        '<p>Esta Política deverá ser interpretada em conjunto com o Estatuto, os Termos de Uso, a Política de Privacidade, a Política de Cookies, a Política de Uso da Marca, os regulamentos internos, os contratos, os procedimentos trabalhistas e o Protocolo Interno do Canal de Integridade. Prevalecerão as normas obrigatórias, o Estatuto e as competências legalmente atribuídas a cada órgão.</p>' +
        '<h3>27. Alterações, legislação e jurisdição</h3>' +
        '<p>A Câmara poderá atualizar esta Política para refletir alterações na legislação, experiência prática, evolução tecnológica, expansão territorial, novas delegações, identificação de riscos ou melhorias nos controles. A versão vigente será a publicada no site, e as alterações não afetarão retroativamente direitos já consolidados.</p>' +
        '<p>Esta Política será regida pelas leis da República Oriental do Uruguai. As divergências relacionadas à sua aplicação buscarão ser resolvidas de boa-fé e, quando necessário, serão submetidas aos tribunais competentes de Montevidéu, sem prejuízo das normas obrigatórias e da atuação das autoridades públicas competentes.</p>' +
        '<h3>28. Contato</h3>' +
        '<p>Para apresentar uma comunicação, fornecer informações adicionais, informar uma possível retaliação ou comunicar um conflito de interesses relacionado ao Canal, envie um e-mail para <a href="mailto:integridad@camaracomerciomercosur.org">integridad@camaracomerciomercosur.org</a>.</p>' +
        '<p>Câmara de Comércio Mercosul</p>' +
        '<p>Associação Internacional Uruguaia.</p>' +
        '<p>Rua Carlos Quijano 1290, Sala 101,</p>' +
        '<p>11.100 Montevidéu, Uruguai.</p>' +
        '<p>Marco legal de referência: Lei nº 18.331 de Proteção de Dados Pessoais e Ação de Habeas Data; Decreto nº 414/009; Decreto nº 64/020; Lei nº 19.580, quando aplicável; Estatuto e demais normas uruguaias pertinentes.</p>',
      fr:
        '<p class="privacy-eyebrow">Chambre de Commerce du Mercosur</p>' +
        '<h2 id="integrity-modal-title">Politique et Fonctionnement du Canal d\'Intégrité</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Date de publication : 5 juillet 2026</p>' +
        '<p>La Chambre de Commerce du Mercosur estime que l\'intégrité institutionnelle exige bien plus qu\'une simple conformité formelle aux réglementations. Elle requiert des mécanismes capables de recevoir des alertes de bonne foi, d\'évaluer les faits de manière impartiale, de protéger les personnes, de préserver les preuves et de prendre des mesures proportionnées en cas de risque pour la légalité, les actifs, la réputation ou les objectifs de l\'institution. Cette Politique explique le fonctionnement public du Canal d\'Intégrité, définit ses garanties et ses limites, et établit les principes qui devront guider son utilisation, sans toutefois divulguer les procédures opérationnelles confidentielles, qui seront détaillées dans le Protocole Interne correspondant.</p>' +
        '<h3>1. Identité institutionnelle et canal de contact</h3>' +
        '<p>La Chambre de Commerce du Mercosur est une association internationale uruguayenne dont le siège social est situé Calle Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay. Le Canal d\'Intégrité est accessible via l\'adresse électronique <a href="mailto:integrity@camaracomerciomercosur.org">integrity@camaracomerciomercosur.org</a>, qui devra rester distincte des communications générales de l\'institution et dont l\'accès est réservé aux personnes dûment désignées.</p>' +
        '<p>L\'accès à la boîte mail devra être géré par des identifiants individuels, sans transfert automatique vers des comptes généraux ou des personnes extérieures à la direction du Canal. Les autorisations devront être revues périodiquement et révoquées immédiatement en cas de cessation de fonction. La Chambre s\'engage à assurer une traçabilité suffisante des accès et des actions, ainsi que des mesures de sécurité, de stockage et de sauvegarde adaptées à la sensibilité des informations reçues.</p>' +
        '<p>Lorsqu\'une communication concerne une personne ayant un accès ordinaire au Canal, le Responsable, une autorité susceptible d\'influencer sa gestion ou la majorité de l\'organe compétent, le canal alternatif établi et publié par la Chambre spécifiquement pour les conflits d\'intérêts devra être utilisé. En attendant la mise en place d\'un canal alternatif permanent, la communication devra être transmise sans délai à une instance indépendante et impartiale, conformément aux dispositions de la présente politique.</p>' +
        '<h3>2. Nature et finalité du Canal</h3>' +
        '<p>Le Canal d\'Intégrité est un mécanisme volontaire de gouvernance institutionnelle créé pour recevoir, enregistrer, évaluer et gérer les signalements d\'irrégularités potentielles concernant la Chambre, ses organes, ses activités, ses ressources, ses projets, ses événements ou son identité institutionnelle. Son objectif est de détecter les risques, de faciliter la correction des cas de non-conformité, de préserver les preuves, de protéger les personnes et les biens, d\'améliorer les contrôles internes et de permettre aux organes concernés de prendre des décisions éclairées.</p>' +
        '<p>Le Canal n\'est ni un tribunal, ni un parquet, ni un service de police, ni une autorité administrative, et ne remplace aucune procédure judiciaire, pénale, du travail, civile ou réglementaire applicable. Il ne constitue pas non plus une procédure disciplinaire indépendante et ne garantit pas que chaque communication fera l\'objet d\'une enquête approfondie. La réception d\'un message n\'implique ni la véracité des faits rapportés, ni l\'existence d\'une responsabilité, ni que la Chambre engage nécessairement des mesures disciplinaires.</p>' +
        '<h3>3. Engagement institutionnel</h3>' +
        '<p>La Chambre gérera le Canal conformément aux principes de légalité, de bonne foi, de transparence, d\'indépendance, d\'impartialité, de proportionnalité, de confidentialité restreinte, de respect, de dignité et de responsabilité. Des efforts seront déployés pour protéger les personnes qui signalent des faits de bonne foi, sans porter atteinte aux droits de la personne concernée, sans préjuger des faits et sans faire du Canal un instrument de confrontation personnelle.</p>' +
        '<p>La création du Canal répond à une décision fondée sur une bonne gouvernance institutionnelle. Elle ne doit pas être interprétée comme une affirmation d\'une obligation légale générale et uniforme applicable à toutes les associations civiles privées uruguayennes, mais plutôt comme un engagement volontaire en matière de prévention, de contrôle, de responsabilité et d\'amélioration continue.</p>' +
        '<h3>4. Portée institutionnelle et relation avec le MERCOSUR</h3>' +
        '<p>Le Canal pourra recevoir des communications relatives à la Chambre, ses organes, autorités, associés, employés, conseillers, fournisseurs, collaborateurs, commanditaires, panélistes, représentants, délégations, sections, événements, programmes, projets, fonds, actifs, systèmes, documents, certificats, accréditations, comptes, données, marque et toute action entreprise ou présentée comme entreprise en son nom. Aucune relation contractuelle préalable n\'est requise, pourvu que les faits aient un lien raisonnable avec la Chambre.</p>' +
        '<p>La Chambre opère dans les sphères économique, commerciale, sociale et institutionnelle du MERCOSUR, mais n\'est pas intégrée à la structure politique, gouvernementale ou organisationnelle officielle du bloc. Ce canal est exclusivement réservé à la Chambre ; il ne s\'agit pas d\'un canal officiel du MERCOSUR, il ne mène pas de recherches générales sur les États Membres, les États Associés, les gouvernements ou les organismes officiels, et il ne remplace pas les mécanismes institutionnels du bloc. Une éventuelle inscription future au Registre des Organisations et Mouvements Sociaux du MERCOSUR (MOS) ne modifierait en rien cette nature.</p>' +
        '<h3>5. Sujets abordés</h3>' +
        '<p>Les faits relatifs à la fraude, la corruption, les pots-de-vin, le détournement de fonds, l\'utilisation irrégulière des ressources, la manipulation des registres, la falsification de documents, la dissimulation d\'informations pertinentes, les conflits d\'intérêts non déclarés, les violations graves des Statuts ou des politiques internes et toute action susceptible de compromettre gravement la légalité ou l\'intégrité financière de la Chambre pourront être signalés.</p>' +
        '<p>Les cas d\'usurpation d\'identité, de faux représentants, d\'abus de fonction, de titres de compétences expirés, de certificats falsifiés, de profils ou de domaines similaires prêtant à confusion, d\'utilisation non autorisée de la marque et de communications non autorisées pourront également être signalés. Sont également concernés la sollicitation de fonds au nom de la Chambre, la promotion d\'investissements non autorisés, la perception de commissions non approuvées, les fausses promesses de soutien, l\'utilisation de documents institutionnels pour légitimer des transactions privées et la présentation de projets comme étant approuvés sans autorisation.</p>' +
        '<p>Le Canal pourra également être utilisé pour signaler les abus d\'autorité, le harcèlement, la discrimination, la violence, les traitements dégradants, les représailles, les violations de la confidentialité, l\'utilisation abusive d\'informations, les accès non autorisés, les fuites, les pertes de données, la manipulation de comptes, les incidents de cybersécurité et tout autre comportement susceptible d\'affecter gravement les personnes, les biens, la crédibilité ou les objectifs institutionnels.</p>' +
        '<h3>6. Sujets exclus et urgences</h3>' +
        '<p>Le Canal n\'est pas destiné aux demandes d\'informations commerciales générales, aux demandes de partenariat, aux propositions de coopération, à la soumission ordinaire de projets, aux demandes de la presse, aux réclamations concernant les délais de réponse, aux désaccords mineurs sans implications institutionnelles, aux opinions politiques, aux questions générales relatives à la protection de la vie privée ni aux demandes d\'exercice des droits relatifs aux données personnelles. Les communications sans rapport avec son objet pourront être redirigées, retournées, archivées ou transmises au service compétent.</p>' +
        '<p>Le Canal n\'est pas non plus un service d\'urgence. En cas de risque immédiat pour une personne, de danger physique, d\'une possible infraction en cours, de destruction imminente de preuves, de perte immédiate de biens ou d\'incident de sécurité critique, il faudra contacter directement les autorités publiques compétentes. La Chambre pourra partager des informations avec la Police, le Parquet, les tribunaux, les autorités du travail, l\'Unité de Régulation et de Contrôle des Données Personnelles ou d\'autres organismes en cas d\'obligation légale, de demande légitime, de risque avéré ou de nécessité de protéger des droits.</p>' +
        '<h3>7. Présentation d\'une communication</h3>' +
        '<p>La communication devra décrire les faits clairement et, si possible, par ordre chronologique ; indiquer les dates approximatives, les personnes ou entités impliquées, leur lien avec la Chambre, les documents disponibles, les témoins potentiels, les risques actuels, les représailles possibles et toute mesure urgente qui pourrait s\'avérer nécessaire. La personne n\'est pas tenue de mener sa propre enquête, de fournir des preuves concluantes ni de constater juridiquement l\'infraction.</p>' +
        '<p>Les informations doivent être obtenues légalement. Il est interdit de recueillir des preuves par accès illégal, interception, vol, manipulation, intrusion dans les systèmes, atteinte à la vie privée ou tout autre acte contraire à la loi. Le Canal ne tolère aucune action illégale menée dans le but d\'obtenir des preuves.</p>' +
        '<h3>8. Communications identifiées, confidentielles et anonymes</h3>' +
        '<p>Les communications identifiées nous permettent de rester en contact avec la personne, de demander des précisions et, si possible, de fournir des mises à jour sur l\'état d\'avancement ou la clôture. Lorsque l\'identité est connue, la Chambre en limitera l\'accès aux seules personnes qui en ont besoin pour gérer le dossier.</p>' +
        '<p>Les communications anonymes peuvent également être acceptées lorsqu\'elles contiennent des informations suffisamment précises pour permettre une évaluation raisonnable. Cependant, le courrier électronique ordinaire ne garantit pas un anonymat technique ; l\'identité peut être déduite du contenu ou du contexte, et l\'absence de contact peut entraver l\'examen, empêcher les clarifications ou limiter l\'information sur le résultat. La Chambre ne garantit ni un anonymat absolu ni une confidentialité absolue.</p>' +
        '<h3>9. Bonne foi et interdiction de représailles</h3>' +
        '<p>Toute communication fondée sur des faits que la personne croit raisonnablement véridiques au moment de sa transmission sera considérée comme ayant été faite de bonne foi, même si ces faits ne peuvent être confirmés ultérieurement. L\'absence de confirmation des faits ne rend pas, en soi, la communication fausse, malveillante ou abusive, et il n\'est pas nécessaire que la personne ait correctement interprété la réglementation applicable.</p>' +
        '<p>La Chambre interdit toute mesure de représailles internes à l\'encontre des personnes qui communiquent des informations de bonne foi, comme des témoins, des collaborateurs ou des personnes fournissant des documents. Les représailles comprennent notamment les menaces, le harcèlement, l\'exclusion injustifiée, le retrait arbitraire d\'opportunités, les pressions exercées pour obtenir le retrait de communication, l\'atteinte à la réputation, la rupture injustifiée de relations professionnelles ou la divulgation inutile d\'identité.</p>' +
        '<p>Cette protection constitue un engagement institutionnel et non une immunité absolue contre les conséquences légitimes découlant de conduites personnelles sans lien avec la communication. Elle ne protège pas non plus les communications délibérément mensongères ni celles utilisées comme moyen de harcèlement, de représailles, de coercition ou d\'extorsion.</p>' +
        '<h3>10. Communications fausses ou abusives</h3>' +
        '<p>Il convient de distinguer une erreur commise de bonne foi, une communication non confirmée, une mauvaise interprétation ou un manque de preuves suffisantes, d\'une communication délibérément fausse. Seules les communications faites en connaissance de cause de leur fausseté, avec une intention délibérée de nuire, les documents manipulés, la dissimulation consciente de faits essentiels ou l\'utilisation abusive du Canal pourront donner lieu à des poursuites.</p>' +
        '<p>Cette clause devra être appliquée de manière restrictive et ne pourra être utilisée pour décourager les communications légitimes, pénaliser les erreurs raisonnables ou transférer à celui qui communique l\'obligation de prouver définitivement les faits.</p>' +
        '<h3>11. Réception, confirmation et gestion diligente</h3>' +
        '<p>Dans la mesure du possible, la Chambre accusera réception de la demande, lui attribuera un numéro de référence interne et pourra demander des informations complémentaires. Elle s\'efforcera d\'accomplir ces démarches dans un délai raisonnable et de traiter la demande avec diligence, en tenant compte de sa gravité, de son urgence, de sa complexité, de la disponibilité des preuves, du risque de représailles et de la nécessité d\'une intervention extérieure.</p>' +
        '<p>Aucun délai strict n\'est fixé pour le règlement, car la durée dépendra des circonstances propres à chaque affaire. En cas de retard important, la Chambre pourra en informer les parties de manière générale, à condition que cette communication ne porte pas atteinte à l\'examen, aux droits des tiers ou à la confidentialité.</p>' +
        '<h3>12. Étapes d\'évaluation, d\'examen et d\'investigation</h3>' +
        '<p>L\'évaluation initiale vise à déterminer si l\'affaire relève du champ du Canal, si les informations sont suffisantes, s\'il existe un risque immédiat, s\'il convient de préserver des preuves, s\'il existe un conflit d\'intérêts, s\'il est nécessaire de réorienter l\'affaire ou s\'il est requis d\'en informer une autorité compétente. Cette phase n\'implique pas l\'ouverture d\'une enquête formelle.</p>' +
        '<p>Lorsque des éléments de preuve suffisants sont réunis, un examen préliminaire pourra être entrepris afin de vérifier les faits essentiels de manière proportionnée. Une enquête interne formelle ne sera ouverte que si la nature, la gravité ou la cohérence des informations le justifient. Si les conclusions sont susceptibles d\'avoir des conséquences légales, contractuelles ou liées à l\'emploi, l\'autorité compétente sera chargée d\'engager la procédure spécifique applicable, assortie des garanties nécessaires.</p>' +
        '<p>La Chambre pourra demander des précisions, regrouper les affaires connexes, archiver les communications manifestement sans rapport, adopter des mesures préventives, solliciter une assistance extérieure ou renvoyer l\'affaire à une autre instance. L\'archivage initial n\'implique pas nécessairement une contestation de la véracité de la communication.</p>' +
        '<h3>13. Gouvernance, indépendance et conflits d\'intérêts</h3>' +
        '<p>La Chambre devra prévoir l\'existence d\'un Responsable de Canal d\'Intégrité, d\'un ou plusieurs suppléants, et d\'un organe compétent pour décider de mesures allant au-delà de la simple gestion opérationnelle. Le Responsable recevra, enregistrera, protègera, évaluera initialement et coordonnera le traitement des plaintes, mais ne pourra imposer de sanctions ni prendre de décisions relevant de la compétence d\'autres instances.</p>' +
        '<p>Nul ne pourra recevoir, évaluer, examiner ou décider sur une question qui le concerne, qui affecte une personne qui lui est étroitement liée, qui est liée à ses propres actions, qui génère un intérêt personnel ou qui compromet objectivement son impartialité. En cas de conflit, la gestion sera confiée à une autre instance, qui pourra être la Commission Fiscale, un comité ad hoc, un conseiller juridique externe, un enquêteur indépendant ou tout autre organe exempt de conflit. L\'existence d\'un conflit d\'intérêts ne paralysera pas le Canal.</p>' +
        '<h3>14. Examen, enquête et préservation des preuves</h3>' +
        '<p>La procédure sera régie par les principes d\'indépendance, d\'impartialité, de diligence, de proportionnalité, de confidentialité, de traçabilité, de présomption d\'innocence, de droit à la défense, de minimisation des données et de respect de la dignité humaine. Elle pourra comprendre l\'examen de documents, des entretiens, des demandes de précisions, la vérification des nominations, l\'examen des dossiers institutionnels, l\'analyse des courriels ou des systèmes lorsque cela est légitime, des avis d\'experts et la conservation des preuves.</p>' +
        '<p>La Chambre veillera à ce que les éléments de preuve pertinents soient préservés intacts, identifiables et sécurisés. Les modalités de la chaîne de possession, des contrôles d\'accès, des modèles de dossiers, de la documentation des entretiens et des règles d\'approbation des mesures sont régies par le Protocole Interne du Canal d\'Intégrité, à accès restreint. Cette Politique ne décrit pas les méthodes internes sensibles ni les techniques susceptibles de faciliter des ingérences.</p>' +
        '<h3>15. Droits de la personne concernée</h3>' +
        '<p>L\'accusé aura le droit d\'être traité impartialement, de ne pas être tenu responsable avant la conclusion de l\'instance, d\'être informé des éléments essentiels de l\'accusation lorsque la procédure le permet, de fournir des explications, de soumettre des documents, de proposer des éléments de preuve, de formuler des observations et de protéger sa vie privée et sa réputation.</p>' +
        '<p>Certaines informations pourront être temporairement retenues lorsque leur divulgation immédiate risquerait de détruire des preuves, d\'entraver l\'examen du dossier, de mettre en danger une personne, de compromettre les mesures préventives ou d\'affecter une enquête externe. Cette réserve ne pourra être utilisée pour priver indéfiniment une personne de son droit à la défense.</p>' +
        '<h3>16. Assistance, représentation et collaboration</h3>' +
        '<p>Lorsque la nature de l\'affaire le justifie, la partie plaignante, la partie concernée ou un témoin peut demander à être accompagné d\'un conseiller, d\'un représentant ou d\'une personne de confiance. La Chambre pourra limiter ou refuser cette participation en cas de conflit d\'intérêts, de risque pour la confidentialité, d\'entrave à l\'examen ou de préjudice aux droits de tiers.</p>' +
        '<p>Les personnes participantes devront coopérer de bonne foi, respecter la confidentialité dans la mesure du raisonnable et éviter tout comportement susceptible d\'altérer des preuves, d\'influencer indûment des témoins ou de nuire à autrui. L\'assistance autorisée ne transforme pas le Canal en procédure judiciaire et ne confère à la personne accompagnatrice aucun pouvoir de diriger l\'examen.</p>' +
        '<h3>17. Retrait de la communication et poursuite de l\'action</h3>' +
        '<p>La partie ayant signalé l\'infraction pourra indiquer qu\'elle ne souhaite plus coopérer ou demander le retrait de son signalement. La Chambre s\'efforcera de respecter cette décision dans la mesure du possible, mais pourra poursuivre l\'évaluation ou l\'examen en cas de risques pertinents, d\'autres personnes potentiellement concernées, d\'éléments de preuve à préserver, d\'obligations légales, de violations graves potentielles ou de motifs suffisants justifiant une protection institutionnelle.</p>' +
        '<p>Le retrait des communications n\'entraîne pas la suppression immédiate des informations déjà reçues et n\'empêche pas, le cas échéant, de signaler les faits aux autorités compétentes. Toute poursuite des communications devra être proportionnée et respecter les règles de protection et de confidentialité des données.</p>' +
        '<h3>18. Mesures préventives</h3>' +
        '<p>Avant de conclure un examen, la Chambre pourra prendre des mesures temporaires pour protéger les personnes, préserver les preuves, limiter l\'accès, suspendre les accréditations, interdire l\'utilisation de marques, prévenir les communications trompeuses, protéger les actifs ou éviter tout préjudice supplémentaire. Ces mesures ne constituent pas une déclaration de responsabilité.</p>' +
        '<p>Toute mesure préventive devra être proportionnée, limitée dans sa portée et sa durée, réexaminée le cas échéant et adoptée par l\'autorité compétente conformément aux Statuts et au règlement intérieur.</p>' +
        '<h3>19. Résultat et mesures institutionnelles</h3>' +
        '<p>À l\'issue de l\'examen, la Chambre pourra classer l\'affaire, formuler des recommandations, demander des corrections, renforcer les contrôles, supprimer du contenu, révoquer des autorisations, suspendre l\'accès ou les identifiants, engager des procédures légales, mettre fin aux relations contractuelles, réclamer des actifs, signaler des faits aux autorités ou intenter une action en justice.</p>' +
        '<p>Les mesures prises à l\'encontre des membres, dirigeants ou administrateurs devront être conformes aux Statuts, au règlement intérieur, aux pouvoirs de l\'organe compétent, au droit à la défense, au principe de proportionnalité et à la loi applicable. Le Responsable du Canal ne pourra imposer unilatéralement des mesures excédant ses pouvoirs.</p>' +
        '<h3>20. Information à la personne communiquant</h3>' +
        '<p>La Chambre pourra accuser réception, demander des précisions, fournir des informations générales sur l\'état d\'avancement du dossier et signaler sa clôture de manière générale. Elle ne sera pas tenue de divulguer les données personnelles de tiers, les sanctions spécifiques, les rapports complets, les délibérations internes, les informations relatives à l\'emploi ou aux contrats, les stratégies juridiques, les communications avec les autorités ou toute autre information protégée.</p>' +
        '<p>L\'étendue des informations fournies dépendra de la nature de l\'affaire, des droits des tiers, de la confidentialité, des restrictions légales et de la nécessité de préserver l\'efficacité de l\'examen.</p>' +
        '<h3>21. Protection des données personnelles</h3>' +
        '<p>La Chambre de Commerce du Mercosur sera responsable du traitement des données personnelles gérées par le biais du Canal. Les données pourront être utilisées pour recevoir et évaluer les communications, analyser les événements ayant des implications institutionnelles, protéger les personnes et les biens, prendre des mesures, conserver des preuves, remplir les obligations, exercer ou défendre des droits et communiquer des informations aux autorités compétentes, le cas échéant. L\'accès à ces données sera accordé aux responsables du Canal, aux organismes compétents, aux conseillers externes, aux chercheurs ou aux autorités uniquement lorsque cela est nécessaire et légalement autorisé.</p>' +
        '<p>Le traitement sera régi par la Loi N° 18.331 relative à la Protection des Données Personnelles et Action en Habeas Data, le Décret N° 414/009, le Décret N° 64/020, la Politique de Confidentialité et les critères de l\'Unité Réglementaire et de Contrôle de Données Personnelles. Les principes de minimisation, de pertinence, d\'accès restreint, de sécurité, de confidentialité, d\'exactitude, de conservation limitée, de traçabilité et de responsabilité seront appliqués.</p>' +
        '<p>L\'évaluation menée par la Chambre aura une portée exclusivement institutionnelle, préventive, légale, sociale ou contractuelle, selon le cas. La Chambre documentera les faits, allégations, preuves, actions et décisions institutionnelles, mais ne déterminera pas les responsabilités pénales, civiles ou administratives réservées aux autorités compétentes. Elle ne constituera pas de base de données privée ni ne tiendra de listes informelles de personnes signalées. En cas de transferts internationaux ou d\'accès depuis une autre juridiction, les garanties exigées seront appliquées et les informations seront communiquées conformément à la Politique de Confidentialité.</p>' +
        '<h3>22. Droits en matière de données</h3>' +
        '<p>Les personnes pourront exercer les droits reconnus par la réglementation uruguayenne selon les modalités prévues par la Politique de Confidentialité. La Chambre pourra appliquer des limitations temporaires, proportionnées et légalement justifiées lorsque cela s\'avère nécessaire pour préserver le processus d\'examen, protéger les droits des tiers, empêcher la destruction de preuves, se conformer à aux obligations ou répondre aux demandes des autorités.</p>' +
        '<p>Toute limitation devra être réexaminée dès lors que les raisons qui la justifiaient cessent d\'exister. La rectification d\'informations inexactes n\'impliquera pas nécessairement la suppression de documents dont la conservation est indispensable pour prouver le déroulement de la procédure ou pour défendre des droits.</p>' +
        '<h3>23. Conservation, blocage et élimination</h3>' +
        '<p>Les communications sans lien avec le Canal, celles insuffisamment documentées, les dossiers clos sans suite, les affaires ayant fait l\'objet d\'une action, les affaires transmises aux autorités et les documents nécessaires à la défense pourront être soumis à des durées de conservation différentes. Les critères applicables devront être consignés dans le Protocole Interne et révisés périodiquement, en tenant compte de la finalité, de la gravité, des délais de responsabilité, des obligations légales et de la nécessité de préserver les preuves.</p>' +
        '<p>Les données seront conservées uniquement pendant la durée nécessaire à l\'évaluation, à l\'examen, à la prise de mesures, au respect des obligations, aux délais de responsabilité, à l\'exercice ou à la défense des droits et à la préservation des preuves. Lorsqu\'elles ne sont plus nécessaires, les données devront être supprimées, anonymisées ou bloquées, selon le cas. La conservation indéfinie, les dossiers informels, les enregistrements parallèles, les listes de personnes accusées et la réutilisation à des fins non liées sont interdits.</p>' +
        '<h3>24. Sécurité numérique et gestion des incidents</h3>' +
        '<p>La Chambre mettra en œuvre des mesures raisonnables pour protéger le Canal contre tout accès non autorisé, perte, altération, divulgation ou destruction des informations. Les documents particulièrement sensibles devront être conservés séparément et partagés uniquement par des moyens adaptés au niveau de risque. Les copies inutiles, les transferts indiscriminés et le stockage sur des appareils ou comptes personnels seront évités.</p>' +
        '<p>En cas d\'incident de sécurité relatif au Canal, la Chambre devra le contenir, préserver les preuves, évaluer ses conséquences, restreindre les accès compromis et procéder aux communications requises par la réglementation applicable. Le Protocole Interne précisera les responsabilités et les actions à entreprendre.</p>' +
        '<h3>25. Harcèlement, discrimination et violence</h3>' +
        '<p>Le Canal pourra recevoir des signalements relatifs au harcèlement, à la discrimination, à la violence, aux abus de pouvoir, aux représailles et aux traitements dégradants. Ces situations peuvent nécessiter des mesures de protection, des procédures liées au droit du travail, une enquête spécialisée, une assistance professionnelle ou un signalement aux autorités.</p>' +
        '<p>Lorsque les faits relèvent de son champ d\'application, la Loi N° 19.580 relative au droit des femmes à une vie exempte de violences sexistes sera prise en compte, ainsi que les autres lois applicables en matière de travail, de droit civil, de droit pénal et de lutte contre la discrimination. Le Canal ne se substitue pas aux mécanismes de protection légaux, administratifs ou judiciaires.</p>' +
        '<h3>26. Transparence agrégée et coordination des documents</h3>' +
        '<p>La Chambre pourra publier des informations statistiques générales sur le nombre de communications, les catégories, l\'état général, les tendances en matière de risques et les améliorations mises en œuvre. Elle ne devra en aucun cas divulguer de données permettant d\'identifier les plaignants, les personnes concernées, les témoins, les projets, les entités, les relations contractuelles ou des informations confidentielles.</p>' +
        '<p>La Politique devra être interprétée conjointement avec les Statuts, les Conditions d\'Utilisation, la Politique de Confidentialité, la Politique relative aux Cookies, la Politique d\'Utilisation de la Marque, le règlement intérieur, les contrats, les procédures d\'embauche et le Protocole Interne du Canal. Les règles impératives, les Statuts et les pouvoirs légalement conférés à chaque organe prévalent.</p>' +
        '<h3>27. Modifications, législation et juridiction</h3>' +
        '<p>La Chambre pourra mettre à jour cette Politique afin de tenir compte des changements réglementaires, de l\'expérience acquise, des évolutions technologiques, de l\'expansion territoriale, de nouvelles délégations, de l\'identification des risques ou de l\'amélioration des contrôles. La version en vigueur sera celle publiée sur le site web, et les modifications ne seront pas rétroactives.</p>' +
        '<p>La Politique sera régie par les lois de la République Orientale de l\'Uruguay. Tout litige relatif à son application sera résolu de bonne foi et, le cas échéant, soumis aux tribunaux compétents de Montevideo, sans préjudice des dispositions réglementaires impératives et de l\'intervention des autorités publiques compétentes.</p>' +
        '<h3>28. Contact</h3>' +
        '<p>Pour soumettre une communication, fournir des informations supplémentaires, signaler d\'éventuelles représailles ou signaler un conflit d\'intérêts lié au Canal, vous pouvez écrire à <a href="mailto:integrity@camaracomerciomercosur.org">integrity@camaracomerciomercosur.org</a>.</p>' +
        '<p class="privacy-signature">Chambre de Commerce du Mercosur. Association internationale uruguayenne. Rue Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay.</p>' +
        '<p style="font-size:.8rem;">Cadre juridique de référence : Loi N° 18.331 sur la Protection des Données Personnelles et l\'Action en Habeas Data ; Décret N° 414/009 ; Décret N° 64/020 ; Loi N° 19.580, le cas échéant ; Statuts et autres réglementations uruguayennes pertinentes.</p>'
    };

    function currentLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return integrityHTML[lang] ? lang : 'es';
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'integrity-modal-title');
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
      return overlay;
    }

    function openModal() {
      var ov = buildOverlay();
      ov.innerHTML =
        '<div class="privacy-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          integrityHTML[currentLang()] +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closeModal);
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeModal() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-integrity-link');
      if (!trigger) return;
      e.preventDefault();
      openModal();
    });
  })();


  /* ---------- Brand Usage policy modal (footer link) ---------- */
  (function () {
    if (!document.querySelector('.js-brand-link')) return;

    var overlay = null;

    var brandHTML = {
      es:
        '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
        '<h2 id="brand-modal-title">Política de Uso de Marca e Identidad Institucional</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Fecha de publicación: 5 de julio de 2026</p>' +
        '<p>La identidad de la Cámara de Comercio Mercosur constituye un activo institucional destinado a identificar de manera inequívoca sus actuaciones, documentos, autoridades, programas y relaciones legítimamente autorizadas. Esta Política establece las condiciones bajo las cuales pueden mencionarse o utilizarse la denominación, el logotipo y los demás elementos vinculados a esa identidad, con el propósito de preservar su integridad, evitar confusión y proteger a la Cámara, a sus asociados, a sus colaboradores y al público frente a apariencias falsas de membresía, representación, certificación, patrocinio o respaldo.</p>' +
        '<h3>1. Identificación y alcance</h3>' +
        '<p>La Cámara de Comercio Mercosur es una asociación internacional uruguaya con domicilio en Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay. Toda solicitud de autorización o comunicación sobre un posible uso indebido deberá dirigirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Esta Política se aplica a cualquier persona física o jurídica que mencione, reproduzca, incorpore o utilice elementos de identidad de la Cámara, incluidos asociados y aspirantes a asociados, autoridades, directivos, representantes, delegados, empleados, asesores, proveedores, colaboradores, patrocinadores, panelistas, aliados institucionales, medios de comunicación, delegaciones, capítulos, organizadores de eventos y terceros en general.</p>' +
        '<p>La membresía, la participación en una actividad, la aparición en una publicación, una colaboración, un patrocinio, una invitación, un nombramiento, una credencial o el acceso al sitio web no conceden por sí mismos una licencia general ni facultades para actuar en nombre de la Cámara.</p>' +
        '<h3>2. Objeto, marca e identidad institucional</h3>' +
        '<p>La presente Política tiene por objeto proteger la identidad institucional, regular sus usos legítimos y prevenir cualquier utilización que pueda inducir a error acerca de quién está autorizado para representar, comunicar, certificar, respaldar o comprometer a la Cámara.</p>' +
        '<p>A estos efectos, la marca comprende principalmente los signos distintivos verbales, gráficos o mixtos utilizados para identificar a la Cámara. La identidad institucional es un concepto más amplio: además de esos signos, comprende cargos, títulos, firmas, credenciales, certificados, membretes, dominios, perfiles sociales, correos, documentos y cualquier otro elemento capaz de generar una apariencia de oficialidad, pertenencia o representación.</p>' +
        '<p>Esta Política tiene naturaleza jurídica e institucional y no sustituye al Manual de Identidad Visual, que podrá desarrollar las especificaciones técnicas de reproducción, tamaños, áreas de seguridad, colores y aplicaciones gráficas.</p>' +
        '<h3>3. Marco jurídico aplicable</h3>' +
        '<p>La protección y utilización de la identidad de la Cámara se interpretarán conforme a la legislación de la República Oriental del Uruguay, incluidos la Ley N.º 17.011 de Marcas, su Decreto Reglamentario N.º 34/999, la Ley N.º 9.739 sobre derechos de autor, las normas civiles aplicables, los principios de buena fe y prevención de confusión, y los Estatutos y reglamentos internos de la Cámara.</p>' +
        '<p>La Ley N.º 17.011 reconoce como marca todo signo apto para distinguir productos o servicios. Los derechos exclusivos propios del registro solo se afirmarán cuando exista efectivamente un registro concedido. En consecuencia, esta Política no utiliza el símbolo de marca registrada ni presume una situación registral que no conste documentalmente.</p>' +
        '<p>La protección institucional puede comprender, según cada caso, marcas registradas, solicitudes de registro, nombres comerciales, denominaciones institucionales, signos distintivos, logotipos, obras gráficas, textos, fotografías, materiales audiovisuales, documentación y derechos derivados del uso legítimo o de la autoría.</p>' +
        '<h3>4. Relación con el MERCOSUR</h3>' +
        '<p>La Cámara desarrolla su actividad dentro del espacio económico, empresarial, social e institucional del MERCOSUR. Su denominación, misión y ámbito de actuación expresan esa vinculación regional y su vocación de promover comercio, inversión, cooperación empresarial e integración.</p>' +
        '<p>La Cámara no forma parte, sin embargo, de la estructura política, gubernamental u orgánica oficial del MERCOSUR, ni integra sus órganos decisorios, políticos o administrativos. Su identidad no constituye un emblema oficial del bloque y la Cámara únicamente puede autorizar el uso de sus propios elementos, no el de símbolos oficiales pertenecientes al MERCOSUR, a sus Estados o a otras instituciones.</p>' +
        '<p>Ninguna autorización sobre la identidad de la Cámara permite presentarse como representante oficial del MERCOSUR. La relación de un asociado, colaborador, patrocinador, panelista, delegado, capítulo o tercero con la Cámara tampoco implica respaldo de los Estados Partes, Estados Asociados, gobiernos u órganos del bloque.</p>' +
        '<p>Cualquier futura inscripción de la Cámara en el Registro de Organizaciones y Movimientos Sociales del MERCOSUR (MOS) tendrá exclusivamente el alcance propio de ese mecanismo y no la convertirá en órgano político u oficial ni otorgará a sus miembros facultades generales de representación del MERCOSUR.</p>' +
        '<h3>5. Elementos protegidos</h3>' +
        '<p>Quedan comprendidos en esta Política la denominación completa de la Cámara, sus traducciones oficiales, siglas y abreviaturas autorizadas, logotipo, isotipo, emblemas, composiciones gráficas, colores institucionales, tipografías, eslóganes, firmas, membretes, sellos, certificados, credenciales, tarjetas, documentos, informes, presentaciones, plantillas, fotografías oficiales, materiales audiovisuales, dominios, direcciones de correo, nombres de usuario, perfiles sociales, cargos, títulos y acreditaciones.</p>' +
        '<p>También se consideran comprendidas las adaptaciones, imitaciones, variantes abreviadas, signos fonéticamente similares, dominios confundibles, perfiles que aparenten oficialidad y cualquier composición verbal, visual, documental o digital que reproduzca elementos esenciales de la identidad o pueda generar una asociación razonable con la Cámara.</p>' +
        '<h3>6. Titularidad, legitimidad y ausencia de licencia implícita</h3>' +
        '<p>La Cámara es titular, solicitante, licenciataria o usuaria legítima de los elementos que integran su identidad institucional, según corresponda en cada caso. Cuando determinados materiales procedan de terceros, su utilización se realizará con arreglo a las autorizaciones, licencias o derechos aplicables.</p>' +
        '<p>Ninguna persona adquiere por su relación con la Cámara propiedad, licencia, derecho de reproducción, adaptación, traducción, sublicencia o registro, ni facultad para emitir documentos, utilizar cargos o presentarse como representante. El silencio, la falta de oposición inmediata o la tolerancia temporal no equivalen a una autorización.</p>' +
        '<h3>7. Regla general de autorización y apoyo técnico</h3>' +
        '<p>Todo uso que exceda una mera referencia informativa requiere autorización previa y escrita. La autorización será expresa, específica, limitada, temporal, no exclusiva, no transferible, no sublicenciable y revocable, y quedará vinculada a una finalidad, unas piezas, unos soportes, unos medios y, cuando corresponda, un territorio determinados.</p>' +
        '<p>La autorización no podrá interpretarse de manera extensiva. La Cámara podrá solicitar maquetas, revisar materiales antes de su publicación, exigir modificaciones, aprobar versiones concretas, limitar formatos o duración, imponer condiciones razonables y ordenar la retirada de cualquier uso que se aparte de lo autorizado.</p>' +
        '<p>El usuario autorizado podrá facilitar los archivos estrictamente necesarios a una imprenta, diseñador, agencia o proveedor técnico que actúe por su cuenta para producir la pieza aprobada. Ese acceso no constituye sublicencia y el usuario seguirá siendo responsable del uso, custodia y eliminación de los archivos.</p>' +
        '<h3>8. Referencias informativas y definición de uso comercial</h3>' +
        '<p>Puede mencionarse correctamente el nombre de la Cámara, enlazarse al sitio oficial, citarse contenido dentro de los límites legales o informarse de manera periodística, académica o histórica sobre actividades reales, siempre que la referencia sea exacta, se realice de buena fe y no tenga por objeto crear una apariencia de patrocinio, representación, membresía o respaldo inexistente.</p>' +
        '<p>A efectos de esta Política, se considerará uso comercial o promocional cualquier utilización destinada directa o indirectamente a vender productos o servicios, captar clientes, asociados, inversores o financiación, mejorar la posición competitiva de una entidad, publicitar una actividad o atribuirse una relación institucional con la Cámara. Estos usos requieren autorización escrita.</p>' +
        '<p>El uso editorial del logotipo por medios de comunicación deberá limitarse a la identificación necesaria, utilizar archivos oficiales y preservar su integridad. Esta posibilidad no autoriza campañas publicitarias, promociones, productos, patrocinios, listados de clientes o usos permanentes con finalidad comercial.</p>' +
        '<h3>9. Usos sujetos a autorización escrita</h3>' +
        '<p>Requieren autorización previa la incorporación de la identidad de la Cámara en páginas web, aplicaciones, presentaciones, folletos, campañas, informes, propuestas, videos, publicaciones, notas de prensa conjuntas, materiales comerciales o promocionales, patrocinios, eventos, productos, merchandising, certificados, credenciales, perfiles digitales, documentos de inversión, procesos de financiación, anuncios de alianzas, convenios, capítulos, delegaciones o usos conjuntos con otras marcas.</p>' +
        '<p>La misma regla se aplica a cualquier pieza que, aun sin reproducir exactamente el logotipo, pueda inducir a pensar que existe una relación de respaldo, certificación, membresía, representación o participación oficial.</p>' +
        '<h3>10. Uso por asociados, aspirantes y antiguos miembros</h3>' +
        '<p>La condición de asociado no concede una licencia automática. La Cámara podrá autorizar la fórmula “Miembro de la Cámara de Comercio Mercosur” únicamente mientras la membresía esté vigente, mediante un distintivo o composición oficial proporcionada o aprobada por la Cámara. El asociado no podrá utilizar por separado el logotipo corporativo principal como si representara a la institución.</p>' +
        '<p>Esa referencia no podrá utilizarse para captar fondos, validar proyectos, promover inversiones, ofrecer garantías, sugerir representación de la Cámara ni insinuar respaldo oficial del MERCOSUR. El derecho de uso finalizará de inmediato al terminar o suspenderse la membresía, revocarse la autorización o incumplirse sus condiciones.</p>' +
        '<p>La presentación de una solicitud de asociación o la condición de aspirante no autoriza ninguna referencia pública a una membresía todavía no concedida. Quien haya dejado de pertenecer a la Cámara podrá mencionar esa condición únicamente en términos históricos, indicando claramente el periodo correspondiente y sin utilizar distintivos que sugieran una vinculación vigente.</p>' +
        '<h3>11. Autoridades, directivos, representantes y referencias históricas</h3>' +
        '<p>Los cargos, títulos, firmas, correos, membretes, tarjetas, credenciales, sellos, perfiles y documentos institucionales solo podrán utilizarse durante la vigencia del nombramiento y dentro de las facultades expresamente conferidas.</p>' +
        '<p>El nombramiento no permite comprometer a la Cámara fuera de la competencia asignada, celebrar acuerdos sin poder suficiente ni utilizar la identidad institucional para actividades personales o negocios ajenos a la función.</p>' +
        '<p>Al finalizar el cargo o la relación, deberán dejar de utilizarse y, cuando corresponda, devolverse o desactivarse cuentas, accesos, firmas, archivos, credenciales, tarjetas, documentos, plantillas, perfiles y demás materiales institucionales. La antigua autoridad podrá referirse a su cargo únicamente de manera histórica, con indicación clara del periodo y sin sugerir que la función continúa vigente.</p>' +
        '<h3>12. Colaboradores, patrocinadores, aliados, panelistas y medios</h3>' +
        '<p>La autorización concedida a un colaborador, patrocinador, aliado, panelista u organizador se limita al proyecto, evento o actividad concreta. No implica una relación permanente, membresía, representación ni derecho a utilizar la identidad en otros contextos.</p>' +
        '<p>La aparición conjunta de logotipos no supone responsabilidad conjunta ni aprobación general de los productos, servicios, declaraciones o actividades del tercero. Ninguna relación podrá anunciarse antes de su aprobación formal ni extenderse a otras personas o entidades sin autorización.</p>' +
        '<p>Los medios podrán utilizar materiales oficiales para fines editoriales veraces, sin alteraciones y sin generar apariencia de patrocinio, asociación política o respaldo comercial.</p>' +
        '<h3>13. Reglas visuales mínimas</h3>' +
        '<p>Deberán utilizarse exclusivamente archivos oficiales, mantenerse las proporciones y colores aprobados, conservarse el área de seguridad, respetarse el tamaño mínimo y garantizarse contraste y legibilidad.</p>' +
        '<p>No se permite reconstruir manualmente el logotipo, utilizar capturas de pantalla o archivos de baja resolución, deformarlo, recortarlo, girarlo, recolorearlo, animarlo, añadir efectos, cambiar tipografías, eliminar elementos, incorporar palabras, integrarlo en otro emblema o crear versiones derivadas.</p>' +
        '<p>Cuando exista un Manual de Identidad Visual vigente, sus reglas prevalecerán en las cuestiones técnicas y gráficas.</p>' +
        '<h3>14. Prohibición de usos políticos, electorales o partidarios</h3>' +
        '<p>La identidad de la Cámara no podrá utilizarse para respaldar partidos políticos, candidaturas, campañas electorales, propaganda, recaudación política, actos partidarios, declaraciones proselitistas o posicionamientos que no hayan sido formalmente aprobados por los órganos competentes de la Cámara.</p>' +
        '<p>Ningún asociado, autoridad, delegado, colaborador o tercero podrá utilizar su relación con la Cámara para sugerir apoyo electoral, gubernamental o partidario. Las opiniones personales deberán presentarse siempre como tales y sin utilizar logotipos, documentos, cargos o canales institucionales fuera de las facultades expresamente conferidas.</p>' +
        '<h3>15. Proyectos, inversión, financiación y captación de fondos</h3>' +
        '<p>La identidad de la Cámara no podrá utilizarse para solicitar dinero, captar inversores, vender participaciones, promover valores, anunciar rondas de financiación, captar depósitos, ofrecer crédito, garantizar proyectos, certificar empresas, validar diligencias debidas, respaldar emisiones, prometer acceso a autoridades, anunciar financiación inexistente, emitir garantías, comercializar oportunidades de inversión o solicitar pagos en nombre de la Cámara.</p>' +
        '<p>La presencia del logotipo en un documento no implica por sí sola aprobación, recomendación, auditoría, certificación, validación, garantía, compromiso financiero, patrocinio, aceptación de riesgos ni respaldo del MERCOSUR.</p>' +
        '<p>Solo un documento formal emitido por el órgano competente, dentro de sus facultades y para un objeto determinado, podrá acreditar una relación, autorización, participación o intervención concreta.</p>' +
        '<h3>16. Certificados, credenciales y nombramientos</h3>' +
        '<p>Los certificados, credenciales y nombramientos deberán ser emitidos por la autoridad competente, mediante formatos aprobados y con los mecanismos de firma, numeración, vigencia y verificación que la Cámara determine.</p>' +
        '<p>Son personales o específicos, no transferibles y no conceden facultades distintas de las expresamente indicadas. No podrán modificarse, reutilizarse para otros fines ni reproducirse de manera que altere su alcance.</p>' +
        '<p>La validez de determinados certificados, credenciales o nombramientos podrá quedar condicionada a su verificación mediante código, registro, enlace, correo oficial u otro mecanismo establecido por la Cámara. Una vez vencidos o finalizada la relación, deberán dejar de utilizarse y, cuando se solicite, devolverse, destruirse o retirarse de los canales públicos.</p>' +
        '<h3>17. Dominios, correos, redes, delegaciones y capítulos</h3>' +
        '<p>Solo se considerarán oficiales los dominios, direcciones de correo y perfiles publicados o enlazados desde el sitio institucional. Queda prohibido registrar dominios similares, crear correos o perfiles que aparenten pertenencia, utilizar nombres de usuario confundibles, replicar la identidad visual o presentarse como canal oficial sin reconocimiento formal.</p>' +
        '<p>Toda delegación, capítulo, oficina o representación deberá ser creada o reconocida formalmente. No podrá crear submarcas, registrar dominios, abrir perfiles, emitir nombramientos o certificados, celebrar acuerdos fuera de su competencia ni comprometer jurídicamente a la Cámara sin autorización y poder suficientes.</p>' +
        '<p>Cuando corresponda, los responsables deberán transferir o entregar a la Cámara el control de cuentas, perfiles, dominios y otros activos digitales utilizados en relación con su función.</p>' +
        '<h3>18. Traducciones y denominaciones autorizadas</h3>' +
        '<p>Las traducciones de la denominación, las abreviaturas, las siglas y las adaptaciones de cargos o títulos requieren aprobación. No podrán crearse nombres confundibles con organismos oficiales ni versiones que alteren el sentido institucional.</p>' +
        '<p>La versión española será la referencia institucional principal salvo decisión expresa de la Cámara. Las traducciones oficiales publicadas por la propia Cámara podrán utilizarse únicamente en la forma exacta aprobada, sin modificaciones ni creación de nuevas siglas.</p>' +
        '<h3>19. Solicitud, vigencia y revocación de autorizaciones</h3>' +
        '<p>Las solicitudes deberán enviarse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> e identificar al solicitante, su organización, la finalidad, el contexto, los materiales, los medios, la duración, la fecha prevista de publicación, los terceros involucrados y el alcance del uso solicitado.</p>' +
        '<p>La Cámara podrá aprobar, rechazar, solicitar aclaraciones, exigir cambios, limitar el alcance, imponer condiciones o revocar la autorización. Ningún uso podrá comenzar antes de recibirse autorización escrita.</p>' +
        '<p>La autorización terminará al vencer el plazo, finalizar el proyecto o evento, cesar la membresía o el cargo, producirse un incumplimiento, utilizarse la identidad fuera del alcance aprobado o existir un riesgo institucional o reputacional relevante.</p>' +
        '<p>Tras el cese, deberán retirarse los materiales, eliminarse las versiones digitales, suspenderse las publicaciones, devolverse las credenciales y desactivarse o transferirse los perfiles, cuentas o dominios cuando corresponda. La Cámara podrá solicitar confirmación escrita de la retirada.</p>' +
        '<h3>20. Supervisión, incumplimientos y comunicación de usos indebidos</h3>' +
        '<p>La Cámara podrá revisar usos, solicitar copias o pruebas, verificar publicaciones y canales, comprobar la vigencia de membresías, cargos y autorizaciones, exigir correcciones y requerir la retirada de materiales. La falta de supervisión previa no legitima un uso no autorizado.</p>' +
        '<p>Ante un posible incumplimiento, la Cámara podrá actuar de manera gradual y proporcional mediante solicitud de aclaración, advertencia, requerimiento de corrección o retirada, suspensión o revocación, comunicación con plataformas, solicitud de cancelación de dominios o perfiles, preservación de pruebas, aclaración pública y, cuando corresponda, acciones administrativas, civiles o penales.</p>' +
        '<p>La respuesta atenderá a la gravedad, duración, intencionalidad, alcance, riesgo de confusión, perjuicio a terceros, daño reputacional, reiteración y cooperación del responsable.</p>' +
        '<p>Cualquier persona puede comunicar perfiles falsos, dominios confundibles, certificados dudosos, falsos representantes, captación de fondos, proyectos no autorizados, correos engañosos, documentos alterados o usos políticos no autorizados escribiendo a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>21. Coordinación y modificaciones</h3>' +
        '<p>Esta Política se interpreta conjuntamente con los Estatutos, los Términos de Uso, la Política de Privacidad, la Política de Cookies, el Manual de Identidad Visual, los reglamentos internos, las condiciones particulares de autorización y el Canal de Integridad. En caso de conflicto prevalecerán las normas imperativas, los Estatutos, la autorización específica en su ámbito y el Manual de Identidad Visual para cuestiones técnicas.</p>' +
        '<p>La Cámara podrá actualizar esta Política para reflejar cambios legislativos, registros marcarios, nuevas versiones de la identidad, expansión territorial, nuevos canales digitales o modalidades de colaboración. La versión vigente será la publicada en el sitio y los cambios no legitimarán usos anteriores no autorizados.</p>' +
        '<h3>22. Legislación aplicable y jurisdicción</h3>' +
        '<p>La Política se regirá por las leyes de la República Oriental del Uruguay. Las partes procurarán resolver de buena fe cualquier diferencia y, cuando no sea posible, serán competentes los tribunales de Montevideo, sin perjuicio de las normas imperativas aplicables.</p>' +
        '<h3>23. Contacto y marco normativo</h3>' +
        '<p>Para solicitar autorización o comunicar un posible uso indebido de la marca o de la identidad institucional puede escribirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>. Cámara de Comercio Mercosur, asociación internacional uruguaya, Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay.</p>' +
        '<p>Marco normativo de referencia: Ley N.º 17.011 de Marcas; Decreto N.º 34/999; Ley N.º 9.739 sobre derechos de autor; normas civiles aplicables; Estatutos y reglamentos internos de la Cámara.</p>',
      en:
        '<p class="privacy-eyebrow">Mercosur Chamber of Commerce</p>' +
        '<h2 id="brand-modal-title">Brand and Institutional Identity Use Policy</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Publication date: July 5, 2026</p>' +
        '<p>The identity of the Mercosur Chamber of Commerce is an institutional asset intended to clearly identify its activities, documents, authorities, programs, and properly authorized relationships. This Policy establishes the conditions under which the Chamber\'s name, logo, and other identity elements may be mentioned or used, with the purpose of protecting their integrity, preventing confusion, and protecting the Chamber, its members, collaborators, and the public from false impressions of membership, representation, certification, sponsorship, or institutional endorsement.</p>' +
        '<h3>1. Identification and scope</h3>' +
        '<p>The Mercosur Chamber of Commerce is a Uruguayan international association located at Carlos Quijano 1290, Office 101, Montevideo 11.100, Uruguay. Any request for authorization or report of possible misuse should be sent to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>This Policy applies to any individual or legal entity that mentions, reproduces, includes, or uses elements of the Chamber\'s identity, including members and membership applicants, authorities, directors, representatives, delegates, employees, advisors, suppliers, collaborators, sponsors, speakers, institutional partners, media organizations, delegations, chapters, event organizers, and any other third party.</p>' +
        '<p>Membership, participation in an event, appearance in a publication, collaboration, sponsorship, invitation, appointment, credential, or access to the website does not, by itself, grant a general license or authorization to act on behalf of the Chamber.</p>' +
        '<h3>2. Purpose, brand, and institutional identity</h3>' +
        '<p>The purpose of this Policy is to protect the Chamber\'s institutional identity, regulate its legitimate use, and prevent any use that may mislead others about who is authorized to represent, communicate, certify, endorse, or make commitments on behalf of the Chamber.</p>' +
        '<p>For the purposes of this Policy, the brand mainly includes the verbal, graphic, or combined distinctive signs used to identify the Chamber. Institutional identity is a broader concept. In addition to these signs, it includes positions, titles, signatures, credentials, certificates, letterheads, domain names, social media profiles, email addresses, documents, and any other element that may create the appearance of being official, affiliated, or authorized to represent the Chamber.</p>' +
        '<p>This Policy is a legal and institutional document and does not replace the Visual Identity Manual, which may establish the technical specifications for reproduction, sizes, clear space, colors, and graphic applications.</p>' +
        '<h3>3. Applicable legal framework</h3>' +
        '<p>The protection and use of the Chamber\'s identity shall be interpreted under the laws of the Oriental Republic of Uruguay, including Law No. 17.011 on Trademarks, Regulatory Decree No. 34/999, Law No. 9.739 on Copyright, applicable civil laws, the principles of good faith and prevention of confusion, and the Chamber\'s Bylaws and internal regulations.</p>' +
        '<p>Law No. 17.011 recognizes as a trademark any sign capable of distinguishing goods or services. Exclusive rights resulting from registration will only be claimed when a valid trademark registration has actually been granted. Therefore, this Policy does not use the registered trademark symbol and does not assume any registration status unless it has been officially documented.</p>' +
        '<p>Depending on each case, institutional protection may include registered trademarks, trademark applications, trade names, institutional names, distinctive signs, logos, graphic works, texts, photographs, audiovisual materials, documents, and rights arising from lawful use or authorship.</p>' +
        '<h3>4. Relationship with Mercosur</h3>' +
        '<p>The Chamber carries out its activities within the economic, business, social, and institutional environment of Mercosur. Its name, mission, and scope of work reflect this regional connection and its commitment to promoting trade, investment, business cooperation, and regional integration.</p>' +
        '<p>However, the Chamber is not part of the official political, governmental, or institutional structure of Mercosur, and it is not a member of its decision-making, political, or administrative bodies. Its identity is not an official symbol of the bloc, and the Chamber may only authorize the use of its own identity elements, not the official symbols of Mercosur, its Member States, Associated States, or other institutions.</p>' +
        '<p>No authorization to use the Chamber\'s identity allows anyone to present themselves as an official representative of Mercosur. Likewise, the relationship of a member, collaborator, sponsor, speaker, delegate, chapter, or any third party with the Chamber does not imply endorsement or recognition by the Member States, Associated States, governments, or official bodies of the bloc.</p>' +
        '<p>Any future registration of the Chamber in the Mercosur Register of Social Organizations and Movements (MOS) will only have the effects established by that mechanism. It will not make the Chamber an official or political body, nor will it give its members general authority to represent Mercosur.</p>' +
        '<h3>5. Protected elements</h3>' +
        '<p>This Policy covers the Chamber\'s full name, its official translations, authorized acronyms and abbreviations, logo, symbol, emblems, graphic designs, institutional colors, fonts, slogans, signatures, letterheads, seals, certificates, credentials, cards, documents, reports, presentations, templates, official photographs, audiovisual materials, domain names, email addresses, usernames, social media profiles, positions, titles, and credentials.</p>' +
        '<p>It also covers adaptations, imitations, shortened versions, phonetically similar signs, confusing domain names, profiles that appear to be official, and any verbal, visual, documentary, or digital element that reproduces essential parts of the Chamber\'s identity or may reasonably create an association with the Chamber.</p>' +
        '<h3>6. Ownership, legitimacy, and no implied license</h3>' +
        '<p>The Chamber is the owner, applicant, license holder, or lawful user of the elements that form its institutional identity, as applicable in each case. When some materials belong to third parties, they will be used according to the applicable permissions, licenses, or legal rights.</p>' +
        '<p>No person acquires ownership, a license, reproduction rights, adaptation rights, translation rights, sublicensing rights, registration rights, or authority to issue documents, use official positions, or act as a representative of the Chamber because of their relationship with it. Silence, the absence of an immediate objection, or temporary tolerance does not mean authorization.</p>' +
        '<h3>7. General authorization rule and technical support</h3>' +
        '<p>Any use beyond a simple informational reference requires prior written authorization. Authorization will be express, specific, limited, temporary, non-exclusive, non-transferable, non-sublicensable, and revocable. It will apply only to a specific purpose, materials, media, and, when applicable, a specific territory.</p>' +
        '<p>Authorization must not be interpreted broadly. The Chamber may request drafts, review materials before publication, require changes, approve specific versions, limit formats or time periods, establish reasonable conditions, and require the removal of any use that does not follow the authorization.</p>' +
        '<p>An authorized user may provide only the necessary files to a printer, designer, agency, or technical supplier acting on their behalf to produce the approved material. This does not create a sublicense, and the authorized user remains responsible for the use, storage, and deletion of those files.</p>' +
        '<h3>8. Informational references and commercial use</h3>' +
        '<p>The Chamber\'s name may be correctly mentioned, linked to its official website, quoted within legal limits, or used in journalistic, academic, or historical information about real activities, provided the reference is accurate, made in good faith, and does not create a false impression of sponsorship, representation, membership, or endorsement.</p>' +
        '<p>For the purposes of this Policy, commercial or promotional use means any use intended, directly or indirectly, to sell products or services, attract customers, members, investors, or funding, improve the competitive position of an organization, promote an activity, or claim an institutional relationship with the Chamber. These uses require written authorization.</p>' +
        '<p>Editorial use of the logo by the media must be limited to the necessary identification, use official files, and preserve the logo\'s integrity. This does not authorize advertising campaigns, promotions, products, sponsorships, client lists, or permanent commercial use.</p>' +
        '<h3>9. Uses requiring written authorization</h3>' +
        '<p>Prior written authorization is required to use the Chamber\'s identity on websites, applications, presentations, brochures, campaigns, reports, proposals, videos, publications, joint press releases, commercial or promotional materials, sponsorships, events, products, merchandise, certificates, credentials, digital profiles, investment documents, financing processes, partnership announcements, agreements, chapters, delegations, or together with other brands.</p>' +
        '<p>The same rule applies to any material that, even without exactly reproducing the logo, may lead people to believe that there is an official relationship, endorsement, certification, membership, representation, or participation.</p>' +
        '<h3>10. Use by members, applicants, and former members</h3>' +
        '<p>Membership does not automatically grant a license to use the Chamber\'s identity. The Chamber may authorize the expression "Member of the Mercosur Chamber of Commerce" only while the membership is active and only through an official badge or design provided or approved by the Chamber. Members may not use the main corporate logo by itself as if they represented the institution.</p>' +
        '<p>This reference may not be used to raise funds, approve projects, promote investments, offer guarantees, suggest representation of the Chamber, or imply official endorsement by Mercosur. The right to use it ends immediately if membership ends or is suspended, the authorization is revoked, or its conditions are violated.</p>' +
        '<p>Submitting a membership application or being an applicant does not authorize any public statement claiming membership before it has been granted. Former members may refer to their past membership only as historical information, clearly indicating the relevant period and without using badges or symbols that suggest a current relationship.</p>' +
        '<h3>11. Authorities, directors, representatives, and historical references</h3>' +
        '<p>Official positions, titles, signatures, email addresses, letterheads, business cards, credentials, seals, profiles, and institutional documents may only be used during the period of appointment and within the authority that has been officially granted.</p>' +
        '<p>An appointment does not authorize anyone to bind the Chamber beyond their assigned responsibilities, enter into agreements without proper authority, or use the Chamber\'s identity for personal activities or private business.</p>' +
        '<p>When the appointment or relationship ends, accounts, access credentials, signatures, files, credentials, business cards, documents, templates, profiles, and other institutional materials must stop being used and, when applicable, must be returned or deactivated. Former authorities may refer to their previous position only as historical information, clearly indicating the relevant period and without suggesting that they still hold the position.</p>' +
        '<h3>12. Collaborators, sponsors, partners, speakers, and media</h3>' +
        '<p>Authorization granted to collaborators, sponsors, partners, speakers, or organizers is limited to the specific project, event, or activity. It does not create a permanent relationship, membership, representation, or the right to use the Chamber\'s identity in other situations.</p>' +
        '<p>The joint display of logos does not mean joint responsibility or general approval of the third party\'s products, services, statements, or activities. No relationship may be announced before formal approval or extended to other people or organizations without authorization.</p>' +
        '<p>Media organizations may use official materials for truthful editorial purposes, without changes and without creating the appearance of sponsorship, political association, or commercial endorsement.</p>' +
        '<h3>13. Minimum visual rules</h3>' +
        '<p>Only official files must be used. Approved proportions, colors, clear space, minimum size, contrast, and readability must always be maintained.</p>' +
        '<p>It is not allowed to recreate the logo manually, use screenshots or low-resolution files, distort, crop, rotate, recolor, animate, add effects, change fonts, remove elements, add words, combine it with another symbol, or create modified versions.</p>' +
        '<p>If a Visual Identity Manual is in force, its technical and graphic rules will prevail.</p>' +
        '<h3>14. Prohibition of Political or Election-Related Use</h3>' +
        '<p>The Chamber\'s identity may not be used to support political parties, candidates, election campaigns, political advertising, political fundraising, party events, political statements, or any position that has not been formally approved by the Chamber\'s competent bodies.</p>' +
        '<p>No member, authority, delegate, collaborator, or third party may use their relationship with the Chamber to suggest political, government, or election support. Personal opinions must always be presented as personal opinions and must not use the Chamber\'s logo, documents, positions, or official communication channels beyond the authority officially granted.</p>' +
        '<h3>15. Projects, Investment, Financing, and Fundraising</h3>' +
        '<p>The Chamber\'s identity may not be used to request money, attract investors, sell shares, promote securities, announce funding rounds, collect deposits, offer credit, guarantee projects, certify companies, validate due diligence, support securities offerings, promise access to public authorities, announce false financing, issue guarantees, promote investment opportunities, or request payments on behalf of the Chamber.</p>' +
        '<p>The presence of the Chamber\'s logo on a document does not, by itself, mean approval, recommendation, audit, certification, validation, guarantee, financial commitment, sponsorship, acceptance of risks, or support from MERCOSUR.</p>' +
        '<p>Only a formal document issued by the competent body, within its authority and for a specific purpose, may prove a relationship, authorization, participation, or official involvement.</p>' +
        '<h3>16. Certificates, Credentials, and Appointments</h3>' +
        '<p>Certificates, credentials, and appointments must be issued by the competent authority using approved formats and the signature, numbering, validity, and verification systems established by the Chamber.</p>' +
        '<p>They are personal or specific, non-transferable, and do not grant powers beyond those expressly stated. They may not be changed, reused for other purposes, or reproduced in a way that changes their scope.</p>' +
        '<p>The validity of certain certificates, credentials, or appointments may depend on verification through a code, register, link, official email, or another verification method established by the Chamber. After they expire or the relationship ends, they must no longer be used and, when requested, must be returned, destroyed, or removed from public channels.</p>' +
        '<h3>17. Domains, Email Addresses, Social Media, Delegations, and Chapters</h3>' +
        '<p>Only the domains, email addresses, and profiles published or linked on the official website are considered official. It is forbidden to register similar domains, create email addresses or profiles that appear to belong to the Chamber, use confusing usernames, copy the visual identity, or present yourself as an official channel without formal recognition.</p>' +
        '<p>Any delegation, chapter, office, or representation must be formally created or officially recognized. It may not create sub-brands, register domains, open profiles, issue appointments or certificates, sign agreements outside its authority, or legally commit the Chamber without proper authorization and sufficient powers.</p>' +
        '<p>When applicable, the responsible persons must transfer to the Chamber the control of accounts, profiles, domains, and other digital assets used in connection with their duties.</p>' +
        '<h3>18. Approved Translations and Names</h3>' +
        '<p>Translations of the Chamber\'s name, abbreviations, acronyms, and adaptations of positions or titles require approval. No names that may be confused with official organizations or that change the institutional meaning may be created.</p>' +
        '<p>The Spanish version is the main institutional reference unless the Chamber decides otherwise. Official translations published by the Chamber may only be used exactly as approved, without changes or the creation of new acronyms.</p>' +
        '<h3>19. Request, Validity, and Revocation of Authorizations</h3>' +
        '<p>Requests must be sent to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> and must identify the applicant, the organization, the purpose, the context, the materials, the communication channels, the duration, the planned publication date, the third parties involved, and the scope of the requested use.</p>' +
        '<p>The Chamber may approve, reject, request additional information, require changes, limit the authorization, set conditions, or revoke the authorization. No use may begin before written authorization is received.</p>' +
        '<p>The authorization will end when the period expires, the project or event ends, the membership or position ends, a violation occurs, the identity is used beyond the approved scope, or there is a significant institutional or reputational risk.</p>' +
        '<p>After the authorization ends, the materials must be removed, digital versions deleted, publications stopped, credentials returned, and profiles, accounts, or domains deactivated or transferred when applicable. The Chamber may request written confirmation that the materials have been removed.</p>' +
        '<h3>20. Monitoring, Violations, and Reporting Improper Use</h3>' +
        '<p>The Chamber may review the use of its identity, request copies or evidence, verify publications and communication channels, confirm the validity of memberships, positions, and authorizations, require corrections, and request the removal of materials. The absence of previous monitoring does not make an unauthorized use valid.</p>' +
        '<p>If a possible violation is identified, the Chamber may act gradually and proportionally through requests for clarification, warnings, correction or removal requests, suspension or revocation, communication with online platforms, requests to cancel domains or profiles, preservation of evidence, public clarification, and, when appropriate, administrative, civil, or criminal actions.</p>' +
        '<p>The response will consider the seriousness, duration, intention, scope, risk of confusion, harm to third parties, reputational damage, repeated conduct, and cooperation of the responsible person.</p>' +
        '<p>Anyone may report fake profiles, confusing domains, suspicious certificates, false representatives, fundraising activities, unauthorized projects, misleading emails, altered documents, or unauthorized political use by writing to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>21. Coordination and Updates</h3>' +
        '<p>This Policy must be read together with the Bylaws, the Terms of Use, the Privacy Policy, the Cookie Policy, the Visual Identity Manual, the internal regulations, the specific authorization conditions, and the Integrity Channel Policy. If there is a conflict, mandatory laws, the Bylaws, the specific authorization, and the Visual Identity Manual for technical matters will prevail.</p>' +
        '<p>The Chamber may update this Policy to reflect legal changes, trademark registrations, new identity versions, territorial expansion, new digital channels, or new forms of cooperation. The current version will be the one published on the website, and the changes will not validate previous unauthorized uses.</p>' +
        '<h3>22. Governing Law and Jurisdiction</h3>' +
        '<p>This Policy is governed by the laws of the Oriental Republic of Uruguay. The parties will try to resolve any dispute in good faith. If this is not possible, the courts of Montevideo will have jurisdiction, without prejudice to any mandatory legal provisions.</p>' +
        '<h3>23. Contact and Legal Framework</h3>' +
        '<p>To request authorization or report possible improper use of the Chamber\'s trademark or institutional identity, please contact <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Mercosur Chamber of Commerce. Uruguayan international association. Carlos Quijano 1290, Office 101, Montevideo 11.100, Uruguay.</p>' +
        '<p>Reference legal framework: Law No. 17.011 on Trademarks; Decree No. 34/999; Law No. 9.739 on Copyright; applicable civil laws; the Chamber\'s Bylaws and internal regulations.</p>',
      pt:
        '<p class="privacy-eyebrow">Câmara de Comércio Mercosul</p>' +
        '<h2 id="brand-modal-title">Política de Uso da Marca e da Identidade Institucional</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Data de publicação: 5 de julho de 2026</p>' +
        '<p>A identidade da Câmara de Comércio Mercosul constitui um ativo institucional destinado a identificar, de forma inequívoca, suas atividades, documentos, autoridades, programas e relações legitimamente autorizadas. Esta Política estabelece as condições sob as quais o nome, o logotipo e os demais elementos vinculados a essa identidade podem ser mencionados ou utilizados, com o objetivo de preservar sua integridade, evitar confusão e proteger a Câmara, seus associados, colaboradores e o público contra falsas aparências de filiação, representação, certificação, patrocínio ou apoio institucional.</p>' +
        '<h3>1. Identificação e alcance</h3>' +
        '<p>A Câmara de Comércio Mercosul é uma associação internacional uruguaia, com sede na Rua Carlos Quijano 1290, Sala 101, CEP 11.100, Montevidéu, Uruguai. Qualquer solicitação de autorização ou comunicação sobre possível uso indevido deverá ser enviada para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Esta Política aplica-se a qualquer pessoa física ou jurídica que mencione, reproduza, incorpore ou utilize elementos da identidade da Câmara, incluindo associados e candidatos à associação, autoridades, diretores, representantes, delegados, empregados, consultores, fornecedores, colaboradores, patrocinadores, palestrantes, parceiros institucionais, meios de comunicação, delegações, capítulos, organizadores de eventos e terceiros em geral.</p>' +
        '<p>A condição de associado, a participação em um evento, a aparição em uma publicação, uma colaboração, um patrocínio, um convite, uma nomeação, uma credencial ou o acesso ao site não concedem, por si só, uma licença geral nem autorização para atuar em nome da Câmara.</p>' +
        '<h3>2. Objeto, marca e identidade institucional</h3>' +
        '<p>Esta Política tem como objetivo proteger a identidade institucional, regular seus usos legítimos e impedir qualquer utilização que possa induzir terceiros a erro sobre quem está autorizado a representar, comunicar, certificar, apoiar ou assumir compromissos em nome da Câmara.</p>' +
        '<p>Para os fins desta Política, a marca compreende principalmente os sinais distintivos verbais, gráficos ou mistos utilizados para identificar a Câmara. A identidade institucional é um conceito mais amplo: além desses sinais, inclui cargos, títulos, assinaturas, credenciais, certificados, papéis timbrados, domínios, perfis em redes sociais, endereços de e-mail, documentos e qualquer outro elemento capaz de criar aparência de oficialidade, vínculo ou representação.</p>' +
        '<p>Esta Política possui natureza jurídica e institucional e não substitui o Manual de Identidade Visual, que poderá estabelecer as especificações técnicas de reprodução, dimensões, áreas de proteção, cores e aplicações gráficas.</p>' +
        '<h3>3. Marco jurídico aplicável</h3>' +
        '<p>A proteção e a utilização da identidade da Câmara serão interpretadas de acordo com a legislação da República Oriental do Uruguai, incluindo a Lei nº 17.011 de Marcas, seu Decreto Regulamentador nº 34/999, a Lei nº 9.739 sobre direitos autorais, as normas civis aplicáveis, os princípios da boa-fé e da prevenção da confusão, bem como os Estatutos e regulamentos internos da Câmara.</p>' +
        '<p>A Lei nº 17.011 reconhece como marca qualquer sinal apto a distinguir produtos ou serviços. Os direitos exclusivos decorrentes do registro somente serão afirmados quando houver efetivamente um registro concedido. Assim, esta Política não utiliza o símbolo de marca registrada nem presume uma situação registral que não esteja documentalmente comprovada.</p>' +
        '<p>A proteção institucional poderá abranger, conforme o caso, marcas registradas, pedidos de registro, nomes comerciais, denominações institucionais, sinais distintivos, logotipos, obras gráficas, textos, fotografias, materiais audiovisuais, documentos e direitos decorrentes do uso legítimo ou da autoria.</p>' +
        '<h3>4. Relação com o Mercosul</h3>' +
        '<p>A Câmara desenvolve suas atividades no espaço econômico, empresarial, social e institucional do Mercosul. Sua denominação, missão e área de atuação refletem essa vinculação regional e sua vocação para promover o comércio, o investimento, a cooperação empresarial e a integração.</p>' +
        '<p>No entanto, a Câmara não faz parte da estrutura política, governamental ou oficial do Mercosul, nem integra seus órgãos de decisão, políticos ou administrativos. Sua identidade não constitui um símbolo oficial do bloco, e a Câmara somente pode autorizar o uso de seus próprios elementos de identidade, não dos símbolos oficiais pertencentes ao Mercosul, aos seus Estados Partes, Estados Associados ou a outras instituições.</p>' +
        '<p>Nenhuma autorização para o uso da identidade da Câmara permite que qualquer pessoa se apresente como representante oficial do Mercosul. Da mesma forma, a relação de um associado, colaborador, patrocinador, palestrante, delegado, capítulo ou terceiro com a Câmara não implica apoio ou reconhecimento por parte dos Estados Partes, Estados Associados, governos ou órgãos oficiais do bloco.</p>' +
        '<p>Qualquer futura inscrição da Câmara no Registro de Organizações e Movimentos Sociais do Mercosul (MOS) terá apenas os efeitos próprios desse mecanismo e não a transformará em um órgão político ou oficial, nem concederá aos seus membros poderes gerais de representação do Mercosul.</p>' +
        '<h3>5. Elementos protegidos</h3>' +
        '<p>Estão abrangidos por esta Política a denominação completa da Câmara, suas traduções oficiais, siglas e abreviações autorizadas, logotipo, isotipo, emblemas, composições gráficas, cores institucionais, tipografias, slogans, assinaturas, papéis timbrados, selos, certificados, credenciais, cartões, documentos, relatórios, apresentações, modelos, fotografias oficiais, materiais audiovisuais, domínios, endereços de e-mail, nomes de usuário, perfis em redes sociais, cargos, títulos e credenciais.</p>' +
        '<p>Também estão abrangidas as adaptações, imitações, versões abreviadas, sinais foneticamente semelhantes, domínios que possam causar confusão, perfis que aparentem ser oficiais e qualquer composição verbal, visual, documental ou digital que reproduza elementos essenciais da identidade da Câmara ou possa criar uma associação razoável com ela.</p>' +
        '<h3>6. Titularidade, legitimidade e ausência de licença implícita</h3>' +
        '<p>A Câmara é titular, requerente, licenciada ou usuária legítima dos elementos que compõem sua identidade institucional, conforme aplicável em cada caso. Quando determinados materiais forem de terceiros, seu uso será realizado de acordo com as autorizações, licenças ou direitos correspondentes.</p>' +
        '<p>Nenhuma pessoa adquire, em razão de sua relação com a Câmara, direitos de propriedade, licença, reprodução, adaptação, tradução, sublicenciamento ou registro, nem autorização para emitir documentos, utilizar cargos ou apresentar-se como representante da Câmara. O silêncio, a ausência de oposição imediata ou a tolerância temporária não constituem autorização.</p>' +
        '<h3>7. Regra geral de autorização e apoio técnico</h3>' +
        '<p>Todo uso que vá além de uma simples referência informativa exige autorização prévia e por escrito. A autorização será expressa, específica, limitada, temporária, não exclusiva, intransferível, sem possibilidade de sublicenciamento e revogável, estando vinculada a uma finalidade, materiais, meios de utilização e, quando aplicável, a um território determinado.</p>' +
        '<p>A autorização não poderá ser interpretada de forma ampla. A Câmara poderá solicitar modelos, revisar materiais antes da publicação, exigir alterações, aprovar versões específicas, limitar formatos ou prazos, estabelecer condições razoáveis e determinar a retirada de qualquer uso que não esteja de acordo com a autorização concedida.</p>' +
        '<p>O usuário autorizado poderá fornecer os arquivos estritamente necessários a uma gráfica, designer, agência ou fornecedor técnico que atue em seu nome para produzir o material aprovado. Esse acesso não constitui sublicenciamento, e o usuário continuará responsável pelo uso, guarda e eliminação dos arquivos.</p>' +
        '<h3>8. Referências informativas e definição de uso comercial</h3>' +
        '<p>É permitido mencionar corretamente o nome da Câmara, criar links para o site oficial, citar conteúdos dentro dos limites legais ou divulgar informações jornalísticas, acadêmicas ou históricas sobre atividades reais, desde que a referência seja correta, feita de boa-fé e não tenha o objetivo de criar uma falsa aparência de patrocínio, representação, filiação ou apoio institucional.</p>' +
        '<p>Para os fins desta Política, considera-se uso comercial ou promocional qualquer utilização destinada, direta ou indiretamente, à venda de produtos ou serviços, captação de clientes, associados, investidores ou recursos financeiros, melhoria da posição competitiva de uma organização, divulgação de uma atividade ou atribuição de uma relação institucional com a Câmara. Esses usos exigem autorização por escrito.</p>' +
        '<p>O uso editorial do logotipo por meios de comunicação deve limitar-se à identificação necessária, utilizar arquivos oficiais e preservar sua integridade. Essa possibilidade não autoriza campanhas publicitárias, promoções, produtos, patrocínios, listas de clientes ou usos permanentes com finalidade comercial.</p>' +
        '<h3>9. Usos sujeitos à autorização por escrito</h3>' +
        '<p>Exigem autorização prévia a utilização da identidade da Câmara em sites, aplicativos, apresentações, folhetos, campanhas, relatórios, propostas, vídeos, publicações, comunicados de imprensa conjuntos, materiais comerciais ou promocionais, patrocínios, eventos, produtos, brindes, certificados, credenciais, perfis digitais, documentos de investimento, processos de financiamento, anúncios de parcerias, acordos, capítulos, delegações ou usos conjuntos com outras marcas.</p>' +
        '<p>A mesma regra aplica-se a qualquer material que, mesmo sem reproduzir exatamente o logotipo, possa levar terceiros a acreditar que existe uma relação de apoio, certificação, filiação, representação ou participação oficial.</p>' +
        '<h3>10. Uso por associados, candidatos e ex-membros</h3>' +
        '<p>A condição de associado não concede licença automática de uso. A Câmara poderá autorizar a utilização da expressão "Membro da Câmara de Comércio Mercosul", apenas enquanto a associação estiver vigente, mediante distintivo ou composição oficial fornecida ou aprovada pela Câmara. O associado não poderá utilizar isoladamente o logotipo institucional principal como se representasse a instituição.</p>' +
        '<p>Essa referência não poderá ser utilizada para captar recursos, validar projetos, promover investimentos, oferecer garantias, sugerir representação da Câmara ou indicar apoio oficial do Mercosul. O direito de uso terminará imediatamente quando a associação for encerrada ou suspensa, a autorização for revogada ou suas condições forem descumpridas.</p>' +
        '<p>A apresentação de um pedido de associação ou a condição de candidato não autoriza qualquer referência pública a uma associação ainda não concedida. Quem deixar de fazer parte da Câmara poderá mencionar essa condição apenas de forma histórica, indicando claramente o período correspondente e sem utilizar distintivos que sugiram vínculo atual.</p>' +
        '<h3>11. Autoridades, diretores, representantes e referências históricas</h3>' +
        '<p>Cargos, títulos, assinaturas, e-mails, papéis timbrados, cartões, credenciais, selos, perfis e documentos institucionais somente poderão ser utilizados durante o período de vigência da nomeação e dentro das competências expressamente concedidas.</p>' +
        '<p>A nomeação não autoriza a pessoa a comprometer a Câmara além das atribuições recebidas, celebrar acordos sem poderes suficientes ou utilizar a identidade institucional para atividades pessoais ou negócios sem relação com sua função.</p>' +
        '<p>Ao término do cargo ou do vínculo com a Câmara, deverão deixar de ser utilizados e, quando aplicável, deverão ser devolvidos ou desativados contas, acessos, assinaturas, arquivos, credenciais, cartões, documentos, modelos, perfis e demais materiais institucionais. A antiga autoridade poderá mencionar o cargo apenas como referência histórica, indicando claramente o período correspondente e sem sugerir que a função continua vigente.</p>' +
        '<h3>12. Colaboradores, patrocinadores, parceiros, palestrantes e meios de comunicação</h3>' +
        '<p>A autorização concedida a colaboradores, patrocinadores, parceiros, palestrantes ou organizadores limita-se ao projeto, evento ou atividade específica. Ela não estabelece uma relação permanente, filiação, representação ou direito de utilizar a identidade da Câmara em outros contextos.</p>' +
        '<p>A exibição conjunta de logotipos não implica responsabilidade conjunta nem aprovação geral dos produtos, serviços, declarações ou atividades do terceiro. Nenhuma relação poderá ser divulgada antes de sua aprovação formal nem estendida a outras pessoas ou entidades sem autorização.</p>' +
        '<p>Os meios de comunicação poderão utilizar materiais oficiais para fins editoriais verdadeiros, sem alterações e sem criar aparência de patrocínio, vínculo político ou apoio comercial.</p>' +
        '<h3>13. Regras visuais mínimas</h3>' +
        '<p>Devem ser utilizados exclusivamente arquivos oficiais, mantendo-se as proporções e cores aprovadas, a área de proteção, o tamanho mínimo e condições adequadas de contraste e legibilidade.</p>' +
        '<p>Não é permitido recriar manualmente o logotipo, utilizar capturas de tela ou arquivos de baixa resolução, deformá-lo, recortá-lo, girá-lo, alterar suas cores, animá-lo, adicionar efeitos, modificar tipografias, remover elementos, acrescentar palavras, integrá-lo a outro símbolo ou criar versões derivadas.</p>' +
        '<p>Quando existir um Manual de Identidade Visual em vigor, suas regras prevalecerão sobre as questões técnicas e gráficas.</p>' +
        '<h3>14. Proibição de usos políticos, eleitorais ou partidários</h3>' +
        '<p>A identidade da Câmara não poderá ser utilizada para apoiar partidos políticos, candidaturas, campanhas eleitorais, propaganda, arrecadação de recursos para fins políticos, atos partidários, declarações de caráter político-partidário ou posicionamentos que não tenham sido formalmente aprovados pelos órgãos competentes da Câmara.</p>' +
        '<p>Nenhum associado, autoridade, delegado, colaborador ou terceiro poderá utilizar sua relação com a Câmara para sugerir apoio eleitoral, governamental ou partidário. As opiniões pessoais deverão ser sempre apresentadas como tal, sem utilizar logotipos, documentos, cargos ou canais institucionais fora das competências expressamente conferidas.</p>' +
        '<h3>15. Projetos, investimentos, financiamento e captação de recursos</h3>' +
        '<p>A identidade da Câmara não poderá ser utilizada para solicitar dinheiro, captar investidores, vender participações, promover valores mobiliários, anunciar rodadas de financiamento, captar depósitos, oferecer crédito, garantir projetos, certificar empresas, validar processos de diligência prévia (due diligence), apoiar emissões, prometer acesso a autoridades, anunciar financiamentos inexistentes, emitir garantias, comercializar oportunidades de investimento ou solicitar pagamentos em nome da Câmara.</p>' +
        '<p>A presença do logotipo em um documento não implica, por si só, aprovação, recomendação, auditoria, certificação, validação, garantia, compromisso financeiro, patrocínio, aceitação de riscos ou respaldo do MERCOSUL.</p>' +
        '<p>Somente um documento formal emitido pelo órgão competente, dentro de suas atribuições e para um objetivo específico, poderá comprovar uma relação, autorização, participação ou intervenção concreta.</p>' +
        '<h3>16. Certificados, credenciais e nomeações</h3>' +
        '<p>Os certificados, credenciais e nomeações deverão ser emitidos pela autoridade competente, em formatos aprovados e com os mecanismos de assinatura, numeração, validade e verificação definidos pela Câmara.</p>' +
        '<p>São pessoais ou específicos, intransferíveis e não concedem poderes além daqueles expressamente indicados. Não poderão ser modificados, reutilizados para outras finalidades nem reproduzidos de forma que altere seu alcance.</p>' +
        '<p>A validade de determinados certificados, credenciais ou nomeações poderá depender de sua verificação por meio de código, registro, link, e-mail oficial ou outro mecanismo estabelecido pela Câmara. Após o vencimento ou o encerramento da relação, deverão deixar de ser utilizados e, quando solicitado, ser devolvidos, destruídos ou removidos dos canais públicos.</p>' +
        '<h3>17. Domínios, e-mails, redes sociais, delegações e capítulos</h3>' +
        '<p>Somente serão considerados oficiais os domínios, endereços de e-mail e perfis publicados ou vinculados ao site institucional. É proibido registrar domínios semelhantes, criar e-mails ou perfis que aparentem pertencer à Câmara, utilizar nomes de usuário que possam gerar confusão, reproduzir a identidade visual ou apresentar-se como canal oficial sem reconhecimento formal.</p>' +
        '<p>Toda delegação, capítulo, escritório ou representação deverá ser criado ou reconhecido formalmente. Não poderá criar submarcas, registrar domínios, abrir perfis, emitir nomeações ou certificados, celebrar acordos além de sua competência nem assumir compromissos jurídicos em nome da Câmara sem autorização e poderes suficientes.</p>' +
        '<p>Quando aplicável, os responsáveis deverão transferir ou entregar à Câmara o controle de contas, perfis, domínios e outros ativos digitais utilizados em relação às suas funções.</p>' +
        '<h3>18. Traduções e denominações autorizadas</h3>' +
        '<p>As traduções da denominação, as abreviações, as siglas e as adaptações de cargos ou títulos exigem aprovação. Não poderão ser criados nomes que possam ser confundidos com organismos oficiais nem versões que alterem o significado institucional.</p>' +
        '<p>A versão em espanhol será a principal referência institucional, salvo decisão expressa da Câmara. As traduções oficiais publicadas pela própria Câmara poderão ser utilizadas apenas na forma exata aprovada, sem modificações nem criação de novas siglas.</p>' +
        '<h3>19. Solicitação, vigência e revogação de autorizações</h3>' +
        '<p>As solicitações deverão ser enviadas para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>, identificando o solicitante, sua organização, a finalidade, o contexto, os materiais, os meios de divulgação, a duração, a data prevista de publicação, os terceiros envolvidos e o alcance do uso solicitado.</p>' +
        '<p>A Câmara poderá aprovar, rejeitar, solicitar esclarecimentos, exigir alterações, limitar o alcance, impor condições ou revogar a autorização. Nenhum uso poderá iniciar antes do recebimento de autorização por escrito.</p>' +
        '<p>A autorização terminará com o vencimento do prazo, o encerramento do projeto ou evento, o fim da associação ou do cargo, a ocorrência de descumprimento, a utilização da identidade além do alcance aprovado ou a existência de risco institucional ou reputacional relevante.</p>' +
        '<p>Após o término, os materiais deverão ser retirados, as versões digitais eliminadas, as publicações suspensas, as credenciais devolvidas e os perfis, contas ou domínios desativados ou transferidos, quando aplicável. A Câmara poderá solicitar confirmação por escrito da retirada.</p>' +
        '<h3>20. Supervisão, descumprimentos e comunicação de usos indevidos</h3>' +
        '<p>A Câmara poderá revisar os usos, solicitar cópias ou provas, verificar publicações e canais, confirmar a validade de associações, cargos e autorizações, exigir correções e solicitar a retirada de materiais. A ausência de fiscalização prévia não legitima um uso não autorizado.</p>' +
        '<p>Diante de um possível descumprimento, a Câmara poderá atuar de forma gradual e proporcional, por meio de pedido de esclarecimentos, advertência, solicitação de correção ou retirada, suspensão ou revogação, comunicação às plataformas, solicitação de cancelamento de domínios ou perfis, preservação de provas, esclarecimento público e, quando aplicável, adoção de medidas administrativas, civis ou penais.</p>' +
        '<p>A resposta considerará a gravidade, a duração, a intenção, o alcance, o risco de confusão, o prejuízo a terceiros, o dano à reputação, a reincidência e a cooperação do responsável.</p>' +
        '<p>Qualquer pessoa poderá comunicar perfis falsos, domínios que possam gerar confusão, certificados suspeitos, falsos representantes, captação de recursos, projetos não autorizados, e-mails enganosos, documentos alterados ou usos políticos não autorizados escrevendo para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>21. Coordenação e alterações</h3>' +
        '<p>Esta Política deverá ser interpretada em conjunto com os Estatutos, os Termos de Uso, a Política de Privacidade, a Política de Cookies, o Manual de Identidade Visual, os regulamentos internos, as condições específicas de autorização e o Canal de Integridade. Em caso de conflito, prevalecerão as normas obrigatórias, os Estatutos, a autorização específica em seu respectivo âmbito e o Manual de Identidade Visual para questões técnicas.</p>' +
        '<p>A Câmara poderá atualizar esta Política para refletir alterações legislativas, registros de marca, novas versões da identidade, expansão territorial, novos canais digitais ou novas modalidades de colaboração. A versão vigente será a publicada no site, e as alterações não legitimarão usos anteriores não autorizados.</p>' +
        '<h3>22. Legislação aplicável e jurisdição</h3>' +
        '<p>Esta Política será regida pelas leis da República Oriental do Uruguai. As partes buscarão resolver qualquer divergência de boa-fé e, quando isso não for possível, serão competentes os tribunais de Montevidéu, sem prejuízo das normas obrigatórias aplicáveis.</p>' +
        '<h3>23. Contato e marco normativo</h3>' +
        '<p>Para solicitar autorização ou comunicar um possível uso indevido da marca ou da identidade institucional, escreva para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Câmara de Comércio Mercosul. Associação internacional uruguaia. Rua Carlos Quijano 1290, Sala 101, CEP 11.100, Montevidéu, Uruguai.</p>' +
        '<p>Marco normativo de referência: Lei nº 17.011 de Marcas; Decreto nº 34/999; Lei nº 9.739 sobre direitos autorais; normas civis aplicáveis; Estatutos e regulamentos internos da Câmara.</p>',
      fr:
        '<p class="privacy-eyebrow">Chambre de Commerce du Mercosur</p>' +
        '<h2 id="brand-modal-title">Politique d\'Utilisation de la Marque et de l\'Identité Institutionnelle</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Date de publication : 5 juillet 2026</p>' +
        '<p>L\'identité de la Chambre de Commerce du Mercosur est un atout institutionnel destiné à identifier sans équivoque ses actions, documents, pouvoirs, programmes et relations légitimement autorisées. Cette Politique établit les conditions dans lesquelles le nom, le logo et les autres éléments associés à cette identité peuvent être mentionnés ou utilisés, afin de préserver son intégrité, d\'éviter toute confusion et de protéger la Chambre, ses membres, ses collaborateurs et le public contre toute apparence trompeuse d\'appartenance, de représentation, de certification, de parrainage ou d\'approbation.</p>' +
        '<h3>1. Identification et étendue</h3>' +
        '<p>La Chambre de Commerce du Mercosur est une association internationale uruguayenne dont le siège social est situé Calle Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay. Toute demande d\'autorisation ou tout signalement d\'abus potentiel doit être adressé à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>La présente Politique s\'applique à toute personne physique ou morale qui mentionne, reproduit, incorpore ou utilise des éléments de l\'identité de la Chambre, y compris les associés et associés potentiels, les autorités, les administrateurs, les représentants, les délégués, les employés, les conseillers, les fournisseurs, les collaborateurs, les commanditaires, les panélistes, les partenaires institutionnels, les médias, les délégations, les sections, les organisateurs d\'événements et les tiers en général.</p>' +
        '<p>L\'adhésion, la participation à une activité, la parution dans une publication, la collaboration, le parrainage, l\'invitation, la nomination, l\'accréditation ou l\'accès au site web ne confèrent pas en eux-mêmes une licence générale ni le pouvoir d\'agir au nom de la Chambre.</p>' +
        '<h3>2. Objet, marque et identité institutionnelle</h3>' +
        '<p>La présente politique a pour but de protéger l\'identité institutionnelle, de réglementer ses utilisations légitimes et d\'empêcher toute utilisation susceptible d\'induire en erreur quant à l\'identité des personnes autorisées à représenter, communiquer, certifier, approuver ou engager la Chambre.</p>' +
        '<p>À ces fins, la marque se compose principalement des signes distinctifs verbaux, graphiques ou mixtes utilisés pour identifier la Chambre. L\'identité institutionnelle est un concept plus large : outre ces signes, elle inclut les fonctions, les titres, les signatures, les qualifications, les certificats, les en-têtes de lettre, les noms de domaine, les profils sociaux, les adresses électroniques, les documents et tout autre élément susceptible de créer une apparence d\'officialité, d\'affiliation ou de représentation.</p>' +
        '<p>Cette politique a une nature juridique et institutionnelle et ne remplace pas le Manuel d\'Identité Visuelle, qui pourra développer les spécifications techniques en matière de reproduction, de tailles, de zones de sécurité, de couleurs et d\'applications graphiques.</p>' +
        '<h3>3. Cadre juridique applicable</h3>' +
        '<p>La protection et l\'utilisation de l\'identité de la Chambre seront interprétées conformément à la législation de la République Orientale de l\'Uruguay, notamment la Loi N° 17.011 sur les Marques, son Décret Réglementaire N° 34/999, la Loi N° 9.739 sur le droit d\'auteur, les règles civiles applicables, les principes de bonne foi et de prévention de la confusion, ainsi que les Statuts et règlements intérieurs de la Chambre.</p>' +
        '<p>La Loi N° 17.011 reconnaît comme marque tout signe permettant de distinguer des produits ou des services. Les droits exclusifs propres à l\'enregistrement ne seront acquis qu\'après l\'obtention d\'un enregistrement. Par conséquent, cette Politique n\'utilise pas le symbole de marque déposée et ne présume pas d\'un statut d\'enregistrement non documenté.</p>' +
        '<p>La protection institutionnelle peut comprendre, selon le cas, les marques déposées, les demandes d\'enregistrement, les noms commerciaux, les noms institutionnels, les signes distinctifs, les logos, les œuvres graphiques, les textes, les photographies, les documents audiovisuels, la documentation et les droits découlant d\'un usage légitime ou d\'une paternité.</p>' +
        '<h3>4. Relation avec le MERCOSUR</h3>' +
        '<p>La Chambre développe son activité dans le cadre économique, commercial, social et institutionnel du MERCOSUR. Son nom, sa mission et son champ d\'action reflètent ce lien régional et son engagement à promouvoir le commerce, l\'investissement, la coopération commerciale et l\'intégration.</p>' +
        '<p>La Chambre, cependant, ne fait pas partie de la structure politique, gouvernementale ou organisationnelle officielle du MERCOSUR et n\'en comprend pas les organes décisionnels, politiques ou administratifs. Son identité ne constitue pas un emblème officiel du bloc, et la Chambre ne peut autoriser que l\'utilisation de ses propres éléments, et non celle des symboles officiels appartenant au MERCOSUR, à ses États ou à d\'autres institutions.</p>' +
        '<p>Aucune autorisation relative à l\'identité de la Chambre ne lui permet de se présenter comme représentante officielle du MERCOSUR. Les liens qu\'elle entretient avec un associé, un collaborateur, un sponsor, un intervenant, un délégué, une section ou un tiers n\'impliquent en aucun cas un soutien de la part des États Membres, des États Associés, des gouvernements ou des organes du bloc.</p>' +
        '<p>Toute future inscription de la Chambre au Registre des Organisations et Mouvements Sociaux du MERCOSUR (MOS) aura exclusivement la portée de ce mécanisme et ne fera pas d\'elle un organe politique ou officiel ni n\'accordera à ses membres des pouvoirs généraux de représentation du MERCOSUR.</p>' +
        '<h3>5. Éléments protégés</h3>' +
        '<p>La présente Politique inclut le nom complet de la Chambre, ses traductions officielles, ses acronymes et abréviations autorisés, son logo, son isotype, ses emblèmes, ses compositions graphiques, ses couleurs institutionnelles, sa typographie, ses slogans, ses signatures, ses en-têtes de lettre, ses sceaux, ses certificats, ses titres de compétence, ses cartes, ses documents, ses rapports, ses présentations, ses modèles, ses photographies officielles, ses supports audiovisuels, ses domaines, ses adresses électroniques, ses noms d\'utilisateur, ses profils sociaux, ses postes, ses titres et ses accréditations.</p>' +
        '<p>Sont également inclus les adaptations, les imitations, les variantes abrégées, les signes phonétiquement similaires, les domaines présentant une ressemblance trompeuse, les profils d\'apparence officielle et toute composition verbale, visuelle, documentaire ou numérique qui reproduit des éléments essentiels de l\'identité ou qui peut générer une association raisonnable avec la Chambre.</p>' +
        '<h3>6. Propriété, légitimité et absence de licence implicite</h3>' +
        '<p>La Chambre est propriétaire, demandeuse, titulaire de licence ou utilisatrice légitime des éléments qui composent son identité institutionnelle, selon le cas. Lorsque certains éléments proviennent de tiers, leur utilisation sera conforme aux autorisations, licences ou droits applicables.</p>' +
        '<p>Nul n\'acquiert, par sa relation avec la Chambre, la propriété, la licence, le droit de reproduction, d\'adaptation, de traduction, de sous-licence ou d\'enregistrement, ni le pouvoir d\'émettre des documents, d\'occuper des fonctions ou de se présenter comme représentant. Le silence, l\'absence d\'objection immédiate ou la tolérance temporaire ne valent pas autorisation.</p>' +
        '<h3>7. Règle générale d\'autorisation et d\'assistance technique</h3>' +
        '<p>Toute utilisation autre qu\'une simple référence informative requiert une autorisation écrite préalable. Cette autorisation sera exprimée, spécifique, limitée, temporaire, non exclusive, non transférable, non sous-licenciable et révocable. Elle doit être liée précisément à un objectif, des éléments, des supports, des moyens et, le cas échéant, à un territoire.</p>' +
        '<p>L\'autorisation ne pourra être interprétée de manière extensive. La Chambre pourra exiger des maquettes, examiner les documents avant publication, imposer des modifications, approuver des versions spécifiques, limiter les formats ou la durée, imposer des conditions raisonnables et ordonner le retrait de toute utilisation non conforme à l\'autorisation.</p>' +
        '<p>L\'utilisateur autorisé ne pourra fournir que les fichiers strictement nécessaires à un imprimeur, un graphiste, une agence ou un prestataire technique agissant pour son compte afin de produire la pièce approuvée. Cet accès ne constitue pas une sous-licence et l\'utilisateur continuera d\'être responsable de l\'utilisation, de la conservation et de la destruction des fichiers.</p>' +
        '<h3>8. Références informatives et définition d\'usage commerciale</h3>' +
        '<p>Le nom de la Chambre peut être correctement mentionné, le site web officiel peut être lié, le contenu peut être cité dans les limites légales, ou les activités réelles peuvent être rapportées de manière journalistique, académique ou historique, à condition que la référence soit exacte, faite de bonne foi et ne vise pas à créer une apparence de parrainage, de représentation, d\'adhésion ou d\'approbation qui n\'existe pas.</p>' +
        '<p>Aux fins de cette Politique, toute utilisation visant directement ou indirectement à vendre des produits ou des services, à attirer des clients, des partenaires, des investisseurs ou des financements, à améliorer la position concurrentielle d\'une entité, à faire la publicité d\'une activité ou à revendiquer une relation institutionnelle avec la Chambre sera considérée comme une utilisation commerciale ou promotionnelle. De telles utilisations nécessitent une autorisation écrite.</p>' +
        '<p>L\'utilisation éditoriale du logo par les moyens de communication devra se limiter à l\'identification nécessaire, utiliser les fichiers officiels et préserver son intégrité. Ceci n\'autorise pas les campagnes publicitaires, les promotions, les produits, les parrainages, les listes de clients ni l\'utilisation permanente à des fins commerciales.</p>' +
        '<h3>9. Utilisations soumises à autorisation écrite</h3>' +
        '<p>L\'intégration de l\'identité de la Chambre dans des pages internet, des applications, des présentations, des brochures, des campagnes, des rapports, des propositions, des vidéos, des publications, des communiqués de presse conjoints, des supports commerciaux ou promotionnels, des commandites, des événements, des produits, du merchandising, des certificats, des accréditations, des profils numériques, des documents d\'investissement, des processus de financement, des annonces d\'alliances, d\'accords, de sections, de délégations ou d\'utilisations conjointes avec d\'autres marques nécessite une autorisation préalable.</p>' +
        '<p>La même règle s\'applique à tout élément qui, même sans reproduire exactement le logo, peut laisser penser qu\'il existe une relation de parrainage, de certification, d\'adhésion, de représentation ou de participation officielle.</p>' +
        '<h3>10. Utilisation par des associés, des candidats et d\'anciens membres</h3>' +
        '<p>L\'adhésion ne confère pas automatiquement de licence. La Chambre pourra autoriser la désignation « Membre de la Chambre de Commerce du Mercosur » uniquement pendant la durée de l\'adhésion, et ce, à l\'aide d\'un label ou d\'un visuel officiel fourni ou approuvé par la Chambre. Le membre ne pourra pas utiliser le logo principal de l\'entreprise séparément, comme s\'il représentait l\'institution.</p>' +
        '<p>Cette référence ne pourra être utilisée pour solliciter des fonds, valider des projets, promouvoir des investissements, offrir des garanties, suggérer une représentation de la Chambre ou sous-entendre un soutien officiel du MERCOSUR. Le droit de l\'utiliser prendra fin immédiatement en cas de radiation ou de suspension de l\'adhésion, de révocation de l\'autorisation ou de non-respect de ses conditions.</p>' +
        '<p>Le dépôt d\'une demande d\'adhésion ou le statut de candidat n\'autorise aucune mention publique d\'une adhésion non encore accordée. Les personnes ayant cessé d\'être membres de la Chambre pourront évoquer ce statut uniquement à titre rétrospectif, en indiquant clairement la période concernée et sans utiliser de symboles suggérant une affiliation actuelle.</p>' +
        '<h3>11. Autorités, directeurs, représentants et références historiques</h3>' +
        '<p>Les postes, titres, signatures, courriels, en-têtes de lettres, cartes, accréditations, sceaux, profils et documents institutionnels ne pourront être utilisés que pendant la durée du mandat et dans les limites des pouvoirs expressément conférés.</p>' +
        '<p>Cette nomination n\'autorise pas la Chambre à s\'engager en dehors de son champ de compétences, à conclure des accords sans pouvoir suffisant, ni à utiliser son identité institutionnelle à des fins personnelles ou commerciales sans rapport avec sa fonction.</p>' +
        '<p>À la cessation d\'une fonction ou d\'une relation, tous les comptes, accès, signatures, fichiers, identifiants, cartes, documents, modèles, profils et autres éléments institutionnels devront être désactivés, le cas échéant, restitués ou mis hors service. Les anciens responsables pourront évoquer leur fonction uniquement dans un contexte historique, en indiquant clairement la période et sans laisser entendre que celle-ci est toujours en fonction.</p>' +
        '<h3>12. Collaborateurs, commanditaires, partenaires, panélistes et médias</h3>' +
        '<p>L\'autorisation accordée à un collaborateur, un sponsor, un partenaire, un intervenant ou un organisateur est limitée au projet, à l\'événement ou à l\'activité concernée. Elle n\'implique aucune relation permanente, adhésion, représentation ou droit d\'utiliser l\'identité dans d\'autres contextes.</p>' +
        '<p>L\'utilisation conjointe de logos n\'implique aucune responsabilité conjointe ni aucune approbation générale des produits, services, déclarations ou activités de la tierce partie. Aucune relation ne pourra être divulguée avant approbation formelle ni étendue à d\'autres personnes ou entités sans autorisation.</p>' +
        '<p>Les médias pourront utiliser les matériels officiels à des fins éditoriales véridiques, sans modification et sans donner l\'apparence d\'un parrainage, d\'une association politique ou d\'un soutien commercial.</p>' +
        '<h3>13. Règles visuelles minimales</h3>' +
        '<p>Seuls les fichiers officiels devront être utilisés, les proportions et les couleurs approuvées devront être respectées, la zone de sécurité devra être préservée, la taille minimale devra être respectée et le contraste et la lisibilité devront être garantis.</p>' +
        '<p>La reconstruction manuelle du logo, à partir de captures d\'écran ou de fichiers basse résolution, sa déformation, son recadrage, sa rotation, sa recoloration, son animation, l\'ajout d\'effets, la modification des polices, la suppression d\'éléments, l\'incorporation de mots, son intégration dans un autre emblème ou la création de versions dérivées ne sont pas autorisées.</p>' +
        '<p>Lorsqu\'un Manuel d\'Identité Visuelle est en vigueur, ses règles prévaudront en matière technique et graphique.</p>' +
        '<h3>14. Interdiction d\'utilisations politiques, électorales ou partisanes</h3>' +
        '<p>L\'identité de la Chambre ne pourra être utilisée pour soutenir des partis politiques, des candidatures, des campagnes électorales, de la propagande, des collectes de fonds politiques, des actes partisans, des déclarations prosélytes ou des positionnements qui n\'ont pas été formellement approuvés par les organes compétents de la Chambre.</p>' +
        '<p>Aucun membre, autorité, délégué, collaborateur ou tiers ne pourra se prévaloir de ses liens avec la Chambre pour suggérer un soutien électoral, gouvernemental ou partisan. Les opinions personnelles devront toujours être exprimées comme telles, sans utiliser de logos, de documents, de prises de position ou de canaux institutionnels en dehors des fins expressément autorisées.</p>' +
        '<h3>15. Projets, investissements, financements et levée de fonds</h3>' +
        '<p>L\'identité de la Chambre ne peut être utilisée pour solliciter des fonds, attirer des investisseurs, vendre des actions, promouvoir des titres, annoncer des levées de fonds, solliciter des dépôts, offrir du crédit, garantir des projets, certifier des entreprises, valider une vérification préalable, soutenir des dossiers, promettre un accès aux autorités, faire la publicité de financements inexistants, émettre des garanties, commercialiser des opportunités d\'investissement ou solliciter des paiements au nom de la Chambre.</p>' +
        '<p>La présence du logo sur un document n\'implique pas en soi une approbation, une recommandation, un audit, une certification, une validation, une garantie, un engagement financier, un parrainage, une acceptation des risques ou un soutien de la part du MERCOSUR.</p>' +
        '<p>Seul un document officiel délivré par l\'autorité compétente, dans le cadre de ses pouvoirs et à des fins spécifiques, pourra prouver une relation, une autorisation, une participation ou une intervention concrète.</p>' +
        '<h3>16. Certificats, qualifications et nominations</h3>' +
        '<p>Les certificats, titres et nominations devront être délivrés par l\'autorité compétente, selon les formats approuvés et avec les mécanismes de signature, de numérotation, de validité et de vérification déterminés par la Chambre.</p>' +
        '<p>Ils sont personnels ou spécifiques, non cessibles, et ne confèrent aucun pouvoir autre que ceux expressément énoncés. Ils ne pourront être modifiés, réutilisés à d\'autres fins, ni reproduits de manière qui en altère leur portée.</p>' +
        '<p>La validité de certains certificats, titres ou nominations pourra être subordonnée à une vérification par code, inscription, lien, courriel officiel ou tout autre mécanisme établi par la Chambre. Une fois expirés ou la relation terminée, ils devront cesser d\'être utilisés et, sur demande, être restitués, détruits ou retirés des canaux publics.</p>' +
        '<h3>17. Domaines, courriels, réseaux, délégations et chapitres</h3>' +
        '<p>Seuls les domaines, adresses électroniques et profils publiés ou liés au site institutionnel seront considérés comme officiels. Il est interdit d\'enregistrer des domaines similaires, de créer des adresses électroniques ou des profils semblant être affiliés à l\'institution, d\'utiliser des noms d\'utilisateur trompeusement similaires, de reproduire l\'identité visuelle ou de se présenter comme un canal officiel sans reconnaissance formelle.</p>' +
        '<p>Chaque antenne, section, bureau ou représentation devra être créée ou reconnue officiellement. Elle ne pourra pas créer de sous-marques, enregistrer des domaines, ouvrir de profils, délivrer des nominations ou des certificats, conclure des accords hors de son champ de compétence, ni engager juridiquement la Chambre sans autorisation et pouvoir suffisants.</p>' +
        '<p>Le cas échéant, les responsables devront transférer ou remettre à la Chambre le contrôle des comptes, profils, domaines et autres actifs numériques utilisés dans le cadre de leurs fonctions.</p>' +
        '<h3>18. Traductions et noms autorisés</h3>' +
        '<p>Les traductions de noms, d\'abréviations, d\'acronymes et les adaptations de fonctions ou de titres doivent être approuvées. Les noms susceptibles d\'être confondus avec des organismes officiels ou les versions qui en modifient le sens institutionnel seront interdits.</p>' +
        '<p>La version espagnole sera la référence institutionnelle principale, sauf décision exprimée de la Chambre. Les traductions officielles publiées par la Chambre elle-même ne pourront être utilisées que dans leur version exacte approuvée, sans modification ni création de nouveaux acronymes.</p>' +
        '<h3>19. Application, validité et révocation des autorisations</h3>' +
        '<p>Les demandes devront être envoyées à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a> et identifier le demandeur, son organisation, le but, le contexte, les matériels, les moyens, la durée, la date de publication prévue, les tiers impliqués et l\'étendue de l\'utilisation demandée.</p>' +
        '<p>La Chambre pourra approuver, refuser, demander des précisions, exiger des modifications, limiter la portée, imposer des conditions ou révoquer l\'autorisation. Aucune utilisation ne pourra commencer avant réception d\'une autorisation écrite.</p>' +
        '<p>L\'autorisation prendra fin à l\'expiration de sa durée, à l\'achèvement du projet ou de l\'événement, à la cessation de l\'adhésion ou du poste, à la survenance d\'une violation, à l\'utilisation de l\'identité en dehors du cadre approuvé ou à l\'existence d\'un risque institutionnel ou de réputation pertinent.</p>' +
        '<p>Suite à la résiliation, les documents devront être retirés, les versions numériques supprimées, les publications suspendues, les identifiants restitués et les profils, comptes ou domaines désactivés ou transférés, le cas échéant. La Chambre pourra exiger une confirmation écrite de ce retrait.</p>' +
        '<h3>20. Supervision, non-respect des règles et signalement des abus</h3>' +
        '<p>La Chambre pourra examiner l\'utilisation, demander des copies ou des preuves, vérifier les publications et les canaux de diffusion, contrôler la validité des adhésions, des cotisations et des autorisations, exiger des corrections et demander le retrait des documents. L\'absence de supervision préalable ne légitime pas une utilisation non autorisée.</p>' +
        '<p>En cas de violation potentielle, la Chambre pourra agir de manière progressive et proportionnée en demandant des éclaircissements, en émettant des avertissements, en exigeant la correction ou la suppression, en suspendant ou en révoquant, en communiquant avec les plateformes, en demandant l\'annulation des domaines ou des profils, en conservant les preuves, en publiant des clarifications et, le cas échéant, en engageant des poursuites administratives, civiles ou pénales.</p>' +
        '<p>La réponse tiendra compte de la gravité, de la durée, de l\'intention, de la portée, du risque de confusion, du préjudice causé à des tiers, de l\'atteinte à la réputation, de la répétition et de la coopération de la partie responsable.</p>' +
        '<p>Toute personne peut signaler les faux profils, les domaines trompeurs, les certificats douteux, les faux représentants, les collectes de fonds, les projets non autorisés, les courriels trompeurs, les documents falsifiés ou les utilisations politiques non autorisées en écrivant à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<h3>21. Coordination et modifications</h3>' +
        '<p>Cette Politique est interprétée conjointement avec les Statuts, les Conditions d\'Utilisation, la Politique de Confidentialité, la Politique relative aux Cookies, le Manuel d\'Identité Visuelle, le règlement intérieur, les conditions d\'autorisation spécifiques et le Canal d\'Intégrité. En cas de conflit, les règles impératives, les Statuts, l\'autorisation spécifique dans son champ d\'application et le Manuel d\'Identité Visuelle pour les aspects techniques prévalent.</p>' +
        '<p>La Chambre pourra mettre à jour la cette Politique afin de tenir compte des changements législatifs, des enregistrements de marques, des nouvelles versions de son identité, de son expansion territoriale, de ses nouveaux canaux numériques ou des accords de collaboration. La version en vigueur sera celle publiée sur le site web, et les modifications ne sauraient légitimer une utilisation antérieure non autorisée.</p>' +
        '<h3>22. Législation applicable et juridiction</h3>' +
        '<p>La Politique est régie par les lois de la République Orientale de l\'Uruguay. Les parties s\'efforceront de résoudre tout différend à l\'amiable et, à défaut, les tribunaux de Montevideo seront compétents, sans préjudice des règles impératives applicables.</p>' +
        '<h3>23. Contact et cadre réglementaire</h3>' +
        '<p>Pour toute demande d\'autorisation ou pour signaler un éventuel usage abusif de la marque ou de l\'identité institutionnelle, veuillez écrire à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p class="privacy-signature">Chambre de Commerce du Mercosur, association internationale uruguayenne, Calle Carlos Quijano 1290, bureau 101, 11100 Montevideo, Uruguay.</p>' +
        '<p style="font-size:.8rem;">Cadre réglementaire de référence : Loi N° 17.011 sur les Marques ; Décret N° 34/999 ; Loi N° 9.739 sur le droit d\'auteur ; réglementations civiles applicables ; Statuts et règlements intérieurs de la Chambre.</p>'
    };

    function currentLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return brandHTML[lang] ? lang : 'es';
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'brand-modal-title');
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
      return overlay;
    }

    function openModal() {
      var ov = buildOverlay();
      ov.innerHTML =
        '<div class="privacy-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          brandHTML[currentLang()] +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closeModal);
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeModal() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-brand-link');
      if (!trigger) return;
      e.preventDefault();
      openModal();
    });
  })();


  /* ---------- Terms of Use modal (footer link) ---------- */
  (function () {
    if (!document.querySelector('.js-terms-link')) return;

    var overlay = null;

    var termsHTML = {
      es:
        '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
        '<h2 id="terms-modal-title">Términos de Uso</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Fecha de publicación: 5 de julio de 2026</p>' +
        '<p>Estos Términos de Uso regulan el acceso, la navegación y la utilización del sitio web de la Cámara de Comercio Mercosur, así como el uso de sus formularios, contenidos, recursos y funcionalidades. Su finalidad es establecer un marco claro para la relación entre la Cámara y las personas, empresas, cámaras, instituciones y demás organizaciones que consultan el sitio o se comunican con ella a través de sus canales digitales.</p>' +
        '<h3>1. Identificación y naturaleza jurídica</h3>' +
        '<p>El titular del sitio es la Cámara de Comercio Mercosur, asociación internacional uruguaya con domicilio en Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay. Para consultas relacionadas con estos Términos puede escribirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>La Cámara desarrolla su actividad bajo el marco jurídico aplicable a las asociaciones civiles en la República Oriental del Uruguay. Este marco se integra, entre otras disposiciones, por el artículo 39 de la Constitución de la República, que reconoce el derecho de asociación; el artículo 21 del Código Civil, relativo al reconocimiento de las asociaciones como personas jurídicas; el Decreto-Ley N.º 15.089, sobre las competencias administrativas del Ministerio de Educación y Cultura en materia de asociaciones civiles y fundaciones; la normativa reglamentaria correspondiente; y los Estatutos de la propia Cámara, que regulan su organización, representación, admisión de asociados, derechos, obligaciones y funcionamiento interno.</p>' +
        '<h3>2. Objeto, alcance y aceptación</h3>' +
        '<p>Estos Términos se aplican al acceso y navegación por el sitio, a la consulta de sus contenidos, al uso de formularios, a las solicitudes de asociación, a las propuestas de cooperación, a la presentación de iniciativas empresariales, a las consultas sobre comercio, inversión, financiación e internacionalización, a la suscripción a comunicaciones institucionales y al acceso a noticias, eventos, publicaciones y enlaces externos.</p>' +
        '<p>El acceso o utilización del sitio implica la aceptación de estos Términos en la medida permitida por la normativa aplicable. Quien actúe en nombre de una empresa, institución u organización declara contar con facultades suficientes para representarla. El simple acceso al sitio no crea por sí mismo una relación contractual, asociativa, profesional, fiduciaria, de mandato o de representación con la Cámara.</p>' +
        '<p>Determinadas actividades, eventos, programas, membresías, acuerdos o relaciones específicas podrán estar sujetos a condiciones particulares. En caso de contradicción, dichas condiciones prevalecerán únicamente respecto de la actividad concreta a la que se refieran.</p>' +
        '<h3>3. Relación con el MERCOSUR</h3>' +
        '<p>La Cámara desarrolla su actividad en el espacio económico, empresarial, social e institucional del MERCOSUR. Su denominación, objeto y misión responden a ese ámbito regional y a su propósito de promover el comercio, la inversión, la cooperación empresarial y la integración entre los Estados Partes, los Estados Asociados y otros mercados internacionales.</p>' +
        '<p>Esta vinculación no significa que la Cámara forme parte de la estructura política, gubernamental u orgánica oficial del MERCOSUR. La Cámara no integra sus órganos políticos, decisorios o administrativos; no adopta decisiones en nombre del bloque; no representa oficialmente al MERCOSUR, a sus Estados Partes, a sus Estados Asociados ni a sus instituciones; y no puede emitir posiciones, certificaciones o autorizaciones oficiales en su nombre. El sitio web de la Cámara no es un portal oficial del MERCOSUR.</p>' +
        '<p>La Cámara puede participar en mecanismos sociales, empresariales, consultivos o institucionales vinculados al proceso de integración regional. Cualquier inscripción, reconocimiento o participación institucional tendrá exclusivamente el alcance que derive del acto correspondiente. Una eventual inscripción en el Registro de Organizaciones y Movimientos Sociales del MERCOSUR (MOS) no convertiría a la Cámara en órgano político u oficial del bloque ni le atribuiría facultades generales para representarlo.</p>' +
        '<h3>4. Finalidad del sitio y ausencia de asesoramiento profesional</h3>' +
        '<p>El sitio tiene finalidades institucionales, informativas, empresariales, divulgativas, educativas y de cooperación. Puede incluir información sobre la Cámara, el MERCOSUR, acuerdos comerciales, datos económicos, mercados, eventos, publicaciones, oportunidades de cooperación e iniciativas de integración regional.</p>' +
        '<p>Los contenidos relacionados con el MERCOSUR se ofrecen desde una perspectiva institucional y empresarial. No constituyen decisiones, posiciones, comunicados o interpretaciones oficiales del bloque, ni sustituyen fuentes gubernamentales, regulatorias, estadísticas, jurídicas o contractuales.</p>' +
        '<p>La información publicada es general y no constituye asesoramiento jurídico, fiscal, contable, regulatorio, financiero, bancario, técnico, de inversión, de valores, de seguros o de cumplimiento normativo; tampoco constituye recomendación de compra o venta, oferta de valores, captación de fondos, concesión de crédito, garantía de financiación ni promesa de rentabilidad. La Cámara puede orientar institucionalmente, facilitar relaciones, identificar especialistas y coordinar interlocutores, pero estas actividades no sustituyen a profesionales autorizados ni garantizan financiación, inversión, aprobación regulatoria, cierre de operaciones o éxito empresarial.</p>' +
        '<h3>5. Exactitud y actualización de la información</h3>' +
        '<p>La Cámara procura utilizar fuentes fiables y mantener los contenidos actualizados. No obstante, la información puede verse afectada por cambios estadísticos, normativos, económicos, institucionales o comerciales; por modificaciones en acuerdos internacionales; por cambios en fechas, sedes o participantes de eventos; o por errores y omisiones involuntarios.</p>' +
        '<p>Por ello, no se garantiza de forma absoluta que todos los contenidos sean completos, exactos, actuales, libres de errores, aplicables a todas las jurisdicciones o permanentemente disponibles. La Cámara podrá corregir, actualizar, reorganizar, suspender o retirar contenidos sin obligación de aviso individual. Antes de adoptar decisiones empresariales, legales, financieras o de inversión, la persona usuaria debe verificar la información en fuentes oficiales y obtener, cuando corresponda, asesoramiento especializado.</p>' +
        '<h3>6. Uso permitido y conductas prohibidas</h3>' +
        '<p>El sitio puede utilizarse para fines lícitos, informativos, profesionales, institucionales, educativos, académicos y empresariales. Se permite la consulta, impresión y descarga razonable de contenidos para uso interno o informativo, siempre que no se altere su sentido, se respete la autoría, se cite la fuente cuando corresponda y no exista explotación comercial no autorizada ni se sugiera una relación institucional inexistente.</p>' +
        '<p>Queda prohibido utilizar el sitio para fines ilícitos, engañosos, abusivos o fraudulentos. No se permite suplantar a la Cámara o a sus representantes; presentarse falsamente como asociado, delegado, aliado o colaborador; introducir código malicioso; interferir con el funcionamiento del sitio; acceder sin autorización a áreas restringidas; realizar extracción masiva de información o bases de datos; recopilar contactos con fines comerciales no autorizados; enviar comunicaciones abusivas o engañosas; alterar contenidos; vulnerar derechos de terceros; captar fondos; promover inversiones no autorizadas; emitir certificados falsos; o sugerir respaldo oficial del MERCOSUR.</p>' +
        '<p>La Cámara podrá rechazar formularios, restringir accesos, suspender funcionalidades, eliminar contenido ilícito, preservar pruebas y adoptar las acciones legales correspondientes cuando exista incumplimiento, fraude, suplantación, abuso, riesgo de seguridad o afectación de derechos. Estas medidas se aplicarán de forma proporcional a la naturaleza del riesgo o incumplimiento.</p>' +
        '<h3>7. Solicitudes de asociación</h3>' +
        '<p>La cumplimentación o envío de una solicitud no produce la admisión automática como asociado, no confiere derechos de membresía, no otorga representación, no autoriza el uso del nombre o logotipo y no permite presentarse como integrante de la Cámara.</p>' +
        '<p>La admisión se rige por los Estatutos, las normas internas, los criterios de elegibilidad, las decisiones del órgano competente y la normativa uruguaya aplicable. Esta organización interna responde a la autonomía de las asociaciones civiles para ordenar su funcionamiento conforme a su objeto y a sus Estatutos.</p>' +
        '<p>La Cámara podrá admitir o rechazar una solicitud, pedir información adicional, suspender su evaluación o archivarla conforme a sus procedimientos internos. No se establecen plazos automáticos de resolución. La decisión podrá comunicarse en la forma prevista por dichos procedimientos, sin que exista obligación de emitir una motivación extensa, salvo disposición legal o estatutaria en contrario.</p>' +
        '<h3>8. Cooperación institucional y participación</h3>' +
        '<p>Las propuestas de cooperación, alianzas, eventos, estudios, programas, actividades o iniciativas conjuntas podrán ser evaluadas atendiendo a su compatibilidad institucional, legalidad, reputación, viabilidad, riesgos y capacidad operativa.</p>' +
        '<p>La recepción de una propuesta no obliga a aceptarla, negociarla o desarrollarla; no genera exclusividad; no crea una alianza; y no autoriza a utilizar el nombre, la marca o la condición de colaborador de la Cámara. Cualquier cooperación deberá formalizarse por escrito cuando su naturaleza lo requiera. La participación o aparición de una entidad en una actividad de la Cámara no implica que esta asuma responsabilidad por sus productos, servicios, declaraciones o actuaciones.</p>' +
        '<h3>9. Presentación de iniciativas empresariales</h3>' +
        '<p>Las iniciativas empresariales pueden remitirse para una evaluación preliminar. Su recepción no obliga a la Cámara a analizarlas, responderlas, financiarlas, representarlas, presentarlas a terceros o continuar conversaciones. Tampoco genera exclusividad, relación contractual, condición de asociado ni garantía de inversión o financiación.</p>' +
        '<p>La persona remitente garantiza que está autorizada para compartir la información, que esta es sustancialmente veraz, que cuenta con las autorizaciones necesarias y que el material no vulnera derechos de terceros, obligaciones de confidencialidad ni disposiciones legales.</p>' +
        '<p>La Cámara no adquiere la propiedad de una idea, iniciativa, proyecto o material por el solo hecho de recibirlo. Cualquier derecho, licencia, mandato, exclusividad o encargo deberá establecerse expresamente por escrito.</p>' +
        '<h3>10. Confidencialidad de la información remitida</h3>' +
        '<p>Los formularios generales y los correos de contacto no constituyen por sí mismos canales confidenciales. La información remitida mediante esos medios no será considerada confidencial automáticamente, aunque la Cámara procurará tratarla con prudencia y limitar su acceso a las personas que necesiten conocerla para atender la solicitud.</p>' +
        '<p>No deben enviarse mediante formularios abiertos secretos empresariales, contratos completos, estados financieros integrales, documentos de identidad, datos bancarios, información técnica reservada u otra documentación sensible. La confidencialidad reforzada requerirá un acuerdo escrito y un canal seguro previamente acordado.</p>' +
        '<p>La Cámara podrá rechazar, no abrir, devolver, archivar o eliminar documentación sensible remitida sin autorización previa. El tratamiento de datos personales se regirá por la Política de Privacidad.</p>' +
        '<h3>11. Propiedad intelectual, marca e identidad institucional</h3>' +
        '<p>Los textos, logotipos, nombres, marcas, diseños, fotografías, gráficos, perfiles, publicaciones, documentos, bases de datos, materiales audiovisuales, nombres de dominio y demás elementos del sitio pertenecen a la Cámara o a terceros que han autorizado su utilización. Su protección se rige, entre otras normas, por la Ley N.º 9.739 sobre derechos de autor y por la normativa aplicable en materia de propiedad intelectual e industrial.</p>' +
        '<p>El acceso al sitio no concede una licencia general sobre esos elementos. Pueden citarse fragmentos breves con atribución adecuada y enlace, dentro de los límites legales. Salvo autorización expresa, queda prohibida la reproducción sustancial, adaptación, traducción, distribución, modificación, comercialización, publicación en otros sitios, creación de obras derivadas o incorporación a productos, servicios o bases de datos.</p>' +
        '<p>El nombre, el logotipo y los demás signos identificativos de la Cámara no pueden utilizarse sin autorización escrita. Se prohíbe emitir certificados no autorizados, utilizar cargos institucionales falsos, crear perfiles o dominios que generen confusión, anunciar una membresía inexistente, presentar proyectos como respaldados por la Cámara o sugerir respaldo oficial del MERCOSUR. Estas reglas se complementarán con la Política de Uso de Marca.</p>' +
        '<h3>12. Contenidos remitidos por las personas usuarias</h3>' +
        '<p>La persona usuaria conserva los derechos que legítimamente le correspondan sobre los contenidos remitidos. Al enviarlos, concede a la Cámara una autorización limitada, no exclusiva y necesaria para recibirlos, almacenarlos, revisarlos, evaluarlos, gestionarlos y responder en relación con la finalidad solicitada.</p>' +
        '<p>Esta autorización permanecerá vigente únicamente durante el tiempo necesario para gestionar esa finalidad, sin perjuicio de la conservación exigida por la ley o necesaria para acreditar las actuaciones realizadas. No permite a la Cámara explotar comercialmente ideas, proyectos o materiales fuera de la finalidad para la que fueron remitidos. La persona usuaria responde de la legitimidad y exactitud sustancial del contenido enviado.</p>' +
        '<h3>13. Enlaces externos, terceros, noticias y eventos</h3>' +
        '<p>El sitio puede incluir enlaces a páginas externas por razones de utilidad, referencia o información, incluidos sitios oficiales del MERCOSUR, eventos, instituciones, cámaras, organizaciones y proveedores. La Cámara no controla ni garantiza el contenido, disponibilidad, seguridad, privacidad, legalidad o servicios de esos sitios.</p>' +
        '<p>La inclusión de un enlace no implica respaldo, asociación, certificación, recomendación, garantía o representación. Al abandonar el sitio de la Cámara, la persona usuaria queda sujeta a las condiciones y políticas del tercero correspondiente.</p>' +
        '<p>Las fechas, sedes, programas, participantes, horarios, condiciones y disponibilidad de eventos o actividades pueden modificarse. La publicación de un evento no garantiza inscripción, disponibilidad, participación ni asistencia de las personas anunciadas. Cada evento podrá estar sujeto a condiciones específicas y, cuando sea organizado por un tercero, también se aplicarán sus propias reglas.</p>' +
        '<h3>14. Disponibilidad, garantías y responsabilidad</h3>' +
        '<p>La Cámara procurará mantener el sitio accesible, funcional y razonablemente seguro, pero no garantiza un funcionamiento ininterrumpido, ausencia absoluta de errores, compatibilidad universal, disponibilidad permanente ni inexistencia total de amenazas. El acceso podrá suspenderse temporalmente por mantenimiento, actualización, seguridad, incidentes, cambios técnicos, decisiones operativas, fuerza mayor u otras circunstancias razonables.</p>' +
        '<p>Dentro de los límites permitidos por la ley, la Cámara no responderá por decisiones adoptadas exclusivamente con base en la información del sitio, pérdidas indirectas, pérdida de oportunidades, interrupciones, actos u omisiones de terceros, enlaces externos, información falsa remitida por usuarios, fracaso de negociaciones, falta de financiación, cambios regulatorios o de mercado, uso indebido del sitio o amenazas informáticas fuera de controles razonables.</p>' +
        '<p>La Cámara tampoco garantiza que una consulta genere respuesta, que una iniciativa sea aceptada, que una relación llegue a formalizarse o que una operación produzca un resultado determinado. Ninguna disposición excluye o limita responsabilidad por dolo, culpa grave, incumplimientos inderogables o derechos que no puedan renunciarse. Se preservan las normas imperativas del derecho uruguayo y, cuando corresponda, la Ley N.º 17.250 de Relaciones de Consumo y sus disposiciones reglamentarias.</p>' +
        '<h3>15. Privacidad y cookies</h3>' +
        '<p>El tratamiento de datos personales se regula por la Política de Privacidad de la Cámara. El uso de cookies y tecnologías similares se regirá por la Política de Cookies y por el panel de preferencias disponible en el sitio.</p>' +
        '<p>La aceptación de estos Términos no equivale a consentimiento para recibir comunicaciones promocionales ni para utilizar cookies no necesarias. Esos consentimientos, cuando correspondan, se solicitarán de forma separada y podrán retirarse conforme a la normativa aplicable.</p>' +
        '<h3>16. Modificación de los Términos y del sitio</h3>' +
        '<p>La Cámara podrá actualizar estos Términos para reflejar cambios normativos, tecnológicos, organizativos o funcionales. La versión vigente indicará su número y fecha de publicación y será aplicable desde su publicación, sin afectar retroactivamente derechos consolidados ni normas imperativas.</p>' +
        '<p>Cuando los cambios sean relevantes, la Cámara podrá informarlos mediante avisos en el sitio u otros medios razonables. La continuidad en el uso del sitio después de la entrada en vigor de una nueva versión implicará su aceptación en la medida permitida por la ley.</p>' +
        '<h3>17. Legislación aplicable, jurisdicción e idiomas</h3>' +
        '<p>Estos Términos se regirán por las leyes de la República Oriental del Uruguay. Antes de iniciar una controversia judicial, las partes procurarán resolver de buena fe cualquier diferencia mediante comunicación directa. Si no fuera posible alcanzar una solución, serán competentes los tribunales de Montevideo, sin perjuicio de las normas imperativas de jurisdicción, competencia o protección que resulten aplicables.</p>' +
        '<p>Los Términos podrán publicarse en español, inglés y portugués. La versión española será la versión jurídica de referencia y las traducciones tendrán finalidad informativa. En caso de discrepancia, prevalecerá la versión española, salvo norma imperativa en contrario.</p>' +
        '<h3>18. Divisibilidad, no renuncia e integración</h3>' +
        '<p>Si una disposición fuera declarada inválida, ilegal o inaplicable, las restantes conservarán su vigencia. La disposición afectada se interpretará o sustituirá, en la medida permitida, de la forma más cercana a su finalidad legítima.</p>' +
        '<p>La falta de ejercicio de un derecho por parte de la Cámara no implica renuncia. Estos Términos se integran con la Política de Privacidad, la Política de Cookies, la Política de Uso de Marca, el Canal de Integridad y las condiciones particulares aplicables a actividades específicas.</p>' +
        '<h3>19. Contacto</h3>' +
        '<p>Para consultas relacionadas con estos Términos de Uso puede escribirse a <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Cámara de Comercio Mercosur. Asociación internacional uruguaya. Calle Carlos Quijano 1290, Oficina 101, 11.100 Montevideo, Uruguay.</p>',
      en:
        '<p class="privacy-eyebrow">Mercosur Chamber of Commerce</p>' +
        '<h2 id="terms-modal-title">Terms of Use</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Publication date: July 5, 2026</p>' +
        '<p>These Terms of Use explain how the access, browsing, and use of the Mercosur Chamber of Commerce website work, as well as the use of its forms, content, and other features. The goal is to make clear the relationship between the Chamber and the people, companies, chambers, institutions, and other organizations that visit the site or contact it through its digital channels.</p>' +
        '<h3>1. Identification and legal nature</h3>' +
        '<p>The owner of the site is the Mercosur Chamber of Commerce, a Uruguayan international association based at Carlos Quijano 1290, Office 101, Montevideo 11.100, Uruguay. For questions about these Terms, please write to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>The Chamber operates under the laws that apply to civil associations in Uruguay. This includes, among other rules: Article 39 of the Uruguayan Constitution, which guarantees the right of association; Article 21 of the Civil Code, on the recognition of associations as legal entities; Decree-Law No. 15.089, on the powers of the Ministry of Education and Culture regarding civil associations and foundations; the related regulations; and the Chamber\'s own Bylaws, which govern its structure, representation, admission of members, rights, duties, and internal operations.</p>' +
        '<h3>2. Purpose, scope, and acceptance</h3>' +
        '<p>These Terms apply to accessing and browsing the site, viewing its content, using its forms, submitting membership requests, proposing cooperation, presenting business projects, asking about trade, investment, financing, and internationalization, subscribing to institutional communications, and accessing news, events, publications, and external links.</p>' +
        '<p>By accessing or using the site, you accept these Terms, to the extent allowed by law. Anyone acting on behalf of a company, institution, or organization declares having enough authority to represent it. Simply accessing the site does not, by itself, create a contractual, membership, professional, trust-based, or representative relationship with the Chamber.</p>' +
        '<p>Certain activities, events, programs, memberships, agreements, or specific relationships may have their own conditions. If there is a conflict, those specific conditions will apply only to that particular activity.</p>' +
        '<h3>3. Relationship with MERCOSUR</h3>' +
        '<p>The Chamber works within the economic, business, social, and institutional space of MERCOSUR. Its name, purpose, and mission are tied to that region and to its goal of supporting trade, investment, business cooperation, and integration among the Member States, Associated States, and other international markets.</p>' +
        '<p>This connection does not mean that the Chamber is part of MERCOSUR\'s political, governmental, or official structure. The Chamber does not belong to MERCOSUR\'s political, decision-making, or administrative bodies; it does not make decisions on behalf of the bloc; it does not officially represent MERCOSUR, its Member States, its Associated States, or its institutions; and it cannot issue official positions, certifications, or authorizations in its name. The Chamber\'s website is not an official MERCOSUR site.</p>' +
        '<p>The Chamber may take part in social, business, advisory, or institutional mechanisms connected to the regional integration process. Any registration, recognition, or institutional participation will have only the scope given by the corresponding act. A possible registration in MERCOSUR\'s Registry of Social Organizations and Movements (MOS) would not turn the Chamber into a political or official body of the bloc, nor would it give the Chamber general power to represent it.</p>' +
        '<h3>4. Purpose of the site and no professional advice</h3>' +
        '<p>The site has institutional, informational, business, educational, and cooperation purposes. It may include information about the Chamber, MERCOSUR, trade agreements, economic data, markets, events, publications, cooperation opportunities, and regional integration projects.</p>' +
        '<p>Content related to MERCOSUR is presented from an institutional and business point of view. It does not represent official decisions, positions, statements, or interpretations of the bloc, and it does not replace government, regulatory, statistical, legal, or contractual sources.</p>' +
        '<p>The information published is general and does not constitute legal, tax, accounting, regulatory, financial, banking, technical, investment, securities, insurance, or compliance advice. It also does not represent a recommendation to buy or sell, an offer of securities, fundraising, granting of credit, a financing guarantee, or a promise of profit. The Chamber may provide institutional guidance, facilitate contacts, identify specialists, and coordinate meetings, but these activities do not replace licensed professionals and do not guarantee financing, investment, regulatory approval, deal closing, or business success.</p>' +
        '<h3>5. Accuracy and updating of information</h3>' +
        '<p>The Chamber tries to use reliable sources and keep its content up to date. However, the information may be affected by statistical, regulatory, economic, institutional, or commercial changes; changes to international agreements; changes to event dates, venues, or participants; or unintentional errors and omissions.</p>' +
        '<p>Because of this, there is no absolute guarantee that all content is complete, accurate, current, error-free, applicable to every jurisdiction, or always available. The Chamber may correct, update, reorganize, suspend, or remove content without having to notify each person individually. Before making business, legal, financial, or investment decisions, please verify the information with official sources and, when needed, seek expert advice.</p>' +
        '<h3>6. Permitted use and prohibited conduct</h3>' +
        '<p>The site may be used for lawful, informational, professional, institutional, educational, academic, and business purposes. Reasonable viewing, printing, and downloading of content is allowed for personal or informational use, as long as its meaning is not changed, authorship is respected, the source is cited when appropriate, and there is no unauthorized commercial use or suggestion of an institutional relationship that does not exist.</p>' +
        '<p>It is prohibited to use the site for unlawful, deceptive, abusive, or fraudulent purposes. It is not allowed to: impersonate the Chamber or its representatives; falsely present oneself as a member, delegate, partner, or collaborator; introduce malicious code; interfere with the site\'s operation; access restricted areas without authorization; carry out large-scale extraction of data or databases; collect contacts for unauthorized commercial purposes; send abusive or deceptive messages; alter content; violate the rights of others; raise funds; promote unauthorized investments; issue false certificates; or suggest official MERCOSUR support.</p>' +
        '<p>The Chamber may reject forms, restrict access, suspend features, remove unlawful content, preserve evidence, and take the corresponding legal action when there is a breach, fraud, impersonation, abuse, security risk, or violation of rights. These measures will be proportional to the nature of the risk or breach.</p>' +
        '<h3>7. Membership requests</h3>' +
        '<p>Filling out or sending a request does not automatically make someone a member, does not grant membership rights, does not grant representation, does not authorize the use of the Chamber\'s name or logo, and does not allow someone to present themselves as part of the Chamber.</p>' +
        '<p>Admission follows the Bylaws, internal rules, eligibility criteria, decisions of the responsible body, and applicable Uruguayan law. This internal organization reflects the freedom civil associations have to organize their operations according to their purpose and Bylaws.</p>' +
        '<p>The Chamber may accept or reject a request, ask for more information, suspend its review, or file it according to its internal procedures. There are no automatic deadlines for a decision. The decision may be communicated as set out in those procedures, without any obligation to provide a detailed explanation, unless the law or the Bylaws require otherwise.</p>' +
        '<h3>8. Institutional cooperation and participation</h3>' +
        '<p>Proposals for cooperation, partnerships, events, studies, programs, activities, or joint projects may be evaluated based on their institutional compatibility, legality, reputation, feasibility, risks, and operational capacity.</p>' +
        '<p>Receiving a proposal does not obligate the Chamber to accept it, negotiate it, or carry it out; it does not create exclusivity; it does not create a partnership; and it does not authorize the use of the Chamber\'s name, brand, or collaborator status. Any cooperation must be formalized in writing when its nature requires it. The participation or presence of an entity in a Chamber activity does not mean the Chamber is responsible for that entity\'s products, services, statements, or actions.</p>' +
        '<h3>9. Presentation of business projects</h3>' +
        '<p>Business projects may be submitted for an initial review. Receiving them does not obligate the Chamber to analyze them, respond, finance them, represent them, present them to third parties, or continue discussions. It also does not create exclusivity, a contractual relationship, member status, or a guarantee of investment or financing.</p>' +
        '<p>The person submitting the project guarantees that they are authorized to share the information, that it is substantially true, that they hold the necessary authorizations, and that the material does not violate the rights of others, confidentiality obligations, or the law.</p>' +
        '<p>The Chamber does not become the owner of an idea, project, or material simply by receiving it. Any right, license, mandate, exclusivity, or assignment must be expressly agreed to in writing.</p>' +
        '<h3>10. Confidentiality of submitted information</h3>' +
        '<p>General forms and contact emails are not, by themselves, confidential channels. Information sent through these means will not be automatically considered confidential, although the Chamber will try to handle it carefully and limit access to those who need it to respond to the request.</p>' +
        '<p>Do not send through open forms: trade secrets, full contracts, complete financial statements, identity documents, banking information, confidential technical information, or other sensitive documents. Stronger confidentiality requires a written agreement and a secure channel agreed upon in advance.</p>' +
        '<p>The Chamber may reject, not open, return, file, or delete sensitive documents sent without prior authorization. The handling of personal data is governed by the Privacy Policy.</p>' +
        '<h3>11. Intellectual property, brand, and institutional identity</h3>' +
        '<p>The texts, logos, names, brands, designs, photographs, graphics, profiles, publications, documents, databases, audiovisual materials, domain names, and other elements of the site belong to the Chamber or to third parties who have authorized their use. Their protection is governed, among other laws, by Law No. 9.739 on copyright and by applicable intellectual and industrial property regulations.</p>' +
        '<p>Access to the site does not grant a general license over these elements. Short excerpts may be quoted with proper attribution and a link, within legal limits. Without express authorization, it is prohibited to substantially reproduce, adapt, translate, distribute, modify, sell, publish on other sites, create derivative works, or include the content in products, services, or databases.</p>' +
        '<p>The Chamber\'s name, logo, and other identifying signs may not be used without written authorization. It is prohibited to issue unauthorized certificates, use false institutional titles, create profiles or domains that cause confusion, announce a membership that does not exist, present projects as backed by the Chamber, or suggest official MERCOSUR support. These rules are complemented by the Brand Use Policy.</p>' +
        '<h3>12. Content submitted by users</h3>' +
        '<p>Users keep the rights they legitimately hold over the content they submit. By sending it, they grant the Chamber a limited, non-exclusive authorization needed to receive, store, review, evaluate, manage, and respond to the requested purpose.</p>' +
        '<p>This authorization lasts only as long as needed to handle that purpose, without affecting any retention required by law or needed to prove the actions taken. It does not allow the Chamber to commercially use ideas, projects, or materials outside the purpose for which they were submitted. Users are responsible for the legitimacy and accuracy of the content they submit.</p>' +
        '<h3>13. External links, third parties, news, and events</h3>' +
        '<p>The site may include links to external pages for reasons of usefulness, reference, or information, including official MERCOSUR sites, events, institutions, chambers, organizations, and providers. The Chamber does not control or guarantee the content, availability, security, privacy, legality, or services of those sites.</p>' +
        '<p>Including a link does not mean endorsement, association, certification, recommendation, guarantee, or representation. When leaving the Chamber\'s site, users become subject to the terms and policies of the relevant third party.</p>' +
        '<p>Dates, venues, schedules, participants, times, conditions, and availability of events or activities may change. Publishing an event does not guarantee registration, availability, participation, or attendance by the people announced. Each event may have its own specific conditions and, when organized by a third party, will also follow that party\'s rules.</p>' +
        '<h3>14. Availability, warranties, and liability</h3>' +
        '<p>The Chamber will try to keep the site accessible, functional, and reasonably secure, but it does not guarantee uninterrupted operation, a total absence of errors, universal compatibility, permanent availability, or a complete absence of threats. Access may be temporarily suspended for maintenance, updates, security, incidents, technical changes, operational decisions, force majeure, or other reasonable circumstances.</p>' +
        '<p>Within the limits allowed by law, the Chamber will not be liable for decisions made based solely on information from the site, indirect losses, lost opportunities, interruptions, acts or omissions of third parties, external links, false information submitted by users, failed negotiations, lack of financing, regulatory or market changes, misuse of the site, or cyber threats beyond reasonable control.</p>' +
        '<p>The Chamber also does not guarantee that an inquiry will receive a response, that a project will be accepted, that a relationship will become formal, or that an operation will produce a specific result. Nothing in these Terms excludes or limits liability for willful misconduct, gross negligence, obligations that cannot be waived by contract, or rights that cannot be renounced. Uruguay\'s mandatory laws remain in force, along with, when applicable, Law No. 17.250 on Consumer Relations and its related regulations.</p>' +
        '<h3>15. Privacy and cookies</h3>' +
        '<p>The handling of personal data is governed by the Chamber\'s Privacy Policy. The use of cookies and similar technologies is governed by the Cookie Policy and by the preferences panel available on the site.</p>' +
        '<p>Accepting these Terms does not mean agreeing to receive promotional communications or to accept non-necessary cookies. Those consents, when required, will be requested separately and may be withdrawn according to applicable law.</p>' +
        '<h3>16. Changes to the Terms and the site</h3>' +
        '<p>The Chamber may update these Terms to reflect legal, technological, organizational, or operational changes. The current version will show its number and publication date and will apply from the moment it is published, without affecting already established rights or mandatory laws.</p>' +
        '<p>When changes are significant, the Chamber may announce them through notices on the site or other reasonable means. Continuing to use the site after a new version takes effect means accepting it, to the extent allowed by law.</p>' +
        '<h3>17. Applicable law, jurisdiction, and languages</h3>' +
        '<p>These Terms are governed by the laws of the Oriental Republic of Uruguay. Before starting a legal dispute, the parties will try to resolve any disagreement in good faith through direct communication. If a solution cannot be reached, the courts of Montevideo will have jurisdiction, without affecting any mandatory rules on jurisdiction, competence, or protection that may apply.</p>' +
        '<p>These Terms may be published in Spanish, English, and Portuguese. The Spanish version is the official legal reference, and the translations are for informational purposes only. In case of any difference between versions, the Spanish version will prevail, unless mandatory law requires otherwise.</p>' +
        '<h3>18. Severability, no waiver, and integration</h3>' +
        '<p>If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions will stay in effect. The affected provision will be interpreted or replaced, as much as possible, in a way that stays closest to its original purpose.</p>' +
        '<p>If the Chamber does not exercise a right, this does not mean it gives up that right. These Terms form a single set together with the Privacy Policy, the Cookie Policy, the Brand Use Policy, the Integrity Channel, and the specific conditions that apply to particular activities.</p>' +
        '<h3>19. Contact</h3>' +
        '<p>For questions about these Terms of Use, please write to <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Mercosur Chamber of Commerce. Uruguayan international association.</p>' +
        '<p>Carlos Quijano 1290, Office 101, Montevideo 11.100, Uruguay.</p>',
      pt:
        '<p class="privacy-eyebrow">Câmara de Comércio Mercosul</p>' +
        '<h2 id="terms-modal-title">Termos de Uso</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Data de publicação: 5 de julho de 2026</p>' +
        '<p>Estes Termos de Uso explicam como funciona o acesso, a navegação e o uso do site da Câmara de Comércio Mercosul, além do uso dos formulários, conteúdos e outras funções do site. O objetivo é deixar claro como é a relação entre a Câmara e as pessoas, empresas, câmaras, instituições e outras organizações que visitam o site ou entram em contato pelos canais digitais.</p>' +
        '<h3>1. Identificação e natureza jurídica</h3>' +
        '<p>A responsável pelo site é a Câmara de Comércio Mercosul, uma associação internacional uruguaia com sede na Rua Carlos Quijano 1290, Sala 101, 11.100 Montevidéu, Uruguai. Para dúvidas sobre estes Termos, escreva para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>A Câmara trabalha seguindo as leis que valem para associações civis no Uruguai. Isso inclui, entre outras regras: o artigo 39 da Constituição uruguaia, que garante o direito de associação; o artigo 21 do Código Civil, sobre o reconhecimento das associações como pessoas jurídicas; o Decreto-Lei nº 15.089, sobre as funções do Ministério da Educação e Cultura em relação a associações civis e fundações; as normas complementares; e o Estatuto da própria Câmara, que organiza sua estrutura, representação, admissão de associados, direitos, deveres e funcionamento interno.</p>' +
        '<h3>2. Objetivo, alcance e aceitação</h3>' +
        '<p>Estes Termos valem para o acesso e a navegação no site, a consulta dos conteúdos, o uso dos formulários, os pedidos de associação, as propostas de cooperação, a apresentação de projetos de negócio, as perguntas sobre comércio, investimento, financiamento e internacionalização, a inscrição em comunicados institucionais e o acesso a notícias, eventos, publicações e links externos.</p>' +
        '<p>Ao acessar ou usar o site, você aceita estes Termos, dentro do que a lei permite. Quem agir em nome de uma empresa, instituição ou organização declara ter poder suficiente para representá-la. O simples acesso ao site não cria, por si só, uma relação contratual, associativa, profissional, de confiança ou de representação com a Câmara.</p>' +
        '<p>Algumas atividades, eventos, programas, associações, acordos ou relações específicas podem ter condições próprias. Se houver conflito, essas condições específicas valem apenas para aquela atividade em particular.</p>' +
        '<h3>3. Relação com o MERCOSUL</h3>' +
        '<p>A Câmara atua no espaço econômico, empresarial, social e institucional do MERCOSUL. Seu nome, objetivo e missão estão ligados a essa região e ao propósito de apoiar o comércio, o investimento, a cooperação empresarial e a integração entre os Estados Partes, os Estados Associados e outros mercados internacionais.</p>' +
        '<p>Essa ligação não quer dizer que a Câmara faça parte da estrutura política, governamental ou oficial do MERCOSUL. A Câmara não integra os órgãos políticos, de decisão ou administrativos do bloco; não toma decisões em nome do MERCOSUL; não representa oficialmente o MERCOSUL, seus Estados Partes, Estados Associados ou instituições; e não pode dar posições, certificados ou autorizações oficiais em nome dele. O site da Câmara não é um site oficial do MERCOSUL.</p>' +
        '<p>A Câmara pode participar de mecanismos sociais, empresariais, consultivos ou institucionais ligados ao processo de integração regional. Qualquer inscrição, reconhecimento ou participação institucional terá apenas o alcance definido pelo ato correspondente. Uma eventual inscrição no Registro de Organizações e Movimentos Sociais do MERCOSUL (MOS) não transformaria a Câmara em órgão político ou oficial do bloco, nem lhe daria poder geral para representá-lo.</p>' +
        '<h3>4. Finalidade do site e ausência de consultoria profissional</h3>' +
        '<p>O site tem finalidades institucionais, informativas, empresariais, educativas e de cooperação. Pode ter informações sobre a Câmara, o MERCOSUL, acordos comerciais, dados econômicos, mercados, eventos, publicações, oportunidades de cooperação e projetos de integração regional.</p>' +
        '<p>Os conteúdos sobre o MERCOSUL são apresentados de um ponto de vista institucional e empresarial. Eles não são decisões, posições, comunicados ou interpretações oficiais do bloco, e não substituem fontes governamentais, regulatórias, estatísticas, jurídicas ou contratuais.</p>' +
        '<p>As informações publicadas são gerais e não são consultoria jurídica, fiscal, contábil, regulatória, financeira, bancária, técnica, de investimento, de valores mobiliários, de seguros ou de conformidade normativa. Elas também não são recomendação de compra ou venda, oferta de valores, captação de recursos, concessão de crédito, garantia de financiamento ou promessa de lucro. A Câmara pode orientar institucionalmente, facilitar contatos, indicar especialistas e organizar reuniões, mas isso não substitui profissionais autorizados nem garante financiamento, investimento, aprovação regulatória, fechamento de negócios ou sucesso empresarial.</p>' +
        '<h3>5. Exatidão e atualização das informações</h3>' +
        '<p>A Câmara tenta usar fontes confiáveis e manter os conteúdos atualizados. Porém, as informações podem mudar por causa de alterações estatísticas, normativas, econômicas, institucionais ou comerciais; mudanças em acordos internacionais; alterações em datas, locais ou participantes de eventos; ou erros e omissões sem intenção.</p>' +
        '<p>Por isso, não há garantia absoluta de que todos os conteúdos estejam completos, exatos, atualizados, sem erros, válidos para todas as jurisdições ou sempre disponíveis. A Câmara pode corrigir, atualizar, reorganizar, suspender ou retirar conteúdos sem precisar avisar cada pessoa. Antes de tomar decisões empresariais, legais, financeiras ou de investimento, verifique as informações em fontes oficiais e busque, quando necessário, orientação especializada.</p>' +
        '<h3>6. Uso permitido e condutas proibidas</h3>' +
        '<p>O site pode ser usado para fins legais, informativos, profissionais, institucionais, educativos, acadêmicos e empresariais. É permitido consultar, imprimir e baixar conteúdos, de forma razoável, para uso pessoal ou informativo, desde que não se mude o sentido do conteúdo, se respeite a autoria, se cite a fonte quando necessário, e não haja uso comercial não autorizado nem sugestão de uma relação institucional que não existe.</p>' +
        '<p>É proibido usar o site para fins ilegais, enganosos, abusivos ou fraudulentos. Não é permitido: fingir ser a Câmara ou seus representantes; se apresentar falsamente como associado, delegado, parceiro ou colaborador; inserir código malicioso; atrapalhar o funcionamento do site; entrar sem autorização em áreas restritas; extrair grande quantidade de dados ou bancos de dados; coletar contatos para fins comerciais não autorizados; enviar mensagens abusivas ou enganosas; alterar conteúdos; violar direitos de terceiros; captar recursos; promover investimentos não autorizados; emitir certificados falsos; ou sugerir apoio oficial do MERCOSUL.</p>' +
        '<p>A Câmara pode recusar formulários, restringir acessos, suspender funções, remover conteúdo ilegal, guardar provas e tomar as medidas legais necessárias quando houver descumprimento, fraude, falsa identidade, abuso, risco de segurança ou violação de direitos. Essas medidas serão proporcionais ao risco ou descumprimento.</p>' +
        '<h3>7. Pedidos de associação</h3>' +
        '<p>Preencher ou enviar um pedido não significa admissão automática como associado, não dá direitos de membro, não autoriza representação, não permite usar o nome ou o logotipo da Câmara e não permite se apresentar como parte da Câmara.</p>' +
        '<p>A admissão segue o Estatuto, as regras internas, os critérios de elegibilidade, as decisões do órgão responsável e a lei uruguaia aplicável. Essa organização interna reflete a liberdade das associações civis para organizar seu funcionamento conforme seu objetivo e seu Estatuto.</p>' +
        '<p>A Câmara pode aceitar ou recusar um pedido, pedir mais informações, suspender a análise ou arquivá-lo, seguindo seus procedimentos internos. Não existem prazos automáticos para decisão. A resposta pode ser comunicada da forma prevista nesses procedimentos, sem obrigação de dar uma explicação detalhada, a não ser que a lei ou o Estatuto exija o contrário.</p>' +
        '<h3>8. Cooperação institucional e participação</h3>' +
        '<p>Propostas de cooperação, parcerias, eventos, estudos, programas, atividades ou projetos conjuntos podem ser avaliadas conforme sua compatibilidade institucional, legalidade, reputação, viabilidade, riscos e capacidade operacional.</p>' +
        '<p>Receber uma proposta não obriga a Câmara a aceitá-la, negociá-la ou executá-la; não gera exclusividade; não cria uma parceria; e não autoriza o uso do nome, da marca ou do status de colaborador da Câmara. Qualquer cooperação deve ser formalizada por escrito quando necessário. A participação ou presença de uma entidade em uma atividade da Câmara não significa que a Câmara seja responsável por seus produtos, serviços, declarações ou ações.</p>' +
        '<h3>9. Apresentação de projetos empresariais</h3>' +
        '<p>Projetos empresariais podem ser enviados para uma avaliação inicial. O recebimento não obriga a Câmara a analisá-los, responder, financiá-los, representá-los, apresentá-los a terceiros ou continuar as conversas. Também não gera exclusividade, relação contratual, status de associado nem garantia de investimento ou financiamento.</p>' +
        '<p>Quem envia o projeto garante que tem autorização para compartilhar a informação, que ela é verdadeira, que possui as autorizações necessárias e que o material não viola direitos de terceiros, obrigações de confidencialidade ou leis.</p>' +
        '<p>A Câmara não se torna dona de uma ideia, projeto ou material apenas por recebê-lo. Qualquer direito, licença, autorização, exclusividade ou encargo deve ser combinado expressamente por escrito.</p>' +
        '<h3>10. Confidencialidade das informações enviadas</h3>' +
        '<p>Os formulários gerais e os e-mails de contato não são, por si só, canais confidenciais. As informações enviadas por esses meios não serão consideradas confidenciais automaticamente, mesmo que a Câmara tente tratá-las com cuidado e limitar o acesso apenas às pessoas que precisam conhecê-las para atender ao pedido.</p>' +
        '<p>Não envie por formulários abertos: segredos empresariais, contratos completos, demonstrações financeiras completas, documentos de identidade, dados bancários, informações técnicas confidenciais ou outros documentos sensíveis. Uma confidencialidade mais forte precisa de um acordo escrito e de um canal seguro combinado antes.</p>' +
        '<p>A Câmara pode recusar, não abrir, devolver, arquivar ou apagar documentos sensíveis enviados sem autorização prévia. O tratamento de dados pessoais segue a Política de Privacidade.</p>' +
        '<h3>11. Propriedade intelectual, marca e identidade institucional</h3>' +
        '<p>Os textos, logotipos, nomes, marcas, desenhos, fotos, gráficos, perfis, publicações, documentos, bancos de dados, materiais audiovisuais, domínios e outros elementos do site pertencem à Câmara ou a terceiros que autorizaram seu uso. A proteção segue, entre outras leis, a Lei nº 9.739 sobre direitos autorais e as normas de propriedade intelectual e industrial aplicáveis.</p>' +
        '<p>O acesso ao site não dá uma licença geral sobre esses elementos. É permitido citar trechos curtos, com atribuição correta e link, dentro dos limites legais. Sem autorização expressa, é proibido reproduzir grande parte do conteúdo, adaptar, traduzir, distribuir, modificar, comercializar, publicar em outros sites, criar obras derivadas ou incluir o conteúdo em produtos, serviços ou bancos de dados.</p>' +
        '<p>O nome, o logotipo e outros sinais de identificação da Câmara não podem ser usados sem autorização escrita. É proibido emitir certificados não autorizados, usar cargos institucionais falsos, criar perfis ou domínios que causem confusão, anunciar uma associação inexistente, apresentar projetos como apoiados pela Câmara, ou sugerir apoio oficial do MERCOSUL. Essas regras se completam com a Política de Uso de Marca.</p>' +
        '<h3>12. Conteúdos enviados pelas pessoas usuárias</h3>' +
        '<p>A pessoa usuária mantém os direitos que legitimamente tem sobre os conteúdos enviados. Ao enviá-los, ela dá à Câmara uma autorização limitada e não exclusiva, necessária para receber, guardar, revisar, avaliar, gerenciar e responder de acordo com a finalidade solicitada.</p>' +
        '<p>Essa autorização dura apenas o tempo necessário para atender a essa finalidade, sem prejuízo da guarda exigida por lei ou necessária para comprovar as ações realizadas. Ela não permite que a Câmara use comercialmente ideias, projetos ou materiais fora da finalidade para a qual foram enviados. A pessoa usuária é responsável pela legitimidade e veracidade do conteúdo enviado.</p>' +
        '<h3>13. Links externos, terceiros, notícias e eventos</h3>' +
        '<p>O site pode ter links para páginas externas, por utilidade, referência ou informação, incluindo sites oficiais do MERCOSUL, eventos, instituições, câmaras, organizações e fornecedores. A Câmara não controla nem garante o conteúdo, a disponibilidade, a segurança, a privacidade, a legalidade ou os serviços desses sites.</p>' +
        '<p>Incluir um link não significa apoio, associação, certificação, recomendação, garantia ou representação. Ao sair do site da Câmara, a pessoa usuária passa a seguir as condições e políticas do terceiro correspondente.</p>' +
        '<p>As datas, locais, programações, participantes, horários, condições e disponibilidade de eventos ou atividades podem mudar. Publicar um evento não garante inscrição, disponibilidade, participação ou presença das pessoas anunciadas. Cada evento pode ter condições próprias e, quando organizado por terceiros, também seguirá as regras deles.</p>' +
        '<h3>14. Disponibilidade, garantias e responsabilidade</h3>' +
        '<p>A Câmara vai tentar manter o site acessível, funcional e razoavelmente seguro, mas não garante funcionamento sem interrupções, ausência total de erros, compatibilidade com todos os sistemas, disponibilidade permanente ou ausência total de ameaças. O acesso pode ser suspenso temporariamente por manutenção, atualização, segurança, incidentes, mudanças técnicas, decisões operacionais, força maior ou outras razões justificadas.</p>' +
        '<p>Dentro dos limites permitidos por lei, a Câmara não será responsável por decisões tomadas apenas com base nas informações do site, perdas indiretas, perda de oportunidades, interrupções, ações ou omissões de terceiros, links externos, informações falsas enviadas por usuários, negociações que não deram certo, falta de financiamento, mudanças regulatórias ou de mercado, uso indevido do site ou ameaças informáticas fora de controles razoáveis.</p>' +
        '<p>A Câmara também não garante que uma pergunta terá resposta, que um projeto será aceito, que uma relação vai se formalizar ou que uma operação terá um resultado específico. Nenhuma parte destes Termos exclui ou limita a responsabilidade por dolo, culpa grave, descumprimentos que não podem ser afastados por contrato, ou direitos que não podem ser renunciados. As normas obrigatórias do direito uruguaio continuam valendo e, quando aplicável, a Lei nº 17.250 de Relações de Consumo e suas normas complementares.</p>' +
        '<h3>15. Privacidade e cookies</h3>' +
        '<p>O tratamento de dados pessoais segue a Política de Privacidade da Câmara. O uso de cookies e tecnologias parecidas segue a Política de Cookies e o painel de preferências disponível no site.</p>' +
        '<p>Aceitar estes Termos não significa aceitar receber comunicações promocionais nem usar cookies não necessários. Esses consentimentos, quando exigidos, serão pedidos separadamente e podem ser retirados conforme a lei aplicável.</p>' +
        '<h3>16. Alteração dos Termos e do site</h3>' +
        '<p>A Câmara pode atualizar estes Termos para refletir mudanças legais, tecnológicas, organizacionais ou de funcionamento. A versão em vigor mostrará seu número e data de publicação, e valerá a partir da publicação, sem afetar retroativamente direitos já garantidos nem normas obrigatórias.</p>' +
        '<p>Quando as mudanças forem importantes, a Câmara pode avisar por meio de avisos no site ou outros meios razoáveis. Continuar usando o site depois que uma nova versão entrar em vigor significa aceitação dela, dentro do que a lei permite.</p>' +
        '<h3>17. Lei aplicável, jurisdição e idiomas</h3>' +
        '<p>Estes Termos seguem as leis da República Oriental do Uruguai. Antes de iniciar uma disputa judicial, as partes vão tentar resolver de boa fé qualquer diferença por meio de comunicação direta. Se não for possível chegar a uma solução, serão competentes os tribunais de Montevidéu, respeitando as normas obrigatórias de jurisdição, competência ou proteção que se apliquem.</p>' +
        '<p>Estes Termos podem ser publicados em espanhol, inglês e português. A versão em espanhol é a versão jurídica de referência, e as traduções têm finalidade apenas informativa. Em caso de diferença entre as versões, vale a versão em espanhol, salvo se a lei exigir o contrário.</p>' +
        '<h3>18. Divisibilidade, não renúncia e integração</h3>' +
        '<p>Se alguma disposição destes Termos for considerada inválida, ilegal ou inaplicável, as demais continuam valendo. A disposição afetada será interpretada ou substituída, dentro do possível, da forma mais próxima à sua finalidade original.</p>' +
        '<p>O fato de a Câmara não usar um direito não significa que ela renuncia a ele. Estes Termos formam um conjunto único com a Política de Privacidade, a Política de Cookies, a Política de Uso de Marca, o Canal de Integridade e as condições específicas de cada atividade.</p>' +
        '<h3>19. Contato</h3>' +
        '<p>Para dúvidas sobre estes Termos de Uso, escreva para <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>Câmara de Comércio Mercosul. Associação internacional uruguaia. Rua Carlos Quijano 1290, Sala 101, 11.100 Montevidéu, Uruguai.</p>',
      fr:
        '<p class="privacy-eyebrow">Chambre de Commerce du Mercosur</p>' +
        '<h2 id="terms-modal-title">Conditions d\'Utilisation</h2>' +
        '<p style="font-size:.8rem;color:var(--ink-soft);margin-top:-8px;">Date de publication : 5 juillet 2026</p>' +
        '<p>Ces Conditions d\'Utilisation régissent l\'accès au site web de la Chambre de Commerce du Mercosur, sa navigation et son utilisation, ainsi que l\'utilisation de ses formulaires, contenus, ressources et fonctionnalités. Elles ont pour objet d\'établir un cadre clair pour les relations entre la Chambre et les personnes physiques, entreprises, chambres de commerce, institutions et autres organisations qui consultent le site ou communiquent avec elle par le biais de ses canaux numériques.</p>' +
        '<h3>1. Identification et nature juridique</h3>' +
        '<p>Le propriétaire du site web est la Chambre de Commerce du Mercosur, une association internationale uruguayenne située Calle Carlos Quijano 1290, bureau 101, 11.100 Montevideo, Uruguay. Pour toute question relative aux présentes Conditions d\'Utilisation, veuillez écrire à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p>La Chambre opère dans le cadre juridique applicable aux associations civiles en République Orientale de l\'Uruguay. Ce cadre comprend notamment l\'article 39 de la Constitution de la République, qui reconnaît le droit d\'association ; l\'article 21 du Code Civil, relatif à la reconnaissance des associations comme personnes morales ; le Décret-Loi n° 15.089, relatif aux compétences administratives du Ministère de l\'Éducation et de la Culture en matière d\'associations civiles et de fondations ; la réglementation correspondante ; et les Statuts de la Chambre, qui régissent son organisation, sa représentation, l\'admission de ses membres, ses droits, obligations et fonctionnement interne.</p>' +
        '<h3>2. Objet, portée et acceptation</h3>' +
        '<p>Les présentes Conditions s\'appliquent à l\'accès et à la navigation sur le site, à la consultation de son contenu, à l\'utilisation des formulaires, à la soumission de demandes d\'adhésion, à la soumission de propositions de coopération, à la présentation d\'initiatives commerciales, aux demandes de renseignements sur le commerce, l\'investissement, le financement et l\'internationalisation, à l\'abonnement aux communications institutionnelles et à l\'accès aux actualités, aux événements, aux publications et aux liens externes.</p>' +
        '<p>L\'accès à ce site ou son utilisation implique l\'acceptation des présentes Conditions générales dans la mesure permise par la loi applicable. Toute personne agissant au nom d\'une entreprise, d\'une institution ou d\'une organisation déclare avoir le pouvoir requis. Le simple accès à ce site n\'établit pas, en soi, de relation contractuelle, de partenariat, professionnelle, fiduciaire, de mandat ou de représentation avec la Chambre.</p>' +
        '<p>Certaines activités, évènements, programmes, adhésions, conventions ou relations spécifiques pourront être soumis à des conditions particulières. En cas de conflit, ces conditions prévaudront uniquement pour l\'activité concernée.</p>' +
        '<h3>3. Relations avec le MERCOSUR</h3>' +
        '<p>La Chambre opère dans les sphères économique, commerciale, sociale et institutionnelle du MERCOSUR. Son nom, son objet et sa mission reflètent ce contexte régional et visent à promouvoir le commerce, l\'investissement, la coopération commerciale et l\'intégration entre les États Membres, les États Associés et autres marchés internationaux.</p>' +
        '<p>Cette affiliation ne signifie pas que la Chambre fasse partie de la structure politique, gouvernementale ou organisationnelle officielle du MERCOSUR. La Chambre n\'est membre d\'aucun de ses organes politiques, décisionnels ou administratifs ; elle ne prend aucune décision au nom du bloc ; elle ne représente pas officiellement le MERCOSUR, ses États Membres, ses États Associés ni ses institutions ; et elle ne peut émettre de positions, certifications ou autorisations officielles en son nom. Le site web de la Chambre n\'est pas un portail officiel du MERCOSUR.</p>' +
        '<p>La Chambre peut participer aux mécanismes sociaux, commerciaux, consultatifs ou institutionnels liés au processus d\'intégration régionale. Toute inscription, reconnaissance ou participation institutionnelle sera limitée à la portée prévue par l\'acte correspondant. Une éventuelle inscription au Registre des Organisations et Mouvements Sociaux du MERCOSUR (MOS) ne convertit pas à la Chambre le statut d\'organe politique ou officiel du bloc, ni des pouvoirs généraux de représentation.</p>' +
        '<h3>4. Objectif du site et absence de conseils professionnels</h3>' +
        '<p>Le site a des vocations institutionnelles, informatives, commerciales, de sensibilisation, éducatives et de coopération. Il peut contenir des informations sur la Chambre, le MERCOSUR, les accords commerciaux, les données économiques, les marchés, les événements, les publications, les opportunités de coopération et les initiatives d\'intégration régionale.</p>' +
        '<p>Le contenu relatif au MERCOSUR est présenté d\'un point de vue institutionnel et commercial. Il ne constitue pas une prise de décision, une position, une déclaration ou une interprétation officielle du bloc, et ne saurait se substituer aux sources gouvernementales, réglementaires, statistiques, juridiques ou contractuelles.</p>' +
        '<p>Les informations publiées sont d\'ordre général et ne constituent ni un avis juridique, fiscal, comptable, réglementaire, financier, bancaire, technique, d\'investissement, de valeurs, d\'assurance ou de conformité ; elles ne constituent pas non plus une recommandation d\'achat ou de vente, une offre de titres, une sollicitation de fonds, l\'octroi d\'un crédit, une garantie de financement ou une promesse de rentabilité. La Chambre peut fournir un accompagnement institutionnel, faciliter les relations, identifier des spécialistes et coordonner des interlocuteurs, mais ces activités ne remplacent pas les professionnels agréés ni garantissent un financement, un investissement, une autorisation réglementaire, la conclusion de transactions ou la réussite commerciale.</p>' +
        '<h3>5. Exactitude et mise à jour des informations</h3>' +
        '<p>La Chambre s\'efforce d\'utiliser des sources fiables et de maintenir son contenu à jour. Cependant, les informations peuvent être affectées par des changements statistiques, réglementaires, économiques, institutionnels ou commerciaux ; des modifications d\'accords internationaux ; des changements de dates, de lieux ou de participants aux événements ; ou par des erreurs et omissions involontaires.</p>' +
        '<p>Par conséquent, aucune garantie absolue ne peut être donnée quant à l\'exhaustivité, l\'exactitude, l\'actualité, l\'absence d\'erreurs, l\'applicabilité à toutes les juridictions ou la disponibilité permanente du contenu. La Chambre se réserve le droit de corriger, mettre à jour, réorganiser, suspendre ou supprimer tout contenu sans obligation de préavis. Avant toute décision commerciale, légale, financière ou d\'investissement, il est conseillé aux utilisateurs de vérifier les informations auprès de sources officielles et, le cas échéant, de consulter un expert.</p>' +
        '<h3>6. Utilisations autorisées et comportements interdits</h3>' +
        '<p>Le site peut être utilisé à des fins licites, informatives, professionnelles, institutionnelles, éducatives, universitaires et commerciales. La consultation, l\'impression et le téléchargement raisonnables du contenu pour un usage interne ou informatif sont autorisés, à condition que son sens ne soit pas altéré, que les droits d\'auteur soient respectés, que la source soit citée le cas échéant et qu\'il n\'y ait aucune exploitation commerciale non autorisée ni suggestion d\'une relation institutionnelle inexistante.</p>' +
        '<p>L\'utilisation de ce site à des fins illicites, trompeuses, abusives ou frauduleuses est interdite. Sont notamment proscrits : l\'usurpation d\'identité de la Chambre ou de ses représentants ; la fausse déclaration en tant qu\'associé, délégué, allié ou collaborateur ; l\'introduction de code malveillant ; toute perturbation du fonctionnement du site ; l\'accès non autorisé à des zones restreintes ; l\'extraction massive d\'informations ou de bases de données ; la collecte de contacts à des fins commerciales non autorisées ; l\'envoi de communications abusives ou trompeuses ; la modification du contenu ; la violation des droits de tiers ; la sollicitation de fonds ; la promotion d\'investissements non autorisés ; l\'émission de faux certificats ; et toute suggestion d\'approbation officielle du MERCOSUR.</p>' +
        '<p>La Chambre pourra rejeter les formulaires, restreindre l\'accès, suspendre les fonctionnalités, supprimer les contenus illégaux, conserver les preuves et engager des poursuites judiciaires en cas de non-respect des règles, de fraude, d\'usurpation d\'identité, d\'abus, de risque pour la sécurité ou d\'atteinte aux droits. Ces mesures seront appliquées en fonction de la gravité du risque ou du manquement.</p>' +
        '<h3>7. Demandes d\'association</h3>' +
        '<p>Le fait de remplir ou de soumettre une demande n\'octroie pas automatiquement l\'adhésion en tant qu\'associé, ne confère aucun droit d\'adhésion, n\'accorde aucune représentation, n\'autorise pas l\'utilisation du nom ou du logo et ne permet pas de se présenter comme membre de la Chambre.</p>' +
        '<p>L\'admission est régie par les Statuts, le règlement intérieur, les critères d\'éligibilité, les décisions de l\'autorité compétente et la législation uruguayenne applicable. Cette organisation interne reflète l\'autonomie des associations civiles dans la gestion de leurs activités, conformément à leur objet et à leurs Statuts.</p>' +
        '<p>La Chambre pourra accepter ou refuser une demande, solliciter des informations complémentaires, suspendre son évaluation ou l\'archiver conformément à ses procédures internes. Il n\'existe pas de délai automatique de traitement. La décision pourra être communiquée selon les modalités prévues par lesdites procédures, sans obligation de motivation détaillée, sauf disposition contraire de la loi ou des statuts.</p>' +
        '<h3>8. Coopération institutionnelle et participation</h3>' +
        '<p>Les propositions de coopération, d\'alliances, d\'événements, d\'études, de programmes, d\'activités ou d\'initiatives conjointes pourront être évaluées en tenant compte de leur compatibilité institutionnelle, légalité, réputation, viabilité, des risques et de leur capacité opérationnelle.</p>' +
        '<p>La réception d\'une proposition n\'oblige pas à l\'accepter, à la négocier ou à la développer ; elle ne confère aucune exclusivité ; elle n\'établit aucune alliance ; et elle n\'autorise pas l\'utilisation du nom, de la marque ou du statut de collaborateur de la Chambre. Toute coopération doit être formalisée par écrit lorsque sa nature l\'exige. La participation ou la présence d\'une entité à une activité de la Chambre n\'implique pas que cette dernière assume la responsabilité de ses produits, services, déclarations ou actions.</p>' +
        '<h3>9. Présentation des initiatives commerciales</h3>' +
        '<p>Les projets d\'entreprise peuvent être soumis pour une évaluation préliminaire. Leur réception n\'oblige pas la Chambre à les analyser, à y répondre, à les financer, à les représenter, à les présenter à des tiers ni à poursuivre les discussions. Elle ne crée pas non plus d\'exclusivité, de relation contractuelle, de statut d\'associé ni de garantie d\'investissement ou de financement.</p>' +
        '<p>L\'expéditeur garantit qu\'il est autorisé à partager les informations, que celles-ci sont substantiellement véridiques, qu\'il dispose des autorisations nécessaires et que les documents ne violent pas les droits des tiers, les obligations de confidentialité ou les dispositions légales.</p>' +
        '<p>La Chambre n\'acquiert aucun droit de propriété sur une idée, une initiative, un projet ou un document du seul fait de sa réception. Tout droit, licence, mandat, exclusivité ou commission devra être expressément établi par écrit.</p>' +
        '<h3>10. Confidentialité des informations soumises</h3>' +
        '<p>Les formulaires généraux et les adresses électroniques de contact ne constituent pas, en soi, des canaux de communication confidentiels. Les informations transmises par ces moyens ne seront pas automatiquement considérées comme confidentielles, même si la Chambre s\'efforcera de les traiter avec prudence et d\'en limiter l\'accès aux seules personnes qui en ont besoin pour traiter la demande.</p>' +
        '<p>Les secrets commerciaux, les contrats complets, les états financiers détaillés, les pièces d\'identité, les coordonnées bancaires, les informations techniques confidentielles et autres documents sensibles ne doivent pas être transmis par le biais de formulaires ouverts. La confidentialité renforcée exigera un accord écrit et un canal de transmission sécurisé préalablement convenu.</p>' +
        '<p>La Chambre pourra refuser, ne pas ouvrir, retourner, archiver ou supprimer tout document sensible soumis sans autorisation préalable. Le traitement des données personnelles est régi par la Politique de Confidentialité.</p>' +
        '<h3>11. Propriété intellectuelle, marque et identité institutionnelle</h3>' +
        '<p>Les textes, logos, noms, marques, dessins, photographies, graphismes, profils, publications, documents, bases de données, contenus audiovisuels, noms de domaine et autres éléments de ce site appartiennent à la Chambre ou à des tiers ayant autorisé leur utilisation. Leur protection est assurée, entre autres, par la Loi N° 9.739 relative au droit d\'auteur et par la législation applicable en matière de propriété intellectuelle et industrielle.</p>' +
        '<p>L\'accès à ce site n\'octroie pas de licence générale sur ces éléments. De courts extraits peuvent être cités, à condition d\'attribuer correctement le contenu et d\'inclure un lien, dans le respect des limites légales. Sauf autorisation expresse, toute reproduction, adaptation, traduction, distribution, modification, commercialisation, publication sur d\'autres sites, création d\'œuvres dérivées ou intégration à des produits, services ou bases de données est interdite.</p>' +
        '<p>Le nom, le logo et les autres signes distinctifs de la Chambre ne peuvent être utilisés sans autorisation écrite. Il est interdit de délivrer des certificats non autorisés, d\'utiliser de fausses fonctions institutionnelles, de créer des profils ou des domaines susceptibles d\'induire en erreur, de faire la publicité d\'une adhésion inexistante, de présenter des projets comme étant approuvés par la Chambre ou de suggérer un soutien officiel du MERCOSUR. Ces règles sont complétées par la Politique d\'Utilisation des Marques.</p>' +
        '<h3>12. Contenu soumis par les utilisateurs</h3>' +
        '<p>L\'utilisateur conserve tous les droits dont il dispose légalement sur le contenu soumis. En le soumettant, il accorde à la Chambre une autorisation limitée, non exclusive et nécessaire pour le recevoir, le stocker, l\'examiner, l\'évaluer, le gérer et y répondre aux fins demandées.</p>' +
        '<p>Cette autorisation restera valable uniquement pendant la durée nécessaire à la réalisation de cet objectif, sans préjudice de toute conservation requise par la loi ou nécessaire à la documentation des actions rélalisées. Elle n\'autorise pas la Chambre à exploiter commercialement les idées, projets ou documents à d\'autres fins que celles pour lesquelles ils ont été soumis. L\'utilisateur est responsable de la légitimité et de l\'exactitude substantielle du contenu soumis.</p>' +
        '<h3>13. Liens externes, tiers, actualités et événements</h3>' +
        '<p>Le site peut contenir des liens vers des pages externes à titre utilitaire, de référence ou d\'information, notamment vers des sites web officiels du MERCOSUR, des événements, des institutions, des chambres de commerce, des organisations et des fournisseurs. La Chambre n\'exerce aucun contrôle et ne garantit ni le contenu, ni la disponibilité, ni la sécurité, ni la confidentialité, ni la légalité, ni les services de ces sites.</p>' +
        '<p>L\'inclusion d\'un lien n\'implique aucune approbation, association, certification, recommandation, garantie ni représentation. En quittant le site de la Chambre, l\'utilisateur est soumis aux conditions et politiques du tiers concerné.</p>' +
        '<p>Les dates, lieux, programmes, participants, horaires, conditions et disponibilités des événements ou activités sont susceptibles d\'être modifiés. La publication d\'un événement ne garantit ni l\'inscription, ni la disponibilité, ni la participation, ni la présence des personnes annoncées. Chaque événement peut être soumis à des conditions spécifiques et, lorsqu\'il est organisé par un tiers, les règles de ce dernier s\'appliqueront également.</p>' +
        '<h3>14. Disponibilité, garanties et responsabilité</h3>' +
        '<p>La Chambre s\'efforcera de maintenir le site accessible, fonctionnel et raisonnablement sécurisé, mais ne garantit pas un fonctionnement ininterrompu, l\'absence totale d\'erreurs, la compatibilité universelle, la disponibilité permanente ni l\'absence totale de menaces. L\'accès pourra être temporairement suspendu pour des raisons de maintenance, de mises à jour, de sécurité, d\'incidents, de modifications techniques, de décisions opérationnelles, de force majeure ou d\'autres circonstances justifiées.</p>' +
        '<p>Dans les limites permises par la loi, la Chambre ne sera pas responsable des décisions prises uniquement sur la base des informations figurant sur le site, des pertes indirectes, des pertes d\'opportunités, des interruptions, des actes ou omissions de tiers, des liens externes, des fausses informations soumises par les utilisateurs, de l\'échec des négociations, du manque de financement, des changements réglementaires ou de marché, de la mauvaise utilisation du site ou des menaces informatiques hors de son contrôle raisonnable.</p>' +
        '<p>La Chambre ne garantit pas non plus qu\'une demande de renseignements suscitera une réponse, qu\'une initiative sera acceptée, qu\'une relation sera formalisée ou qu\'une transaction aboutira à un résultat précis. Aucune disposition n\'exclut ni ne limite la responsabilité en cas de fraude, de faute grave, de manquements non susceptibles de renonciation ou de droits auxquels il ne peut être renoncé. Le droit uruguayen impératif et, le cas échéant, la Loi N° 17.250 relative aux Relations de Consommation et ses règlements d\'application sont maintenus.</p>' +
        '<h3>15. Confidentialité et cookies</h3>' +
        '<p>Le traitement des données personnelles est régi par la Politique de Confidentialité de la Chambre. L\'utilisation des cookies et technologies similaires sera régie par la Politique relative aux Cookies et par le panneau de préférences disponible sur le site web.</p>' +
        '<p>L\'acceptation des présentes Conditions générales ne vaut pas consentement à la réception de communications promotionnelles ni à l\'utilisation de cookies non essentiels. Le cas échéant, ces consentements seront demandés séparément et pourront être retirés conformément à la loi applicable.</p>' +
        '<h3>16. Modification des Conditions et du site</h3>' +
        '<p>La Chambre pourra mettre à jour les présentes Conditions afin de tenir compte des changements réglementaires, technologiques, organisationnels ou fonctionnels. La version en vigueur indiquera son numéro et sa date de publication et sera applicable à compter de cette publication, sans effet rétroactif sur les droits acquis ni sur les règles impératives.</p>' +
        '<p>En cas de modifications importantes, la Chambre pourra les informer par le biais d\'avis sur le site ou par tout autre moyen approprié. La poursuite de l\'utilisation du site après l\'entrée en vigueur d\'une nouvelle version vaudra son acceptation dans la mesure permise par la loi.</p>' +
        '<h3>17. Législation applicable, juridiction et langues</h3>' +
        '<p>Ces Conditions sont régies par les lois de la République Orientale de l\'Uruguay. Avant toute action en justice, les parties s\'efforceront de résoudre tout différend à l\'amiable par voie de communication directe. À défaut d\'accord, les tribunaux de Montevideo seront compétents, sous réserve des règles impératives de juridiction, de compétence territoriale ou de protection applicables.</p>' +
        '<p>Les Conditions générales pourront être publiées en espagnol, en anglais et en portugais. La version espagnole fait foi, les traductions étant fournies à titre informatif uniquement. En cas de divergence, la version espagnole prévaut, sauf disposition légale contraire.</p>' +
        '<h3>18. Divisibilité, non-renonciation et intégration</h3>' +
        '<p>Si une disposition est déclarée invalide, illégale ou inapplicable, les autres dispositions demeurent pleinement en vigueur. La disposition concernée sera interprétée ou remplacée, dans la mesure permise par la loi, de manière à se rapprocher le plus possible de son objectif légitime.</p>' +
        '<p>Le fait pour la Chambre de ne pas exercer un droit ne constitue pas une renonciation. Ces Conditions sont intégrées à la Politique de Confidentialité, à la Politique relative aux Cookies, à la Politique d\'Utilisation de la Marque, au Canal d\'Intégrité et à toutes conditions spécifiques applicables à certaines activités.</p>' +
        '<h3>19. Contact</h3>' +
        '<p>Pour toute question relative aux présentes Conditions d\'Utilisation, veuillez écrire à <a href="mailto:info@camaracomerciomercosur.org">info@camaracomerciomercosur.org</a>.</p>' +
        '<p class="privacy-signature">Chambre de Commerce du Mercosur. Association internationale uruguayenne. Rue Carlos Quijano 1290, Bureau 101, 11.100 Montevideo, Uruguay.</p>'
    };

    function currentLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return termsHTML[lang] ? lang : 'es';
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'terms-modal-title');
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeModal();
      });
      return overlay;
    }

    function openModal() {
      var ov = buildOverlay();
      ov.innerHTML =
        '<div class="privacy-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          termsHTML[currentLang()] +
        '</div>';
      ov.querySelector('.privacy-close').addEventListener('click', closeModal);
      window.requestAnimationFrame(function () {
        ov.classList.add('is-open');
      });
    }

    function closeModal() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) closeModal();
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-terms-link');
      if (!trigger) return;
      e.preventDefault();
      openModal();
    });
  })();


  /* ---------- Cookie preferences modal ---------- */
  (function () {
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

    var COOKIES_CONTENT = {
      es: {
        title: 'Configurar Cookies',
        intro: 'Utilizamos cookies estrictamente necesarias para el funcionamiento del sitio y, de forma opcional, cookies analíticas para entender cómo se utiliza. Puedes activar o desactivar las categorías opcionales y guardar tu preferencia en cualquier momento.',
        necessaryLabel: 'Cookies necesarias',
        necessaryDesc: 'Imprescindibles para la navegación, la seguridad y el funcionamiento básico del sitio. No pueden desactivarse.',
        analyticsLabel: 'Cookies analíticas',
        analyticsDesc: 'Nos ayudan a entender de forma agregada y anónima cómo se utiliza el sitio, para mejorar contenidos y navegación.',
        reject: 'Rechazar opcionales',
        save: 'Guardar preferencias'
      },
      en: {
        title: 'Cookie Settings',
        intro: 'We use strictly necessary cookies to ensure the website works properly and, optionally, analytical cookies to understand how it is used. You can enable or disable optional categories and save your preferences at any time.',
        necessaryLabel: 'Necessary Cookies',
        necessaryDesc: 'These cookies are essential for navigation, security, and the basic operation of the website. They cannot be disabled.',
        analyticsLabel: 'Analytical Cookies',
        analyticsDesc: 'These cookies help us understand, in an anonymous and aggregated way, how the website is used, allowing us to improve its content and user experience.',
        reject: 'Reject Optional Cookies',
        save: 'Save Preferences'
      },
      pt: {
        title: 'Configurar Cookies',
        intro: 'Utilizamos cookies estritamente necessários para o funcionamento do site e, de forma opcional, cookies analíticos para entender como ele é utilizado. Você pode ativar ou desativar as categorias opcionais e salvar suas preferências a qualquer momento.',
        necessaryLabel: 'Cookies necessários',
        necessaryDesc: 'Essenciais para a navegação, a segurança e o funcionamento básico do site. Não podem ser desativados.',
        analyticsLabel: 'Cookies analíticos',
        analyticsDesc: 'Ajudam-nos a compreender, de forma agregada e anônima, como o site é utilizado, permitindo melhorar o conteúdo e a experiência de navegação.',
        reject: 'Recusar opcionais',
        save: 'Salvar preferências'
      },
      fr: {
        title: 'Configurer les Cookies',
        intro: 'Nous utilisons des cookies strictement nécessaires pour fonctionnement du site et, éventuellement, des cookies analytiques pour comprendre son utilisation. Vous pouvez activer ou désactiver les catégories optionnelles et enregistrer vos préférences à tout moment.',
        necessaryLabel: 'Cookies nécessaires',
        necessaryDesc: 'Indispensables à la navigation, à la sécurité et au fonctionnement de base du site, ils ne peuvent pas être désactivés.',
        analyticsLabel: 'Cookies analytiques',
        analyticsDesc: 'Ils nous aident à comprendre, de manière agrégée et anonyme, comment le site est utilisé, afin d\'améliorer le contenu et la navigation.',
        reject: 'Refuser les éléments facultatifs',
        save: 'Enregistrer les préférences'
      }
    };

    function cookiesLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return COOKIES_CONTENT[lang] ? lang : 'es';
    }

    function cookiesHTMLFor(lang) {
      var t = COOKIES_CONTENT[lang];
      return (
        '<p class="privacy-eyebrow">Cámara de Comercio Mercosur</p>' +
        '<h2 id="cookies-modal-title">' + t.title + '</h2>' +
        '<p>' + t.intro + '</p>' +
        '<div class="cookie-option">' +
          '<div class="cookie-option-head">' +
            '<label for="cookie-necessary">' + t.necessaryLabel + '</label>' +
            '<input type="checkbox" id="cookie-necessary" checked disabled>' +
          '</div>' +
          '<p>' + t.necessaryDesc + '</p>' +
        '</div>' +
        '<div class="cookie-option">' +
          '<div class="cookie-option-head">' +
            '<label for="cookie-analytics">' + t.analyticsLabel + '</label>' +
            '<input type="checkbox" id="cookie-analytics">' +
          '</div>' +
          '<p>' + t.analyticsDesc + '</p>' +
        '</div>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="btn btn-outline-blue" data-cookie-action="reject">' + t.reject + '</button>' +
          '<button type="button" class="btn btn-primary" data-cookie-action="save">' + t.save + '</button>' +
        '</div>' +
        '<p class="cookie-status" role="status" aria-live="polite"></p>'
      );
    }

    function buildOverlay() {
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.className = 'privacy-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'cookies-modal-title');
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeCookies();
      });
      return overlay;
    }

    function renderCookies(ov) {
      ov.innerHTML =
        '<div class="privacy-modal cookies-modal">' +
          '<button type="button" class="privacy-close" aria-label="Cerrar">&times;</button>' +
          cookiesHTMLFor(cookiesLang()) +
        '</div>';

      var analyticsBox = ov.querySelector('#cookie-analytics');
      var status = ov.querySelector('.cookie-status');
      analyticsBox.checked = readPrefs().analytics;

      function setStatus(text) {
        status.textContent = text;
      }

      ov.querySelector('[data-cookie-action="save"]').addEventListener('click', function () {
        savePrefs({ analytics: analyticsBox.checked });
        setStatus(mercosurText('cookies.saved', 'Preferencias guardadas.'));
        window.setTimeout(closeCookies, 900);
      });

      ov.querySelector('[data-cookie-action="reject"]').addEventListener('click', function () {
        analyticsBox.checked = false;
        savePrefs({ analytics: false });
        setStatus(mercosurText('cookies.necessaryOnly', 'Solo se usarán las cookies necesarias.'));
        window.setTimeout(closeCookies, 900);
      });

      ov.querySelector('.privacy-close').addEventListener('click', closeCookies);
    }

    function openCookies() {
      var ov = buildOverlay();
      renderCookies(ov);
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

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-cookies-link');
      if (!trigger) return;
      e.preventDefault();
      openCookies();
    });
  })();

  /* ---------- Cookie consent banner (first layer, per Cookie Policy §9) ---------- */
  (function () {
    var STORAGE_KEY = 'mercosurCookiePrefs';
    var already = null;
    try { already = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
    if (already !== null) return;

    var BANNER_TEXT = {
      es: {
        message: 'Utilizamos cookies estrictamente necesarias para el funcionamiento del sitio y, de forma opcional, cookies analíticas. Puedes aceptar todas, rechazar las no necesarias o configurar tus preferencias.',
        policyLink: 'Política de Cookies',
        reject: 'Rechazar no necesarias',
        configure: 'Configurar',
        acceptAll: 'Aceptar todas'
      },
      en: {
        message: 'We use strictly necessary cookies for the website to work and, optionally, analytical cookies. You can accept all, reject non-essential cookies, or configure your preferences.',
        policyLink: 'Cookie Policy',
        reject: 'Reject Non-Essential',
        configure: 'Configure',
        acceptAll: 'Accept All'
      },
      pt: {
        message: 'Utilizamos cookies estritamente necessários para o funcionamento do site e, de forma opcional, cookies analíticos. Você pode aceitar todos, recusar os não necessários ou configurar suas preferências.',
        policyLink: 'Política de Cookies',
        reject: 'Recusar não necessários',
        configure: 'Configurar',
        acceptAll: 'Aceitar todos'
      }
    };

    function bannerLang() {
      var lang = 'es';
      try { lang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
      return BANNER_TEXT[lang] ? lang : 'es';
    }

    function savePrefs(prefs) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { /* storage unavailable */ }
    }

    var t = BANNER_TEXT[bannerLang()];
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookies');
    banner.innerHTML =
      '<div class="cookie-banner-inner">' +
        '<p>' + t.message + ' <a href="#" class="js-cookies-policy-link">' + t.policyLink + '</a></p>' +
        '<div class="cookie-banner-actions">' +
          '<button type="button" class="btn btn-outline-blue" data-banner-action="reject">' + t.reject + '</button>' +
          '<button type="button" class="btn btn-outline-blue js-cookies-link" data-banner-action="configure">' + t.configure + '</button>' +
          '<button type="button" class="btn btn-primary" data-banner-action="accept">' + t.acceptAll + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    function dismiss() {
      banner.classList.remove('is-open');
      window.setTimeout(function () { banner.remove(); }, 300);
    }

    banner.querySelector('[data-banner-action="accept"]').addEventListener('click', function () {
      savePrefs({ analytics: true });
      dismiss();
    });
    banner.querySelector('[data-banner-action="reject"]').addEventListener('click', function () {
      savePrefs({ analytics: false });
      dismiss();
    });
    banner.querySelector('[data-banner-action="configure"]').addEventListener('click', function () {
      dismiss();
    });

    window.requestAnimationFrame(function () {
      banner.classList.add('is-open');
    });
  })();

  /* ---------- Institutional notice modal (shown once per session) ---------- */
  (function () {
    if (sessionStorage.getItem('mercosurNoticeShown') === '1') return;

    var NOTICE_CONTENT = {
      es:
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
        '<p class="notice-signature">Cámara de Comercio Mercosur</p>',
      en:
        '<p class="notice-eyebrow">Institutional Statement</p>' +
        '<h2 id="notice-title">The Mercosur Chamber of Commerce expresses its solidarity with the people of Venezuela</h2>' +
        '<p>The Mercosur Chamber of Commerce expresses its deepest solidarity with the people of the Bolivarian Republic of Venezuela following the tragedy caused by the devastating earthquake that has affected thousands of families, leaving a profound human, social, and economic impact.</p>' +
        '<p>During this difficult time, we extend our sincere condolences to those who have lost loved ones and express our appreciation to the rescue teams, healthcare professionals, volunteers, and national and international organizations working tirelessly to save lives and support the affected communities.</p>' +
        '<p>Times of crisis also test the ability of our institutions to act with responsibility, coordination, and solidarity.</p>' +
        '<p>We reaffirm that recovering from a tragedy of this scale requires the joint effort of all sectors, including governments, businesses, chambers of commerce, civil society organizations, international organizations, and citizens.</p>' +
        '<p>For this reason, we encourage our business community, partner institutions, and all members of the economic ecosystem to support, whenever possible, the humanitarian initiatives and official assistance programs established to help the Venezuelan people.</p>' +
        '<p>MERCOSUR and our region become stronger when solidarity goes beyond borders and becomes a shared commitment.</p>' +
        '<p>We also provide below the links to official organizations currently receiving donations. The Chamber is not affiliated with these organizations. We share this information solely for public awareness after confirming its validity with colleagues in Venezuela, highlighting the importance of ensuring that donations reach the places and people who need them most.</p>' +
        '<div class="notice-links">' +
          '<p>Links to Official Organizations</p>' +
          '<ul class="notice-links-grid">' +
            '<li><a href="https://help.unicef.org/lac/venezuela/emergenciavenezuela" target="_blank" rel="noopener">UNICEF - United Nations</a></li>' +
            '<li><a href="https://sharethemeal.org/campaigns/venezuela1" target="_blank" rel="noopener">Share The Meal</a></li>' +
            '<li><a href="http://www.caritasvenezuela.org/donaciones" target="_blank" rel="noopener">Caritas Venezuela</a></li>' +
            '<li><a href="http://www.globalgiving.org" target="_blank" rel="noopener">GlobalGiving (@globalgiving)</a></li>' +
          '</ul>' +
        '</div>' +
        '<p class="notice-signature">Mercosur Chamber of Commerce</p>',
      pt:
        '<p class="notice-eyebrow">Comunicado Institucional</p>' +
        '<h2 id="notice-title">A Câmara de Comércio Mercosul manifesta sua solidariedade ao povo venezuelano</h2>' +
        '<p>A Câmara de Comércio Mercosul manifesta sua mais profunda solidariedade ao povo da República Bolivariana da Venezuela diante da tragédia causada pelo devastador terremoto que afetou milhares de famílias, deixando um profundo impacto humano, social e econômico.</p>' +
        '<p>Neste momento de grande sofrimento, expressamos nossas condolências às pessoas que perderam seus entes queridos e nosso reconhecimento às equipes de resgate, aos profissionais de saúde, aos voluntários e aos organismos nacionais e internacionais que trabalham incansavelmente para salvar vidas e prestar assistência às comunidades afetadas.</p>' +
        '<p>As crises também colocam à prova a capacidade de nossas instituições de agir com responsabilidade, coordenação e solidariedade.</p>' +
        '<p>Reafirmamos que a recuperação de uma tragédia dessa magnitude exige o esforço conjunto de todos os setores: governos, empresas, câmaras de comércio, organizações da sociedade civil, organismos internacionais e cidadãos.</p>' +
        '<p>Por esse motivo, convidamos nossa comunidade empresarial, as instituições associadas e todos os integrantes do ecossistema econômico a colaborar, dentro de suas possibilidades, com as iniciativas humanitárias e os mecanismos de assistência oficialmente disponibilizados para apoiar o povo venezuelano.</p>' +
        '<p>O Mercosul e toda a nossa região se fortalecem quando a solidariedade ultrapassa fronteiras e se transforma em um compromisso compartilhado.</p>' +
        '<p>Também divulgamos abaixo os links de instituições oficiais que estão recebendo doações. Esclarecemos que a Câmara não possui qualquer vínculo com essas entidades. Compartilhamos essas informações apenas para fins de divulgação, após verificar sua autenticidade junto a colegas venezuelanos, destacando a importância de que as doações cheguem efetivamente aos locais e às pessoas que mais necessitam.</p>' +
        '<div class="notice-links">' +
          '<p>Links de instituições oficiais</p>' +
          '<ul class="notice-links-grid">' +
            '<li><a href="https://help.unicef.org/lac/venezuela/emergenciavenezuela" target="_blank" rel="noopener">UNICEF - ONU</a></li>' +
            '<li><a href="https://sharethemeal.org/campaigns/venezuela1" target="_blank" rel="noopener">Share The Meal</a></li>' +
            '<li><a href="http://www.caritasvenezuela.org/donaciones" target="_blank" rel="noopener">Cáritas Venezuela</a></li>' +
            '<li><a href="http://www.globalgiving.org" target="_blank" rel="noopener">Global Giving (@globalgiving)</a></li>' +
          '</ul>' +
        '</div>' +
        '<p class="notice-signature">Câmara de Comércio Mercosul</p>',
      fr:
        '<p class="notice-eyebrow">Communiqué institutionnel</p>' +
        '<h2 id="notice-title">La Chambre de Commerce du Mercosur exprime sa solidarité avec le peuple vénézuélien</h2>' +
        '<p>Depuis la Chambre de Commerce du Mercosur, nous exprimons notre plus profonde solidarité avec le peuple de la République bolivarienne du Venezuela face à la tragédie causée par le séisme dévastateur qui a touché des milliers de familles, laissant une profonde cicatrice humaine, sociale et économique.</p>' +
        '<p>En ces moments d\'immense tristesse, nous présentons nos condoléances à ceux qui ont perdu des êtres chers et exprimons notre reconnaissance aux équipes de secours, au personnel de santé, aux bénévoles et aux organisations nationales et internationales qui travaillent sans relâche pour sauver des vies et aider les communautés touchées.</p>' +
        '<p>Les crises mettent également à l\'épreuve la capacité de nos institutions à agir avec responsabilité, coordination et solidarité.</p>' +
        '<p>Nous réaffirmons que la récupération après une tragédie de cette ampleur exige l\'effort commun de tous les secteurs : gouvernements, entreprises, chambres de commerce, organisations de la société civile, organisations internationales et citoyens.</p>' +
        '<p>Par conséquent, nous appelons notre communauté d\'affaires, les institutions associées et tous les acteurs de l\'écosystème économique à collaborer, dans la limite de leurs moyens, avec les initiatives humanitaires et les mécanismes d\'assistance officiellement habilités à soutenir le peuple vénézuélien.</p>' +
        '<p>Le Mercosur et notre région se renforcent lorsque la solidarité transcende les frontières et devient un engagement partagé.</p>' +
        '<p>Nous partageons également des liens vers des institutions officielles qui reçoivent actuellement les dons. Nous tenons à préciser que nous ne sommes affiliés à aucune de ces organisations ; nous partageons simplement ces informations à titre informatif, après en avoir vérifié l\'exactitude auprès de nos collègues vénézuéliens. Nous insistons sur l\'importance de veiller à ce que les dons parviennent aux personnes et aux lieux qui en ont le plus besoin.</p>' +
        '<div class="notice-links">' +
          '<p>Liens des institutions officielles</p>' +
          '<ul class="notice-links-grid">' +
            '<li><a href="https://help.unicef.org/lac/venezuela/emergenciavenezuela" target="_blank" rel="noopener">UNICEF - ONU</a></li>' +
            '<li><a href="https://sharethemeal.org/campaigns/venezuela1" target="_blank" rel="noopener">Share The Meal</a></li>' +
            '<li><a href="http://www.caritasvenezuela.org/donaciones" target="_blank" rel="noopener">Caritas Venezuela</a></li>' +
            '<li><a href="http://www.globalgiving.org" target="_blank" rel="noopener">Global Giving (@globalgiving)</a></li>' +
          '</ul>' +
        '</div>' +
        '<p class="notice-signature">Chambre de Commerce du Mercosur</p>'
    };

    var noticeLang = 'es';
    try { noticeLang = localStorage.getItem('mercosurLang') || 'es'; } catch (e) { /* storage unavailable */ }
    if (!NOTICE_CONTENT[noticeLang]) noticeLang = 'es';

    var overlay = document.createElement('div');
    overlay.className = 'notice-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'notice-title');
    overlay.innerHTML =
      '<div class="notice-modal">' +
        '<button type="button" class="notice-close" aria-label="Cerrar">&times;</button>' +
        NOTICE_CONTENT[noticeLang] +
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