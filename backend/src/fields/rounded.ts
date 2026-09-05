import type { Field } from 'payload';

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
  options: [
    { label: 'None', value: 'none' },
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
    { label: 'Full (pill)', value: 'full' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Corner rounding for this section’s buttons, cards and form fields.',
  },
};
