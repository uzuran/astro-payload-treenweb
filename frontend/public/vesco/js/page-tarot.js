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

// Admin-authored card packs (CardPacks/Cards in Payload) are a separate,
// additive system — see src/lib/vescoCardLoader.ts. `activePack` is null
// (classic 78-card deck, everything below behaves exactly as before) or the
// currently-selected pack's cards, pre-mapped into the same shape as
// window.Vesco.cards() so renderGrid/renderDetail/shuffle need no branching
// beyond activeCards()/activeFavourites() themselves.
let activePack = null; // { id, favKey, cards: [...] } | null

function activeCards() {
  return activePack ? activePack.cards : cards();
}

function activeFavourites() {
  if (!activePack) return favourites();
  try {
    return JSON.parse(localStorage.getItem(activePack.favKey)) || [];
  } catch (e) {
    return [];
  }
}

function toggleActiveFavourite(id) {
  if (!activePack) return toggleFavourite(id);
  var f = activeFavourites();
  var next = f.indexOf(id) > -1 ? f.filter(function (x) { return x !== id; }) : f.concat([id]);
  try { localStorage.setItem(activePack.favKey, JSON.stringify(next)); } catch (e) { /* private mode */ }
  return next;
}

/** Maps a loaded CMS pack's cards onto the bundled deck's card shape (see
 * vesco-data.js's CARDS) so the render functions below don't need to know
 * the difference. Fields the pack has no equivalent for (element/ruler/a
 * yes-no reading, the classic deck's separate Czech title) get a neutral
 * placeholder rather than "undefined" showing up in the UI. */
function mapPackCards(loaded) {
  return loaded.cards.map(function (c) {
    return {
      id: String(c.id),
      num: c.order != null ? String(c.order) : '',
      name: c.name,
      czech: '',
      arcana: '',
      suit: loaded.pack.name,
      art: c.imageUrl || '',
      keywords: c.tags || [],
      upright: c.meaningUpright || '—',
      reversed: c.meaningReversed || '—',
      element: '—',
      ruler: '—',
      yes: '—',
    };
  });
}

const FILTERS = ['All', 'Major', 'Wands', 'Pentacles'];
const list = () => {
  // A pack's tags are free-form (not the classic deck's fixed taxonomy) —
  // the filter bar doesn't apply to it and is hidden by renderFilters().
  if (activePack) return activeCards();
  return filter === 'All'
    ? cards()
    : cards().filter(c => filter === 'Major' ? c.arcana === 'Major' : c.suit === filter);
};

function renderFilters() {
  if (activePack) { $('[data-filters]').innerHTML = ''; return; }
  const T = t();
  $('[data-filters]').innerHTML = FILTERS.map(f => `
    <button type="button" class="v-chip cursor-pointer transition-colors"
            style="${f === filter ? 'background:var(--ink);color:var(--parchment);border-color:var(--ink)' : ''}"
            data-filter="${f}">${T.filters[f]}</button>`).join('');
}

function renderGrid() {
  const items = list();
  $('[data-count]').textContent = `${items.length} ${plural(items.length, t().cardsUnit)}`;
  grid.innerHTML = items.map(activePack ? (c => c) : locCard).map(c => `
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
  const found = activeCards().find(x => x.id === selId);
  const c = activePack ? found : locCard(found);
  const fav = activeFavourites().includes(c.id);
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
    const pool = list().length ? list() : activeCards();
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

  if (e.target.closest('[data-fav]') && selId) { toggleActiveFavourite(selId); renderDetail(); }
});

function renderAll() { renderFilters(); renderGrid(); renderDetail(); }
onLanguageChange(renderAll);
renderAll();

/** window.VescoCardLoader (lib/vescoCardLoader.ts) is a Vite module script —
 * the browser always defers it until after this classic script has already
 * run, so it may not exist yet when we get here. */
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

function setupPackSwitcher(loader) {
  const row = $('[data-pack-switcher-row]');
  const select = $('[data-pack-switcher]');
  if (!row || !select) return;

  loader.getCardPacks(currentLang()).then((packs) => {
    if (!packs.length) return; // nothing published — stay hidden, no UI change
    packs.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = String(p.id);
      opt.textContent = p.name || p.slug;
      select.appendChild(opt);
    });
    row.classList.remove('hidden');
    row.classList.add('flex');
  }).catch(() => { /* CMS unreachable — stay hidden, classic deck unaffected */ });

  select.addEventListener('change', () => {
    const value = select.value;
    filter = 'All';
    selId = null;

    if (!value) {
      activePack = null;
      renderAll();
      return;
    }

    const id = Number(value);
    loader.loadCardPack(id, currentLang()).then((loaded) => {
      activePack = {
        id,
        favKey: loader.favoritesStorageKey(id),
        cards: mapPackCards(loaded),
      };
      renderAll();
    }).catch(() => {
      select.value = ''; // failed to load — fall back to Classic Tarot
      activePack = null;
      renderAll();
    });
  });
}

whenCardLoaderReady(setupPackSwitcher);
})();
