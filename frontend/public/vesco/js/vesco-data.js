/* Vesco data (EN). Classic script — exposes window.VescoData. */
(function () {
'use strict';
// Vesco — shared content + calculation logic. No styling here.

const CARDS = [
  { id: 'the-sun', num: 'XIX', name: 'The Sun', czech: 'Slunce', arcana: 'Major', suit: 'Major Arcana', art: '/vesco/img/cards/the-sun.jpg',
    keywords: ['Clarity', 'Vitality', 'Arrival'],
    upright: 'Warmth without conditions. The Sun is the moment the fog lifts and you can finally see the shape of the thing you were afraid of. Say the true thing out loud today — you will be met well.',
    reversed: 'Brightness you are performing rather than feeling. Rest before you shine for anyone else.',
    element: 'Fire', ruler: 'Sun', yes: 'Yes' },
  { id: 'judgement', num: 'XX', name: 'Judgement', czech: 'Soud', arcana: 'Major', suit: 'Major Arcana', art: '/vesco/img/cards/judgement.jpg',
    keywords: ['Reckoning', 'Awakening', 'Choice'],
    upright: 'A call you have already heard. Judgement asks you to stop waiting for permission and answer honestly — the reckoning is gentler than the delay.',
    reversed: 'Self-judgement dressed as discernment. Loosen the verdict you passed on your younger self.',
    element: 'Fire', ruler: 'Pluto', yes: 'Yes, with conditions' },
  { id: 'ace-pentacles', num: 'I', name: 'Ace of Pentacles', czech: 'Eso pentaklů', arcana: 'Minor', suit: 'Pentacles', art: '/vesco/img/cards/ace-pentacles.jpg',
    keywords: ['Seed', 'Offer', 'Ground'],
    upright: 'Something material is being handed to you — small, unglamorous, real. Take it and plant it. Roots today, harvest much later.',
    reversed: 'An opportunity held but not planted. Choose the soil before the seed dries out.',
    element: 'Earth', ruler: 'Taurus', yes: 'Yes' },
  { id: 'king-wands', num: 'XIV', name: 'King of Wands', czech: 'Král holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/king-wands.jpg',
    keywords: ['Command', 'Vision', 'Build'],
    upright: 'You know what to build and you know who to ask. Lead from the front today — your certainty is the useful part, not your caution.',
    reversed: 'Heat spent on being right. Convince by building, not by arguing.',
    element: 'Fire', ruler: 'Sagittarius', yes: 'Yes' },
  { id: 'queen-wands', num: 'XIII', name: 'Queen of Wands', czech: 'Královna holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/queen-wands.jpg',
    keywords: ['Warmth', 'Presence', 'Magnetism'],
    upright: 'Steady heat rather than a flare. You do not have to chase what you want today — hold your ground warmly and it will come to sit beside you.',
    reversed: 'Warmth given outward until nothing is left inward. Keep one flame for yourself.',
    element: 'Fire', ruler: 'Aries', yes: 'Yes' },
  { id: 'page-wands', num: 'XI', name: 'Page of Wands', czech: 'Páže holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/page-wands.jpg',
    keywords: ['News', 'Beginning', 'Curiosity'],
    upright: 'A message arrives and it is more interesting than useful — follow it anyway. Beginner energy is an advantage right now, not an embarrassment.',
    reversed: 'Enthusiasm scattered across too many starts. Pick one and let the rest wait.',
    element: 'Fire', ruler: 'Fire in Fire', yes: 'Yes, tentatively' },
  { id: 'four-wands', num: 'IV', name: 'Four of Wands', czech: 'Čtyřka holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/four-wands.jpg',
    keywords: ['Home', 'Celebration', 'Threshold'],
    upright: 'A structure holds and you are safe under it. Mark the milestone — even quietly, even alone. Stability that goes uncelebrated stops feeling like stability.',
    reversed: 'A celebration you are hosting for others. Ask what a homecoming would look like for you.',
    element: 'Fire', ruler: 'Venus in Aries', yes: 'Yes' },
  { id: 'five-wands', num: 'V', name: 'Five of Wands', czech: 'Pětka holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/five-wands.jpg',
    keywords: ['Friction', 'Competition', 'Noise'],
    upright: 'Five people, five good ideas, no conductor. The conflict is not personal and it is not fatal — it is simply unorganised energy. Name the goal and the scuffle resolves.',
    reversed: 'Conflict avoided into resentment. A short honest disagreement is cheaper than a long polite one.',
    element: 'Fire', ruler: 'Saturn in Leo', yes: 'Not yet' },
  { id: 'seven-wands', num: 'VII', name: 'Seven of Wands', czech: 'Sedmička holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/seven-wands.jpg',
    keywords: ['Defence', 'Conviction', 'Ground held'],
    upright: 'You are standing on something you built and someone wants a piece of it. You are allowed to say no plainly, once, without a paragraph of justification.',
    reversed: 'Defending ground you no longer want. Check whether the hill is still yours.',
    element: 'Fire', ruler: 'Mars in Leo', yes: 'Yes, if you hold firm' },
  { id: 'nine-wands', num: 'IX', name: 'Nine of Wands', czech: 'Devítka holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/nine-wands.jpg',
    keywords: ['Resilience', 'Almost', 'Guard'],
    upright: 'Tired but still upright, which is its own kind of victory. One more push — but do it rested. The last stretch rewards patience, not adrenaline.',
    reversed: 'Armour worn indoors. Let one person past the fence this week.',
    element: 'Fire', ruler: 'Moon in Sagittarius', yes: 'Yes, with effort' },
  { id: 'ten-wands', num: 'X', name: 'Ten of Wands', czech: 'Desítka holí', arcana: 'Minor', suit: 'Wands', art: '/vesco/img/cards/ten-wands.jpg',
    keywords: ['Burden', 'Nearly home', 'Delegate'],
    upright: 'You are carrying all ten because you never asked which two were not yours. The town is in sight. Put something down before the last hill.',
    reversed: 'Collapse before completion. Release, do not abandon — there is a difference.',
    element: 'Fire', ruler: 'Sun in Sagittarius', yes: 'Yes, at a cost' }
];

const ZODIAC = [
  { sign: 'Aries', glyph: '♈', dates: 'Mar 21 – Apr 19', element: 'Fire', mode: 'Cardinal', ruler: 'Mars', mood: 'Momentum',
    daily: 'Start the thing badly. Aries progress is made in first drafts, and today the appetite is bigger than the plan — let it be.',
    weekly: 'Mars gives you a clean run through midweek, then asks for maintenance. Front-load anything that needs courage, and leave Friday for repair.',
    monthly: 'A month of returns on work you started impatiently. What felt reckless in spring reads as decisive now. Protect your sleep; that is the whole strategy.' },
  { sign: 'Taurus', glyph: '♉', dates: 'Apr 20 – May 20', element: 'Earth', mode: 'Fixed', ruler: 'Venus', mood: 'Steadying',
    daily: 'Comfort is information today, not indulgence. Notice what your body relaxes around and take that seriously.',
    weekly: 'Money and worth blur this week. Ask what you charge for and what you quietly give away. One adjustment is enough.',
    monthly: 'Slow consolidation. Nothing dramatic arrives, but by month end the ground you stand on is measurably wider.' },
  { sign: 'Gemini', glyph: '♊', dates: 'May 21 – Jun 20', element: 'Air', mode: 'Mutable', ruler: 'Mercury', mood: 'Quickening',
    daily: 'Two conversations will contradict each other and both will be true. Hold them loosely and let the pattern show itself by evening.',
    weekly: 'Mercury favours writing over speaking. The thing you cannot explain out loud will clarify the moment you draft it.',
    monthly: 'A month of editing rather than gathering. Fewer inputs, better sentences. Say no to three things and the fourth becomes possible.' },
  { sign: 'Cancer', glyph: '♋', dates: 'Jun 21 – Jul 22', element: 'Water', mode: 'Cardinal', ruler: 'Moon', mood: 'Tender',
    daily: 'Your instinct is early, not wrong. Give it a day before you act, then act without apology.',
    weekly: 'Home is the lever this week — a rearranged room changes more than a rearranged schedule.',
    monthly: 'Old feeling surfaces with new perspective attached. This is not regression; it is a second, kinder pass at the same material.' },
  { sign: 'Leo', glyph: '♌', dates: 'Jul 23 – Aug 22', element: 'Fire', mode: 'Fixed', ruler: 'Sun', mood: 'Radiant',
    daily: 'Be seen doing something imperfectly. Today the generosity is in the visibility, not the polish.',
    weekly: 'Recognition arrives sideways — through a colleague, not a spotlight. Accept it plainly.',
    monthly: 'Creative appetite returns after a flat stretch. Make the unnecessary thing; it pays for itself in energy.' },
  { sign: 'Virgo', glyph: '♍', dates: 'Aug 23 – Sep 22', element: 'Earth', mode: 'Mutable', ruler: 'Mercury', mood: 'Precise',
    daily: 'One system, fixed properly, will buy back an hour a day. Choose the smallest broken thing.',
    weekly: 'The urge to refine is high and the returns are diminishing. Ship at 90% and let the last 10% teach you in public.',
    monthly: 'A month for maintenance made visible. Document what you do; the record is the raise.' },
  { sign: 'Libra', glyph: '♎', dates: 'Sep 23 – Oct 22', element: 'Air', mode: 'Cardinal', ruler: 'Venus', mood: 'Weighing',
    daily: 'A decision is waiting on your preference, not more data. State it and the room will follow.',
    weekly: 'Balance is not equal effort — it is correct effort. Rebalance one relationship rather than all of them.',
    monthly: 'Partnership themes sharpen. What was implicit gets said, and the clarity is a relief on both sides.' },
  { sign: 'Scorpio', glyph: '♏', dates: 'Oct 23 – Nov 21', element: 'Water', mode: 'Fixed', ruler: 'Pluto', mood: 'Deepening',
    daily: 'You already know. The work today is choosing what to do with the knowing, gently.',
    weekly: 'Something ends without ceremony this week. Give it one, privately — endings you skip come back for attention.',
    monthly: 'Power returns through disclosure. One honest sentence dissolves a month of strategy.' },
  { sign: 'Sagittarius', glyph: '♐', dates: 'Nov 22 – Dec 21', element: 'Fire', mode: 'Mutable', ruler: 'Jupiter', mood: 'Expanding',
    daily: 'Distance clarifies. A walk, a different room, a longer view — then the decision is obvious.',
    weekly: 'Jupiter opens a door that requires you to leave something behind. Both halves are the offer.',
    monthly: 'Study over travel this month. The horizon you want is intellectual, and it starts with one difficult book.' },
  { sign: 'Capricorn', glyph: '♑', dates: 'Dec 22 – Jan 19', element: 'Earth', mode: 'Cardinal', ruler: 'Saturn', mood: 'Building',
    daily: 'Ambition is quiet today. Do the unglamorous hour and let the ledger notice.',
    weekly: 'Saturn rewards a boundary, not a sprint. Say when you stop, out loud, and keep it once.',
    monthly: 'Structural month. Something you have been carrying informally becomes official — title, contract, or agreement.' },
  { sign: 'Aquarius', glyph: '♒', dates: 'Jan 20 – Feb 18', element: 'Air', mode: 'Fixed', ruler: 'Uranus', mood: 'Reframing',
    daily: 'The odd idea is the correct one. Test it small before you defend it large.',
    weekly: 'Community pulls this week. Contribute the thing only you would think to make.',
    monthly: 'A month of useful detachment. Step back far enough and the system you are inside becomes editable.' },
  { sign: 'Pisces', glyph: '♓', dates: 'Feb 19 – Mar 20', element: 'Water', mode: 'Mutable', ruler: 'Neptune', mood: 'Dreaming',
    daily: 'Porous is not weak. Filter your inputs today and your intuition sharpens by itself.',
    weekly: 'Creative and compassionate work overlap. Do not price the first as if it were the second.',
    monthly: 'Neptune softens deadlines and heightens meaning. Keep one hard structure so the month has a shape to dream inside.' }
];

const NUM_MEANINGS = {
  1: { title: 'The Initiator', line: 'Independence, invention, the first step. You are built to begin things and to be uncomfortable in committees.', strengths: ['Self-starting', 'Original', 'Decisive'], growth: 'Ask for help before it is urgent.' },
  2: { title: 'The Diplomat', line: 'Sensitivity, partnership, pace. You read the room before you enter it and hold groups together without being asked.', strengths: ['Perceptive', 'Patient', 'Cooperative'], growth: 'State your own preference first, not last.' },
  3: { title: 'The Communicator', line: 'Expression, humour, contagion. Ideas move faster when they pass through you.', strengths: ['Expressive', 'Social', 'Inventive'], growth: 'Finish one thing before naming the next three.' },
  4: { title: 'The Builder', line: 'Structure, craft, reliability. You make things that hold, and you notice when they do not.', strengths: ['Methodical', 'Trustworthy', 'Grounded'], growth: 'Leave one plan deliberately unfinished.' },
  5: { title: 'The Explorer', line: 'Freedom, appetite, change. Routine dulls you; variety is a requirement, not a vice.', strengths: ['Adaptable', 'Curious', 'Quick'], growth: 'Commit to one thing long enough to get bored, then past it.' },
  6: { title: 'The Guardian', line: 'Care, responsibility, beauty. People bring you their weight because you can carry it.', strengths: ['Nurturing', 'Loyal', 'Aesthetic'], growth: 'Care is not a debt others owe back — release the ledger.' },
  7: { title: 'The Seeker', line: 'Analysis, solitude, depth. You would rather understand it than announce it.',
    strengths: ['Analytical', 'Intuitive', 'Independent'], growth: 'Share the half-formed thought; solitude has diminishing returns.' },
  8: { title: 'The Architect', line: 'Authority, scale, material mastery. You think in systems and outcomes and you are comfortable with power.', strengths: ['Strategic', 'Resilient', 'Ambitious'], growth: 'Measure something other than output this month.' },
  9: { title: 'The Humanitarian', line: 'Compassion, completion, perspective. You see the whole arc, which makes small setbacks bearable.', strengths: ['Generous', 'Wise', 'Forgiving'], growth: 'Let someone finish something for you.' },
  11: { title: 'The Illuminator', line: 'A master number. Heightened intuition and nervous brilliance — a 2 lit from inside.', strengths: ['Visionary', 'Empathic', 'Inspiring'], growth: 'Ground the signal: sleep, food, routine.' },
  22: { title: 'The Master Builder', line: 'A master number. The vision of an 11 with the hands of a 4 — able to make the improbable practical.', strengths: ['Far-sighted', 'Capable', 'Steady'], growth: 'Scale slowly; the vision is not going anywhere.' },
  33: { title: 'The Teacher', line: 'A master number. Care raised to a craft — service without martyrdom, if you are careful.', strengths: ['Compassionate', 'Articulate', 'Devoted'], growth: 'Teach by example, then rest.' }
};

const VOWELS = 'AEIOU';
const LETTER = { A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8 };

function reduce(n, keepMaster) {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n).split('').reduce((a, d) => a + +d, 0);
  }
  return n;
}
const digitsOf = (s) => String(s).replace(/\D/g, '').split('').map(Number);

function meaning(n) { return NUM_MEANINGS[n] || NUM_MEANINGS[reduce(n, false)]; }

function calculate(name, date) {
  const clean = (name || '').toUpperCase().replace(/[^A-Z ]/g, '');
  const letters = clean.replace(/ /g, '').split('');
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  const lifePathRaw = sum(digitsOf(date));
  const lifePath = reduce(lifePathRaw, true);
  const expression = reduce(sum(letters.map(c => LETTER[c] || 0)), true);
  const soul = reduce(sum(letters.filter(c => VOWELS.includes(c)).map(c => LETTER[c])), true);
  const personality = reduce(sum(letters.filter(c => !VOWELS.includes(c)).map(c => LETTER[c])), true);
  const [y, m, d] = (date || '').split('-').map(Number);
  const birthday = d ? reduce(d, true) : null;
  const maturity = reduce(lifePath + expression, true);
  const year = d ? reduce(sum(digitsOf(`${m}${d}`)) + sum(digitsOf(new Date().getFullYear())), false) : null;

  return {
    ok: !!(letters.length && digitsOf(date).length === 8),
    lifePath, expression, soul, personality, birthday, maturity, year,
    lifePathRaw,
    letterMap: letters.map(c => ({ c, v: LETTER[c] || 0, vowel: VOWELS.includes(c) })),
    meaning: meaning(lifePath)
  };
}

const SAVED = [
  { date: 'Sep 6', spread: 'Daily pull', card: 'Nine of Wands', note: 'Tired but upright. Rested before the last push.' },
  { date: 'Sep 3', spread: 'Three-card — past / present / next', card: 'Four of Wands', note: 'Signed the lease. Marked it with dinner.' },
  { date: 'Aug 28', spread: 'Daily pull', card: 'Page of Wands', note: 'The odd email turned into the interesting one.' },
  { date: 'Aug 24', spread: 'Decision spread', card: 'Seven of Wands', note: 'Said no, once, plainly. It held.' }
];

const STREAK = { days: 18, best: 31, week: [true, true, true, false, true, true, true] };

// Abstract geometric zodiac marks — 24×24 viewBox, stroke-only.
const SIGN_PATH = {
  Aries: 'M4 19c0-7 2.2-10.5 5-10.5 2 0 3 1.8 3 3.8M20 19c0-7-2.2-10.5-5-10.5-2 0-3 1.8-3 3.8',
  Taurus: 'M12 22a4.6 4.6 0 100-9.2 4.6 4.6 0 000 9.2M4 3c0 4.8 3.6 8 8 8s8-3.2 8-8',
  Gemini: 'M6 4h12M6 20h12M9.5 4v16M14.5 4v16',
  Cancer: 'M3 9c3.5-4 11-4 14.5-.5M21 15c-3.5 4-11 4-14.5.5M6 7.5a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4M18 12.1a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4',
  Leo: 'M7 19a3.6 3.6 0 007.2 0c0-2-1.6-3-1.6-5M7 19c-2 0-3.4-1.6-3.4-3.6 0-2.6 2.2-4 4.4-4M8 11.4c-1.4-1.2-1.6-3-.6-4.4 1.2-1.8 4-1.8 5.2 0 1 1.6.4 3.6-1 4.6',
  Virgo: 'M4 7v11M9 7v11M14 7v9M4 7a2.2 2.2 0 014.9 0M9 7a2.2 2.2 0 014.9 0M14 16c0 3.6 3 5.4 6 3.4M17 8.2c2.2 0 3.6 2 3.6 5 0 3.6-1.4 6-3.6 7',
  Libra: 'M3 19.5h18M3 14.5h5.6a5.6 5.6 0 1110.8 0H21',
  Scorpio: 'M3 7v10M8 7v10M13 7v9M3 7a2.2 2.2 0 014.9 0M8 7a2.2 2.2 0 014.9 0M13 16a3 3 0 006 0v-3M19 13l2.2 2.2M19 13l-2 2.2',
  Sagittarius: 'M5.5 18.5L19 5M11.5 5H19v7.5M4.5 12.5l7 7',
  Capricorn: 'M3 7.5c3.2-3 6.4 0 6.4 4.2V19M9.4 11.7c1.6-4 6-4.4 7.6-.8a3.6 3.6 0 01-4.6 4.8',
  Aquarius: 'M3 9.5l3.2-3.2 3.2 3.2 3.2-3.2 3.2 3.2 3.2-3.2M3 16.5l3.2-3.2 3.2 3.2 3.2-3.2 3.2 3.2 3.2-3.2',
  Pisces: 'M6.5 4c-3.6 5-3.6 11 0 16M17.5 4c3.6 5 3.6 11 0 16M4 12h16'
};

window.VescoData = { CARDS, ZODIAC, SIGN_PATH, SAVED, STREAK, calculate, meaning };
})();
