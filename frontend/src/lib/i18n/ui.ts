import { DEFAULT_LOCALE, type Locale } from '../locale';

/**
 * UI chrome strings — interface labels the frontend owns, versioned with the
 * code. NOT in Payload (that's for editor-managed content). `ru` is the shape
 * source; `en`/`cs` must satisfy the exact same key set (TS-enforced).
 *
 * `{param}` placeholders are filled by `t(locale)(key, { param: value })`.
 */
const RU = {
  'header.homeAria': '{site}, главная',
  'header.navAria': 'Главная навигация',
  'header.navAriaMobile': 'Мобильная навигация',
  'header.menuOpen': 'Открыть меню',
  'header.menuClose': 'Закрыть меню',
  'header.cta': 'Записаться',

  'switcher.aria': 'Язык',

  'footer.findUs': 'НАЙДИ НАС',
  'footer.hours': 'ВРЕМЯ ДЛЯ СЕБЯ',
  'footer.disclaimer': 'Названия, мастера и цены — примеры.',

  'booking.name': 'Твоё имя',
  'booking.namePlaceholder': 'Как к тебе обращаться?',
  'booking.phone': 'Телефон',
  'booking.phonePlaceholder': '+420 000 000 000',
  'booking.service': 'Услуга',
  'booking.master': 'Мастер',
  'booking.anyMaster': 'Любой мастер',
  'booking.date': 'Желаемая дата',
  'booking.submit': 'Проверить запись',
  'booking.result':
    '{name}, всё заполнено: {service}, {date}. Это демонстрация — запись не создана и данные не отправлены.',

  'errors.pageNotFoundTitle': 'Страница не найдена',
  'errors.postNotFoundTitle': 'Пост не найден',
  'errors.notFoundHeading': 'Страница не найдена',
  'errors.notFound404Heading': '404 — Страница не найдена',
  'errors.notFoundBody': 'Такой страницы не существует.',
  'errors.couldNotFind': 'Мы не нашли',
  'errors.postNotFoundHeading': 'Пост не найден',
  'errors.backHome': 'На главную',
} as const;

export type UIKey = keyof typeof RU;

const EN: Record<UIKey, string> = {
  'header.homeAria': '{site}, home',
  'header.navAria': 'Main navigation',
  'header.navAriaMobile': 'Mobile navigation',
  'header.menuOpen': 'Open menu',
  'header.menuClose': 'Close menu',
  'header.cta': 'Book',

  'switcher.aria': 'Language',

  'footer.findUs': 'FIND US',
  'footer.hours': 'TIME FOR YOURSELF',
  'footer.disclaimer': 'Names, barbers and prices are examples.',

  'booking.name': 'Your name',
  'booking.namePlaceholder': 'What should we call you?',
  'booking.phone': 'Phone',
  'booking.phonePlaceholder': '+420 000 000 000',
  'booking.service': 'Service',
  'booking.master': 'Barber',
  'booking.anyMaster': 'Any barber',
  'booking.date': 'Preferred date',
  'booking.submit': 'Check availability',
  'booking.result':
    '{name}, all set: {service}, {date}. This is a demo — no booking was made and nothing was sent.',

  'errors.pageNotFoundTitle': 'Page not found',
  'errors.postNotFoundTitle': 'Post not found',
  'errors.notFoundHeading': 'Page not found',
  'errors.notFound404Heading': '404 — Page not found',
  'errors.notFoundBody': "The page you're looking for doesn't exist.",
  'errors.couldNotFind': "We couldn't find",
  'errors.postNotFoundHeading': 'Post not found',
  'errors.backHome': 'Go to the home page',
};

const CS: Record<UIKey, string> = {
  'header.homeAria': '{site}, domů',
  'header.navAria': 'Hlavní navigace',
  'header.navAriaMobile': 'Mobilní navigace',
  'header.menuOpen': 'Otevřít menu',
  'header.menuClose': 'Zavřít menu',
  'header.cta': 'Objednat',

  'switcher.aria': 'Jazyk',

  'footer.findUs': 'NAJDI NÁS',
  'footer.hours': 'ČAS PRO SEBE',
  'footer.disclaimer': 'Jména, holiči a ceny jsou příklady.',

  'booking.name': 'Tvé jméno',
  'booking.namePlaceholder': 'Jak ti máme říkat?',
  'booking.phone': 'Telefon',
  'booking.phonePlaceholder': '+420 000 000 000',
  'booking.service': 'Služba',
  'booking.master': 'Holič',
  'booking.anyMaster': 'Kterýkoli holič',
  'booking.date': 'Preferovaný termín',
  'booking.submit': 'Zkontrolovat termín',
  'booking.result':
    '{name}, hotovo: {service}, {date}. Toto je ukázka — žádná rezervace nevznikla a nic se neodeslalo.',

  'errors.pageNotFoundTitle': 'Stránka nenalezena',
  'errors.postNotFoundTitle': 'Příspěvek nenalezen',
  'errors.notFoundHeading': 'Stránka nenalezena',
  'errors.notFound404Heading': '404 — Stránka nenalezena',
  'errors.notFoundBody': 'Hledaná stránka neexistuje.',
  'errors.couldNotFind': 'Nenašli jsme',
  'errors.postNotFoundHeading': 'Příspěvek nenalezen',
  'errors.backHome': 'Zpět na hlavní stránku',
};

export const UI: Record<Locale, Record<UIKey, string>> = { ru: RU, en: EN, cs: CS };

/** Bound translator for a locale: `const tr = t(locale); tr('header.cta')`. */
export function t(locale: Locale) {
  const table = UI[locale] ?? UI[DEFAULT_LOCALE];
  return (key: UIKey, params?: Record<string, string>): string => {
    let value = table[key];
    if (value === undefined) {
      if (import.meta.env.DEV) console.warn(`[ui] missing key "${key}" for locale "${locale}"`);
      value = UI[DEFAULT_LOCALE][key] ?? key;
    }
    if (params) {
      for (const [name, replacement] of Object.entries(params)) {
        value = value.replaceAll(`{${name}}`, replacement);
      }
    }
    return value;
  };
}
