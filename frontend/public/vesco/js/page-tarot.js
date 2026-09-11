/* Classic script — depends on window.Vesco (app.js). */
(function () {
'use strict';
var V = window.Vesco;
  var t = V.t,
      locCard = V.locCard,
      cards = V.cards,
      plural = V.plural,
      favourites = V.favourites,
      toggleFavourite = V.toggleFavourite,
      onLanguageChange = V.onLanguageChange;

const $ = (s) => document.querySelector(s);
const grid = $('[data-grid]');
const detail = $('[data-detail]');
const stage = $('[data-shuffle-stage]');

let filter = 'All';
let selId = null;
let orient = 'upright';
let timer;

const FILTERS = ['All', 'Major', 'Wands', 'Pentacles'];
const list = () => filter === 'All'
  ? cards()
  : cards().filter(c => filter === 'Major' ? c.arcana === 'Major' : c.suit === filter);

function renderFilters() {
  const T = t();
  $('[data-filters]').innerHTML = FILTERS.map(f => `
    <button type="button" class="v-chip cursor-pointer transition-colors"
            style="${f === filter ? 'background:var(--ink);color:var(--parchment);border-color:var(--ink)' : ''}"
            data-filter="${f}">${T.filters[f]}</button>`).join('');
}

function renderGrid() {
  const items = list();
  $('[data-count]').textContent = `${items.length} ${plural(items.length, t().cardsUnit)}`;
  grid.innerHTML = items.map(locCard).map(c => `
    <button type="button" class="v-deck-tile block w-full border-0 bg-transparent p-0 text-left" data-card="${c.id}">
      <img src="${c.art}" alt="${c.name}" loading="lazy" width="200" height="290" class="v-card-art">
      <span class="mt-3.5 flex items-baseline justify-between gap-2 border-t border-[--rule] pt-3">
        <span class="font-display text-sm uppercase tracking-[.1em] leading-snug">${c.name}</span>
        <span class="font-mono text-[10px] text-muted">${c.num}</span>
      </span>
    </button>`).join('');
}

function renderDetail() {
  if (!selId) { detail.classList.add('hidden'); detail.classList.remove('grid'); return; }
  const T = t();
  const c = locCard(cards().find(x => x.id === selId));
  const fav = favourites().includes(c.id);
  const text = orient === 'reversed' ? c.reversed : c.upright;

  detail.classList.remove('hidden');
  detail.classList.add('grid');
  detail.innerHTML = `
    <div class="v-anim-flip">
      <img src="${c.art}" alt="${c.name}" width="340" height="493"
           class="v-card-art shadow-[0_26px_46px_-30px_rgba(34,26,19,.5)]">
      <p class="mt-3.5 text-center font-mono text-[10px] uppercase tracking-wide2 text-muted">${c.czech}</p>
    </div>
    <div>
      <div class="mb-2 flex items-baseline justify-between gap-3.5">
        <p class="m-0 font-mono text-[11px] uppercase tracking-[.2em] text-muted">${c.suit} · ${c.num}</p>
        <button type="button" class="border-0 bg-transparent text-xl leading-none text-muted hover:text-ink" data-close aria-label="Close">×</button>
      </div>
      <h2 class="mb-5 font-display text-[clamp(30px,3.4vw,46px)] font-normal">${c.name}</h2>
      <div class="mb-7 flex flex-wrap gap-2.5">${c.keywords.map(k => `<span class="v-chip">${k}</span>`).join('')}</div>
      <div class="v-toggle mb-6">
        <button type="button" data-orient="upright" aria-pressed="${orient === 'upright'}">${T.upright}</button>
        <button type="button" data-orient="reversed" aria-pressed="${orient === 'reversed'}">${T.reversed}</button>
      </div>
      <p class="mb-8 font-display text-[25px] leading-snug">${text}</p>
      <dl class="mb-7 grid gap-px overflow-hidden rounded-art border border-[--rule-2] bg-[--rule-2] [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
        ${[[T.element, c.element], [T.ruler, c.ruler], [T.yesNo, c.yes]].map(([k, v], i) => `
          <div class="bg-card px-5 py-4">
            <dt class="text-[10px] uppercase tracking-label text-muted">${k}</dt>
            <dd class="m-0 mt-1.5 font-mono text-sm${i === 2 ? ' text-clay' : ''}">${v}</dd>
          </div>`).join('')}
      </dl>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="v-btn v-btn--outline" data-fav>${fav ? T.inFav : T.addFav}</button>
        <button type="button" class="v-btn text-muted hover:text-ink" data-shuffle>${T.pullAnother}</button>
      </div>
    </div>`;
}

function shuffle() {
  selId = null;
  renderDetail();
  stage.classList.remove('hidden');
  stage.classList.add('grid');
  clearTimeout(timer);
  timer = setTimeout(() => {
    const pool = list().length ? list() : cards();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    stage.classList.add('hidden');
    stage.classList.remove('grid');
    selId = pick.id;
    orient = Math.random() > 0.72 ? 'reversed' : 'upright';
    renderDetail();
  }, 1500);
}

document.addEventListener('click', (e) => {
  const f = e.target.closest('[data-filter]');
  if (f) { filter = f.dataset.filter; renderFilters(); renderGrid(); return; }

  const card = e.target.closest('[data-card]');
  if (card) { selId = card.dataset.card; orient = 'upright'; renderDetail(); return; }

  if (e.target.closest('[data-shuffle]')) { shuffle(); return; }
  if (e.target.closest('[data-close]')) { selId = null; renderDetail(); return; }

  const o = e.target.closest('[data-orient]');
  if (o) { orient = o.dataset.orient; renderDetail(); return; }

  if (e.target.closest('[data-fav]') && selId) { toggleFavourite(selId); renderDetail(); }
});

function renderAll() { renderFilters(); renderGrid(); renderDetail(); }
onLanguageChange(renderAll);
renderAll();
})();
