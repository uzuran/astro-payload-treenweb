import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '@payload-config';
import { getPayload } from 'payload';

import { DEFAULT_LOCALE, supportedLocalesSeed } from '../locales';
import { uiLabelsSeed } from './uiLabels';

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
// Look up by alt, not filename: Payload suffixes the filename (hero-1.jpg) if
// a stale file is left in uploads/, which would break filename-based matching.
const existingHeroImage = await payload.find({
  collection: 'media',
  where: { alt: { equals: HERO_ALT } },
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
    social: [
      { platform: 'instagram', url: 'https://instagram.com/forma.barber' },
      { platform: 'facebook', url: 'https://facebook.com/forma.barber' },
      { platform: 'tiktok', url: 'https://tiktok.com/@forma.barber' },
      { platform: 'youtube', url: 'https://youtube.com/@forma.barber' },
      { platform: 'telegram', url: 'https://t.me/forma_barber' },
      { platform: 'whatsapp', url: 'https://wa.me/420123456789' },
    ],
    contact: {
      address: 'Пльзень, адрес барбершопа',
      phone: '',
      hoursWeekday: 'Пн–Пт · 10:00–20:00',
      hoursSaturday: 'Сб · 10:00–18:00',
      hoursSunday: 'Вс · выходной',
      mapUrl: '',
    },
    footerNote: '© 2026 FORMA. Демонстрационный шаблон.',
    seo: { titleTemplate: '{page} · {site}', defaultDescription: DESCRIPTION },
    defaultLocale: DEFAULT_LOCALE,
    supportedLocales: supportedLocalesSeed,
  },
});

await payload.updateGlobal({ slug: 'ui-labels', data: uiLabelsSeed.ru });

await payload.updateGlobal({ slug: 'animation-settings', data: { duration: 1.2 } });

const NAV_MAIN_RU = [
  { label: 'О нас', href: '#about' },
  { label: 'Услуги и цены', href: '#services' },
  { label: 'Мастера', href: '#team' },
  { label: 'Контакты', href: '#contacts' },
];

await payload.updateGlobal({
  slug: 'navigation',
  // Footer nav mirrors the primary nav — a quick way back up on this one-pager.
  data: { main: NAV_MAIN_RU, footer: NAV_MAIN_RU },
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

// ─── Translations (en, cs) ────────────────────────────────────────────────
// ru (the default locale) stays authoritative; these fill the localized
// fields for the other locales. Non-localized fields (slug, href, price,
// phone, relations, media binary) are untouched. UI chrome hardcoded in the
// Astro components (form labels, "Записаться" CTA) is out of scope here.

const TRANSLATIONS = {
  en: {
    hero: {
      eyebrowLeft: "BARBERSHOP · MEN'S TERRITORY",
      eyebrowRight: 'STYLE STARTS WITH THE DETAILS',
      headingLine1: 'YOUR SHAPE.',
      headingAccent: 'YOUR CHARACTER.',
      introText: 'A precise cut. Clean lines.\nNothing extra — just what suits you.',
      ctaLabel: 'Pick a time',
      sealCaption: 'Classic technique. Modern eye.',
      photoCaptionLeft: 'CRAFT IN EVERY MOVE',
    },
    services: {
      eyebrow: '01 / SERVICES',
      heading: 'GOOD SHAPE.\nFAIR PRICE.',
      note: "Stick with the familiar or try something new. We'll help you find your shape.",
      items: [
        {
          name: "Men's haircut",
          description: 'Consultation, wash and styling',
          duration: '60 min',
        },
        {
          name: 'Beard & moustache',
          description: 'Shaping and a clean outline',
          duration: '30 min',
        },
        {
          name: 'Haircut + beard',
          badge: 'COMBO',
          description: 'The full look in one visit',
          duration: '90 min',
        },
        { name: 'Classic shave', description: 'Hot towel and skin care', duration: '45 min' },
      ],
    },
    about: {
      eyebrow: '02 / PHILOSOPHY',
      heading: 'A PLACE TO\nBE\nYOURSELF.',
      leadParagraph:
        "We don't cut everyone the same. We look at the shape of your face, how your hair grows and the rhythm of your life. Then we get to work.",
      bodyParagraph:
        'Talk football if you like, or just sit in silence. Good music, a cup of coffee and time for yourself are included.',
      footnote: 'ATTENTION TO DETAIL. RESPECT FOR YOU.',
    },
    team: {
      eyebrow: '03 / TEAM',
      heading: 'KNOW YOUR\nBARBER.',
      note: 'Different characters. One standard of quality.',
    },
    booking: {
      eyebrow: '04 / BOOKING',
      heading: 'TIME TO\nRESHAPE',
      headingAccent: 'YOUR SHAPE.',
      intro: 'Choose a service and a date that works.',
      disclaimer: 'Demo form: nothing is sent and no slot is booked.',
    },
    navMain: ['About', 'Services & prices', 'Barbers', 'Contacts'],
    ticker: ['HAIRCUT', 'BEARD', 'CHARACTER'],
    site: {
      tagline: 'Your shape. Your character.',
      description: "FORMA — men's haircuts, beard grooming and classic shaves. Find your shape.",
      footerNote: '© 2026 FORMA. Demo template.',
      contact: {
        address: 'Pilsen, barbershop address',
        hoursWeekday: 'Mon–Fri · 10:00–20:00',
        hoursSaturday: 'Sat · 10:00–18:00',
        hoursSunday: 'Sun · closed',
      },
    },
    masters: {
      Алекс: {
        name: 'Alex',
        specialty: 'Classic cuts and scissor work',
        bookingLabel: 'Book with Alex ↗',
      },
      Марк: {
        name: 'Mark',
        specialty: 'Fades and modern shapes',
        bookingLabel: 'Book with Mark ↗',
      },
      Дан: {
        name: 'Dan',
        specialty: 'Beard sculpting and shaves',
        bookingLabel: 'Book with Dan ↗',
      },
    },
    heroAlt: "A barber shaping a men's haircut with scissors and comb",
    home: {
      title: 'FORMA — barbershop',
      seoDescription: "FORMA — men's haircuts, beard grooming and classic shaves. Find your shape.",
    },
  },
  cs: {
    hero: {
      eyebrowLeft: 'BARBERSHOP · MUŽSKÉ ÚZEMÍ',
      eyebrowRight: 'STYL ZAČÍNÁ U DETAILŮ',
      headingLine1: 'TVŮJ TVAR.',
      headingAccent: 'TVŮJ CHARAKTER.',
      introText: 'Přesný střih. Čisté linie.\nNic navíc — jen to, co ti sedí.',
      ctaLabel: 'Vybrat čas',
      sealCaption: 'Klasické techniky. Moderní pohled.',
      photoCaptionLeft: 'ŘEMESLO V KAŽDÉM POHYBU',
    },
    services: {
      eyebrow: '01 / SLUŽBY',
      heading: 'DOBRÝ TVAR.\nFÉROVÁ CENA.',
      note: 'Zůstaň u osvědčeného, nebo zkus něco nového. S tvarem ti poradíme.',
      items: [
        { name: 'Pánský střih', description: 'Konzultace, mytí a styling', duration: '60 min' },
        { name: 'Vousy a knír', description: 'Modelace tvaru a čistý kontur', duration: '30 min' },
        {
          name: 'Střih + vousy',
          badge: 'KOMBO',
          description: 'Kompletní vzhled na jednu návštěvu',
          duration: '90 min',
        },
        { name: 'Klasické holení', description: 'Horký ručník a péče o pleť', duration: '45 min' },
      ],
    },
    about: {
      eyebrow: '02 / FILOZOFIE',
      heading: 'MÍSTO, KDE\nMŮŽEŠ BÝT\nSÁM SEBOU.',
      leadParagraph:
        'Nestříháme všechny stejně. Díváme se na tvar obličeje, růst vlasů i tvůj životní rytmus. A pak se pustíme do práce.',
      bodyParagraph:
        'Můžeš probrat fotbal, nebo prostě mlčet. Dobrá hudba, šálek kávy a čas pro sebe jsou v ceně.',
      footnote: 'DŮRAZ NA DETAIL. RESPEKT K TOBĚ.',
    },
    team: {
      eyebrow: '03 / TÝM',
      heading: 'ZNEJ SVÉHO\nHOLIČE.',
      note: 'Různé povahy. Jeden přístup ke kvalitě.',
    },
    booking: {
      eyebrow: '04 / OBJEDNÁNÍ',
      heading: 'ČAS NA\nNOVÝ',
      headingAccent: 'TVAR.',
      intro: 'Vyber si službu a termín, který ti vyhovuje.',
      disclaimer: 'Ukázkový formulář: nic se neodesílá a žádný termín se nerezervuje.',
    },
    navMain: ['O nás', 'Služby a ceny', 'Holiči', 'Kontakty'],
    ticker: ['STŘIH', 'VOUSY', 'CHARAKTER'],
    site: {
      tagline: 'Tvůj tvar. Tvůj charakter.',
      description: 'FORMA — pánské střihy, úprava vousů a klasické holení. Najdi svůj tvar.',
      footerNote: '© 2026 FORMA. Ukázková šablona.',
      contact: {
        address: 'Plzeň, adresa barbershopu',
        hoursWeekday: 'Po–Pá · 10:00–20:00',
        hoursSaturday: 'So · 10:00–18:00',
        hoursSunday: 'Ne · zavřeno',
      },
    },
    masters: {
      Алекс: {
        name: 'Alex',
        specialty: 'Klasika a střihy nůžkami',
        bookingLabel: 'Objednat k Alexovi ↗',
      },
      Марк: {
        name: 'Marek',
        specialty: 'Fady a moderní tvary',
        bookingLabel: 'Objednat k Markovi ↗',
      },
      Дан: {
        name: 'Dan',
        specialty: 'Modelace vousů a holení',
        bookingLabel: 'Objednat k Danovi ↗',
      },
    },
    heroAlt: 'Holič tvaruje pánský střih nůžkami a hřebenem',
    home: {
      title: 'FORMA — barbershop',
      seoDescription: 'FORMA — pánské střihy, úprava vousů a klasické holení. Najdi svůj tvar.',
    },
  },
};

for (const locale of ['en', 'cs'] as const) {
  const t = TRANSLATIONS[locale];

  await payload.updateGlobal({ slug: 'hero', locale, data: t.hero });
  await payload.updateGlobal({ slug: 'about', locale, data: t.about });
  await payload.updateGlobal({ slug: 'team', locale, data: t.team });
  await payload.updateGlobal({ slug: 'booking', locale, data: t.booking });

  const servicesGlobal = await payload.findGlobal({ slug: 'services' });
  await payload.updateGlobal({
    slug: 'services',
    locale,
    data: {
      eyebrow: t.services.eyebrow,
      heading: t.services.heading,
      note: t.services.note,
      items: (servicesGlobal.items ?? []).map((row, i) => ({
        id: row.id ?? undefined,
        priceCurrency: 'Kč',
        ...(t.services.items[i] ?? {}),
      })),
    },
  });

  const navigationGlobal = await payload.findGlobal({ slug: 'navigation' });
  const translateMenu = (rows: typeof navigationGlobal.main) =>
    (rows ?? []).map((row, i) => ({
      id: row.id ?? undefined,
      label: t.navMain[i] ?? row.label,
      href: row.href,
    }));
  await payload.updateGlobal({
    slug: 'navigation',
    locale,
    data: {
      main: translateMenu(navigationGlobal.main),
      footer: translateMenu(navigationGlobal.footer),
    },
  });

  const settingsGlobal = await payload.findGlobal({ slug: 'site-settings' });
  await payload.updateGlobal({
    slug: 'site-settings',
    locale,
    data: {
      tagline: t.site.tagline,
      description: t.site.description,
      footerNote: t.site.footerNote,
      contact: t.site.contact,
      seo: { titleTemplate: '{page} · {site}', defaultDescription: t.site.description },
      ticker: (settingsGlobal.ticker ?? []).map((row, i) => ({
        id: row.id ?? undefined,
        word: t.ticker[i] ?? row.word,
      })),
    },
  });

  await payload.updateGlobal({ slug: 'ui-labels', locale, data: uiLabelsSeed[locale] });

  for (const [ruName, translated] of Object.entries(t.masters)) {
    const found = await payload.find({
      collection: 'masters',
      where: { name: { equals: ruName } },
      limit: 1,
    });
    if (found.docs[0]) {
      await payload.update({
        collection: 'masters',
        id: found.docs[0].id,
        locale,
        data: translated,
      });
    }
  }

  if (heroImageId !== undefined) {
    await payload.update({
      collection: 'media',
      id: heroImageId,
      locale,
      data: { alt: t.heroAlt },
    });
  }

  const homeDoc = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  });
  if (homeDoc.docs[0]) {
    await payload.update({
      collection: 'pages',
      id: homeDoc.docs[0].id,
      locale,
      data: {
        title: t.home.title,
        seo: { title: t.home.title, description: t.home.seoDescription },
      },
    });
  }

  payload.logger.info(`seeded ${locale} translations`);
}

payload.logger.info('seed complete');
process.exit(0);
