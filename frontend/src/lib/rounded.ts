export const ROUNDED = ['none', 'sm', 'md', 'lg', 'full'] as const;
export type Rounded = (typeof ROUNDED)[number];

/** Narrow a CMS value to a `Rounded`, degrading anything unknown/empty to `none`. */
export function toRounded(value: unknown): Rounded {
  return (ROUNDED as readonly string[]).includes(value as string) ? (value as Rounded) : 'none';
}

/** The classes a section root carries: `rounded rounded--<value>`. */
export function roundedClass(value: unknown): string {
  return `rounded rounded--${toRounded(value)}`;
}
