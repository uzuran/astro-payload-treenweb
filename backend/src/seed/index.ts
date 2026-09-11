/**
 * Dev seed — creates a local admin user so `pnpm --filter @treenweb/backend seed`
 * gives you a way into the admin panel on a fresh database. Nothing else.
 *
 * A template adds its own content seeding here (globals, pages, demo data).
 */
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
} else {
  payload.logger.info('admin user already exists — nothing to seed');
}

payload.logger.info('seed complete');
process.exit(0);
