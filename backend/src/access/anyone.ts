import type { Access } from 'payload';

/** Public read. Use only for genuinely public data. */
export const anyone: Access = () => true;
