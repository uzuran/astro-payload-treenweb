/**
 * Overlay CMS data onto a complete fallback object, ignoring "empty" CMS
 * fields (null, undefined, '', or []). A section therefore always has every
 * field populated — from Payload where set, from the bundled fallback where
 * the CMS is unreachable or a field is blank.
 *
 * Shallow by design: nested objects/arrays are taken whole from whichever
 * side wins. That is enough for the flat landing-page globals.
 */
export function withFallback<T extends object>(
  data: Partial<T> | null | undefined,
  fallback: T,
): T {
  const out = { ...fallback };
  if (!data) return out;
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    (out as Record<string, unknown>)[key] = value;
  }
  return out;
}
