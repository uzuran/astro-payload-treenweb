import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_hero_animation" AS ENUM('fade', 'slide-up', 'zoom', 'neon');
  ALTER TABLE "site_settings" ADD COLUMN "hero_animation" "enum_site_settings_hero_animation" DEFAULT 'fade';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "hero_animation";
  DROP TYPE "public"."enum_site_settings_hero_animation";`)
}
