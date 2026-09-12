/* Classic script — depends on window.Vesco (app.js). */
(function () {
'use strict';
var V = window.Vesco;
  var t = V.t,
      meaning = V.meaning,
      calculate = V.calculate,
      onLanguageChange = V.onLanguageChange;

const $ = (s) => document.querySelector(s);
const form = $('[data-form]');
let res = calculate('Anna Marie Vesely', '1994-07-19');

function render() {
  const T = t();
  const m = meaning(res.lifePath);

  $('[data-result]').innerHTML = `
    <p class="m-0 text-center">
      <span class="block font-display text-[clamp(76px,9vw,130px)] leading-[.9] text-clay">${res.lifePath}</span>
      <span class="mt-5 block font-mono text-[10px] uppercase tracking-[.2em] text-muted">${T.lifePath}</span>
    </p>
    <div>
      <p class="v-label mb-3">${form.date.value} → ${res.lifePathRaw} → ${res.lifePath}</p>
      <h2 class="mb-4 font-display text-[clamp(28px,3vw,40px)] font-normal">${m.title}</h2>
      <p class="mb-6 text-base leading-relaxed text-ink70">${m.line}</p>
      <div class="flex flex-wrap gap-2.5">${m.strengths.map(s => `<span class="v-chip">${s}</span>`).join('')}</div>
    </div>`;

  const vals = [res.expression, res.soul, res.personality, res.birthday, res.maturity, res.year];
  $('[data-blocks]').innerHTML = T.blocks.map((b, i) => `
    <div>
      <div class="mb-3.5 flex items-baseline justify-between gap-3">
        <span class="text-[10px] uppercase tracking-label text-muted">${b[0]}</span>
        <span class="font-display text-[38px] leading-[.8]">${vals[i]}</span>
      </div>
      <p class="mb-2 font-display text-lg">${meaning(vals[i]).title}</p>
      <p class="m-0 text-[13px] leading-relaxed text-ink50">${b[1]}</p>
    </div>`).join('');

  const barVals = [res.lifePath, res.expression, res.soul, res.personality];
  const total = barVals.reduce((a, b) => a + b, 0);
  $('[data-bars]').innerHTML = T.bars.map((label, i) => {
    const pct = Math.round((barVals[i] / total) * 100);
    return `
    <div class="mb-5">
      <div class="mb-2 flex items-baseline justify-between gap-3">
        <span class="text-sm">${label} ${barVals[i]}</span>
        <span class="font-mono text-xs text-muted">${pct}%</span>
      </div>
      <div class="v-bar"><span style="width:${pct}%"></span></div>
    </div>`;
  }).join('');

  $('[data-growth]').textContent = m.growth;

  $('[data-letters]').innerHTML = res.letterMap.map(l => `
    <div class="w-[34px] rounded-[10px] border border-[#E0D3B9] py-1.5 text-center"
         style="background:${l.vowel ? '#EFE0C4' : '#F7F1E4'}">
      <span class="block font-display text-[15px] leading-none">${l.c}</span>
      <span class="mt-1 block font-mono text-[9px] text-muted">${l.v}</span>
    </div>`).join('');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  res = calculate(form.name.value, form.date.value);
  if (res.ok) render();
});

onLanguageChange(render);
render();
})();
