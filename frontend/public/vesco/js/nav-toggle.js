/* Vesco — mobile header nav toggle. Classic script, external file (CSP is
   script-src 'self' with no 'unsafe-inline' — can't be an inline block). */
(function () {
  'use strict';
  var btn = document.getElementById('vesco-nav-toggle');
  var nav = document.getElementById('vesco-nav');
  var iconOpen = document.getElementById('vesco-nav-icon-open');
  var iconClose = document.getElementById('vesco-nav-icon-close');
  if (!btn || !nav) return;

  function setOpen(open) {
    // `hidden` is display:none; nothing else here (flex-col, items-*, the
    // toggle's self-center) does anything without display:flex also being
    // set — Tailwind's `hidden` and a bare `flex` can't both sit in the
    // class list at once (unprefixed utility order isn't guaranteed), so
    // toggle them together, same as page-tarot.js does for its own
    // hidden/grid panels.
    nav.classList.toggle('hidden', !open);
    nav.classList.toggle('flex', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (iconOpen) iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  }

  btn.addEventListener('click', function () {
    setOpen(nav.classList.contains('hidden'));
  });

  // Every fresh page's nav starts closed; sync the button/icon to match (also
  // covers the data-astro-rerun re-run on a soft nav, where the incoming
  // page's markup is always freshly closed too).
  setOpen(false);

  // If the viewport grows past the desktop breakpoint while the mobile menu
  // is open, drop back to the always-visible desktop nav state.
  var desktop = window.matchMedia('(min-width: 1024px)');
  desktop.addEventListener('change', function () {
    if (desktop.matches) setOpen(false);
  });
})();
