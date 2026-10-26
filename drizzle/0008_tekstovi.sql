CREATE TABLE "tekstovi" (
	"kljuc" text PRIMARY KEY NOT NULL,
	"vrijednost" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
