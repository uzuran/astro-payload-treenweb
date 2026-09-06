import { DEFAULT_LOCALE, type Locale } from '../locale';

/**
 * Screen-reader / structural strings the UI owns. NOT editor content — there is
 * deliberately no Payload counterpart. `{param}` placeholders via the returned fn.
 */
const RU = {
  homeAria: '{site}, главная',
  navAria: 'Главная навигация',
  navAriaMobile: 'Мобильная навигация',
  navAriaFooter: 'Навигация в подвале',
  menuOpen: 'Открыть меню',
  menuClose: 'Закрыть меню',
  switcherAria: 'Язык',
  consentAria: 'Согласие на cookie',
} as const;

export type AriaKey = keyof typeof RU;
export const ARIA_KEYS = Object.keys(RU) as AriaKey[];

const EN: Record<AriaKey, string> = {
  homeAria: '{site}, home',
  navAria: 'Main navigation',
  navAriaMobile: 'Mobile navigation',
  navAriaFooter: 'Footer navigation',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  switcherAria: 'Language',
  consentAria: 'Cookie consent',
};

const CS: Record<AriaKey, string> = {
  homeAria: '{site}, domů',
  navAria: 'Hlavní navigace',
  navAriaMobile: 'Mobilní navigace',
  navAriaFooter: 'Navigace v patičce',
  menuOpen: 'Otevřít menu',
  menuClose: 'Zavřít menu',
  switcherAria: 'Jazyk',
  consentAria: 'Souhlas s cookies',
};

const ARIA: Record<Locale, Record<AriaKey, string>> = { ru: RU, en: EN, cs: CS };

export function aria(locale: Locale) {
  const table = ARIA[locale] ?? ARIA[DEFAULT_LOCALE];
  return (key: AriaKey, params?: Record<string, string>): string => {
    let value = table[key] ?? ARIA[DEFAULT_LOCALE][key];
    if (params) for (const [k, v] of Object.entries(params)) value = value.replaceAll(`{${k}}`, v);
    return value;
  };
}
