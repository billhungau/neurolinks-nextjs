import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "insights" ADD COLUMN "ai_source_session" varchar;
    ALTER TABLE "_insights_v" ADD COLUMN "version_ai_source_session" varchar;

    CREATE TABLE "ai_source_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "session_id" varchar NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric
    );

    CREATE INDEX "ai_source_documents_session_id_idx" ON "ai_source_documents" USING btree ("session_id");
    CREATE INDEX "ai_source_documents_expires_at_idx" ON "ai_source_documents" USING btree ("expires_at");
    CREATE INDEX "ai_source_documents_updated_at_idx" ON "ai_source_documents" USING btree ("updated_at");
    CREATE INDEX "ai_source_documents_created_at_idx" ON "ai_source_documents" USING btree ("created_at");
    CREATE UNIQUE INDEX "ai_source_documents_filename_idx" ON "ai_source_documents" USING btree ("filename");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "ai_source_documents" CASCADE;
    ALTER TABLE "_insights_v" DROP COLUMN "version_ai_source_session";
    ALTER TABLE "insights" DROP COLUMN "ai_source_session";
  `)
}
