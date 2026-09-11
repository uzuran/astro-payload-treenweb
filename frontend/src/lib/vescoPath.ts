export type VescoLocale = 'en' | 'cs';
export type VescoPage = 'home' | 'tarot' | 'horoscope' | 'numerology' | 'dashboard';

const SEGMENT: Record<VescoPage, string> = {
  home: '',
  tarot: '/tarot',
  horoscope: '/horoscope',
  numerology: '/numerology',
  dashboard: '/dashboard',
};

/** Absolute URL for `page` in `loc` — the URL is what actually changes the language. */
export function vescoPath(loc: VescoLocale, page: VescoPage): string {
  return `/${loc}${SEGMENT[page]}`;
}
