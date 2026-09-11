/* Merges CMS-sourced label overrides (from Payload, embedded by the server as
   inert JSON — never inline JS, so this respects script-src 'self') over the
   bundled vesco-cs.js UI dictionary, before app.js captures window.VescoCS.
   Load order: vesco-data.js -> vesco-cs.js -> cms-merge.js -> app.js -> page-*.js.
   Fails safe: any missing/malformed payload leaves the bundled copy as-is. */
(function () {
  'use strict';
  try {
    var el = document.getElementById('vesco-cms-labels');
    if (!el) return;
    var overrides = JSON.parse(el.textContent || '{}');
    var UI = window.VescoCS && window.VescoCS.UI;
    if (!UI) return;
    ['en', 'cs'].forEach(function (lang) {
      var o = overrides[lang];
      if (o && UI[lang]) Object.assign(UI[lang], o);
    });
  } catch (e) {
    // Malformed/partial CMS payload — bundled defaults stand.
  }
})();
