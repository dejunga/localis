import { relations, sql } from "drizzle-orm";
import {
  boolean,
  char,
  date,
  index,
  integer,
  jsonb,
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
export const popustTip = pgEnum("popust_tip", ["postotak", "iznos"]);
export const prijavaIzvor = pgEnum("prijava_izvor", ["web", "admin"]);

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
  // Admin upisuje ručno kad klijent pošalje narudžbenicu; ide u export za računovodstvo.
  brojNarudzbenice: text("broj_narudzbenice"),
  // Admin ručno označava kad klijent plati; ide u export za računovodstvo.
  placeno: boolean("placeno").notNull().default(false),
  // Postavlja se na današnji dan kad se označi plaćeno; admin ga može ispraviti. NULL kad nije plaćeno.
  datumPlacanja: date("datum_placanja"),
  // Privola kontakt osobe za obavijesti o budućim edukacijama. NULL = nije dana ili je povučena.
  privolaObavijestiAt: timestamp("privola_obavijesti_at", { withTimezone: true }),
  privolaObavijestiVerzija: text("privola_obavijesti_verzija"),
  privolaPovucenaAt: timestamp("privola_povucena_at", { withTimezone: true }),
  status: prijavaStatus("status").notNull().default("nova"),
  // "admin" = Marija je prijavu unijela ručno (telefon, mail) umjesto klijenta preko forme.
  izvor: prijavaIzvor("izvor").notNull().default("web"),
  // Popust koji admin želi na sljedećoj ponudi; ponuda ga kopira u snapshot. NULL tip = bez popusta.
  popustTip: popustTip("popust_tip"),
  popustVrijednost: numeric("popust_vrijednost", { precision: 10, scale: 2 }), // % ili EUR, ovisno o tipu
  popustOpis: text("popust_opis"),
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
    // ukupno je nakon popusta; osnovica = ukupno + popustIznos.
    ukupno: numeric("ukupno", { precision: 10, scale: 2 }).notNull(),
    popustTip: popustTip("popust_tip"),
    popustVrijednost: numeric("popust_vrijednost", { precision: 10, scale: 2 }),
    popustIznos: numeric("popust_iznos", { precision: 10, scale: 2 }),
    popustOpis: text("popust_opis"),
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

// Izmjene tekstova na stranicama iz /admin/tekstovi. Izvorni tekst je u lib/tekstovi.ts;
// ovdje su samo polja koja se od njega razlikuju.
export const tekstovi = pgTable("tekstovi", {
  kljuc: text("kljuc").primaryKey(),
  vrijednost: text("vrijednost").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const brojacPonuda =pgTable("brojac_ponuda", {
  godina: integer("godina").primaryKey(),
  zadnjiBroj: integer("zadnji_broj").notNull().default(0),
});

// Zaštita javnih formi od spama: jedan red = jedan pokušaj slanja pod ključem
// (npr. "prijava-ip:<hash>"). Redovi stariji od dan brišu se pri svakom pokušaju.
export const rateLimitPokusaji = pgTable(
  "rate_limit_pokusaji",
  {
    id: serial("id").primaryKey(),
    kljuc: text("kljuc").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("rate_limit_kljuc_vrijeme").on(t.kljuc, t.createdAt),
    index("rate_limit_vrijeme").on(t.createdAt),
  ],
);

export const upitnikPreporuka = pgEnum("upitnik_preporuka", ["da", "mozda", "ne"]);

// Jedan red = jedan poslani upitnik s /upitnik/[slug]. Anoniman osim ako polaznik sam upiše kontakt.
export const upitniciOdgovori = pgTable(
  "upitnici_odgovori",
  {
    id: serial("id").primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    seminarSlug: text("seminar_slug").notNull(),
    // Snapshot naslova, kao u prijavama.
    seminarTitle: text("seminar_title").notNull(),
    ocjenaUkupno: integer("ocjena_ukupno").notNull(), // 1-5
    ocjenaKorisnost: integer("ocjena_korisnost").notNull(), // 1-5
    // Snapshot imena predavača u trenutku slanja.
    ocjenePredavaca: jsonb("ocjene_predavaca").$type<{ ime: string; ocjena: number }[]>().notNull(),
    preporuka: upitnikPreporuka("preporuka"),
    svidjelo: text("svidjelo"),
    popraviti: text("popraviti"),
    recenzija: text("recenzija"),
    strucnaPomoc: text("strucna_pomoc"),
    kontaktIme: text("kontakt_ime"),
    kontaktUstanova: text("kontakt_ustanova"),
    kontaktEmail: text("kontakt_email"),
    // Privola za javljanje na kontakt email; NULL kad emaila nema.
    privolaKontaktAt: timestamp("privola_kontakt_at", { withTimezone: true }),
    privolaKontaktVerzija: text("privola_kontakt_verzija"),
    // Dopuštenje da se recenzija objavi na stranici (bez imena); NULL kad nema recenzije ili kvačice.
    privolaObjavaAt: timestamp("privola_objava_at", { withTimezone: true }),
    privolaObjavaVerzija: text("privola_objava_verzija"),
  },
  (t) => [index("upitnici_odgovori_slug").on(t.seminarSlug)],
);

// Jedan red = mail s upitnikom kontakt osobi jedne prijave. Unique na prijavi štiti od dvostrukog slanja.
// Red bez poslan_at i bez greske (slanje prošlo, upis pao) smatra se poslanim - radije nijedan mail nego dva.
export const upitniciMailovi = pgTable("upitnici_mailovi", {
  id: serial("id").primaryKey(),
  prijavaId: integer("prijava_id")
    .notNull()
    .unique()
    .references(() => prijave.id),
  seminarSlug: text("seminar_slug").notNull(),
  email: text("email").notNull(), // snapshot adrese na koju je poslano
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  poslanAt: timestamp("poslan_at", { withTimezone: true }),
  greska: text("greska"),
});

// Materijali s edukacije (prezentacija i sl.) za mail nakon edukacije. Datoteka je u privatnom Blobu.
export const upitniciMaterijali = pgTable(
  "upitnici_materijali",
  {
    id: serial("id").primaryKey(),
    seminarSlug: text("seminar_slug").notNull(),
    naziv: text("naziv").notNull(), // izvorno ime datoteke, prikazuje se polaznicima
    blobUrl: text("blob_url").notNull(),
    pathname: text("pathname").notNull(), // za presigned preuzimanje
    velicina: integer("velicina").notNull(), // bajtovi
    contentType: text("content_type"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("upitnici_materijali_slug").on(t.seminarSlug)],
);

// Termin maila nakon edukacije. Bez reda ili s datum_slanja NULL mail ne ide.
export const upitniciSlanja = pgTable("upitnici_slanja", {
  seminarSlug: text("seminar_slug").primaryKey(),
  datumSlanja: date("datum_slanja"), // "YYYY-MM-DD"; cron šalje taj dan
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
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
export type UpitnikOdgovor = typeof upitniciOdgovori.$inferSelect;
export type UpitnikMail = typeof upitniciMailovi.$inferSelect;
export type UpitnikMaterijal = typeof upitniciMaterijali.$inferSelect;
