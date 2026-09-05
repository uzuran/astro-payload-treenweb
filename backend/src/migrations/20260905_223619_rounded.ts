import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_hero_rounded" AS ENUM('none', 'sm', 'md', 'lg', 'full');
  CREATE TYPE "public"."enum_services_rounded" AS ENUM('none', 'sm', 'md', 'lg', 'full');
  CREATE TYPE "public"."enum_about_rounded" AS ENUM('none', 'sm', 'md', 'lg', 'full');
  CREATE TYPE "public"."enum_team_rounded" AS ENUM('none', 'sm', 'md', 'lg', 'full');
  CREATE TYPE "public"."enum_booking_rounded" AS ENUM('none', 'sm', 'md', 'lg', 'full');
  ALTER TABLE "hero" ADD COLUMN "rounded" "enum_hero_rounded" DEFAULT 'none';
  ALTER TABLE "services" ADD COLUMN "rounded" "enum_services_rounded" DEFAULT 'none';
  ALTER TABLE "about" ADD COLUMN "rounded" "enum_about_rounded" DEFAULT 'none';
  ALTER TABLE "team" ADD COLUMN "rounded" "enum_team_rounded" DEFAULT 'none';
  ALTER TABLE "booking" ADD COLUMN "rounded" "enum_booking_rounded" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hero" DROP COLUMN "rounded";
  ALTER TABLE "services" DROP COLUMN "rounded";
  ALTER TABLE "about" DROP COLUMN "rounded";
  ALTER TABLE "team" DROP COLUMN "rounded";
  ALTER TABLE "booking" DROP COLUMN "rounded";
  DROP TYPE "public"."enum_hero_rounded";
  DROP TYPE "public"."enum_services_rounded";
  DROP TYPE "public"."enum_about_rounded";
  DROP TYPE "public"."enum_team_rounded";
  DROP TYPE "public"."enum_booking_rounded";`)
}
