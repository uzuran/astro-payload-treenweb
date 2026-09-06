import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_labels_locales" ADD COLUMN "consent_body" varchar;
  ALTER TABLE "ui_labels_locales" ADD COLUMN "consent_essential_button" varchar;
  ALTER TABLE "ui_labels_locales" ADD COLUMN "consent_analytics_button" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ui_labels_locales" DROP COLUMN "consent_body";
  ALTER TABLE "ui_labels_locales" DROP COLUMN "consent_essential_button";
  ALTER TABLE "ui_labels_locales" DROP COLUMN "consent_analytics_button";`)
}
