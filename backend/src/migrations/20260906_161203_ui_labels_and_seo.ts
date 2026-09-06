import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ui_labels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ui_labels_locales" (
  	"header_cta" varchar,
  	"footer_find_us_heading" varchar,
  	"footer_hours_heading" varchar,
  	"footer_disclaimer" varchar,
  	"booking_name_label" varchar,
  	"booking_name_placeholder" varchar,
  	"booking_phone_label" varchar,
  	"booking_phone_placeholder" varchar,
  	"booking_service_label" varchar,
  	"booking_master_label" varchar,
  	"booking_any_master_option" varchar,
  	"booking_date_label" varchar,
  	"booking_submit_label" varchar,
  	"booking_result_template" varchar,
  	"not_found_page_meta_title" varchar,
  	"not_found_post_meta_title" varchar,
  	"not_found_heading" varchar,
  	"not_found_heading404" varchar,
  	"not_found_body" varchar,
  	"not_found_missing_path_template" varchar,
  	"not_found_post_heading" varchar,
  	"not_found_back_home_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "site_settings_locales" ADD COLUMN "seo_title_template" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "seo_default_description" varchar;
  ALTER TABLE "ui_labels_locales" ADD CONSTRAINT "ui_labels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ui_labels"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "ui_labels_locales_locale_parent_id_unique" ON "ui_labels_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ui_labels" CASCADE;
  DROP TABLE "ui_labels_locales" CASCADE;
  ALTER TABLE "site_settings_locales" DROP COLUMN "seo_title_template";
  ALTER TABLE "site_settings_locales" DROP COLUMN "seo_default_description";`)
}
