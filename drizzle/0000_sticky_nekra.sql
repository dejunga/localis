CREATE TYPE "public"."ponuda_status" AS ENUM('poslana', 'stornirana', 'greska');--> statement-breakpoint
CREATE TYPE "public"."prijava_status" AS ENUM('nova', 'ponuda_poslana', 'stornirana');--> statement-breakpoint
CREATE TABLE "brojac_ponuda" (
	"godina" integer PRIMARY KEY NOT NULL,
	"zadnji_broj" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "polaznici" (
	"id" serial PRIMARY KEY NOT NULL,
	"prijava_id" integer NOT NULL,
	"ime" text NOT NULL,
	"radno_mjesto" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ponude" (
	"id" serial PRIMARY KEY NOT NULL,
	"prijava_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"redni_broj" integer NOT NULL,
	"godina" integer NOT NULL,
	"broj" text NOT NULL,
	"datum_izdavanja" date NOT NULL,
	"vrijedi_do" date NOT NULL,
	"rok_placanja" date NOT NULL,
	"kolicina" integer NOT NULL,
	"cijena" numeric(10, 2) NOT NULL,
	"ukupno" numeric(10, 2) NOT NULL,
	"pdf_url" text,
	"status" "ponuda_status" DEFAULT 'greska' NOT NULL,
	"stornirana_at" timestamp with time zone,
	"email_poslan_at" timestamp with time zone,
	"greska" text,
	CONSTRAINT "ponude_broj_unique" UNIQUE("broj")
);
--> statement-breakpoint
CREATE TABLE "postavke" (
	"kljuc" text PRIMARY KEY NOT NULL,
	"vrijednost" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prijave" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seminar_slug" text NOT NULL,
	"seminar_title" text NOT NULL,
	"kontakt_ime" text NOT NULL,
	"email" text NOT NULL,
	"telefon" text NOT NULL,
	"organizacija" text NOT NULL,
	"adresa" text NOT NULL,
	"oib" char(11) NOT NULL,
	"napomena" text,
	"status" "prijava_status" DEFAULT 'nova' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "polaznici" ADD CONSTRAINT "polaznici_prijava_id_prijave_id_fk" FOREIGN KEY ("prijava_id") REFERENCES "public"."prijave"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ponude" ADD CONSTRAINT "ponude_prijava_id_prijave_id_fk" FOREIGN KEY ("prijava_id") REFERENCES "public"."prijave"("id") ON DELETE no action ON UPDATE no action;