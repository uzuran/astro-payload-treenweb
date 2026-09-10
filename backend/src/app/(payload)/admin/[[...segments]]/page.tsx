import type { Metadata } from 'next';

import config from '@payload-config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';

import { importMap } from '../importMap.js';

// The admin panel is fully dynamic. This stops `next build` from trying to
// pre-render it during page-data collection, which would init Payload and
// connect to a database that isn't available at image-build time.
export const dynamic = 'force-dynamic';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap });

export default Page;
