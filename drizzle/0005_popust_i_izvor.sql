CREATE TYPE "public"."popust_tip" AS ENUM('postotak', 'iznos');--> statement-breakpoint
CREATE TYPE "public"."prijava_izvor" AS ENUM('web', 'admin');--> statement-breakpoint
ALTER TABLE "ponude" ADD COLUMN "popust_tip" "popust_tip";--> statement-breakpoint
ALTER TABLE "ponude" ADD COLUMN "popust_vrijednost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "ponude" ADD COLUMN "popust_iznos" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "ponude" ADD COLUMN "popust_opis" text;--> statement-breakpoint
ALTER TABLE "prijave" ADD COLUMN "izvor" "prijava_izvor" DEFAULT 'web' NOT NULL;--> statement-breakpoint
ALTER TABLE "prijave" ADD COLUMN "popust_tip" "popust_tip";--> statement-breakpoint
ALTER TABLE "prijave" ADD COLUMN "popust_vrijednost" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "prijave" ADD COLUMN "popust_opis" text;