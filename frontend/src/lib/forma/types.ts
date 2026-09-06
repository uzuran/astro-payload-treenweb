import type {
  About,
  Booking,
  Hero,
  Master,
  NavItem,
  Services,
  SiteSettings,
  Team,
} from '../payload/client';

/**
 * The bundled offline copy of one locale's FORMA landing content. Consumed by
 * `lib/fallback.ts` → `getFallback(locale)`. Keep in sync with the seed
 * (`backend/src/seed/index.ts`).
 */
export interface FormaContent {
  /** Header primary nav (footer nav has no offline fallback — see Phase E). */
  nav: NavItem[];
  ticker: string[];
  hero: Hero;
  /** Alt text for the bundled hero image (public/hero.jpg). */
  heroPhotoAlt: string;
  services: Services;
  about: About;
  team: Team;
  masters: Master[];
  booking: Booking;
  /** Only the fields the chrome actually reads offline (name / tagline /
   *  description / contact / footerNote). */
  site: SiteSettings;
}
