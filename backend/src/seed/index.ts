import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '@payload-config';
import { getPayload } from 'payload';

import { DEFAULT_LOCALE, supportedLocalesSeed } from '../locales';

const ADMIN_EMAIL = 'admin@treenweb.local';
const ADMIN_PASSWORD = 'nuzky999';

const DESCRIPTION =
  'FORMA — мужские стрижки, оформление бороды и классическое бритьё. Найди свою форму.';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src/seed -> repo root -> frontend/public (also the site's offline fallback image)
const HERO_IMAGE = path.resolve(dirname, '../../../frontend/public/hero.jpg');
const HERO_ALT = 'Барбер придаёт форму мужской стрижке ножницами и расчёской';

const payload = await getPayload({ config });

// ─── Admin user ────────────────────────────────────────────────────────────
const existingAdmin = await payload.find({
  collection: 'users',
  where: { email: { equals: ADMIN_EMAIL } },
  limit: 1,
});
if (existingAdmin.totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Dev Admin' },
  });
  payload.logger.info(`seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

// ─── Hero image (Media) — upload once, reuse on re-run ──────────────────────
let heroImageId: number | undefined;
const existingHeroImage = await payload.find({
  collection: 'media',
  where: { filename: { equals: 'hero.jpg' } },
  limit: 1,
});
if (existingHeroImage.docs[0]) {
  heroImageId = existingHeroImage.docs[0].id;
} else if (existsSync(HERO_IMAGE)) {
  const created = await payload.create({
    collection: 'media',
    data: { alt: HERO_ALT },
    filePath: HERO_IMAGE,
  });
  heroImageId = created.id;
  payload.logger.info('seeded media: hero.jpg');
} else {
  payload.logger.warn(`hero image not found at ${HERO_IMAGE} — hero photo left unset`);
}

// ─── Globals (idempotent — updateGlobal overwrites) ────────────────────────
await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    siteName: 'FORMA',
    tagline: 'Твоя форма. Твой характер.',
    description: DESCRIPTION,
    ticker: [{ word: 'СТРИЖКА' }, { word: 'БОРОДА' }, { word: 'ХАРАКТЕР' }],
    contact: {
      address: 'Пльзень, адрес барбершопа',
      phone: '',
      hoursWeekday: 'Пн–Пт · 10:00–20:00',
      hoursSaturday: 'Сб · 10:00–18:00',
      hoursSunday: 'Вс · выходной',
      mapUrl: '',
    },
    footerNote: '© 2026 FORMA. Демонстрационный шаблон.',
    defaultLocale: DEFAULT_LOCALE,
    supportedLocales: supportedLocalesSeed,
  },
});

await payload.updateGlobal({
  slug: 'navigation',
  data: {
    main: [
      { label: 'О нас', href: '#about' },
      { label: 'Услуги и цены', href: '#services' },
      { label: 'Мастера', href: '#team' },
      { label: 'Контакты', href: '#contacts' },
    ],
  },
});

await payload.updateGlobal({
  slug: 'hero',
  data: {
    eyebrowLeft: 'БАРБЕРШОП · МУЖСКАЯ ТЕРРИТОРИЯ',
    eyebrowRight: 'СТИЛЬ НАЧИНАЕТСЯ С ДЕТАЛЕЙ',
    headingLine1: 'ТВОЯ ФОРМА.',
    headingAccent: 'ТВОЙ ХАРАКТЕР.',
    introText: 'Точная стрижка. Чёткие линии.\nНичего лишнего — только то, что подходит тебе.',
    ctaLabel: 'Выбрать время',
    ctaHref: '#booking',
    sealText: 'F.',
    sealCaption: 'Классические техники. Современный взгляд.',
    photo: heroImageId ?? null,
    photoCaptionLeft: 'МАСТЕРСТВО В КАЖДОМ ДВИЖЕНИИ',
    photoCaptionRight: '01 / FORMA',
  },
});

await payload.updateGlobal({
  slug: 'services',
  data: {
    eyebrow: '01 / УСЛУГИ',
    heading: 'ХОРОШАЯ ФОРМА.\nЧЕСТНАЯ ЦЕНА.',
    note: 'Выбирай привычное или попробуй новое. С формой поможем определиться.',
    items: [
      {
        name: 'Мужская стрижка',
        description: 'Консультация, мытьё головы и укладка',
        duration: '60 мин',
        priceAmount: 600,
        priceCurrency: 'Kč',
      },
      {
        name: 'Борода и усы',
        description: 'Моделирование формы и чёткий контур',
        duration: '30 мин',
        priceAmount: 350,
        priceCurrency: 'Kč',
      },
      {
        name: 'Стрижка + борода',
        badge: 'КОМБО',
        description: 'Полный образ за одно посещение',
        duration: '90 мин',
        priceAmount: 850,
        priceCurrency: 'Kč',
      },
      {
        name: 'Классическое бритьё',
        description: 'Горячее полотенце и уход за кожей',
        duration: '45 мин',
        priceAmount: 450,
        priceCurrency: 'Kč',
      },
    ],
  },
});

await payload.updateGlobal({
  slug: 'about',
  data: {
    eyebrow: '02 / ФИЛОСОФИЯ',
    heading: 'МЕСТО, ГДЕ\nМОЖНО БЫТЬ\nСОБОЙ.',
    leadParagraph:
      'Здесь не стригут всех одинаково. Мы смотрим на форму лица, рост волос и твой ритм жизни. А потом берёмся за дело.',
    bodyParagraph:
      'Можно обсудить футбол. Можно просто помолчать. Хорошая музыка, чашка кофе и время для себя — уже включены.',
    footnote: 'ВНИМАНИЕ К ДЕТАЛЯМ. УВАЖЕНИЕ К ТЕБЕ.',
  },
});

await payload.updateGlobal({
  slug: 'team',
  data: {
    eyebrow: '03 / КОМАНДА',
    heading: 'ЗНАЙ СВОЕГО\nМАСТЕРА.',
    note: 'Разные характеры. Один подход к качеству.',
  },
});

await payload.updateGlobal({
  slug: 'booking',
  data: {
    eyebrow: '04 / ЗАПИСЬ',
    heading: 'ВРЕМЯ\nОБНОВИТЬ',
    headingAccent: 'ФОРМУ.',
    intro: 'Выбери услугу и удобную дату.',
    disclaimer: 'Демонстрационная форма: данные не отправляются, время не бронируется.',
  },
});

// ─── Masters (upsert by name) ──────────────────────────────────────────────
const masters = [
  {
    initials: 'АЛ',
    name: 'Алекс',
    specialty: 'Классика и стрижки ножницами',
    bookingLabel: 'Записаться к Алексу ↗',
    order: 1,
  },
  {
    initials: 'МР',
    name: 'Марк',
    specialty: 'Фейды и современные формы',
    bookingLabel: 'Записаться к Марку ↗',
    order: 2,
  },
  {
    initials: 'ДН',
    name: 'Дан',
    specialty: 'Моделирование бороды и бритьё',
    bookingLabel: 'Записаться к Дану ↗',
    order: 3,
  },
];
for (const master of masters) {
  const found = await payload.find({
    collection: 'masters',
    where: { name: { equals: master.name } },
    limit: 1,
  });
  if (found.docs[0]) {
    await payload.update({ collection: 'masters', id: found.docs[0].id, data: master });
  } else {
    await payload.create({ collection: 'masters', data: master });
  }
}
payload.logger.info(`seeded ${masters.length} masters`);

// ─── Pages: /home (kept for <title> / SEO only) + /draft-page ──────────────
const home = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
});
const homeData = {
  title: 'FORMA — барбершоп',
  slug: 'home',
  _status: 'published' as const,
  seo: { title: 'FORMA — барбершоп', description: DESCRIPTION },
};
if (home.docs[0]) {
  await payload.update({ collection: 'pages', id: home.docs[0].id, data: homeData });
  payload.logger.info('updated published page: /home');
} else {
  await payload.create({
    collection: 'pages',
    draft: false,
    data: { ...homeData, publishedAt: new Date().toISOString() },
  });
  payload.logger.info('seeded published page: /home');
}

const draft = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'draft-page' } },
  limit: 1,
  draft: true,
});
if (draft.totalDocs === 0) {
  await payload.create({
    collection: 'pages',
    data: { title: 'Draft Page', slug: 'draft-page', _status: 'draft' },
  });
  payload.logger.info('seeded draft page: /draft-page');
}

payload.logger.info('seed complete');
process.exit(0);
