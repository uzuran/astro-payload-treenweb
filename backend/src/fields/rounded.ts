import type { Field } from 'payload';

const roundedOptions = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Full (pill)', value: 'full' },
];

/**
 * Per-section corner rounding. The matching `sections/*.astro` renders it as
 * `rounded rounded--<value>` on the <section>; the CSS rounds that section's
 * contained buttons, cards and form fields (and exposes the radius as a custom
 * property). Not localized — it's a visual choice, not copy. `none` (default)
 * is a no-op; the FORMA template is square by design.
 */
export const roundedField: Field = {
  name: 'rounded',
  type: 'select',
  defaultValue: 'none',
  options: roundedOptions,
  admin: {
    position: 'sidebar',
    description: 'Corner rounding for this section’s buttons, cards and form fields.',
  },
};

/**
 * Corner rounding for the hero photo only — a separate control from the section
 * `rounded` value above, so the photo can be rounded (or not) on its own.
 */
export const heroPhotoRoundedField: Field = {
  name: 'photoRounded',
  type: 'select',
  defaultValue: 'none',
  options: roundedOptions,
  admin: {
    position: 'sidebar',
    description: 'Corner rounding for the hero photo only.',
  },
};
