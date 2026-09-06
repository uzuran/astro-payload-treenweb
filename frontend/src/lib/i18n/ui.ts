import type { Locale } from '../locale';

/**
 * OFFLINE FALLBACK for the Payload `ui-labels` global. Read only when a CMS
 * field is blank or the CMS is unreachable (see `resolveLabels`). Shape MUST
 * match `backend/src/globals/UiLabels.ts`. `ru` is the shape source; `en`/`cs`
 * are type-checked to the same keys. Screen-reader strings live in `./aria.ts`.
 */
const RU = {
  header: { cta: 'Записаться' },
  footer: {
    findUsHeading: 'НАЙДИ НАС',
    hoursHeading: 'ВРЕМЯ ДЛЯ СЕБЯ',
    disclaimer: 'Названия, мастера и цены — примеры.',
  },
  booking: {
    nameLabel: 'Твоё имя',
    namePlaceholder: 'Как к тебе обращаться?',
    phoneLabel: 'Телефон',
    phonePlaceholder: '+420 000 000 000',
    serviceLabel: 'Услуга',
    masterLabel: 'Мастер',
    anyMasterOption: 'Любой мастер',
    dateLabel: 'Желаемая дата',
    submitLabel: 'Проверить запись',
    resultTemplate:
      '{name}, всё заполнено: {service}, {date}. Это демонстрация — запись не создана и данные не отправлены.',
  },
  notFound: {
    pageMetaTitle: 'Страница не найдена',
    postMetaTitle: 'Пост не найден',
    heading: 'Страница не найдена',
    heading404: '404 — Страница не найдена',
    body: 'Такой страницы не существует.',
    missingPathTemplate: 'Мы не нашли {path}.',
    postHeading: 'Пост не найден',
    backHomeLabel: 'На главную',
  },
} as const;

export type UiFallback = { [G in keyof typeof RU]: Record<keyof (typeof RU)[G], string> };

const EN: UiFallback = {
  header: { cta: 'Book' },
  footer: {
    findUsHeading: 'FIND US',
    hoursHeading: 'TIME FOR YOURSELF',
    disclaimer: 'Names, barbers and prices are examples.',
  },
  booking: {
    nameLabel: 'Your name',
    namePlaceholder: 'What should we call you?',
    phoneLabel: 'Phone',
    phonePlaceholder: '+420 000 000 000',
    serviceLabel: 'Service',
    masterLabel: 'Barber',
    anyMasterOption: 'Any barber',
    dateLabel: 'Preferred date',
    submitLabel: 'Check availability',
    resultTemplate:
      '{name}, all set: {service}, {date}. This is a demo — no booking was made and nothing was sent.',
  },
  notFound: {
    pageMetaTitle: 'Page not found',
    postMetaTitle: 'Post not found',
    heading: 'Page not found',
    heading404: '404 — Page not found',
    body: "The page you're looking for doesn't exist.",
    missingPathTemplate: "We couldn't find {path}.",
    postHeading: 'Post not found',
    backHomeLabel: 'Go to the home page',
  },
};

const CS: UiFallback = {
  header: { cta: 'Objednat' },
  footer: {
    findUsHeading: 'NAJDI NÁS',
    hoursHeading: 'ČAS PRO SEBE',
    disclaimer: 'Jména, holiči a ceny jsou příklady.',
  },
  booking: {
    nameLabel: 'Tvé jméno',
    namePlaceholder: 'Jak ti máme říkat?',
    phoneLabel: 'Telefon',
    phonePlaceholder: '+420 000 000 000',
    serviceLabel: 'Služba',
    masterLabel: 'Holič',
    anyMasterOption: 'Kterýkoli holič',
    dateLabel: 'Preferovaný termín',
    submitLabel: 'Zkontrolovat termín',
    resultTemplate:
      '{name}, hotovo: {service}, {date}. Toto je ukázka — žádná rezervace nevznikla a nic se neodeslalo.',
  },
  notFound: {
    pageMetaTitle: 'Stránka nenalezena',
    postMetaTitle: 'Příspěvek nenalezen',
    heading: 'Stránka nenalezena',
    heading404: '404 — Stránka nenalezena',
    body: 'Hledaná stránka neexistuje.',
    missingPathTemplate: 'Nenašli jsme {path}.',
    postHeading: 'Příspěvek nenalezen',
    backHomeLabel: 'Zpět na hlavní stránku',
  },
};

export const UI_FALLBACK: Record<Locale, UiFallback> = { ru: RU, en: EN, cs: CS };
