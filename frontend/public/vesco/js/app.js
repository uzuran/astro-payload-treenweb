/* Vesco — shared UI: i18n, header state, preferences.
   Classic script (no modules) so the pages also work from file://.
   Exposes window.Vesco. Load after vesco-data.js and vesco-cs.js. */
(function () {
  'use strict';

  var DATA = window.VescoData;
  var CS = window.VescoCS;

  var LANG_KEY = 'vesco.lang', SIGN_KEY = 'vesco.sign', FAV_KEY = 'vesco.favs';
  var DEFAULT_FAVS = ['nine-wands', 'four-wands', 'the-sun', 'queen-wands'];

  function read(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  // The URL (/en/... or /cs/...) is authoritative — it sets <html lang>
  // server-side. Keep localStorage in sync so the deck/zodiac engine (which
  // has no other locale signal) always matches what the page is showing.
  var lang = document.documentElement.lang === 'cs' ? 'cs' : 'en';
  write(LANG_KEY, lang);

  function t() { return CS.UI[lang]; }
  function isCS() { return lang === 'cs'; }

  function locCard(card) {
    if (!isCS()) return card;
    var cs = CS.CARDS_CS[card.id] || {};
    return Object.assign({}, card, cs, {
      suit: CS.term(card.suit), element: CS.term(card.element), ruler: CS.term(card.ruler)
    });
  }

  function locSign(z) {
    if (!isCS()) return z;
    var cs = CS.ZODIAC_CS[z.sign];
    return Object.assign({}, z, cs, { ruler: CS.term(cs.ruler) });
  }

  function meaning(n) {
    if (!isCS()) return DATA.meaning(n);
    if (CS.NUM_CS[n]) return CS.NUM_CS[n];
    var sum = String(n).split('').reduce(function (a, b) { return a + Number(b); }, 0);
    return CS.NUM_CS[sum] || CS.NUM_CS[9];
  }

  function glyph(sign, size, width, color) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 28) + '" height="' + (size || 28) +
      '" fill="none" stroke="' + (color || 'var(--clay)') + '" stroke-width="' + (width || 1.4) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
      DATA.SIGN_PATH[sign] + '"></path></svg>';
  }

  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, t());
  }

  function applyStaticText() {
    document.documentElement.lang = lang;

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (node) {
      var v = get(node.getAttribute('data-i18n'));
      if (typeof v === 'string') node.textContent = v;
    });

    var today = document.querySelector('[data-today]');
    if (today) {
      today.textContent = new Date().toLocaleDateString(lang === 'cs' ? 'cs-CZ' : 'en-GB',
        { weekday: 'long', day: 'numeric', month: 'long' });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-lang-btn]'), function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-btn') === lang));
    });
  }

  var listeners = [];

  function setLanguage(next) {
    lang = next;
    write(LANG_KEY, next);
    applyStaticText();
    listeners.forEach(function (fn) { fn(lang); });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lang-btn]');
    if (btn) setLanguage(btn.getAttribute('data-lang-btn'));
  });

  window.Vesco = {
    t: t,
    locCard: locCard,
    locSign: locSign,
    meaning: meaning,
    glyph: glyph,
    cards: function () { return DATA.CARDS; },
    zodiac: function () { return DATA.ZODIAC; },
    signPath: function (s) { return DATA.SIGN_PATH[s]; },
    streak: DATA.STREAK,
    calculate: DATA.calculate,
    plural: CS.plural,
    savedReadings: function () { return isCS() ? CS.SAVED_CS : DATA.SAVED; },
    userSign: function () { return read(SIGN_KEY, 'Libra'); },
    setUserSign: function (s) { write(SIGN_KEY, s); },
    favourites: function () {
      try { return JSON.parse(localStorage.getItem(FAV_KEY)) || DEFAULT_FAVS.slice(); }
      catch (e) { return DEFAULT_FAVS.slice(); }
    },
    toggleFavourite: function (id) {
      var f = window.Vesco.favourites();
      var next = f.indexOf(id) > -1 ? f.filter(function (x) { return x !== id; }) : f.concat([id]);
      write(FAV_KEY, JSON.stringify(next));
      return next;
    },
    setLanguage: setLanguage,
    onLanguageChange: function (fn) { listeners.push(fn); },
    applyStaticText: applyStaticText
  };

  applyStaticText();
})();
