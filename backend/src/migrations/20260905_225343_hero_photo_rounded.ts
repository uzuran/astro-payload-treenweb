import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_hero_photo_rounded" AS ENUM('none', 'sm', 'md', 'lg', 'full');
  ALTER TABLE "hero" ADD COLUMN "photo_rounded" "enum_hero_photo_rounded" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hero" DROP COLUMN "photo_rounded";
  DROP TYPE "public"."enum_hero_photo_rounded";`)
}
