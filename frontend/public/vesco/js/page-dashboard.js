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
      streak = V.streak,
      calculate = V.calculate,
      savedReadings = V.savedReadings,
      plural = V.plural,
      favourites = V.favourites,
      userSign = V.userSign,
      onLanguageChange = V.onLanguageChange;

const $ = (s) => document.querySelector(s);
const res = calculate('Anna Marie Vesely', '1994-07-19');

function render() {
  const T = t();
  const m = meaning(res.lifePath);
  const sign = locSign(zodiac().find(z => z.sign === userSign()) || zodiac()[6]);
  const log = savedReadings();

  const stat = (label, value, note) => `
    <div>
      <p class="m-0 text-[10px] uppercase tracking-label text-muted">${label}</p>
      <p class="m-0 mt-2.5 font-display text-[42px] leading-none">${value}</p>
      <p class="m-0 mt-1 text-xs text-ink50">${note}</p>
    </div>`;

  $('[data-stats]').innerHTML =
    stat(T.streak, streak.days, T.bestDays.replace('{n}', streak.best)) +
    stat(T.readingsSaved, log.length, T.thisMonth) +
    stat(T.favSuit, T.suitWands, T.suitNote) +
    stat(T.lifePath, res.lifePath, m.title);

  $('[data-entries]').textContent = `${log.length} ${plural(log.length, T.entries)}`;
  $('[data-log]').innerHTML = log.map(r => `
    <li class="grid items-baseline gap-5 border-b border-[--rule-2] py-5 [grid-template-columns:66px_minmax(150px,190px)_minmax(180px,1fr)]">
      <span class="font-mono text-xs text-muted">${r.date}</span>
      <span>
        <span class="block font-display text-lg">${r.card}</span>
        <span class="mt-1 block text-[11px] uppercase tracking-[.12em] text-muted">${r.spread}</span>
      </span>
      <span class="text-sm leading-relaxed text-ink70">${r.note}</span>
    </li>`).join('');

  $('[data-favs]').innerHTML = favourites()
    .map(id => cards().find(c => c.id === id)).filter(Boolean).map(locCard)
    .map(c => `
      <a href="tarot.html" class="block text-ink hover:opacity-80">
        <img src="${c.art}" alt="${c.name}" loading="lazy" width="120" height="174" class="v-card-art">
        <span class="mt-2.5 block font-display text-xs uppercase tracking-[.1em] leading-snug">${c.name}</span>
      </a>`).join('');

  $('[data-profile]').innerHTML = `
    <p class="v-label mb-6">${T.zodiacProfile}</p>
    <div class="mb-7 flex items-center gap-5">
      <div class="grid h-[74px] w-[74px] shrink-0 rotate-45 place-items-center rounded-tile border border-[--edge]">
        <span class="-rotate-45">${glyph(userSign(), 38, 1.2)}</span>
      </div>
      <div>
        <p class="m-0 font-display text-[26px] uppercase tracking-[.08em]">${sign.sign}</p>
        <p class="m-0 mt-1 font-mono text-[10px] text-muted">${sign.dates}</p>
      </div>
    </div>
    <dl class="m-0">
      <div class="v-row"><dt>${T.sun}</dt><dd>${sign.sign} 12°</dd></div>
      <div class="v-row"><dt>${T.moon}</dt><dd>${T.moonPos}</dd></div>
      <div class="v-row"><dt>${T.rising}</dt><dd>${T.risingPos}</dd></div>
    </dl>
    <a href="horoscope.html" class="v-btn v-btn--outline mt-6 w-full">${T.readThisWeek}</a>`;

  $('[data-week]').innerHTML = streak.week.map((on, i) => `
    <div class="flex-1 text-center">
      <p class="mb-2 font-mono text-[9px] text-muted">${T.days[i]}</p>
      <div class="h-10 rounded-[10px] border border-[--edge]" style="background:${on ? 'var(--clay)' : 'transparent'}"></div>
    </div>`).join('');
}

onLanguageChange(render);
render();
})();
