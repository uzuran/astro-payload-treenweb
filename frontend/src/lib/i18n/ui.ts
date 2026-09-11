import type { Locale } from '../locale';

/**
 * OFFLINE FALLBACK for site chrome text (header CTA, footer, cookie consent,
 * 404). There is currently no backend `ui-labels` global — `getUiLabels()`
 * always 404s and `resolveLabels()` always falls through to this bundled
 * copy; see `resolveLabels` in `./labels.ts`. `ru` is the shape source;
 * `en`/`cs` are type-checked to the same keys. Screen-reader strings live in
 * `./aria.ts`.
 */
const RU = {
  header: { cta: 'Записаться' },
  footer: {
    findUsHeading: 'НАЙДИ НАС',
    hoursHeading: 'ВРЕМЯ ДЛЯ СЕБЯ',
    disclaimer: 'Показанный контент и цены — примеры.',
  },
  consent: {
    body: 'Мы храним cookie, чтобы запомнить язык. С вашего согласия загружаем приватную аналитику — без персональных данных и трекинга между сайтами.',
    essentialButton: 'Только необходимые',
    analyticsButton: 'Разрешить аналитику',
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
    disclaimer: 'Content and prices shown are examples.',
  },
  consent: {
    body: 'We store a cookie to remember your language. With your consent we also load privacy-friendly analytics — no personal data, no cross-site tracking.',
    essentialButton: 'Essential only',
    analyticsButton: 'Allow analytics',
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
    disclaimer: 'Zobrazený obsah a ceny jsou pouze příklady.',
  },
  consent: {
    body: 'Ukládáme cookie, abychom si zapamatovali jazyk. S vaším souhlasem načteme i analytiku šetrnou k soukromí — žádná osobní data, žádné sledování napříč weby.',
    essentialButton: 'Jen nezbytné',
    analyticsButton: 'Povolit analytiku',
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
