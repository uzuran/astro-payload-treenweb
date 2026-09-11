/* Classic script — depends on window.Vesco (app.js). */
(function () {
'use strict';
var V = window.Vesco;
  var t = V.t,
      locSign = V.locSign,
      zodiac = V.zodiac,
      glyph = V.glyph,
      setUserSign = V.setUserSign,
      onLanguageChange = V.onLanguageChange;

const $ = (s) => document.querySelector(s);
let tab = 'daily';
let current = localStorage.getItem('vesco.sign') || 'Libra';

const TABS = ['daily', 'weekly', 'monthly'];

function renderTabs() {
  const T = t();
  $('[data-tabs]').innerHTML = TABS.map(k =>
    `<button type="button" data-tab="${k}" aria-pressed="${k === tab}">${T.tabs[k]}</button>`).join('');
}

function renderFeatured() {
  const T = t();
  const s = locSign(zodiac().find(z => z.sign === current));
  $('[data-featured]').innerHTML = `
    <div class="text-center">
      <div class="mx-auto grid h-[110px] w-[110px] rotate-45 place-items-center rounded-[20px] border border-[--edge]">
        <span class="-rotate-45">${glyph(current, 48, 1.1)}</span>
      </div>
      <p class="mt-5 font-mono text-[10px] tracking-[.12em] text-muted">${s.dates}</p>
    </div>
    <div>
      <p class="v-label mb-2.5">${T.tabLabels[tab]} · ${T.mood.toLowerCase()} ${s.mood}</p>
      <h2 class="mb-5 font-display text-[clamp(30px,3.2vw,44px)] font-normal">${s.sign}</h2>
      <p class="m-0 font-display text-[25px] leading-snug">${s[tab]}</p>
    </div>
    <dl class="m-0">
      <div class="v-row"><dt>${T.element}</dt><dd>${s.element}</dd></div>
      <div class="v-row"><dt>${T.mode}</dt><dd>${s.mode}</dd></div>
      <div class="v-row"><dt>${T.ruler}</dt><dd>${s.ruler}</dd></div>
      <button type="button" class="v-btn v-btn--outline mt-5 w-full" data-pin>${T.setMySign}</button>
    </dl>`;
}

function renderSigns() {
  $('[data-signs]').innerHTML = zodiac().map(z => {
    const s = locSign(z);
    return `
    <button type="button" class="v-sign-tile" data-sign="${z.sign}" aria-pressed="${z.sign === current}">
      <span class="mb-4 flex items-baseline justify-between gap-2.5">
        ${glyph(z.sign, 28)}
        <span class="font-mono text-[9px] uppercase tracking-[.12em] text-muted">${s.element}</span>
      </span>
      <span class="mb-1 block font-display text-[21px] uppercase tracking-[.1em]">${s.sign}</span>
      <span class="mb-4 block font-mono text-[10px] text-muted">${s.dates}</span>
      <span class="block border-t border-[--rule-2] pt-3.5 text-[13.5px] leading-relaxed text-ink70">${s[tab].split('. ')[0]}.</span>
    </button>`;
  }).join('');
}

document.addEventListener('click', (e) => {
  const tb = e.target.closest('[data-tab]');
  if (tb) { tab = tb.dataset.tab; renderAll(); return; }
  const sg = e.target.closest('[data-sign]');
  if (sg) { current = sg.dataset.sign; renderAll(); return; }
  if (e.target.closest('[data-pin]')) { setUserSign(current); e.target.closest('[data-pin]').textContent = '✓'; }
});

function renderAll() { renderTabs(); renderFeatured(); renderSigns(); }
onLanguageChange(renderAll);
renderAll();
})();
