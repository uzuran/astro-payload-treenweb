/**
 * Bundled copy of the FORMA landing content — identical to what the seed
 * writes to Payload. Used by every section component via `withFallback`, so
 * the page renders in full even when the CMS is unreachable or a field is
 * blank. Keep in sync with backend/src/seed/index.ts.
 */
import type {
  About,
  Booking,
  Hero,
  Master,
  NavItem,
  Services,
  SiteSettings,
  Team,
} from './payload/client';

export const NAV_FB: NavItem[] = [
  { label: 'О нас', href: '#about' },
  { label: 'Услуги и цены', href: '#services' },
  { label: 'Мастера', href: '#team' },
  { label: 'Контакты', href: '#contacts' },
];

export const TICKER_FB = ['СТРИЖКА', 'БОРОДА', 'ХАРАКТЕР'];

export const HERO_FB: Hero = {
  eyebrowLeft: 'БАРБЕРШОП · МУЖСКАЯ ТЕРРИТОРИЯ',
  eyebrowRight: 'СТИЛЬ НАЧИНАЕТСЯ С ДЕТАЛЕЙ',
  headingLine1: 'ТВОЯ ФОРМА.',
  headingAccent: 'ТВОЙ ХАРАКТЕР.',
  introText: 'Точная стрижка. Чёткие линии.\nНичего лишнего — только то, что подходит тебе.',
  ctaLabel: 'Выбрать время',
  ctaHref: '#booking',
  sealText: 'F.',
  sealCaption: 'Классические техники. Современный взгляд.',
  photo: null,
  photoCaptionLeft: 'МАСТЕРСТВО В КАЖДОМ ДВИЖЕНИИ',
  photoCaptionRight: '01 / FORMA',
};

export const HERO_PHOTO_ALT_FB = 'Барбер придаёт форму мужской стрижке ножницами и расчёской';
/** Static image shipped in public/ for when Payload has no hero photo. */
export const HERO_PHOTO_SRC_FB = '/hero.jpg';

export const SERVICES_FB: Services = {
  eyebrow: '01 / УСЛУГИ',
  heading: 'ХОРОШАЯ ФОРМА.\nЧЕСТНАЯ ЦЕНА.',
  headingAccent: null,
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
};

export const ABOUT_FB: About = {
  eyebrow: '02 / ФИЛОСОФИЯ',
  heading: 'МЕСТО, ГДЕ\nМОЖНО БЫТЬ\nСОБОЙ.',
  headingAccent: null,
  note: null,
  leadParagraph:
    'Здесь не стригут всех одинаково. Мы смотрим на форму лица, рост волос и твой ритм жизни. А потом берёмся за дело.',
  bodyParagraph:
    'Можно обсудить футбол. Можно просто помолчать. Хорошая музыка, чашка кофе и время для себя — уже включены.',
  footnote: 'ВНИМАНИЕ К ДЕТАЛЯМ. УВАЖЕНИЕ К ТЕБЕ.',
};

export const TEAM_FB: Team = {
  eyebrow: '03 / КОМАНДА',
  heading: 'ЗНАЙ СВОЕГО\nМАСТЕРА.',
  headingAccent: null,
  note: 'Разные характеры. Один подход к качеству.',
};

export const MASTERS_FB: Master[] = [
  {
    id: 'fb-1',
    initials: 'АЛ',
    name: 'Алекс',
    specialty: 'Классика и стрижки ножницами',
    bookingLabel: 'Записаться к Алексу ↗',
    order: 1,
  },
  {
    id: 'fb-2',
    initials: 'МР',
    name: 'Марк',
    specialty: 'Фейды и современные формы',
    bookingLabel: 'Записаться к Марку ↗',
    order: 2,
  },
  {
    id: 'fb-3',
    initials: 'ДН',
    name: 'Дан',
    specialty: 'Моделирование бороды и бритьё',
    bookingLabel: 'Записаться к Дану ↗',
    order: 3,
  },
];

export const BOOKING_FB: Booking = {
  eyebrow: '04 / ЗАПИСЬ',
  heading: 'ВРЕМЯ\nОБНОВИТЬ',
  headingAccent: 'ФОРМУ.',
  note: null,
  intro: 'Выбери услугу и удобную дату.',
  disclaimer: 'Демонстрационная форма: данные не отправляются, время не бронируется.',
};

export const SITE_FB: SiteSettings = {
  siteName: 'FORMA',
  tagline: 'Твоя форма. Твой характер.',
  description:
    'FORMA — мужские стрижки, оформление бороды и классическое бритьё. Найди свою форму.',
  ticker: TICKER_FB.map((word) => ({ word })),
  contact: {
    address: 'Пльзень, адрес барбершопа',
    phone: '',
    hoursWeekday: 'Пн–Пт · 10:00–20:00',
    hoursSaturday: 'Сб · 10:00–18:00',
    hoursSunday: 'Вс · выходной',
    mapUrl: '',
  },
  footerNote: '© 2026 FORMA. Демонстрационный шаблон.',
  defaultLocale: 'ru',
  supportedLocales: [{ code: 'ru', label: 'Русский', enabled: true }],
};
