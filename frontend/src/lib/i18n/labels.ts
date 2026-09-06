import { DEFAULT_LOCALE, type Locale } from '../locale';
import type { UiLabels } from '../payload/client';
import { UI_FALLBACK, type UiFallback } from './ui';

/** Fill `{token}` placeholders (booking confirmation, missing-path line). */
export function interpolate(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce((out, [k, v]) => out.replaceAll(`{${k}}`, v), template);
}

type Group = keyof UiFallback;

/** CMS value first (non-empty after trim), bundled dictionary second. Never undefined. */
export function resolveLabels(cms: UiLabels | null | undefined, locale: Locale) {
  const fb: UiFallback = UI_FALLBACK[locale] ?? UI_FALLBACK[DEFAULT_LOCALE];
  const pick = <G extends Group>(group: G, key: keyof UiFallback[G]): string => {
    const raw = (cms?.[group as keyof UiLabels] as Record<string, unknown> | null | undefined)?.[
      key as string
    ];
    return typeof raw === 'string' && raw.trim() ? raw : (fb[group][key] as string);
  };
  return {
    header: { cta: pick('header', 'cta') },
    footer: {
      findUsHeading: pick('footer', 'findUsHeading'),
      hoursHeading: pick('footer', 'hoursHeading'),
      disclaimer: pick('footer', 'disclaimer'),
    },
    booking: {
      nameLabel: pick('booking', 'nameLabel'),
      namePlaceholder: pick('booking', 'namePlaceholder'),
      phoneLabel: pick('booking', 'phoneLabel'),
      phonePlaceholder: pick('booking', 'phonePlaceholder'),
      serviceLabel: pick('booking', 'serviceLabel'),
      masterLabel: pick('booking', 'masterLabel'),
      anyMasterOption: pick('booking', 'anyMasterOption'),
      dateLabel: pick('booking', 'dateLabel'),
      submitLabel: pick('booking', 'submitLabel'),
      resultTemplate: pick('booking', 'resultTemplate'),
    },
    notFound: {
      pageMetaTitle: pick('notFound', 'pageMetaTitle'),
      postMetaTitle: pick('notFound', 'postMetaTitle'),
      heading: pick('notFound', 'heading'),
      heading404: pick('notFound', 'heading404'),
      body: pick('notFound', 'body'),
      missingPathTemplate: pick('notFound', 'missingPathTemplate'),
      postHeading: pick('notFound', 'postHeading'),
      backHomeLabel: pick('notFound', 'backHomeLabel'),
    },
  };
}
export type Labels = ReturnType<typeof resolveLabels>;
