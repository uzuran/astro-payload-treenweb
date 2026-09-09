import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { CollectionConfig } from 'payload';

import { anyone } from '../access/anyone';
import { authenticated } from '../access/authenticated';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Re-encode every generated image size to WebP at a sensible quality. */
const webp = { format: 'webp' as const, options: { quality: 78 } };

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../uploads/media'),
    // SVG deliberately excluded — it is a script-injection vector.
    mimeTypes: [
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/avif',
      'image/gif',
      'application/pdf',
    ],
    // Generated variants are re-encoded to WebP (smaller than JPEG/PNG at equal
    // quality, universally supported) and never upscaled past the original.
    imageSizes: [
      { name: 'thumbnail', width: 400, withoutEnlargement: true, formatOptions: webp },
      { name: 'card', width: 768, withoutEnlargement: true, formatOptions: webp },
      { name: 'hero', width: 1600, withoutEnlargement: true, formatOptions: webp },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Describe the image for screen readers and SEO. Required in the default locale; fill each locale for a11y.',
      },
    },
    { name: 'caption', type: 'text', localized: true },
  ],
};
