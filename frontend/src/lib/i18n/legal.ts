import { DEFAULT_LOCALE, type Locale } from '../locale';

/**
 * Cookie / privacy notice — factual copy the UI owns (like `aria.ts`), not
 * marketing text, so it lives in version control rather than the CMS. Rendered
 * by `src/pages/[locale]/privacy.astro`; the two `footer` strings are used by
 * the footer's "manage consent" control.
 */
export interface CookieRow {
  name: string;
  purpose: string;
  retention: string;
}

export interface LegalContent {
  metaTitle: string;
  title: string;
  intro: string;
  cookiesHeading: string;
  cookies: CookieRow[];
  analyticsHeading: string;
  analyticsBody: string;
  manageHeading: string;
  manageBody: string;
  manageButton: string;
  /** Footer link label. */
  footerLink: string;
}

const RU: LegalContent = {
  metaTitle: 'Cookie и конфиденциальность',
  title: 'Cookie и конфиденциальность',
  intro:
    'Этот сайт использует минимум cookie. Мы не размещаем рекламные и трекинговые cookie сторонних сервисов.',
  cookiesHeading: 'Какие cookie мы используем',
  cookies: [
    {
      name: 'locale',
      purpose: 'Запоминает выбранный язык, чтобы страница открывалась на нём при следующем визите.',
      retention: 'около 6 месяцев',
    },
    {
      name: 'cookie_consent',
      purpose: 'Хранит ваш выбор в отношении аналитики, чтобы не показывать баннер повторно.',
      retention: 'около 6 месяцев',
    },
  ],
  analyticsHeading: 'Аналитика',
  analyticsBody:
    'С вашего согласия загружается Plausible — аналитика без cookie и без сбора персональных данных. Она работает только в рабочей среде и только после нажатия «Разрешить аналитику».',
  manageHeading: 'Изменить выбор',
  manageBody:
    'Нажмите кнопку ниже — баннер согласия появится снова, и вы сможете выбрать заново. Ссылка «Cookie» в подвале сайта делает то же самое.',
  manageButton: 'Изменить настройки cookie',
  footerLink: 'Cookie',
};

const EN: LegalContent = {
  metaTitle: 'Cookies & privacy',
  title: 'Cookies & privacy',
  intro:
    'This site uses a minimal set of cookies. We set no advertising or third-party tracking cookies.',
  cookiesHeading: 'Cookies we use',
  cookies: [
    {
      name: 'locale',
      purpose: 'Remembers the language you chose so the site opens in it next time.',
      retention: 'about 6 months',
    },
    {
      name: 'cookie_consent',
      purpose: 'Stores your analytics choice so the banner is not shown again.',
      retention: 'about 6 months',
    },
  ],
  analyticsHeading: 'Analytics',
  analyticsBody:
    'With your consent the site loads Plausible — cookieless analytics that collects no personal data. It runs only in production and only after you choose “Allow analytics”.',
  manageHeading: 'Change your choice',
  manageBody:
    'Use the button below — the consent banner reappears and you can choose again. The “Cookies” link in the site footer does the same.',
  manageButton: 'Change cookie settings',
  footerLink: 'Cookies',
};

const CS: LegalContent = {
  metaTitle: 'Cookies a soukromí',
  title: 'Cookies a soukromí',
  intro:
    'Tento web používá minimum cookies. Nenastavujeme reklamní ani sledovací cookies třetích stran.',
  cookiesHeading: 'Které cookies používáme',
  cookies: [
    {
      name: 'locale',
      purpose: 'Zapamatuje si zvolený jazyk, aby se web příště otevřel v něm.',
      retention: 'přibližně 6 měsíců',
    },
    {
      name: 'cookie_consent',
      purpose: 'Ukládá vaši volbu ohledně analytiky, aby se banner nezobrazoval znovu.',
      retention: 'přibližně 6 měsíců',
    },
  ],
  analyticsHeading: 'Analytika',
  analyticsBody:
    'S vaším souhlasem web načte Plausible — analytiku bez cookies, která nesbírá žádné osobní údaje. Běží pouze v produkčním prostředí a jen po volbě „Povolit analytiku“.',
  manageHeading: 'Změna volby',
  manageBody:
    'Použijte tlačítko níže — banner souhlasu se znovu zobrazí a můžete zvolit jinak. Odkaz „Cookies“ v patičce dělá totéž.',
  manageButton: 'Změnit nastavení cookies',
  footerLink: 'Cookies',
};

const LEGAL: Record<Locale, LegalContent> = { ru: RU, en: EN, cs: CS };

export function legal(locale: Locale): LegalContent {
  return LEGAL[locale] ?? LEGAL[DEFAULT_LOCALE];
}
