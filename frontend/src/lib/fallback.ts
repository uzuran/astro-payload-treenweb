/**
 * Bundled offline fallback for the site chrome. Rendered when the CMS is
 * unreachable or a field is empty, so the header/footer never crash.
 *
 * Template-neutral placeholder: a new template fills these in (or, better,
 * leans on the CMS globals and leaves this empty). Keep the shape — the header
 * and footer read `.site.*` and `.nav`.
 */
import type { NavItem } from './payload/client';

export interface FallbackContent {
  /** Header primary nav when Navigation.main is empty. */
  nav: NavItem[];
  /** The handful of SiteSettings fields the chrome reads offline. */
  site: {
    siteName: string;
    tagline: string;
    description: string;
    footerNote: string;
    contact: {
      address?: string;
      phone?: string;
      hoursWeekday?: string;
      hoursSaturday?: string;
      hoursSunday?: string;
      mapUrl?: string;
    };
  };
}

const EMPTY: FallbackContent = {
  nav: [],
  site: {
    siteName: '',
    tagline: '',
    description: '',
    footerNote: '',
    contact: {},
  },
};

/** Bundled fallback content (locale-neutral placeholder). */
export function getFallback(_locale?: unknown): FallbackContent {
  return EMPTY;
}
