CREATE TABLE "rate_limit_pokusaji" (
	"id" serial PRIMARY KEY NOT NULL,
	"kljuc" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_kljuc_vrijeme" ON "rate_limit_pokusaji" USING btree ("kljuc","created_at");--> statement-breakpoint
CREATE INDEX "rate_limit_vrijeme" ON "rate_limit_pokusaji" USING btree ("created_at");