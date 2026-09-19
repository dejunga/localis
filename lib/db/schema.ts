import { relations, sql } from "drizzle-orm";
import {
  char,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const prijavaStatus = pgEnum("prijava_status", ["nova", "ponuda_poslana", "stornirana"]);
export const ponudaStatus = pgEnum("ponuda_status", ["poslana", "stornirana", "greska"]);

// Jedna prijava = jedan submit forme na /edukacije/[slug].
export const prijave = pgTable("prijave", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  seminarSlug: text("seminar_slug").notNull(),
  // Snapshot naslova - ako se naslov u edukacije.ts kasnije promijeni, prijava pamti original.
  seminarTitle: text("seminar_title").notNull(),
  kontaktIme: text("kontakt_ime").notNull(),
  email: text("email").notNull(),
  telefon: text("telefon").notNull(),
  organizacija: text("organizacija").notNull(),
  adresa: text("adresa").notNull(),
  oib: char("oib", { length: 11 }).notNull(),
  napomena: text("napomena"),
  status: prijavaStatus("status").notNull().default("nova"),
});

export const polaznici = pgTable("polaznici", {
  id: serial("id").primaryKey(),
  prijavaId: integer("prijava_id")
    .notNull()
    .references(() => prijave.id, { onDelete: "cascade" }),
  ime: text("ime").notNull(),
  radnoMjesto: text("radno_mjesto").notNull(),
});

// Ponuda je snapshot: sve što je pisalo na PDF-u sprema se ovdje i ne mijenja se retroaktivno.
export const ponude = pgTable(
  "ponude",
  {
    id: serial("id").primaryKey(),
    prijavaId: integer("prijava_id")
      .notNull()
      .references(() => prijave.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    redniBroj: integer("redni_broj").notNull(),
    godina: integer("godina").notNull(),
    broj: text("broj").notNull().unique(), // npr. "8-112/26"
    datumIzdavanja: date("datum_izdavanja").notNull(),
    vrijediDo: date("vrijedi_do").notNull(),
    rokPlacanja: date("rok_placanja").notNull(),
    kolicina: integer("kolicina").notNull(),
    cijena: numeric("cijena", { precision: 10, scale: 2 }).notNull(),
    ukupno: numeric("ukupno", { precision: 10, scale: 2 }).notNull(),
    pdfUrl: text("pdf_url"),
    // Kreće kao "greska" i prelazi u "poslana" tek kad PDF + Blob + mail prođu.
    status: ponudaStatus("status").notNull().default("greska"),
    storniranaAt: timestamp("stornirana_at", { withTimezone: true }),
    emailPoslanAt: timestamp("email_poslan_at", { withTimezone: true }),
    greska: text("greska"),
  },
  (t) => [
    // Najviše jedna aktivna (ne-stornirana) ponuda po prijavi - štiti od dvoklika u adminu.
    uniqueIndex("ponude_aktivna_po_prijavi")
      .on(t.prijavaId)
      .where(sql`${t.status} <> 'stornirana'`),
  ],
);

export const postavke = pgTable("postavke", {
  kljuc: text("kljuc").primaryKey(),
  vrijednost: text("vrijednost").notNull(),
});

export const brojacPonuda = pgTable("brojac_ponuda", {
  godina: integer("godina").primaryKey(),
  zadnjiBroj: integer("zadnji_broj").notNull().default(0),
});

// Relacije za db.query.* (admin lista).
export const prijaveRelations = relations(prijave, ({ many }) => ({
  polaznici: many(polaznici),
  ponude: many(ponude),
}));
export const polazniciRelations = relations(polaznici, ({ one }) => ({
  prijava: one(prijave, { fields: [polaznici.prijavaId], references: [prijave.id] }),
}));
export const ponudeRelations = relations(ponude, ({ one }) => ({
  prijava: one(prijave, { fields: [ponude.prijavaId], references: [prijave.id] }),
}));

export type Prijava = typeof prijave.$inferSelect;
export type Polaznik = typeof polaznici.$inferSelect;
export type Ponuda = typeof ponude.$inferSelect;
