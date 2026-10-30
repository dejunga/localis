CREATE TABLE "upitnici_materijali" (
	"id" serial PRIMARY KEY NOT NULL,
	"seminar_slug" text NOT NULL,
	"naziv" text NOT NULL,
	"blob_url" text NOT NULL,
	"pathname" text NOT NULL,
	"velicina" integer NOT NULL,
	"content_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upitnici_slanja" (
	"seminar_slug" text PRIMARY KEY NOT NULL,
	"datum_slanja" date,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "upitnici_materijali_slug" ON "upitnici_materijali" USING btree ("seminar_slug");