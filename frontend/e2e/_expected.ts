/** Mirrors the Phase-C seed (backend/src/seed/uiLabels.ts). */
export const LOCALES = ['ru', 'en', 'cs'] as const;
export type E2ELocale = (typeof LOCALES)[number];

export const EXPECTED: Record<
  E2ELocale,
  {
    cta: string;
    findUs: string;
    submit: string;
    notFound: string;
    notFound404: string;
    back: string;
  }
> = {
  ru: {
    cta: 'Записаться',
    findUs: 'НАЙДИ НАС',
    submit: 'Проверить запись',
    notFound: 'Страница не найдена',
    notFound404: '404 — Страница не найдена',
    back: 'На главную',
  },
  en: {
    cta: 'Book',
    findUs: 'FIND US',
    submit: 'Check availability',
    notFound: 'Page not found',
    notFound404: '404 — Page not found',
    back: 'Go to the home page',
  },
  cs: {
    cta: 'Objednat',
    findUs: 'NAJDI NÁS',
    submit: 'Zkontrolovat termín',
    notFound: 'Stránka nenalezena',
    notFound404: '404 — Stránka nenalezena',
    back: 'Zpět na hlavní stránku',
  },
};

/** SiteSettings.defaultLocale in the environment under test. */
export const ADMIN_DEFAULT = (process.env.E2E_DEFAULT_LOCALE ?? 'ru') as E2ELocale;
