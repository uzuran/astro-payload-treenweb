import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { withPayload } from '@payloadcms/next/withPayload';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // include workspace deps in the standalone bundle
  outputFileTracingRoot: path.join(dirname, '..'),
  poweredByHeader: false,
  reactStrictMode: true,
  // linting runs at the workspace level (`pnpm lint`), not during `next build`
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
