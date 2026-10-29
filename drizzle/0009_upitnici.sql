CREATE TYPE "public"."upitnik_preporuka" AS ENUM('da', 'mozda', 'ne');--> statement-breakpoint
CREATE TABLE "upitnici_mailovi" (
	"id" serial PRIMARY KEY NOT NULL,
	"prijava_id" integer NOT NULL,
	"seminar_slug" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"poslan_at" timestamp with time zone,
	"greska" text,
	CONSTRAINT "upitnici_mailovi_prijava_id_unique" UNIQUE("prijava_id")
);
--> statement-breakpoint
CREATE TABLE "upitnici_odgovori" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seminar_slug" text NOT NULL,
	"seminar_title" text NOT NULL,
	"ocjena_ukupno" integer NOT NULL,
	"ocjena_korisnost" integer NOT NULL,
	"ocjene_predavaca" jsonb NOT NULL,
	"preporuka" "upitnik_preporuka",
	"svidjelo" text,
	"popraviti" text,
	"recenzija" text,
	"strucna_pomoc" text,
	"kontakt_ime" text,
	"kontakt_ustanova" text,
	"kontakt_email" text,
	"privola_kontakt_at" timestamp with time zone,
	"privola_kontakt_verzija" text
);
--> statement-breakpoint
ALTER TABLE "upitnici_mailovi" ADD CONSTRAINT "upitnici_mailovi_prijava_id_prijave_id_fk" FOREIGN KEY ("prijava_id") REFERENCES "public"."prijave"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "upitnici_odgovori_slug" ON "upitnici_odgovori" USING btree ("seminar_slug");