/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'macelleria-del-desiderio',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google (tabella aperta a schermo il 24/9/2026) = il loro sito: lunedì 8–13, mar–sab 8–13 e 16–19:30, domenica chiuso. */
    hours: {
      0: [],
      1: [['08:00', '13:00']],
      2: [['08:00', '13:00'], ['16:00', '19:30']],
      3: [['08:00', '13:00'], ['16:00', '19:30']],
      4: [['08:00', '13:00'], ['16:00', '19:30']],
      5: [['08:00', '13:00'], ['16:00', '19:30']],
      6: [['08:00', '13:00'], ['16:00', '19:30']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 2400,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.f": "La Macelleria del Desiderio · via Luigi Ornato 45, Milan",
      "intro.skip": "skip",
      "nav.home": "La Macelleria del Desiderio, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "by Antonio Desiderio · via Luigi Ornato 45, Milan",
      "nav.carne": "Meat",
      "nav.gastronomia": "Deli counter",
      "nav.formaggi": "Cheese",
      "nav.domicilio": "Home delivery",
      "nav.recensioni": "Reviews",
      "nav.orari": "Hours and where",
      "nav.domande": "Questions",
      "cta.chiama": "Call",
      "cta.chiama2": "Call +39 02 642 4792",
      "h.k": "Butcher · deli counter · cheese · via Luigi Ornato 45, Niguarda, Milan",
      "h.malt": "The butcher drawn on the shop apron, arms crossed",
      "h.t": "What would you like?",
      "h.r": "Meat, home-made deli dishes, cheese. Delivered to your door, with every kind of meal voucher.",
      "h.p": "It is the question you hear at the counter when it is your turn: in Italian, «Desidera?». Here it is also the surname: the shop belongs to Antonio <b>Desiderio</b>, and the apron says it in big letters, with the butcher standing arms crossed. The answers are below, one at a time.",
      "h.cta1": "Call +39 02 642 4792",
      "h.cta2": "Home delivery",
      "h.cta3": "Write to us",
      "h.badge": "4.8 on Google with 38 reviews · «ottima» (excellent) is the word customers write most often",
      "h.zoom": "Enlarge the photo of the apron",
      "h.alt": "The shop apron: Macelleria del Desiderio, Milan, the phone number, and the butcher drawn with his arms crossed",
      "h.cap": "the apron with our mark (photo from the Google listing)",
      "c.k": "01 · at the meat counter",
      "c.d": "Would you like some meat?",
      "c.h": "Meat of guaranteed origin, and cured meats.",
      "c.p1": "On our website we put it like this: a wide choice of meat of guaranteed origin and different kinds of cured meats. Customers put it another way: the word «ottima» appears in twelve reviews out of fourteen.",
      "c.p2": "Tell us what you have to cook and for how many: the right cut and the quantity are decided at the counter, together.",
      "g.k": "02 · at the deli counter",
      "g.d": "Would you like something ready?",
      "g.h": "Cold and cooked dishes, made by us every day.",
      "g.p1": "Inside the butcher's there is a section for the deli counter: every day dishes of our own making, cold dishes and cooked dishes. To order, products for coeliacs.",
      "g1.h": "Every day",
      "g1.p": "What is ready you see at the counter: it changes with the shopping and with the season.",
      "g2.h": "Cold and cooked",
      "g2.p": "Cold dishes to take home and cooked dishes to warm up: made here, not delivered here.",
      "g3.h": "To order",
      "g3.p": "For coeliacs, and for anyone who needs a precise quantity on a precise day: tell us in advance.",
      "g.p2": "Five reviews out of fourteen mention the deli counter: «good rotisserie products», «freshly prepared food». You find them below, in full.",
      "f.k": "03 · at the cheese counter",
      "f.d": "Would you like some cheese?",
      "f.h": "Fresh cheeses and dairy.",
      "f.p": "A butcher's that also has a cheese counter: fresh cheeses and dairy, Italian products, to finish the shopping in one place. Ask what has come in.",
      "d.k": "04 · at the till",
      "d.d": "Would you like us to bring it over?",
      "d.h": "Home delivery. And every kind of voucher.",
      "d.p1": "Two signs that are also on our website, and still hold.",
      "d.c1": "Home delivery available",
      "d.c2": "All kinds of meal vouchers accepted",
      "d.p2": "For delivery to your home you call and we arrange it. Meal vouchers are fine, of every kind: our reviewers write it too.",
      "d.zoom": "Enlarge the photo of the shop window",
      "d.alt": "The shop window with the striped awning and the Macelleria sign",
      "d.cap": "the window with the striped awning (photo from our website)",
      "a.k": "05 · at Antonio's",
      "a.d": "Anything else?",
      "a.h": "The smile, and years of trust.",
      "a.cit": "«My trusted butcher's for years»",
      "a.cit2": "from a Google review",
      "a.p": "Four reviews speak of trust, and one says they are affectionate with children. It is not something you can promise: you can only keep doing it, every morning at eight.",
      "a.n1": "reviews out of 14 write «ottima» about the meat or the quality",
      "a.n2": "mention kindness, courtesy, friendliness",
      "a.n3": "mention the deli counter",
      "a.n4": "say «trusted» or «for years»",
      "a.nota": "counted on the 14 Google reviews with a text, September 2026",
      "r.k": "06 · the reviews",
      "r.d": "Would you like an opinion?",
      "r.h": "What people write.",
      "r.p": "Five Google reviews, as they were written.",
      "r.voto": "out of 5 · 38 Google reviews",
      "r1.c": "Viviana · 5 years ago · 5 stars",
      "r2.c": "Laura P. · 2 years ago · 5 stars",
      "r3.c": "Patrizia V. · 3 years ago · 5 stars",
      "r4.c": "Barbara P. · 5 years ago · 5 stars",
      "r5.c": "Danilo C. · a year ago · 4 stars",
      "o.k": "07 · hours and where",
      "o.d": "Would you like to drop by?",
      "o.h": "On Monday, mornings only.",
      "o.p": "Tuesday to Saturday morning and afternoon, 8–13 and 16–19:30. On Monday from 8 to 13, then closed. Closed on Sunday.",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.solo": "morning only",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "o.nota": "For holidays and for the summer, better to call first.",
      "k.ind": "address",
      "k.tel": "phone",
      "k.mail": "email",
      "o.strada": "Get directions",
      "o.zoom": "Enlarge the photo of the sign",
      "o.alt": "The Macelleria sign and the striped awning on via Luigi Ornato, seen from the street",
      "o.cap2": "the sign on via Luigi Ornato (Google Street View)",
      "o.mappa": "Map: La Macelleria del Desiderio, Via Luigi Ornato 45, Milan",
      "q.k": "08 · questions",
      "q.d": "Would you like to ask?",
      "q.h": "The questions we get asked.",
      "qa.1": "Do you deliver to homes?",
      "ra.1": "Yes, home delivery is available: call +39 02 642 4792 and we arrange it.",
      "qa.2": "Do you accept meal vouchers?",
      "ra.2": "Yes, all kinds of meal vouchers and tickets.",
      "qa.3": "Is the deli counter open every day?",
      "ra.3": "Yes: every day dishes of our own making, cold and cooked.",
      "qa.4": "Do you have products for coeliacs?",
      "ra.4": "To order, yes: tell us what you need and for when.",
      "qa.5": "Are you open on Monday afternoon?",
      "ra.5": "No: on Monday mornings only, from 8 to 13. Tuesday to Saturday 8–13 and 16–19:30. Closed on Sunday.",
      "qa.6": "Do you also sell cured meats and cheese?",
      "ra.6": "Yes: different kinds of cured meats, fresh cheeses and dairy.",
      "qa.7": "Who is the Desiderio?",
      "ra.7": "Antonio Desiderio, the owner: the shop carries his surname. And «desidera?» is what you hear at the counter when it is your turn.",
      "piede.s": "by Antonio Desiderio · butcher, deli counter, cheese · home delivery · all meal vouchers · Mon 8–13, Tue–Sat 8–13 and 16–19:30",
      "piede.b": "Demo site by <a href=\"https://bespokestud.io\" target=\"_blank\" rel=\"noopener\">Bespoke Studio</a> · texts, hours and services from the business's website, the Google listing and the public Google reviews (September 2026); photographs from the Google listing, the business's website and Google Street View.",
      "b.chiama": "Call",
      "b.gastro": "Deli",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · La Macelleria del Desiderio — «Desidera?»: il fumetto ═══
     Ogni [data-fumetto] è un blocco «banco»: il macellaio del grembiule e uno o due fumetti (.fumetto--d la domanda,
     .fumetto--r la risposta) che sbocciano dalla coda (transform-origin 0 100%). Stato finale nel CSS = fumetti aperti:
     senza JS e in reduced-motion è tutto già detto. Con GSAP: il JS li chiude (scale 0, opacity 0: data-stato=muto)
     e li apre in sequenza (chiede → risponde). L'intro parte subito, l'hero dopo l'intro (bespokeHeroEntrance),
     le sezioni quando entrano in vista. */
  var fumettiVivi = hasGsap && hasST && !reducedMotion;
  var parla = function (el, subito) {
    var b = el.querySelectorAll('.fumetto');
    if (!b.length) { el.setAttribute('data-stato', 'risponde'); return; }
    if (subito || !hasGsap) { if (hasGsap) gsap.set(b, { clearProps: 'opacity,transform' }); el.setAttribute('data-stato', 'risponde'); return; }
    if (el.getAttribute('data-stato') !== 'muto') return;
    el.setAttribute('data-stato', 'chiede');
    var tl = gsap.timeline({ onComplete: function () { gsap.set(b, { clearProps: 'opacity,transform' }); el.setAttribute('data-stato', 'risponde'); } });
    tl.to(b[0], { opacity: 1, scale: 1, duration: .5, ease: 'back.out(1.8)' }, 0);
    if (b[1]) tl.to(b[1], { opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.6)' }, 0.55);
  };
  var taci = function (el) {
    var b = el.querySelectorAll('.fumetto');
    if (!b.length) return;
    gsap.set(b, { opacity: 0, scale: 0, transformOrigin: '0% 100%' });
    el.setAttribute('data-stato', 'muto');
  };
  var banchi = Array.prototype.slice.call(document.querySelectorAll('[data-fumetto]'));
  if (fumettiVivi) {
    banchi.forEach(taci);
    var introB = document.getElementById('introFumetto');
    if (introB) {
      setTimeout(function () { parla(introB); }, 200);
      setTimeout(function () { var f = document.getElementById('introFine'); if (f) f.classList.add('is-on'); }, 1300);
    }
    banchi.filter(function (b) { return !b.hasAttribute('data-fumetto-manuale'); }).forEach(function (b) {
      ScrollTrigger.create({ trigger: b, start: 'top 85%', once: true, onEnter: function () { parla(b); } });
    });
    // rete di sicurezza: dopo 7 s ciò che è in vista e ancora muto parla
    setTimeout(function () {
      banchi.forEach(function (b) {
        if (b.getAttribute('data-stato') !== 'muto') return;
        var r = b.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) parla(b, true);
      });
    }, 7000);
  } else {
    var f0 = document.getElementById('introFine'); if (f0) f0.classList.add('is-on');
  }

  window.bespokeHeroEntrance = function () {
    var hero = document.getElementById('heroFumetto');
    if (!fumettiVivi) { if (hero) parla(hero, true); return; }
    if (hero) parla(hero);
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(['.apertura__p', '.apertura__stato', '.apertura__azioni', '.apertura__badge'], { opacity: 0, y: 16, duration: .6, stagger: .08 }, 0.9)
      .from('.apertura__foto', { opacity: 0, y: 24, duration: .8 }, '-=.6');
  };

})();
