/* Vesco — back-to-top button. Classic script, external file: CSP is
   script-src 'self' with no 'unsafe-inline', so this can't be an inline
   <script> block — it has to be a same-origin file like the rest of
   public/vesco/js/*. */
(function () {
  'use strict';
  var btn = document.getElementById('vesco-back-to-top');
  if (btn) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var sync = function () {
      btn.hidden = window.scrollY < 600;
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' });
    });
  }
})();
