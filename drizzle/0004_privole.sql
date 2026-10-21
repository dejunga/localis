ALTER TABLE "prijave" ADD COLUMN "privola_obavijesti_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "prijave" ADD COLUMN "privola_obavijesti_verzija" text;--> statement-breakpoint
ALTER TABLE "prijave" ADD COLUMN "privola_povucena_at" timestamp with time zone;