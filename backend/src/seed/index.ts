import config from '@payload-config';
import { getPayload } from 'payload';

const ADMIN_EMAIL = 'admin@treenweb.local';
const ADMIN_PASSWORD = 'nuzky999';

const payload = await getPayload({ config });

const existingAdmin = await payload.find({
  collection: 'users',
  where: { email: { equals: ADMIN_EMAIL } },
  limit: 1,
});

if (existingAdmin.totalDocs === 0) {
  await payload.create({
    collection: 'users',
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: 'Dev Admin' },
  });
  payload.logger.info(`seeded admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

const home = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
});
if (home.totalDocs === 0) {
  await payload.create({
    collection: 'pages',
    draft: false,
    data: {
      title: 'Home',
      slug: 'home',
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
  });
  payload.logger.info('seeded published page: /home');
}

const draft = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'draft-page' } },
  limit: 1,
  draft: true,
});
if (draft.totalDocs === 0) {
  await payload.create({
    collection: 'pages',
    data: { title: 'Draft Page', slug: 'draft-page', _status: 'draft' },
  });
  payload.logger.info('seeded draft page: /draft-page');
}

payload.logger.info('seed complete');
process.exit(0);
