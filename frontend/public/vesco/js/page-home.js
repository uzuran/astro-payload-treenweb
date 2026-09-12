/* Classic script — depends on window.Vesco (app.js). */
(function () {
'use strict';
var V = window.Vesco;
  var t = V.t,
      locCard = V.locCard,
      locSign = V.locSign,
      meaning = V.meaning,
      cards = V.cards,
      zodiac = V.zodiac,
      glyph = V.glyph,
      signPath = V.signPath,
      streak = V.streak,
      calculate = V.calculate,
      userSign = V.userSign,
      onLanguageChange = V.onLanguageChange;

const $ = (sel) => document.querySelector(sel);
const chip = (s) => `<span class="v-chip">${s}</span>`;
const row = (k, v, accent) =>
  `<div class="v-row"><dt>${k}</dt><dd${accent ? ' class="text-clay"' : ''}>${v}</dd></div>`;

const res = calculate('Anna Marie Vesely', '1994-07-19');

function render() {
  const T = t();
  const daily = locCard(cards().find(c => c.id === 'nine-wands'));
  const sign = locSign(zodiac().find(z => z.sign === userSign()) || zodiac()[6]);
  const m = meaning(res.lifePath);

  $('[data-hero-title]').innerHTML =
    `${T.heroTitle[0]}<br>${T.heroTitle[1]}<br><span class="text-clay">${T.heroTitle[2]}</span>`;

  $('[data-daily-name]').textContent = daily.name;
  $('[data-daily-suit]').textContent = daily.suit;
  $('[data-daily-upright]').textContent = daily.upright;
  $('[data-daily-reversed]').textContent = daily.reversed;
  $('[data-daily-keywords]').innerHTML = daily.keywords.map(chip).join('');
  $('[data-daily-record]').innerHTML = [
    row(T.arcana, daily.suit), row(T.element, daily.element), row(T.ruler, daily.ruler),
    row(T.yesNo, daily.yes, true), row(T.czechTitle, daily.czech)
  ].join('');

  const save = $('[data-save-daily]');
  save.textContent = save.dataset.saved === 'true' ? T.savedReading : T.saveReading;

  $('[data-sky-card]').innerHTML = `
    <div class="shrink-0 text-center">
      <div class="grid h-24 w-24 place-items-center rounded-tile border border-[--edge] rotate-45">
        <span class="-rotate-45">${glyph(userSign(), 38, 1.2)}</span>
      </div>
      <p class="mt-5 font-display text-[19px] uppercase tracking-[.12em]">${sign.sign}</p>
      <p class="mt-1.5 font-mono text-[10px] tracking-[.1em] text-muted">${sign.dates}</p>
    </div>
    <div class="min-w-0 flex-1 basis-60">
      <p class="v-label mb-3.5">${T.mood} · ${sign.mood}</p>
      <p class="mb-5 font-display text-[22px] leading-relaxed">${sign.daily}</p>
      <dl class="m-0 flex flex-wrap gap-7 border-t border-[--rule-2] pt-4">
        <div><dt class="text-[10px] uppercase tracking-label text-muted">${T.element}</dt><dd class="m-0 mt-1 text-sm">${sign.element}</dd></div>
        <div><dt class="text-[10px] uppercase tracking-label text-muted">${T.mode}</dt><dd class="m-0 mt-1 text-sm">${sign.mode}</dd></div>
        <div><dt class="text-[10px] uppercase tracking-label text-muted">${T.ruler}</dt><dd class="m-0 mt-1 text-sm">${sign.ruler}</dd></div>
      </dl>
    </div>`;

  $('[data-transits]').innerHTML = ['14:20', '3° △', 'Rx', '92%'].map((code, i) => `
    <li class="flex items-baseline gap-3.5 border-t border-[--rule-2] py-3">
      <span class="w-14 shrink-0 font-mono text-xs text-clay">${code}</span>
      <span class="text-sm text-ink70">${T.transits[i]}</span>
    </li>`).join('');

  $('[data-teaser-num]').textContent = res.lifePath;
  $('[data-teaser-title]').textContent = m.title;
  $('[data-teaser-line]').textContent = m.line;

  $('[data-cta-title]').innerHTML =
    `${T.ctaTitle[0]}<br><span class="text-muted">${T.ctaTitle[1]}</span>`;

  $('[data-streak-days]').textContent = streak.days;
  $('[data-streak-week]').innerHTML = streak.week.map((on, i) => `
    <div class="w-[34px] text-center">
      <p class="mb-2 font-mono text-[9px] tracking-[.1em] text-muted">${T.days[i]}</p>
      <div class="h-[34px] rounded-[10px] border border-[--edge]" style="background:${on ? 'var(--clay)' : 'transparent'}"></div>
    </div>`).join('');
}

document.querySelector('[data-save-daily]').addEventListener('click', (e) => {
  const b = e.currentTarget;
  b.dataset.saved = b.dataset.saved === 'true' ? 'false' : 'true';
  b.textContent = b.dataset.saved === 'true' ? t().savedReading : t().saveReading;
});

onLanguageChange(render);
render();

/* Admin-authored card packs (CardPacks/Cards in Payload) are a separate,
   additive system — see src/lib/vescoCardLoader.ts. render() above always
   shows the classic deck's placeholder "today's card" first, unchanged, so
   this page behaves exactly as before for anyone with no packs, or if the
   CMS is unreachable. If a pack IS available, this swaps its first card in
   afterward — same "bundled defaults first, CMS overrides async" pattern as
   cms-merge.js. */
function whenCardLoaderReady(cb) {
  if (window.VescoCardLoader) { cb(window.VescoCardLoader); return; }
  window.addEventListener('vesco:cardloader-ready', function once() {
    window.removeEventListener('vesco:cardloader-ready', once);
    cb(window.VescoCardLoader);
  });
}

function currentLang() {
  return document.documentElement.lang === 'cs' ? 'cs' : 'en';
}

function showCmsDailyCard(loader) {
  const lang = currentLang();
  loader.getActivePackId().then((activeId) => (
    activeId != null
      ? loader.loadCardPack(activeId, lang)
      : loader.getCardPacks(lang).then((packs) => packs.length ? loader.loadCardPack(packs[0].id, lang) : null)
  )).then((loaded) => {
    if (!loaded || !loaded.cards.length) return; // no pack available — classic card stands
    const card = loaded.cards[0];
    const T = t();

    const img = $('[data-daily-art]');
    if (img && card.imageUrl) { img.src = card.imageUrl; img.alt = card.name; }
    $('[data-daily-name]').textContent = card.name;
    $('[data-daily-suit]').textContent = loaded.pack.name;
    $('[data-daily-upright]').textContent = card.meaningUpright || '';
    $('[data-daily-reversed]').textContent = card.meaningReversed || '';
    $('[data-daily-keywords]').innerHTML = card.tags.map(chip).join('');
    $('[data-daily-record]').innerHTML = [
      row(T.arcana, loaded.pack.name), row(T.element, '—'), row(T.ruler, '—'),
      row(T.yesNo, '—', true), row(T.czechTitle, '—')
    ].join('');
  }).catch(() => { /* CMS unreachable — classic card stands */ });
}

onLanguageChange(() => whenCardLoaderReady(showCmsDailyCard));
whenCardLoaderReady(showCmsDailyCard);
})();
