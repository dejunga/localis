# Automatske ponude – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kad se netko prijavi na edukaciju, prijava se sprema u Postgres, izdaje se ponuda s jedinstvenim brojem, generira PDF identičan postojećim ručnim ponudama i šalje klijentu + LOCALIS-u; admin panel za pregled, storno i ponovno izdavanje.

**Architecture:** Server akcija `sendSeminarRegistration` nakon validacije sprema prijavu (tx1), zatim `izdajPonudu` u tx2 atomarno povećava godišnji brojač i inserta ponudu, pa `dovrsiPonudu` renderira PDF (`@react-pdf/renderer`), uploada u privatni Vercel Blob i šalje mailove preko postojećeg Zoho SMTP-a. Svaki korak nakon tx1 je "best effort" – greška ostavlja prijavu u bazi i ponudu u statusu `greska` za ručni retry iz admina. Admin je zaštićen HMAC-potpisanim cookiejem, provjera u `proxy.ts` + u svakoj server akciji.

**Tech Stack:** Next.js 16 (App Router, server actions, `proxy.ts`), Drizzle ORM + `pg` na Neon Postgres, `@vercel/blob` (private), `@react-pdf/renderer` + Carlito TTF, nodemailer (Zoho), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-19-automatske-ponude-design.md`

**Infrastruktura već postoji:** Neon `localis-db` i Blob `localis-ponude` povezani na Vercel projekt; `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` su u Vercelu i u `.env.local` (`vercel env pull .env.local` ako fali).

---

## Struktura datoteka

| Datoteka | Odgovornost |
|---|---|
| `lib/db/schema.ts` | Drizzle shema (prijave, polaznici, ponude, postavke, brojac_ponuda) + relacije |
| `lib/db/index.ts` | `db` klijent (pg Pool + attachDatabasePool) |
| `drizzle.config.ts`, `drizzle/` | drizzle-kit config + migracije |
| `scripts/seed.ts` | početne `postavke` |
| `lib/postavke.ts` | čitanje/pisanje postavki s defaultima |
| `lib/email/transport.ts` | zajednički nodemailer transport + `sendMail` s `EMAIL_DRY_RUN` |
| `lib/prijave/spremi.ts` | tx1: insert prijave + polaznika; ažuriranje iz admina |
| `lib/prijave/ucitaj.ts` | čitanje prijave s polaznicima i ponudama (admin + izdaj) |
| `lib/ponude/izdavatelj.ts` | konstante LOCALIS + boje |
| `lib/ponude/datumi.ts` | izračun datuma ponude |
| `lib/ponude/format.ts` | hr datumi, iznosi, polaznici, broj, naziv datoteke |
| `lib/ponude/PonudaPdf.tsx` | React-PDF dokument |
| `lib/ponude/pdf.ts` | `renderToBuffer` wrapper + tip podataka |
| `lib/ponude/blob.ts` | upload/download privatnog bloba |
| `lib/ponude/email.ts` | mail klijentu, interni mail, storno mail |
| `lib/ponude/izdaj.ts` | tx2 brojač+insert, `dovrsiPonudu`, storno, ponovni mail |
| `lib/admin/session.ts` | HMAC cookie: napravi/provjeri token, `zahtijevajAdmina` |
| `proxy.ts` | redirect neautoriziranog `/admin/*` na login |
| `app/admin/**` | login, lista prijava, detalj, postavke, PDF download |
| `app/(site)/edukacije/actions.ts` | orkestracija toka prijave (modificira se) |
| `lib/edukacije.ts` | `ponuda` blok u `Seminar` (modificira se) |

---

### Task 1: Ovisnosti, Vitest, env primjer

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Modify: `.env.example`
- Modify: `next.config.ts`

- [ ] **Step 1: Instaliraj pakete**

```bash
npm i drizzle-orm pg @vercel/functions @vercel/blob @react-pdf/renderer
npm i -D drizzle-kit @types/pg vitest dotenv tsx pdf-parse@1.1.1 @types/pdf-parse
```

- [ ] **Step 2: Dodaj skripte u `package.json`**

U `"scripts"` dodaj:

```json
"test": "vitest run",
"test:watch": "vitest",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:seed": "tsx --env-file=.env.local scripts/seed.ts"
```

- [ ] **Step 3: Vitest config**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import path from "node:path";

config({ path: ".env.local" });

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: next.config.ts – react-pdf kao external, fontovi u trace**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pdf ima native/binary ovisnosti - ne bundlati.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Fontovi i logo za PDF čitaju se s diska u runtimeu; osiguraj da uđu u serverless bundle.
  outputFileTracingIncludes: {
    "/*": ["./public/fonts/**/*", "./public/ponuda/**/*"],
  },
};

export default nextConfig;
```

- [ ] **Step 5: `.env.example` – nove varijable**

Dodaj na kraj:

```
# Baza (Neon preko Vercel Marketplace) - `vercel env pull .env.local` ih dovlači automatski.
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Vercel Blob (privatni store localis-ponude) - PDF-ovi ponuda
BLOB_READ_WRITE_TOKEN=

# Admin panel /admin - jedna zajednička lozinka + tajna za potpis cookieja (random, 32+ znakova)
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

# 1 = mailovi se samo logiraju u konzolu (lokalni razvoj/testovi)
EMAIL_DRY_RUN=
```

- [ ] **Step 6: Provjeri da sve radi**

Run: `npx vitest run`
Expected: `No test files found` (bitno je da vitest starta bez config greške).

Run: `npm run build`
Expected: build prolazi.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts next.config.ts .env.example
git commit -m "Add Drizzle, Vercel Blob, react-pdf and Vitest dependencies"
```

---

### Task 2: Drizzle shema, klijent, migracija, seed

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Create: `drizzle.config.ts`
- Create: `scripts/seed.ts`
- Create: `drizzle/` (generirano)

- [ ] **Step 1: Shema**

`lib/db/schema.ts`:

```ts
import { relations } from "drizzle-orm";
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
export const ponude = pgTable("ponude", {
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
});

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
```

- [ ] **Step 2: Klijent**

`lib/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

// Jedan pool po procesu - Next u devu hot-reloada module, pa ga čuvamo na globalThis.
const globalForDb = globalThis as unknown as { __localisPool?: Pool };

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nije postavljen.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  // Vercel Fluid compute: zatvori konekcije kad se instanca gasi.
  attachDatabasePool(pool);
  return pool;
}

const pool = globalForDb.__localisPool ?? createPool();
globalForDb.__localisPool = pool;

export const db = drizzle({ client: pool, schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
```

- [ ] **Step 3: drizzle-kit config**

`drizzle.config.ts`:

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Migracije idu preko direktne (unpooled) konekcije - Neon preporuka.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_UNPOOLED ili DATABASE_URL nije postavljen.");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
```

- [ ] **Step 4: Generiraj i primijeni migraciju**

Run: `npm run db:generate`
Expected: `drizzle/0000_*.sql` kreiran, sadrži `CREATE TABLE "prijave"`, `"polaznici"`, `"ponude"`, `"postavke"`, `"brojac_ponuda"` i dva `CREATE TYPE`.

Run: `npm run db:migrate`
Expected: bez greške (drizzle ispiše da su migracije primijenjene).

- [ ] **Step 5: Seed postavki**

`scripts/seed.ts`:

```ts
import { db } from "../lib/db";
import { postavke } from "../lib/db/schema";

const pocetne = [
  { kljuc: "broj_ponude_sredina", vrijednost: "112" },
  { kljuc: "dani_valjanosti", vrijednost: "2" },
  { kljuc: "potpisnik", vrijednost: "Milada Sofka, voditeljica ureda" },
];

async function main() {
  await db.insert(postavke).values(pocetne).onConflictDoNothing();
  const rows = await db.select().from(postavke);
  console.log(rows);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

Run: `npm run db:seed`
Expected: ispis tri reda postavki.

- [ ] **Step 6: Commit**

```bash
git add lib/db drizzle drizzle.config.ts scripts/seed.ts
git commit -m "Add Drizzle schema, client and initial migration for registrations and offers"
```

---

### Task 3: Postavke – čitanje s defaultima

**Files:**
- Create: `lib/postavke.ts`

- [ ] **Step 1: Implementacija**

`lib/postavke.ts`:

```ts
import { db } from "@/lib/db";
import { postavke } from "@/lib/db/schema";

export type Postavke = {
  brojPonudeSredina: string;
  daniValjanosti: number;
  potpisnik: string;
};

// Defaulti vrijede dok seed ne prođe ili ako netko obriše red.
const DEFAULTI: Postavke = {
  brojPonudeSredina: "112",
  daniValjanosti: 2,
  potpisnik: "Milada Sofka, voditeljica ureda",
};

export async function getPostavke(): Promise<Postavke> {
  const rows = await db.select().from(postavke);
  const map = new Map(rows.map((r) => [r.kljuc, r.vrijednost]));
  const dani = Number(map.get("dani_valjanosti"));
  return {
    brojPonudeSredina: map.get("broj_ponude_sredina") ?? DEFAULTI.brojPonudeSredina,
    daniValjanosti: Number.isInteger(dani) && dani >= 0 ? dani : DEFAULTI.daniValjanosti,
    potpisnik: map.get("potpisnik") ?? DEFAULTI.potpisnik,
  };
}

export async function setPostavke(nove: Postavke): Promise<void> {
  const rows = [
    { kljuc: "broj_ponude_sredina", vrijednost: nove.brojPonudeSredina },
    { kljuc: "dani_valjanosti", vrijednost: String(nove.daniValjanosti) },
    { kljuc: "potpisnik", vrijednost: nove.potpisnik },
  ];
  for (const row of rows) {
    await db
      .insert(postavke)
      .values(row)
      .onConflictDoUpdate({ target: postavke.kljuc, set: { vrijednost: row.vrijednost } });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/postavke.ts
git commit -m "Add settings accessor with defaults"
```

---

### Task 4: `ponuda` blok u `lib/edukacije.ts`

**Files:**
- Modify: `lib/edukacije.ts`

- [ ] **Step 1: Tip**

U `Seminar` tip, iza `priceNote?: string;` dodaj:

```ts
  // Podaci za automatsku ponudu. Bez ovog bloka prijava ne izdaje ponudu (samo interni mail).
  ponuda?: {
    cijena: number; // EUR po polazniku, bez PDV-a
    predavac: string; // kako piše na ponudi, npr. "Dipl.iur. X i dipl.iur. Y"
    mjesto: string; // puna adresa održavanja
    ukljuceno: string;
    nazivStavke?: string; // default: `${kicker} – ${title}`
  };
```

- [ ] **Step 2: Podaci za obje edukacije**

Edukacija `izvanredni-pravni-lijekovi-u-upravnom-postupku`, iza `priceNote`:

```ts
    ponuda: {
      cijena: 199,
      predavac: "Prof. dr. sc. Dario Đerđa",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      ukljuceno: "radni materijali, coffee break, potvrda o sudjelovanju",
    },
```

Edukacija `kako-izraditi-opci-akt-u-jlprs`, iza `priceNote`:

```ts
    ponuda: {
      cijena: 199,
      predavac: "Dipl.iur. Vikica Duvnjak i dipl.iur. Aleksandra Jozić-Ileković",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      ukljuceno: "radni materijali, coffee break, potvrda o sudjelovanju",
    },
```

- [ ] **Step 3: Komentar**

Zamijeni `// Ručno dodane edukacije. Nova edukacija: dodati objekt u niz ispod.` s:

```ts
// Ručno dodane edukacije. Nova edukacija: dodati objekt u niz ispod.
// Blok `ponuda` je obavezan za plaćene edukacije - bez njega prijava ne šalje ponudu.
```

- [ ] **Step 4: Provjera**

Run: `npx tsc --noEmit`
Expected: bez grešaka.

- [ ] **Step 5: Commit**

```bash
git add lib/edukacije.ts
git commit -m "Add offer data block to seminars"
```

---

### Task 5: Zajednički email transport + dry run

**Files:**
- Create: `lib/email/transport.ts`
- Modify: `app/(site)/kontakt/actions.ts`
- Modify: `app/(site)/edukacije/actions.ts` (samo transport dio – tok se mijenja u Tasku 13)

- [ ] **Step 1: Transport**

`lib/email/transport.ts`:

```ts
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export type MailConfig = {
  user: string; // Zoho račun s kojeg se šalje (info@localis.hr)
  internalTo: string; // kamo idu interne obavijesti (CONTACT_TO)
};

export function getMailConfig(): MailConfig | null {
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;
  if (process.env.EMAIL_DRY_RUN === "1") {
    const u = user ?? "info@localis.hr";
    return { user: u, internalTo: process.env.CONTACT_TO ?? u };
  }
  if (!user || !pass) return null;
  return { user, internalTo: process.env.CONTACT_TO ?? user };
}

let cached: nodemailer.Transporter | null = null;

function getTransport() {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: "smtppro.zoho.eu",
    port: 465,
    secure: true,
    auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASSWORD },
  });
  return cached;
}

// EMAIL_DRY_RUN=1 -> mail se logira umjesto šalje (lokalno, testovi).
export async function sendMail(options: Mail.Options): Promise<void> {
  if (process.env.EMAIL_DRY_RUN === "1") {
    const attachments = (options.attachments ?? []).map((a) => a.filename).join(", ");
    console.log(
      `[EMAIL_DRY_RUN] to=${String(options.to)} subject=${options.subject} attachments=[${attachments}]\n${options.text}`,
    );
    return;
  }
  await getTransport().sendMail(options);
}
```

- [ ] **Step 2: Kontakt forma koristi transport**

U `app/(site)/kontakt/actions.ts`:
- Zamijeni `import nodemailer from "nodemailer";` s `import { getMailConfig, sendMail } from "@/lib/email/transport";`
- Zamijeni blok od `const user = process.env.ZOHO_SMTP_USER;` do kraja `if (!user || !pass) { ... }` s:

```ts
  const mail = getMailConfig();
  if (!mail) {
    console.error("Kontakt forma: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Slanje trenutno nije moguće. Javite nam se na info@localis.hr.",
    };
  }
```

- U `try` bloku obriši `const transport = nodemailer.createTransport({...});` i zamijeni `await transport.sendMail({` s `await sendMail({`; `from: \`"LOCALIS web" <${user}>\`` → `from: \`"LOCALIS web" <${mail.user}>\``; `to,` → `to: mail.internalTo,`.

- [ ] **Step 3: Isto u `app/(site)/edukacije/actions.ts`**

Ista zamjena kao u koraku 2 (import, config blok, `sendMail`, `mail.user`, `mail.internalTo`). Poruka greške ostaje "Prijava trenutno nije moguća...".

- [ ] **Step 4: Provjera**

Run: `npx tsc --noEmit && npm run lint`
Expected: bez grešaka.

Ručno: `EMAIL_DRY_RUN=1` u `.env.local`, `npm run dev`, pošalji kontakt formu → u konzoli `[EMAIL_DRY_RUN] to=...`.

- [ ] **Step 5: Commit**

```bash
git add lib/email/transport.ts "app/(site)/kontakt/actions.ts" "app/(site)/edukacije/actions.ts"
git commit -m "Extract shared mail transport with dry-run mode"
```

---

### Task 6: Datumi ponude

**Files:**
- Create: `lib/ponude/datumi.ts`
- Test: `lib/ponude/datumi.test.ts`

- [ ] **Step 1: Test**

`lib/ponude/datumi.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { danasZagreb, dodajDane, izracunajDatumePonude } from "./datumi";

describe("dodajDane", () => {
  it("dodaje dane preko granice mjeseca", () => {
    expect(dodajDane("2026-09-30", 2)).toBe("2026-10-02");
  });
  it("dodaje dane preko granice godine", () => {
    expect(dodajDane("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("danasZagreb", () => {
  it("vraća ISO datum po zagrebačkom vremenu", () => {
    // 23:30 UTC 19.9. = 01:30 20.9. u Zagrebu (CEST)
    expect(danasZagreb(new Date("2026-09-19T23:30:00Z"))).toBe("2026-09-20");
  });
});

describe("izracunajDatumePonude", () => {
  it("vrijedi do = rok plaćanja = izdavanje + dani", () => {
    expect(
      izracunajDatumePonude({ danas: "2026-09-17", daniValjanosti: 2, datumEdukacije: "2026-09-28" }),
    ).toEqual({ datumIzdavanja: "2026-09-17", vrijediDo: "2026-09-19", rokPlacanja: "2026-09-19" });
  });
  it("ne prelazi datum edukacije", () => {
    expect(
      izracunajDatumePonude({ danas: "2026-09-27", daniValjanosti: 2, datumEdukacije: "2026-09-28" }),
    ).toEqual({ datumIzdavanja: "2026-09-27", vrijediDo: "2026-09-28", rokPlacanja: "2026-09-28" });
  });
  it("nikad prije dana izdavanja", () => {
    expect(
      izracunajDatumePonude({ danas: "2026-09-28", daniValjanosti: 2, datumEdukacije: "2026-09-28" }),
    ).toEqual({ datumIzdavanja: "2026-09-28", vrijediDo: "2026-09-28", rokPlacanja: "2026-09-28" });
  });
});
```

- [ ] **Step 2: Pokreni – pada**

Run: `npx vitest run lib/ponude/datumi.test.ts`
Expected: FAIL – `Cannot find module './datumi'`.

- [ ] **Step 3: Implementacija**

`lib/ponude/datumi.ts`:

```ts
// Svi datumi su ISO stringovi "YYYY-MM-DD" - isto kao Drizzle `date` kolone.

export function dodajDane(iso: string, dani: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dani)).toISOString().slice(0, 10);
}

export function danasZagreb(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zagreb" }).format(now);
}

export type DatumiPonude = {
  datumIzdavanja: string;
  vrijediDo: string;
  rokPlacanja: string;
};

// Pravilo (spec): vrijedi do = rok plaćanja = izdavanje + N dana, ali nikad nakon
// datuma edukacije i nikad prije dana izdavanja.
export function izracunajDatumePonude(input: {
  danas: string;
  daniValjanosti: number;
  datumEdukacije: string;
}): DatumiPonude {
  let vrijediDo = dodajDane(input.danas, input.daniValjanosti);
  if (vrijediDo > input.datumEdukacije) vrijediDo = input.datumEdukacije;
  if (vrijediDo < input.danas) vrijediDo = input.danas;
  return { datumIzdavanja: input.danas, vrijediDo, rokPlacanja: vrijediDo };
}
```

- [ ] **Step 4: Pokreni – prolazi**

Run: `npx vitest run lib/ponude/datumi.test.ts`
Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/ponude/datumi.ts lib/ponude/datumi.test.ts
git commit -m "Add offer date calculation"
```

---

### Task 7: Formatiranje

**Files:**
- Create: `lib/ponude/format.ts`
- Test: `lib/ponude/format.test.ts`

- [ ] **Step 1: Test**

`lib/ponude/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  formatDatumHr,
  formatIznos,
  formatPolaznici,
  nazivDatotekePonude,
  sastaviBrojPonude,
} from "./format";

describe("formatDatumHr", () => {
  it("piše mjesec u genitivu s točkom na kraju", () => {
    expect(formatDatumHr("2026-09-28")).toBe("28. rujna 2026.");
    expect(formatDatumHr("2026-01-05")).toBe("5. siječnja 2026.");
    expect(formatDatumHr("2026-11-01")).toBe("1. studenoga 2026.");
  });
});

describe("formatIznos", () => {
  it("hr format s dvije decimale", () => {
    expect(formatIznos(199)).toBe("199,00");
    expect(formatIznos(1199)).toBe("1.199,00");
    expect(formatIznos("398.00")).toBe("398,00");
    expect(formatIznos(0)).toBe("0,00");
  });
});

describe("formatPolaznici", () => {
  const a = { ime: "Ana Anić", radnoMjesto: "pročelnica" };
  const b = { ime: "Bruno Brunić", radnoMjesto: "viši savjetnik" };
  const c = { ime: "Cvita Cvitić", radnoMjesto: "referentica" };
  it("jedan", () => expect(formatPolaznici([a])).toBe("Ana Anić, pročelnica"));
  it("dva", () =>
    expect(formatPolaznici([a, b])).toBe("Ana Anić, pročelnica i Bruno Brunić, viši savjetnik"));
  it("tri", () =>
    expect(formatPolaznici([a, b, c])).toBe(
      "Ana Anić, pročelnica; Bruno Brunić, viši savjetnik i Cvita Cvitić, referentica",
    ));
  it("prazno", () => expect(formatPolaznici([])).toBe(""));
});

describe("sastaviBrojPonude", () => {
  it("redni-sredina/yy", () => {
    expect(sastaviBrojPonude(8, "112", 2026)).toBe("8-112/26");
    expect(sastaviBrojPonude(1, "112", 2027)).toBe("1-112/27");
  });
});

describe("nazivDatotekePonude", () => {
  it("bez kose crte i zabranjenih znakova", () => {
    expect(nazivDatotekePonude("8-112/26", "Grad Čabar")).toBe("Ponuda 8-112-26 - Grad Čabar.pdf");
    expect(nazivDatotekePonude("8-112/26", 'Općina "X" / Y')).toBe("Ponuda 8-112-26 - Općina X  Y.pdf");
  });
});
```

- [ ] **Step 2: Pokreni – pada**

Run: `npx vitest run lib/ponude/format.test.ts`
Expected: FAIL – modul ne postoji.

- [ ] **Step 3: Implementacija**

`lib/ponude/format.ts`:

```ts
const MJESECI_GENITIV = [
  "siječnja",
  "veljače",
  "ožujka",
  "travnja",
  "svibnja",
  "lipnja",
  "srpnja",
  "kolovoza",
  "rujna",
  "listopada",
  "studenoga",
  "prosinca",
];

// "2026-09-28" -> "28. rujna 2026."  Ručna tablica, ne Intl - da server i test daju isto.
export function formatDatumHr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MJESECI_GENITIV[m - 1]} ${y}.`;
}

const hrBroj = new Intl.NumberFormat("hr-HR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 1199 -> "1.199,00". Prima i string jer Drizzle numeric vraća string.
export function formatIznos(n: number | string): string {
  return hrBroj.format(Number(n));
}

export type PolaznikZaIspis = { ime: string; radnoMjesto: string };

// 1: "A, rm" | 2: "A, rm i B, rm" | 3+: "A, rm; B, rm i C, rm"
export function formatPolaznici(polaznici: PolaznikZaIspis[]): string {
  const items = polaznici.map((p) => `${p.ime}, ${p.radnoMjesto}`);
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join("; ")} i ${items[items.length - 1]}`;
}

export function sastaviBrojPonude(redniBroj: number, sredina: string, godina: number): string {
  return `${redniBroj}-${sredina}/${String(godina).slice(-2)}`;
}

export function nazivDatotekePonude(broj: string, organizacija: string): string {
  const safeBroj = broj.replace(/\//g, "-");
  const safeOrg = organizacija.replace(/[\\/:*?"<>|]/g, "").trim();
  return `Ponuda ${safeBroj} - ${safeOrg}.pdf`;
}
```

- [ ] **Step 4: Pokreni – prolazi**

Run: `npx vitest run lib/ponude/format.test.ts`
Expected: svi passed. Ako `formatIznos(1199)` vrati `1199,00` (bez točke), Node nema puni ICU – provjeri `node -p "process.versions.icu"`; koristi Node ≥ 20.

- [ ] **Step 5: Commit**

```bash
git add lib/ponude/format.ts lib/ponude/format.test.ts
git commit -m "Add Croatian formatting helpers for offers"
```

---

### Task 8: Konstante izdavatelja, fontovi, logo

**Files:**
- Create: `lib/ponude/izdavatelj.ts`
- Create: `public/fonts/Carlito-Regular.ttf`, `public/fonts/Carlito-Bold.ttf`, `public/fonts/Carlito-Italic.ttf`
- Create: `public/ponuda/logo.png`

- [ ] **Step 1: Konstante**

`lib/ponude/izdavatelj.ts`:

```ts
// Podaci LOCALIS-a kako stoje na ponudi. Pravni naziv ostaje pun ("obrt ...") - ovo je poslovni dokument.
export const IZDAVATELJ = {
  naziv: "LOCALIS, obrt za savjetovanje i edukaciju",
  vlasnik: "vl. Marija Jungić",
  adresa: "Ljudevita Gaja 8, 43290 Grubišno Polje",
  mjesto: "Grubišno Polje",
  telefon: "+385 (0) 95 3135 158",
  email: "info@localis.hr",
  web: "www.localis.hr",
  oib: "07277793412",
  iban: "HR2124020061140660868",
  banka: "Erste & Steiermärkische Bank d.d.",
  swift: "ESBCHR22",
  pdvNapomena:
    "Obrt nije u sustavu PDV-a – PDV nije obračunat temeljem čl. 90. st. 1. i 2. Zakona o porezu na dodanu vrijednost.",
  disclaimer1: "Ovaj dokument služi kao informacija o cijenama i ne smije se uporabiti za knjiženje.",
  disclaimer2: "Ovo nije fiskalizirani račun.",
} as const;

export const BOJE = {
  navy: "#062B47",
  navyLight: "#1A395B",
  gold: "#D49838",
  siva: "#BFD5DC",
  tekst: "#111111",
} as const;
```

- [ ] **Step 2: Fontovi (Carlito = metrički Calibri, OFL licenca)**

```bash
mkdir -p public/fonts public/ponuda
curl -L -o public/fonts/Carlito-Regular.ttf https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-Regular.ttf
curl -L -o public/fonts/Carlito-Bold.ttf    https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-Bold.ttf
curl -L -o public/fonts/Carlito-Italic.ttf  https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-Italic.ttf
ls -la public/fonts
```

Expected: tri datoteke, svaka > 300 KB. Ako je < 10 KB, URL je vratio HTML (404) – otvori https://github.com/googlefonts/carlito/tree/main/fonts/ttf i uzmi točan path.

- [ ] **Step 3: Logo PNG iz SVG-a**

react-pdf ne učitava SVG datoteke kao `<Image>`; rasteriziraj mark:

```bash
npx --yes sharp-cli -i localis_logo/export/svg/localis-mark.svg -o public/ponuda/logo.png resize 400
```

Expected: `public/ponuda/logo.png`, ~400px širine, transparentna pozadina. Otvori i provjeri da je navy stem + zlatni riseri.

- [ ] **Step 4: Commit**

```bash
git add lib/ponude/izdavatelj.ts public/fonts public/ponuda
git commit -m "Add issuer constants, Carlito fonts and logo raster for offer PDF"
```

---

### Task 9: PDF ponude

**Files:**
- Create: `lib/ponude/PonudaPdf.tsx`
- Create: `lib/ponude/pdf.ts`
- Test: `lib/ponude/pdf.test.ts`

- [ ] **Step 1: Test**

`lib/ponude/pdf.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import pdfParse from "pdf-parse";
import { renderPonudaPdf, type PonudaPdfData } from "./pdf";

const cabar: PonudaPdfData = {
  broj: "7-112/26",
  datumIzdavanja: "2026-09-17",
  vrijediDo: "2026-09-19",
  rokPlacanja: "2026-09-19",
  klijent: {
    naziv: "GRAD ČABAR",
    adresa: "Narodnog oslobođenja 2, 51306 Čabar",
    oib: "04026778166",
    kontakt: "Ines Loknar Josić",
    telefon: "095/5014046",
    email: "ines.loknar@cabar.hr",
  },
  edukacija: {
    kicker: "Praktična radionica",
    naslov: "Kako izraditi opći akt u JLP(R)S: od pravnog temelja do sudske prakse",
    predavac: "Dipl.iur. Vikica Duvnjak i dipl.iur. Aleksandra Jozić-Ileković",
    datumLabel: "28. rujna 2026.",
    mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
    ukljuceno: "radni materijali, coffee break, potvrda o sudjelovanju",
    nazivStavke: "Praktična radionica – Kako izraditi opći akt u JLP(R)S: od pravnog temelja do sudske prakse",
  },
  polaznici: [
    { ime: "Ines Loknar Josić", radnoMjesto: "pročelnica" },
    { ime: "Marija Gašpar", radnoMjesto: "viša savjetnica za imovinsko-pravne poslove" },
  ],
  kolicina: 2,
  cijena: 199,
  ukupno: 398,
  potpisnik: "Milada Sofka, voditeljica ureda",
};

describe("renderPonudaPdf", () => {
  it("renderira PDF sa svim ključnim podacima", async () => {
    const buffer = await renderPonudaPdf(cabar);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    const { text, numpages } = await pdfParse(buffer);
    expect(numpages).toBe(1);
    for (const s of [
      "PONUDA BROJ: 7-112/26",
      "GRAD ČABAR",
      "04026778166",
      "Ines Loknar Josić, pročelnica i Marija Gašpar",
      "28. rujna 2026.",
      "17. rujna 2026.",
      "19. rujna 2026.",
      "398,00",
      "199,00",
      "HR00 7-112/26",
      "Milada Sofka, voditeljica ureda",
      "Obrt nije u sustavu PDV-a",
    ]) {
      expect(text).toContain(s);
    }
  }, 30_000);
});
```

- [ ] **Step 2: Pokreni – pada**

Run: `npx vitest run lib/ponude/pdf.test.ts`
Expected: FAIL – modul ne postoji.

- [ ] **Step 3: React-PDF dokument**

`lib/ponude/PonudaPdf.tsx`:

```tsx
import path from "node:path";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { IZDAVATELJ, BOJE } from "./izdavatelj";
import { formatDatumHr, formatIznos, formatPolaznici } from "./format";
import type { PonudaPdfData } from "./pdf";

const fontsDir = path.join(process.cwd(), "public", "fonts");
const logoPath = path.join(process.cwd(), "public", "ponuda", "logo.png");

Font.register({
  family: "Carlito",
  fonts: [
    { src: path.join(fontsDir, "Carlito-Regular.ttf") },
    { src: path.join(fontsDir, "Carlito-Bold.ttf"), fontWeight: "bold" },
    { src: path.join(fontsDir, "Carlito-Italic.ttf"), fontStyle: "italic" },
  ],
});
// Bez rastavljanja riječi - hrvatski se inače lomi na krivim mjestima.
Font.registerHyphenationCallback((word) => [word]);

const s = StyleSheet.create({
  page: {
    fontFamily: "Carlito",
    fontSize: 10.5,
    color: BOJE.tekst,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    lineHeight: 1.35,
  },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  logo: { width: 34, height: 34, marginRight: 10 },
  wordmark: { fontSize: 18, letterSpacing: 2.5, color: BOJE.navy, fontWeight: "bold" },
  tagline: { fontSize: 6.5, letterSpacing: 2, color: BOJE.navy },
  izdavateljNaziv: { fontWeight: "bold", color: BOJE.navy, fontSize: 11 },
  klijentBlok: { alignItems: "flex-end", marginTop: 10 },
  bold: { fontWeight: "bold" },
  naslov: {
    marginTop: 22,
    marginBottom: 4,
    textAlign: "center",
    color: BOJE.navy,
    fontWeight: "bold",
    fontSize: 14,
  },
  zlatnaLinija: { borderBottomWidth: 1.5, borderBottomColor: BOJE.gold, marginBottom: 10 },
  predmetNaslov: { fontStyle: "italic", marginLeft: 12, marginBottom: 6 },
  metaRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
    paddingVertical: 3,
  },
  metaLabel: { width: 150, fontWeight: "bold" },
  metaValue: { flex: 1 },
  stavkeNaslov: { fontWeight: "bold", marginTop: 12, marginBottom: 4 },
  tHead: { flexDirection: "row", backgroundColor: BOJE.navy, color: "#FFFFFF", fontWeight: "bold" },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#CCCCCC" },
  cell: { paddingVertical: 4, paddingHorizontal: 4, borderRightWidth: 0.5, borderRightColor: "#DDDDDD" },
  cRb: { width: 30 },
  cNaziv: { flex: 1 },
  cJmj: { width: 36, textAlign: "center" },
  cKol: { width: 56, textAlign: "center" },
  cCijena: { width: 80, textAlign: "right" },
  cIznos: { width: 80, textAlign: "right", borderRightWidth: 0 },
  zbrojBlok: { alignSelf: "flex-end", width: 250, marginTop: 14 },
  zbrojRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  zbrojUkupno: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BOJE.navy,
    marginTop: 2,
    paddingTop: 3,
    fontWeight: "bold",
    color: BOJE.navy,
  },
  napomene: { marginTop: 16 },
  potpis: { marginTop: 40, alignItems: "flex-end" },
});

function Meta({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.metaRow}>
      <Text style={s.metaLabel}>{label}</Text>
      <Text style={[s.metaValue, bold ? s.bold : {}]}>{value}</Text>
    </View>
  );
}

export function PonudaPdf({ data }: { data: PonudaPdfData }) {
  const { klijent, edukacija } = data;
  return (
    <Document title={`Ponuda ${data.broj}`} author={IZDAVATELJ.naziv}>
      <Page size="A4" style={s.page}>
        <View style={s.logoRow}>
          <Image src={logoPath} style={s.logo} />
          <View>
            <Text style={s.wordmark}>LOCALIS</Text>
            <Text style={s.tagline}>EDUKACIJA I SAVJETOVANJE</Text>
          </View>
        </View>

        <Text style={s.izdavateljNaziv}>{IZDAVATELJ.naziv}</Text>
        <Text>{IZDAVATELJ.vlasnik}</Text>
        <Text>{IZDAVATELJ.adresa}</Text>
        <Text>T: {IZDAVATELJ.telefon}</Text>
        <Text>E: {IZDAVATELJ.email}</Text>
        <Text>W: {IZDAVATELJ.web}</Text>
        <Text>OIB: {IZDAVATELJ.oib}</Text>
        <Text>
          IBAN: {IZDAVATELJ.iban}, {IZDAVATELJ.banka}
        </Text>
        <Text>SWIFT/BIC: {IZDAVATELJ.swift}</Text>
        <Text style={{ marginTop: 6 }}>
          Mjesto i datum: {IZDAVATELJ.mjesto}, {formatDatumHr(data.datumIzdavanja)}
        </Text>
        <Text>Ponuda vrijedi do: {formatDatumHr(data.vrijediDo)}</Text>

        <View style={s.klijentBlok}>
          <Text style={s.bold}>{klijent.naziv}</Text>
          <Text style={s.bold}>{klijent.adresa}</Text>
          <Text style={s.bold}>OIB: {klijent.oib}</Text>
          <Text style={s.bold}>Kontakt osoba: {klijent.kontakt}</Text>
          <Text style={s.bold}>Tel: {klijent.telefon}</Text>
          <Text style={s.bold}>e-mail: {klijent.email}</Text>
        </View>

        <Text style={s.naslov}>PONUDA BROJ: {data.broj}</Text>
        <View style={s.zlatnaLinija} />

        <Text style={s.bold}>Predmet ponude: {edukacija.kicker}</Text>
        <Text style={s.predmetNaslov}>„{edukacija.naslov}"</Text>

        <Meta label="Predavač" value={edukacija.predavac} />
        <Meta label="Datum održavanja" value={edukacija.datumLabel} />
        <Meta label="Mjesto održavanja" value={edukacija.mjesto} />
        <Meta label="Ime i prezime polaznika" value={formatPolaznici(data.polaznici)} bold />
        <Meta label="Uključeno" value={edukacija.ukljuceno} />

        <Text style={s.stavkeNaslov}>Stavke ponude</Text>
        <View style={s.tHead}>
          <Text style={[s.cell, s.cRb]}>Rb.</Text>
          <Text style={[s.cell, s.cNaziv]}>Naziv usluge</Text>
          <Text style={[s.cell, s.cJmj]}>Jmj</Text>
          <Text style={[s.cell, s.cKol]}>Količina</Text>
          <Text style={[s.cell, s.cCijena]}>Cijena (EUR)</Text>
          <Text style={[s.cell, s.cIznos]}>Iznos (EUR)</Text>
        </View>
        <View style={s.tRow}>
          <Text style={[s.cell, s.cRb]}>1.</Text>
          <Text style={[s.cell, s.cNaziv]}>{edukacija.nazivStavke}</Text>
          <Text style={[s.cell, s.cJmj]}>kom</Text>
          <Text style={[s.cell, s.cKol]}>{formatIznos(data.kolicina)}</Text>
          <Text style={[s.cell, s.cCijena]}>{formatIznos(data.cijena)}</Text>
          <Text style={[s.cell, s.cIznos]}>{formatIznos(data.ukupno)}</Text>
        </View>

        <View style={s.zbrojBlok}>
          <View style={s.zbrojRow}>
            <Text>Ukupno bez PDV-a</Text>
            <Text>{formatIznos(data.ukupno)}</Text>
          </View>
          <View style={s.zbrojRow}>
            <Text>Rabat</Text>
            <Text>{formatIznos(0)}</Text>
          </View>
          <View style={s.zbrojRow}>
            <Text>PDV (0 %)</Text>
            <Text>{formatIznos(0)}</Text>
          </View>
          <View style={s.zbrojUkupno}>
            <Text>UKUPNO ZA PLAĆANJE (EUR)</Text>
            <Text>{formatIznos(data.ukupno)}</Text>
          </View>
        </View>

        <View style={s.napomene}>
          <Text>{IZDAVATELJ.pdvNapomena}</Text>
          <Text>Rok plaćanja: {formatDatumHr(data.rokPlacanja)}</Text>
          <Text style={s.bold}>Prilikom plaćanja pozovite se na broj: HR00 {data.broj}</Text>
          <Text style={{ marginTop: 4 }}>{IZDAVATELJ.disclaimer1}</Text>
          <Text>{IZDAVATELJ.disclaimer2}</Text>
        </View>

        <View style={s.potpis}>
          <Text>{IZDAVATELJ.naziv}</Text>
          <Text>{data.potpisnik}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

- [ ] **Step 4: Render wrapper + tip podataka**

`lib/ponude/pdf.ts`:

```ts
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { PolaznikZaIspis } from "./format";

// Sve što PDF treba - čisti podaci, bez DB tipova, da se može renderirati i u testu.
export type PonudaPdfData = {
  broj: string;
  datumIzdavanja: string; // ISO
  vrijediDo: string; // ISO
  rokPlacanja: string; // ISO
  klijent: {
    naziv: string;
    adresa: string;
    oib: string;
    kontakt: string;
    telefon: string;
    email: string;
  };
  edukacija: {
    kicker: string;
    naslov: string;
    predavac: string;
    datumLabel: string;
    mjesto: string;
    ukljuceno: string;
    nazivStavke: string;
  };
  polaznici: PolaznikZaIspis[];
  kolicina: number;
  cijena: number;
  ukupno: number;
  potpisnik: string;
};

export async function renderPonudaPdf(data: PonudaPdfData): Promise<Buffer> {
  // Dinamički import da se react-pdf (težak modul) ne učitava na rutama koje ga ne trebaju.
  const { PonudaPdf } = await import("./PonudaPdf");
  return renderToBuffer(createElement(PonudaPdf, { data }));
}
```

- [ ] **Step 5: Pokreni – prolazi**

Run: `npx vitest run lib/ponude/pdf.test.ts`
Expected: 1 passed. Ako pdf-parse ne izvuče tekst s dijakriticima, provjeri da su fontovi stvarno TTF (Task 8 korak 2).

- [ ] **Step 6: Vizualna provjera**

Dodaj privremeno u test (ili pokreni jednokratno):

```ts
import { writeFileSync } from "node:fs";
writeFileSync("C:/Users/antonio.jungic/Downloads/ponuda-test.pdf", buffer);
```

Otvori PDF pored `Ponuda Čabar.pdf`. Uskladi margine/veličine u `StyleSheet` dok raspored ne odgovara (jedna stranica, tablica poravnata, potpis desno). Ukloni privremeni `writeFileSync`.

- [ ] **Step 7: Commit**

```bash
git add lib/ponude/PonudaPdf.tsx lib/ponude/pdf.ts lib/ponude/pdf.test.ts
git commit -m "Render offer PDF with react-pdf matching the existing template"
```

---

### Task 10: Blob upload/download

**Files:**
- Create: `lib/ponude/blob.ts`

- [ ] **Step 1: Implementacija**

`lib/ponude/blob.ts`:

```ts
import { put } from "@vercel/blob";

// Store je privatan - URL bez tokena ne radi. Download ide preko admin rute (Task 16).
export async function uploadPonudaPdf(nazivDatoteke: string, pdf: Buffer): Promise<string> {
  const blob = await put(`ponude/${nazivDatoteke}`, pdf, {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function downloadPonudaPdf(url: string): Promise<Buffer> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("BLOB_READ_WRITE_TOKEN nije postavljen.");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Blob download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
```

- [ ] **Step 2: Ručna provjera (jednokratno)**

```bash
npx tsx --env-file=.env.local -e "import('./lib/ponude/blob.ts').then(async m => { const url = await m.uploadPonudaPdf('test.pdf', Buffer.from('%PDF-1.4 test')); console.log(url); const b = await m.downloadPonudaPdf(url); console.log(b.toString()); })"
```

Expected: URL s `.private.blob.vercel-storage.com`, zatim `%PDF-1.4 test`. Obriši testni blob: `vercel blob del <url>`.

- [ ] **Step 3: Commit**

```bash
git add lib/ponude/blob.ts
git commit -m "Add private Blob upload/download for offer PDFs"
```

---

### Task 11: Mailovi ponude

**Files:**
- Create: `lib/ponude/email.ts`
- Test: `lib/ponude/email.test.ts`

- [ ] **Step 1: Test (tekst maila je čista funkcija)**

`lib/ponude/email.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { tekstMailaKlijentu } from "./email";

describe("tekstMailaKlijentu", () => {
  it("sadrži broj, rok, poziv na broj i polaznike", () => {
    const t = tekstMailaKlijentu({
      kontaktIme: "Ines Loknar Josić",
      naslov: "Kako izraditi opći akt u JLP(R)S",
      datumLabel: "28. rujna 2026.",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      broj: "7-112/26",
      rokPlacanja: "2026-09-19",
      polaznici: [
        { ime: "Ines Loknar Josić", radnoMjesto: "pročelnica" },
        { ime: "Marija Gašpar", radnoMjesto: "viša savjetnica" },
      ],
      potpisnik: "Milada Sofka, voditeljica ureda",
    });
    expect(t).toContain("Poštovani/a Ines Loknar Josić,");
    expect(t).toContain("ponudu br. 7-112/26");
    expect(t).toContain("Rok plaćanja: 19. rujna 2026.");
    expect(t).toContain("HR00 7-112/26");
    expect(t).toContain("1. Ines Loknar Josić, pročelnica");
    expect(t).toContain("2. Marija Gašpar, viša savjetnica");
    expect(t).toContain("Milada Sofka, voditeljica ureda");
  });
});
```

- [ ] **Step 2: Pokreni – pada**

Run: `npx vitest run lib/ponude/email.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementacija**

`lib/ponude/email.ts`:

```ts
import { getMailConfig, sendMail } from "@/lib/email/transport";
import { IZDAVATELJ } from "./izdavatelj";
import { formatDatumHr, type PolaznikZaIspis } from "./format";

export type MailKlijentuInput = {
  kontaktIme: string;
  naslov: string;
  datumLabel: string;
  mjesto: string;
  broj: string;
  rokPlacanja: string; // ISO
  polaznici: PolaznikZaIspis[];
  potpisnik: string;
};

export function tekstMailaKlijentu(i: MailKlijentuInput): string {
  return [
    `Poštovani/a ${i.kontaktIme},`,
    "",
    `zahvaljujemo na prijavi na edukaciju „${i.naslov}" (${i.datumLabel}, ${i.mjesto}).`,
    "",
    `U privitku dostavljamo ponudu br. ${i.broj}.`,
    `Rok plaćanja: ${formatDatumHr(i.rokPlacanja)}`,
    `Prilikom plaćanja pozovite se na broj: HR00 ${i.broj}.`,
    "",
    "Polaznici:",
    ...i.polaznici.map((p, idx) => `${idx + 1}. ${p.ime}, ${p.radnoMjesto}`),
    "",
    `Za sva pitanja stojimo na raspolaganju: ${IZDAVATELJ.email}, ${IZDAVATELJ.telefon}.`,
    "",
    IZDAVATELJ.naziv,
    i.potpisnik,
  ].join("\n");
}

export type InterniMailInput = {
  seminarTitle: string;
  kontaktIme: string;
  email: string;
  telefon: string;
  organizacija: string;
  adresa: string;
  oib: string;
  napomena: string | null;
  polaznici: PolaznikZaIspis[];
  prijavaId: number;
  ponuda: { broj: string; ukupno: string | number } | null;
  greska?: string | null;
};

export function tekstInternogMaila(i: InterniMailInput): string {
  const ponudaLinije = i.ponuda
    ? [`Ponuda: ${i.ponuda.broj}, ukupno ${i.ponuda.ukupno} EUR (PDF u privitku)`]
    : i.greska
      ? [`PONUDA NIJE IZDANA - provjeri /admin/prijave/${i.prijavaId}`, `Greška: ${i.greska}`]
      : ["Edukacija nema definiranu ponudu - ponuda nije izdana."];
  return [
    `Edukacija: ${i.seminarTitle}`,
    ...ponudaLinije,
    "",
    `Ime i prezime: ${i.kontaktIme}`,
    `Email: ${i.email}`,
    `Telefon: ${i.telefon || "-"}`,
    `Ustanova/tvrtka: ${i.organizacija}`,
    `Adresa: ${i.adresa}`,
    `OIB: ${i.oib}`,
    "",
    "Polaznici:",
    ...i.polaznici.map((p, idx) => `${idx + 1}. ${p.ime} (${p.radnoMjesto})`),
    "",
    i.napomena || "-",
  ].join("\n");
}

export type Privitak = { filename: string; content: Buffer };

export async function posaljiPonuduKlijentu(
  to: string,
  input: MailKlijentuInput,
  privitak: Privitak,
): Promise<void> {
  const mail = getMailConfig();
  if (!mail) throw new Error("SMTP nije konfiguriran.");
  await sendMail({
    from: `"LOCALIS" <${mail.user}>`,
    to,
    replyTo: `"LOCALIS" <${mail.user}>`,
    subject: `Ponuda br. ${input.broj} - ${input.naslov}`,
    text: tekstMailaKlijentu(input),
    attachments: [{ filename: privitak.filename, content: privitak.content, contentType: "application/pdf" }],
  });
}

export async function posaljiInterniMail(input: InterniMailInput, privitak?: Privitak): Promise<void> {
  const mail = getMailConfig();
  if (!mail) throw new Error("SMTP nije konfiguriran.");
  await sendMail({
    from: `"LOCALIS web" <${mail.user}>`,
    to: mail.internalTo,
    replyTo: `"${input.kontaktIme}" <${input.email}>`,
    subject: `Nova prijava na edukaciju - ${input.seminarTitle}`,
    text: tekstInternogMaila(input),
    attachments: privitak
      ? [{ filename: privitak.filename, content: privitak.content, contentType: "application/pdf" }]
      : [],
  });
}

export async function posaljiStornoKlijentu(to: string, broj: string, potpisnik: string): Promise<void> {
  const mail = getMailConfig();
  if (!mail) throw new Error("SMTP nije konfiguriran.");
  await sendMail({
    from: `"LOCALIS" <${mail.user}>`,
    to,
    replyTo: `"LOCALIS" <${mail.user}>`,
    subject: `Storno ponude br. ${broj}`,
    text: [
      "Poštovani,",
      "",
      `obavještavamo vas da je ponuda br. ${broj} stornirana i više nije važeća.`,
      "Ako je potrebno, nova ponuda slijedi zasebnim mailom. Za pitanja nam se obratite na info@localis.hr.",
      "",
      IZDAVATELJ.naziv,
      potpisnik,
    ].join("\n"),
  });
}
```

- [ ] **Step 4: Pokreni – prolazi**

Run: `npx vitest run lib/ponude/email.test.ts`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add lib/ponude/email.ts lib/ponude/email.test.ts
git commit -m "Add offer, internal and cancellation e-mails"
```

---

### Task 12: Spremanje prijave, izdavanje ponude, orkestracija

**Files:**
- Create: `lib/prijave/spremi.ts`
- Create: `lib/prijave/ucitaj.ts`
- Create: `lib/ponude/izdaj.ts`
- Test: `lib/ponude/izdaj.test.ts` (integracija, brojač)

- [ ] **Step 1: Spremanje prijave**

`lib/prijave/spremi.ts`:

```ts
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, prijave } from "@/lib/db/schema";

export type NovaPrijava = {
  seminarSlug: string;
  seminarTitle: string;
  kontaktIme: string;
  email: string;
  telefon: string;
  organizacija: string;
  adresa: string;
  oib: string;
  napomena: string | null;
  polaznici: { ime: string; radnoMjesto: string }[];
};

// tx1: prijava + polaznici zajedno ili ništa.
export async function spremiPrijavu(p: NovaPrijava): Promise<number> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(prijave)
      .values({
        seminarSlug: p.seminarSlug,
        seminarTitle: p.seminarTitle,
        kontaktIme: p.kontaktIme,
        email: p.email,
        telefon: p.telefon,
        organizacija: p.organizacija,
        adresa: p.adresa,
        oib: p.oib,
        napomena: p.napomena,
      })
      .returning({ id: prijave.id });
    await tx
      .insert(polaznici)
      .values(p.polaznici.map((pl) => ({ prijavaId: row.id, ime: pl.ime, radnoMjesto: pl.radnoMjesto })));
    return row.id;
  });
}

export type IzmjenaPrijave = Omit<NovaPrijava, "seminarSlug" | "seminarTitle">;

// Uređivanje iz admina: podaci + polaznici se zamjenjuju u jednoj transakciji.
export async function azurirajPrijavu(id: number, p: IzmjenaPrijave): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(prijave)
      .set({
        kontaktIme: p.kontaktIme,
        email: p.email,
        telefon: p.telefon,
        organizacija: p.organizacija,
        adresa: p.adresa,
        oib: p.oib,
        napomena: p.napomena,
      })
      .where(eq(prijave.id, id));
    await tx.delete(polaznici).where(eq(polaznici.prijavaId, id));
    await tx
      .insert(polaznici)
      .values(p.polaznici.map((pl) => ({ prijavaId: id, ime: pl.ime, radnoMjesto: pl.radnoMjesto })));
  });
}
```

- [ ] **Step 2: Čitanje prijave**

`lib/prijave/ucitaj.ts`:

```ts
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, ponude, prijave, type Polaznik, type Ponuda, type Prijava } from "@/lib/db/schema";

export type PrijavaDetalji = Prijava & { polaznici: Polaznik[]; ponude: Ponuda[] };

export async function ucitajPrijavu(id: number): Promise<PrijavaDetalji | null> {
  const [p] = await db.select().from(prijave).where(eq(prijave.id, id));
  if (!p) return null;
  const [pol, pon] = await Promise.all([
    db.select().from(polaznici).where(eq(polaznici.prijavaId, id)).orderBy(polaznici.id),
    db.select().from(ponude).where(eq(ponude.prijavaId, id)).orderBy(desc(ponude.id)),
  ]);
  return { ...p, polaznici: pol, ponude: pon };
}

export type PrijavaRed = Prijava & { brojPolaznika: number; zadnjaPonuda: Ponuda | null };

export async function ucitajPrijave(filter?: {
  seminarSlug?: string;
  status?: Prijava["status"];
}): Promise<PrijavaRed[]> {
  const rows = await db.query.prijave.findMany({
    where: (t, { and, eq: e }) =>
      and(
        filter?.seminarSlug ? e(t.seminarSlug, filter.seminarSlug) : undefined,
        filter?.status ? e(t.status, filter.status) : undefined,
      ),
    orderBy: (t, { desc: d }) => [d(t.createdAt)],
    with: { polaznici: true, ponude: { orderBy: (t, { desc: d }) => [d(t.id)], limit: 1 } },
  });
  return rows.map((r) => ({
    ...r,
    brojPolaznika: r.polaznici.length,
    zadnjaPonuda: r.ponude[0] ?? null,
  }));
}
```

- [ ] **Step 3: Test brojača (integracija)**

`lib/ponude/izdaj.test.ts`:

```ts
import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { brojacPonuda } from "@/lib/db/schema";
import { sljedeciRedniBroj } from "./izdaj";

const GODINA = 2099; // testna godina - ne dira prave brojeve

describe.skipIf(!process.env.DATABASE_URL)("sljedeciRedniBroj", () => {
  afterAll(async () => {
    await db.delete(brojacPonuda).where(eq(brojacPonuda.godina, GODINA));
  });

  it("10 paralelnih poziva daje 10 različitih brojeva 1..10", async () => {
    await db.delete(brojacPonuda).where(eq(brojacPonuda.godina, GODINA));
    const brojevi = await Promise.all(
      Array.from({ length: 10 }, () => db.transaction((tx) => sljedeciRedniBroj(tx, GODINA))),
    );
    expect([...brojevi].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }, 30_000);
});
```

- [ ] **Step 4: Pokreni – pada**

Run: `npx vitest run lib/ponude/izdaj.test.ts`
Expected: FAIL – modul ne postoji.

- [ ] **Step 5: Izdavanje**

`lib/ponude/izdaj.ts`:

```ts
import { eq, sql } from "drizzle-orm";
import { db, type Tx } from "@/lib/db";
import { brojacPonuda, ponude, prijave, type Ponuda } from "@/lib/db/schema";
import { getSeminar, type Seminar } from "@/lib/edukacije";
import { getPostavke } from "@/lib/postavke";
import { ucitajPrijavu, type PrijavaDetalji } from "@/lib/prijave/ucitaj";
import { downloadPonudaPdf, uploadPonudaPdf } from "./blob";
import { danasZagreb, izracunajDatumePonude } from "./datumi";
import {
  posaljiInterniMail,
  posaljiPonuduKlijentu,
  posaljiStornoKlijentu,
  type InterniMailInput,
  type MailKlijentuInput,
} from "./email";
import { nazivDatotekePonude, sastaviBrojPonude } from "./format";
import { renderPonudaPdf, type PonudaPdfData } from "./pdf";

type SeminarSPonudom = Seminar & { ponuda: NonNullable<Seminar["ponuda"]> };

// INSERT ... ON CONFLICT DO UPDATE je atomaran - dvije paralelne transakcije nikad ne dobiju isti broj.
export async function sljedeciRedniBroj(tx: Tx, godina: number): Promise<number> {
  const [row] = await tx
    .insert(brojacPonuda)
    .values({ godina, zadnjiBroj: 1 })
    .onConflictDoUpdate({
      target: brojacPonuda.godina,
      set: { zadnjiBroj: sql`${brojacPonuda.zadnjiBroj} + 1` },
    })
    .returning({ zadnjiBroj: brojacPonuda.zadnjiBroj });
  return row.zadnjiBroj;
}

async function seminarSPonudom(slug: string): Promise<SeminarSPonudom> {
  const seminar = await getSeminar(slug);
  if (!seminar?.ponuda) throw new Error(`Edukacija "${slug}" nema definiran blok ponuda.`);
  return seminar as SeminarSPonudom;
}

// tx2: brojač + insert ponude u statusu "greska". Vraća id ponude.
export async function kreirajPonudu(prijavaId: number): Promise<number> {
  const prijava = await ucitajPrijavu(prijavaId);
  if (!prijava) throw new Error(`Prijava ${prijavaId} ne postoji.`);
  if (prijava.ponude.some((p) => p.status === "poslana" || p.status === "greska")) {
    throw new Error("Prijava već ima aktivnu ponudu - prvo je storniraj.");
  }
  const seminar = await seminarSPonudom(prijava.seminarSlug);
  const postavke = await getPostavke();

  const danas = danasZagreb();
  const godina = Number(danas.slice(0, 4));
  const datumi = izracunajDatumePonude({
    danas,
    daniValjanosti: postavke.daniValjanosti,
    datumEdukacije: seminar.date,
  });
  const kolicina = prijava.polaznici.length;
  const cijena = seminar.ponuda.cijena;
  const ukupno = kolicina * cijena;

  return db.transaction(async (tx) => {
    const redniBroj = await sljedeciRedniBroj(tx, godina);
    const [row] = await tx
      .insert(ponude)
      .values({
        prijavaId,
        redniBroj,
        godina,
        broj: sastaviBrojPonude(redniBroj, postavke.brojPonudeSredina, godina),
        datumIzdavanja: datumi.datumIzdavanja,
        vrijediDo: datumi.vrijediDo,
        rokPlacanja: datumi.rokPlacanja,
        kolicina,
        cijena: cijena.toFixed(2),
        ukupno: ukupno.toFixed(2),
        status: "greska",
      })
      .returning({ id: ponude.id });
    return row.id;
  });
}

function pdfPodaci(
  prijava: PrijavaDetalji,
  ponuda: Ponuda,
  seminar: SeminarSPonudom,
  potpisnik: string,
): PonudaPdfData {
  return {
    broj: ponuda.broj,
    datumIzdavanja: ponuda.datumIzdavanja,
    vrijediDo: ponuda.vrijediDo,
    rokPlacanja: ponuda.rokPlacanja,
    klijent: {
      naziv: prijava.organizacija,
      adresa: prijava.adresa,
      oib: prijava.oib,
      kontakt: prijava.kontaktIme,
      telefon: prijava.telefon,
      email: prijava.email,
    },
    edukacija: {
      kicker: seminar.kicker,
      naslov: seminar.title,
      predavac: seminar.ponuda.predavac,
      datumLabel: seminar.dateLabel,
      mjesto: seminar.ponuda.mjesto,
      ukljuceno: seminar.ponuda.ukljuceno,
      nazivStavke: seminar.ponuda.nazivStavke ?? `${seminar.kicker} – ${seminar.title}`,
    },
    polaznici: prijava.polaznici.map((p) => ({ ime: p.ime, radnoMjesto: p.radnoMjesto })),
    kolicina: ponuda.kolicina,
    cijena: Number(ponuda.cijena),
    ukupno: Number(ponuda.ukupno),
    potpisnik,
  };
}

function mailKlijentuInput(
  prijava: PrijavaDetalji,
  ponuda: Ponuda,
  seminar: SeminarSPonudom,
  potpisnik: string,
): MailKlijentuInput {
  return {
    kontaktIme: prijava.kontaktIme,
    naslov: seminar.title,
    datumLabel: seminar.dateLabel,
    mjesto: seminar.ponuda.mjesto,
    broj: ponuda.broj,
    rokPlacanja: ponuda.rokPlacanja,
    polaznici: prijava.polaznici.map((p) => ({ ime: p.ime, radnoMjesto: p.radnoMjesto })),
    potpisnik,
  };
}

export function interniInput(prijava: PrijavaDetalji): InterniMailInput {
  return {
    seminarTitle: prijava.seminarTitle,
    kontaktIme: prijava.kontaktIme,
    email: prijava.email,
    telefon: prijava.telefon,
    organizacija: prijava.organizacija,
    adresa: prijava.adresa,
    oib: prijava.oib,
    napomena: prijava.napomena,
    polaznici: prijava.polaznici.map((p) => ({ ime: p.ime, radnoMjesto: p.radnoMjesto })),
    prijavaId: prijava.id,
    ponuda: null,
  };
}

async function interniMailBezRusenja(input: InterniMailInput, privitak?: { filename: string; content: Buffer }) {
  try {
    await posaljiInterniMail(input, privitak);
  } catch (e) {
    console.error("Interni mail nije poslan.", e);
  }
}

export type DovrsiRezultat = { ok: true } | { ok: false; greska: string };

// PDF -> Blob -> mail klijentu -> statusi -> interni mail. Idempotentno: može se ponoviti za ponudu u "greska".
export async function dovrsiPonudu(ponudaId: number): Promise<DovrsiRezultat> {
  const [ponuda] = await db.select().from(ponude).where(eq(ponude.id, ponudaId));
  if (!ponuda) return { ok: false, greska: `Ponuda ${ponudaId} ne postoji.` };
  if (ponuda.status === "stornirana") return { ok: false, greska: "Ponuda je stornirana." };

  const prijava = await ucitajPrijavu(ponuda.prijavaId);
  if (!prijava) return { ok: false, greska: "Prijava ne postoji." };

  try {
    const seminar = await seminarSPonudom(prijava.seminarSlug);
    const postavke = await getPostavke();
    const filename = nazivDatotekePonude(ponuda.broj, prijava.organizacija);

    const pdf = await renderPonudaPdf(pdfPodaci(prijava, ponuda, seminar, postavke.potpisnik));
    const pdfUrl = ponuda.pdfUrl ?? (await uploadPonudaPdf(filename, pdf));
    await db.update(ponude).set({ pdfUrl }).where(eq(ponude.id, ponudaId));

    await posaljiPonuduKlijentu(
      prijava.email,
      mailKlijentuInput(prijava, ponuda, seminar, postavke.potpisnik),
      { filename, content: pdf },
    );

    await db.transaction(async (tx) => {
      await tx
        .update(ponude)
        .set({ status: "poslana", emailPoslanAt: new Date(), greska: null })
        .where(eq(ponude.id, ponudaId));
      await tx.update(prijave).set({ status: "ponuda_poslana" }).where(eq(prijave.id, prijava.id));
    });

    // Interni mail ne smije srušiti tok - klijent je već dobio ponudu.
    await interniMailBezRusenja(
      { ...interniInput(prijava), ponuda: { broj: ponuda.broj, ukupno: ponuda.ukupno } },
      { filename, content: pdf },
    );
    return { ok: true };
  } catch (e) {
    const greska = e instanceof Error ? e.message : String(e);
    console.error(`Ponuda ${ponudaId}: dovršavanje nije uspjelo.`, e);
    await db.update(ponude).set({ status: "greska", greska }).where(eq(ponude.id, ponudaId));
    return { ok: false, greska };
  }
}

// Puni tok za novu prijavu. Nikad ne baca - greška se vraća i zapisuje.
export async function izdajPonudu(prijavaId: number): Promise<DovrsiRezultat & { ponudaId?: number }> {
  let ponudaId: number;
  try {
    ponudaId = await kreirajPonudu(prijavaId);
  } catch (e) {
    const greska = e instanceof Error ? e.message : String(e);
    console.error(`Prijava ${prijavaId}: kreiranje ponude nije uspjelo.`, e);
    const prijava = await ucitajPrijavu(prijavaId);
    if (prijava) await interniMailBezRusenja({ ...interniInput(prijava), greska });
    return { ok: false, greska };
  }
  const rezultat = await dovrsiPonudu(ponudaId);
  if (!rezultat.ok) {
    const prijava = await ucitajPrijavu(prijavaId);
    if (prijava) await interniMailBezRusenja({ ...interniInput(prijava), greska: rezultat.greska });
  }
  return { ...rezultat, ponudaId };
}

export async function stornirajPonudu(ponudaId: number, obavijestiKlijenta: boolean): Promise<void> {
  const [ponuda] = await db.select().from(ponude).where(eq(ponude.id, ponudaId));
  if (!ponuda) throw new Error("Ponuda ne postoji.");
  if (ponuda.status === "stornirana") return;
  const bilaPoslana = ponuda.status === "poslana";
  await db.transaction(async (tx) => {
    await tx
      .update(ponude)
      .set({ status: "stornirana", storniranaAt: new Date() })
      .where(eq(ponude.id, ponudaId));
    await tx.update(prijave).set({ status: "stornirana" }).where(eq(prijave.id, ponuda.prijavaId));
  });
  if (obavijestiKlijenta && bilaPoslana) {
    const prijava = await ucitajPrijavu(ponuda.prijavaId);
    const postavke = await getPostavke();
    if (prijava) await posaljiStornoKlijentu(prijava.email, ponuda.broj, postavke.potpisnik);
  }
}

// Ponovno slanje maila s postojećim PDF-om (bez novog renderiranja).
export async function ponovnoPosaljiMail(ponudaId: number): Promise<void> {
  const [ponuda] = await db.select().from(ponude).where(eq(ponude.id, ponudaId));
  if (!ponuda || ponuda.status !== "poslana" || !ponuda.pdfUrl) {
    throw new Error("Mail se može ponovno poslati samo za poslanu ponudu s PDF-om.");
  }
  const prijava = await ucitajPrijavu(ponuda.prijavaId);
  if (!prijava) throw new Error("Prijava ne postoji.");
  const seminar = await seminarSPonudom(prijava.seminarSlug);
  const postavke = await getPostavke();
  const pdf = await downloadPonudaPdf(ponuda.pdfUrl);
  await posaljiPonuduKlijentu(prijava.email, mailKlijentuInput(prijava, ponuda, seminar, postavke.potpisnik), {
    filename: nazivDatotekePonude(ponuda.broj, prijava.organizacija),
    content: pdf,
  });
  await db.update(ponude).set({ emailPoslanAt: new Date() }).where(eq(ponude.id, ponudaId));
}
```

- [ ] **Step 6: Pokreni – prolazi**

Run: `npx vitest run lib/ponude/izdaj.test.ts`
Expected: 1 passed (koristi pravu dev bazu, godina 2099, čisti za sobom).

Run: `npx tsc --noEmit`
Expected: bez grešaka.

- [ ] **Step 7: Commit**

```bash
git add lib/prijave lib/ponude/izdaj.ts lib/ponude/izdaj.test.ts
git commit -m "Save registrations and issue offers with atomic yearly counter"
```

---

### Task 13: Tok prijave u server akciji + poruka korisniku

**Files:**
- Modify: `app/(site)/edukacije/actions.ts`
- Modify: `app/(site)/edukacije/[slug]/RegistracijaForm.tsx`

- [ ] **Step 1: Tip stanja**

U `actions.ts` proširi `RegistrationState`:

```ts
export type RegistrationState = {
  status: "idle" | "sent" | "error";
  message?: string;
  // Postavljeno kad je ponuda uspješno poslana - forma ispiše na koju adresu.
  ponudaPoslanaNa?: string;
  errors?: Partial<
    Record<
      "ime" | "email" | "telefon" | "organizacija" | "adresa" | "oib" | "polaznici",
      string
    >
  >;
};
```

- [ ] **Step 2: Zamijeni sve od `const mail = getMailConfig();` do kraja funkcije**

```ts
  const mail = getMailConfig();
  if (!mail) {
    console.error("Prijava na edukaciju: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Prijava trenutno nije moguća. Javite nam se na info@localis.hr.",
    };
  }

  const nova = {
    seminarSlug: seminar.slug,
    seminarTitle: seminar.title,
    kontaktIme: ime,
    email,
    telefon,
    organizacija,
    adresa,
    oib,
    napomena: napomena || null,
    polaznici,
  };

  // tx1 - ako baza padne, prijava se ne gubi u potpunosti: interni mail ide kao i prije.
  let prijavaId: number;
  try {
    prijavaId = await spremiPrijavu(nova);
  } catch (error) {
    console.error("Prijava na edukaciju: spremanje u bazu nije uspjelo.", error);
    try {
      await posaljiInterniMail({
        ...nova,
        prijavaId: 0,
        ponuda: null,
        greska: "Baza nedostupna - prijava NIJE spremljena, ručno je unesi.",
      });
    } catch (mailError) {
      console.error("Prijava na edukaciju: ni interni mail nije poslan.", mailError);
      return {
        status: "error",
        message: "Prijava nije uspjela. Pokušajte ponovno ili nam pišite na info@localis.hr.",
      };
    }
    return { status: "sent" };
  }

  // Besplatna edukacija / bez ponuda bloka: samo interni mail, kao do sada.
  if (!seminar.ponuda) {
    try {
      await posaljiInterniMail({ ...nova, prijavaId, ponuda: null });
    } catch (error) {
      console.error("Prijava na edukaciju: interni mail nije poslan.", error);
    }
    return { status: "sent" };
  }

  const rezultat = await izdajPonudu(prijavaId);
  // I kad ponuda ne uspije, prijava je spremljena - korisniku je to "zaprimljeno".
  return rezultat.ok ? { status: "sent", ponudaPoslanaNa: email } : { status: "sent" };
}
```

Importi na vrhu `actions.ts`:

```ts
import { getMailConfig } from "@/lib/email/transport";
import { getSeminar, isSeminarPast } from "@/lib/edukacije";
import { spremiPrijavu } from "@/lib/prijave/spremi";
import { izdajPonudu } from "@/lib/ponude/izdaj";
import { posaljiInterniMail } from "@/lib/ponude/email";
```

Ukloni sada nekorišteni `sendMail` import i varijablu `seminarTitle` (naslov ide iz `seminar.title`). Hidden input `seminar` u formi ostavi – akcija ga više ne čita, nije štetan.

- [ ] **Step 3: Poruka u formi**

U `RegistracijaForm.tsx` zamijeni blok `if (state.status === "sent") { ... }`:

```tsx
  if (state.status === "sent") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-semibold text-green-800 mb-1">Prijava zaprimljena!</h3>
        <p className="text-green-600 text-sm">
          {state.ponudaPoslanaNa
            ? `Ponudu smo poslali na ${state.ponudaPoslanaNa}. Provjerite i mapu neželjene pošte.`
            : "Javit ćemo vam se s potvrdom u roku od 24 sata."}
        </p>
      </div>
    );
  }
```

- [ ] **Step 4: Ručni test (dry run)**

`.env.local`: `EMAIL_DRY_RUN=1`. `npm run dev`, otvori `/edukacije/kako-izraditi-opci-akt-u-jlprs`, pošalji prijavu s 2 polaznika.

Expected:
- Forma: "Ponudu smo poslali na ...".
- Konzola: dva `[EMAIL_DRY_RUN]` bloka (klijent s privitkom `Ponuda 1-112-26 - ....pdf`, interni).
- `npx drizzle-kit studio` (ili SQL): red u `prijave` (status `ponuda_poslana`), 2 u `polaznici`, 1 u `ponude` (status `poslana`, `pdf_url` postavljen, `broj` = `1-112/26`), `brojac_ponuda` 2026 → 1.

- [ ] **Step 5: Lint + tipovi**

Run: `npx tsc --noEmit && npm run lint`
Expected: čisto.

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/edukacije/actions.ts" "app/(site)/edukacije/[slug]/RegistracijaForm.tsx"
git commit -m "Persist registrations and issue offers automatically on submit"
```

---

### Task 14: Admin sesija, proxy, login

**Files:**
- Create: `lib/admin/token.ts` (bez `next/*` importa – koristi ga proxy)
- Create: `lib/admin/session.ts`
- Create: `proxy.ts`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/login/page.tsx`, `LoginForm.tsx`, `actions.ts`
- Create: `app/admin/login/odjava/route.ts`
- Modify: `app/robots.ts`
- Test: `lib/admin/token.test.ts`

- [ ] **Step 1: Test tokena**

`lib/admin/token.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { napraviToken, provjeriToken } from "./token";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-koji-je-dovoljno-dug-1234567890";
});

describe("admin token", () => {
  it("valjan token prolazi", async () => {
    const t = await napraviToken();
    expect(await provjeriToken(t)).toBe(true);
  });
  it("izmijenjen potpis pada", async () => {
    const t = await napraviToken();
    const [exp, sig] = t.split(".");
    expect(await provjeriToken(`${exp}.${sig.slice(0, -2)}aa`)).toBe(false);
  });
  it("istekao token pada", async () => {
    const t = await napraviToken(-1000);
    expect(await provjeriToken(t)).toBe(false);
  });
  it("undefined/prazno pada", async () => {
    expect(await provjeriToken(undefined)).toBe(false);
    expect(await provjeriToken("")).toBe(false);
  });
});
```

- [ ] **Step 2: Pokreni – pada**

Run: `npx vitest run lib/admin/token.test.ts`
Expected: FAIL.

- [ ] **Step 3: Token (Web Crypto – radi i u proxy-ju i u server akcijama)**

`lib/admin/token.ts`:

```ts
export const ADMIN_COOKIE = "localis_admin";
export const TRAJANJE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dana

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET nije postavljen ili je prekratak.");
  return s;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Buffer.from(sig).toString("base64url");
}

export function jednakoKonstantno(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token = "<exp ms>.<hmac(exp)>". Bez stanja na serveru - promjena tajne poništava sve sesije.
export async function napraviToken(trajanjeMs = TRAJANJE_MS): Promise<string> {
  const exp = String(Date.now() + trajanjeMs);
  return `${exp}.${await hmac(exp)}`;
}

export async function provjeriToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  return jednakoKonstantno(await hmac(exp), sig);
}
```

`lib/admin/session.ts`:

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, TRAJANJE_MS, jednakoKonstantno, napraviToken, provjeriToken } from "./token";

export function lozinkaIspravna(unos: string): boolean {
  const prava = process.env.ADMIN_PASSWORD ?? "";
  return prava.length > 0 && jednakoKonstantno(unos, prava);
}

export async function postaviSesiju(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, await napraviToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TRAJANJE_MS / 1000,
  });
}

export async function obrisiSesiju(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function jeAdmin(): Promise<boolean> {
  return provjeriToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

// Za server komponente i akcije - proxy je samo optimistična provjera.
export async function zahtijevajAdmina(): Promise<void> {
  if (!(await jeAdmin())) redirect("/admin/login");
}
```

- [ ] **Step 4: Pokreni – prolazi**

Run: `npx vitest run lib/admin/token.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Proxy**

`proxy.ts` (root projekta, uz `app/`):

```ts
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, provjeriToken } from "@/lib/admin/token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const ok = await provjeriToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 6: Layout, index, login stranica, akcije**

`app/admin/layout.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LOCALIS admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[var(--navy)] text-white">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6 text-sm">
          <span className="font-semibold tracking-wide">LOCALIS admin</span>
          <Link href="/admin/prijave" className="hover:underline">
            Prijave
          </Link>
          <Link href="/admin/postavke" className="hover:underline">
            Postavke
          </Link>
          <form action="/admin/login/odjava" method="post" className="ml-auto">
            <button type="submit" className="hover:underline">
              Odjava
            </button>
          </form>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

`app/admin/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/prijave");
}
```

`app/admin/login/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { lozinkaIspravna, postaviSesiju } from "@/lib/admin/session";

export type LoginState = { greska?: string };

export async function prijaviSe(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const lozinka = String(formData.get("lozinka") ?? "");
  const next = String(formData.get("next") ?? "/admin/prijave");
  if (!lozinkaIspravna(lozinka)) {
    return { greska: "Neispravna lozinka." };
  }
  await postaviSesiju();
  redirect(next.startsWith("/admin") ? next : "/admin/prijave");
}
```

`app/admin/login/odjava/route.ts`:

```ts
import { NextResponse } from "next/server";
import { obrisiSesiju } from "@/lib/admin/session";

export async function POST(request: Request) {
  await obrisiSesiju();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
```

`app/admin/login/page.tsx`:

```tsx
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="max-w-sm mx-auto mt-16 bg-white border border-gray-200 rounded-xl p-8">
      <h1 className="text-xl font-semibold mb-6">Prijava u admin</h1>
      <LoginForm next={next ?? "/admin/prijave"} />
    </div>
  );
}
```

`app/admin/login/LoginForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { prijaviSe, type LoginState } from "./actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(prijaviSe, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="lozinka" className="block text-sm font-medium mb-1.5">
          Lozinka
        </label>
        <input
          id="lozinka"
          name="lozinka"
          type="password"
          required
          autoFocus
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
        />
      </div>
      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[var(--navy)] text-white font-medium rounded-lg disabled:opacity-60"
      >
        {pending ? "Provjera..." : "Prijavi se"}
      </button>
    </form>
  );
}
```

- [ ] **Step 7: robots – disallow /admin**

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

const siteUrl = "https://www.localis.hr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 8: Ručni test**

`npm run dev`: otvori `/admin/prijave` → redirect na `/admin/login?next=/admin/prijave`. Kriva lozinka → "Neispravna lozinka." Prava (iz `.env.local` `ADMIN_PASSWORD`) → redirect na `/admin/prijave` (404 je ok – stranica dolazi u Tasku 15). Odjava → nazad na login.

- [ ] **Step 9: Commit**

```bash
git add lib/admin proxy.ts app/admin app/robots.ts
git commit -m "Add password-protected admin area with signed session cookie"
```

---

### Task 15: Admin – lista prijava

**Files:**
- Create: `app/admin/StatusBadge.tsx`
- Create: `app/admin/prijave/page.tsx`

- [ ] **Step 1: Badge**

`app/admin/StatusBadge.tsx`:

```tsx
const BOJE: Record<string, string> = {
  nova: "bg-yellow-100 text-yellow-800",
  ponuda_poslana: "bg-green-100 text-green-800",
  poslana: "bg-green-100 text-green-800",
  stornirana: "bg-gray-200 text-gray-700",
  greska: "bg-red-100 text-red-800",
};

const LABELE: Record<string, string> = {
  nova: "nova",
  ponuda_poslana: "ponuda poslana",
  poslana: "poslana",
  stornirana: "stornirana",
  greska: "greška",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${BOJE[status] ?? "bg-gray-100"}`}>
      {LABELE[status] ?? status}
    </span>
  );
}
```

- [ ] **Step 2: Lista**

`app/admin/prijave/page.tsx`:

```tsx
import Link from "next/link";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { getSeminars } from "@/lib/edukacije";
import { ucitajPrijave } from "@/lib/prijave/ucitaj";
import type { Prijava } from "@/lib/db/schema";
import StatusBadge from "../StatusBadge";

export const dynamic = "force-dynamic";

const STATUSI: Prijava["status"][] = ["nova", "ponuda_poslana", "stornirana"];

function fmtDatum(d: Date) {
  return new Intl.DateTimeFormat("hr-HR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  }).format(d);
}

export default async function PrijavePage({
  searchParams,
}: {
  searchParams: Promise<{ edukacija?: string; status?: string }>;
}) {
  await zahtijevajAdmina();
  const { edukacija, status } = await searchParams;
  const statusFilter = STATUSI.find((s) => s === status);
  const [prijave, seminari] = await Promise.all([
    ucitajPrijave({ seminarSlug: edukacija || undefined, status: statusFilter }),
    getSeminars(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Prijave</h1>

      <form className="flex flex-wrap gap-3 mb-6 text-sm" method="get">
        <select name="edukacija" defaultValue={edukacija ?? ""} className="border rounded-lg px-3 py-2 bg-white">
          <option value="">Sve edukacije</option>
          {seminari.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="border rounded-lg px-3 py-2 bg-white">
          <option value="">Svi statusi</option>
          <option value="nova">nova</option>
          <option value="ponuda_poslana">ponuda poslana</option>
          <option value="stornirana">stornirana</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg">
          Filtriraj
        </button>
      </form>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Edukacija</th>
              <th className="px-3 py-2">Organizacija</th>
              <th className="px-3 py-2">Kontakt</th>
              <th className="px-3 py-2 text-center">Polaznici</th>
              <th className="px-3 py-2">Ponuda</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {prijave.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  Nema prijava.
                </td>
              </tr>
            )}
            {prijave.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-3 py-2 whitespace-nowrap">{fmtDatum(p.createdAt)}</td>
                <td className="px-3 py-2 max-w-xs truncate" title={p.seminarTitle}>
                  {p.seminarTitle}
                </td>
                <td className="px-3 py-2">{p.organizacija}</td>
                <td className="px-3 py-2">
                  {p.kontaktIme}
                  <div className="text-gray-500 text-xs">{p.email}</div>
                </td>
                <td className="px-3 py-2 text-center">{p.brojPolaznika}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {p.zadnjaPonuda ? (
                    <>
                      {p.zadnjaPonuda.broj} <StatusBadge status={p.zadnjaPonuda.status} />
                    </>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/prijave/${p.id}`} className="text-[var(--navy)] hover:underline">
                    Detalji
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Ručni test**

`/admin/prijave` prikazuje prijavu iz Taska 13 s brojem ponude i statusima. Filtri rade.

- [ ] **Step 4: Commit**

```bash
git add app/admin/prijave/page.tsx app/admin/StatusBadge.tsx
git commit -m "Add admin registrations list with filters"
```

---

### Task 16: Admin – detalj prijave, akcije, PDF download

**Files:**
- Create: `app/admin/prijave/[id]/page.tsx`
- Create: `app/admin/prijave/[id]/actions.ts`
- Create: `app/admin/prijave/[id]/UrediPrijavuForm.tsx`
- Create: `app/admin/prijave/[id]/PonudaAkcije.tsx`
- Create: `app/admin/ponude/[id]/pdf/route.ts`

- [ ] **Step 1: Server akcije**

`app/admin/prijave/[id]/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { azurirajPrijavu } from "@/lib/prijave/spremi";
import { dovrsiPonudu, izdajPonudu, ponovnoPosaljiMail, stornirajPonudu } from "@/lib/ponude/izdaj";

export type AdminAkcijaState = { poruka?: string; greska?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OIB_RE = /^\d{11}$/;

function osvjezi(prijavaId: number) {
  revalidatePath(`/admin/prijave/${prijavaId}`);
  revalidatePath("/admin/prijave");
}

export async function spremiIzmjene(
  prijavaId: number,
  _prev: AdminAkcijaState,
  formData: FormData,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const imena = formData.getAll("polaznik_ime").map((v) => String(v).trim());
  const radna = formData.getAll("polaznik_radno_mjesto").map((v) => String(v).trim());
  const polaznici = imena
    .map((ime, i) => ({ ime, radnoMjesto: radna[i] ?? "" }))
    .filter((p) => p.ime || p.radnoMjesto);
  const p = {
    kontaktIme: String(formData.get("kontaktIme") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telefon: String(formData.get("telefon") ?? "").trim(),
    organizacija: String(formData.get("organizacija") ?? "").trim(),
    adresa: String(formData.get("adresa") ?? "").trim(),
    oib: String(formData.get("oib") ?? "").trim(),
    napomena: String(formData.get("napomena") ?? "").trim() || null,
    polaznici,
  };
  if (!p.kontaktIme || !p.organizacija || !p.adresa || !p.telefon) {
    return { greska: "Sva polja osim napomene su obavezna." };
  }
  if (!EMAIL_RE.test(p.email)) return { greska: "Neispravan email." };
  if (!OIB_RE.test(p.oib)) return { greska: "OIB mora imati 11 znamenaka." };
  if (polaznici.length === 0 || polaznici.some((x) => !x.ime || !x.radnoMjesto)) {
    return { greska: "Svaki polaznik treba ime i radno mjesto." };
  }
  await azurirajPrijavu(prijavaId, p);
  osvjezi(prijavaId);
  return { poruka: "Izmjene spremljene. Postojeća ponuda NIJE promijenjena - storniraj je i izdaj novu." };
}

export async function storniraj(
  prijavaId: number,
  ponudaId: number,
  obavijesti: boolean,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  try {
    await stornirajPonudu(ponudaId, obavijesti);
    osvjezi(prijavaId);
    return { poruka: "Ponuda stornirana." };
  } catch (e) {
    return { greska: e instanceof Error ? e.message : String(e) };
  }
}

export async function izdajNovu(prijavaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const r = await izdajPonudu(prijavaId);
  osvjezi(prijavaId);
  return r.ok ? { poruka: "Nova ponuda izdana i poslana." } : { greska: `Ponuda nije dovršena: ${r.greska}` };
}

export async function pokusajPonovno(prijavaId: number, ponudaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const r = await dovrsiPonudu(ponudaId);
  osvjezi(prijavaId);
  return r.ok ? { poruka: "Ponuda dovršena i poslana." } : { greska: r.greska };
}

export async function posaljiMailPonovno(prijavaId: number, ponudaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  try {
    await ponovnoPosaljiMail(ponudaId);
    osvjezi(prijavaId);
    return { poruka: "Mail ponovno poslan." };
  } catch (e) {
    return { greska: e instanceof Error ? e.message : String(e) };
  }
}
```

- [ ] **Step 2: Forma za uređivanje (client)**

`app/admin/prijave/[id]/UrediPrijavuForm.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import type { Polaznik, Prijava } from "@/lib/db/schema";
import { spremiIzmjene, type AdminAkcijaState } from "./actions";

const input =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20";

export default function UrediPrijavuForm({ prijava, polaznici }: { prijava: Prijava; polaznici: Polaznik[] }) {
  const [state, action, pending] = useActionState<AdminAkcijaState, FormData>(
    spremiIzmjene.bind(null, prijava.id),
    {},
  );
  const [redovi, setRedovi] = useState(
    polaznici.map((p) => ({ key: p.id, ime: p.ime, radnoMjesto: p.radnoMjesto })),
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm">
          Kontakt osoba
          <input name="kontaktIme" defaultValue={prijava.kontaktIme} className={input} required />
        </label>
        <label className="text-sm">
          Email
          <input name="email" type="email" defaultValue={prijava.email} className={input} required />
        </label>
        <label className="text-sm">
          Telefon
          <input name="telefon" defaultValue={prijava.telefon} className={input} required />
        </label>
        <label className="text-sm">
          OIB
          <input name="oib" defaultValue={prijava.oib} className={input} required pattern="\d{11}" />
        </label>
        <label className="text-sm sm:col-span-2">
          Organizacija
          <input name="organizacija" defaultValue={prijava.organizacija} className={input} required />
        </label>
        <label className="text-sm sm:col-span-2">
          Adresa
          <input name="adresa" defaultValue={prijava.adresa} className={input} required />
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-1.5">Polaznici</div>
        <div className="space-y-2">
          {redovi.map((r, i) => (
            <div key={r.key} className="flex gap-2">
              <input name="polaznik_ime" defaultValue={r.ime} placeholder="Ime i prezime" className={input} required />
              <input
                name="polaznik_radno_mjesto"
                defaultValue={r.radnoMjesto}
                placeholder="Radno mjesto"
                className={input}
                required
              />
              {redovi.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRedovi(redovi.filter((_, j) => j !== i))}
                  className="px-3 text-gray-400 hover:text-red-600"
                  aria-label="Ukloni"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRedovi([...redovi, { key: Date.now(), ime: "", radnoMjesto: "" }])}
          className="mt-2 text-sm text-[var(--navy)] hover:underline"
        >
          + Dodaj polaznika
        </button>
      </div>

      <label className="text-sm block">
        Napomena
        <textarea name="napomena" defaultValue={prijava.napomena ?? ""} rows={3} className={input} />
      </label>

      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      {state.poruka && <p className="text-green-700 text-sm">{state.poruka}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
      >
        {pending ? "Spremanje..." : "Spremi izmjene"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Gumbi akcija (client)**

`app/admin/prijave/[id]/PonudaAkcije.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import type { Ponuda } from "@/lib/db/schema";
import {
  izdajNovu,
  pokusajPonovno,
  posaljiMailPonovno,
  storniraj,
  type AdminAkcijaState,
} from "./actions";

const btn = "px-3 py-1.5 rounded-lg text-sm border disabled:opacity-60";

export function PonudaAkcije({ prijavaId, ponuda }: { prijavaId: number; ponuda: Ponuda }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminAkcijaState>({});
  const [obavijesti, setObavijesti] = useState(true);
  const run = (fn: () => Promise<AdminAkcijaState>) => start(async () => setState(await fn()));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ponuda.status === "greska" && (
        <button
          className={`${btn} border-[var(--navy)] text-[var(--navy)]`}
          disabled={pending}
          onClick={() => run(() => pokusajPonovno(prijavaId, ponuda.id))}
        >
          Pokušaj ponovno
        </button>
      )}
      {ponuda.status === "poslana" && (
        <button
          className={`${btn} border-gray-300`}
          disabled={pending}
          onClick={() => run(() => posaljiMailPonovno(prijavaId, ponuda.id))}
        >
          Pošalji mail ponovno
        </button>
      )}
      {ponuda.status !== "stornirana" && (
        <>
          <label className="text-xs flex items-center gap-1">
            <input type="checkbox" checked={obavijesti} onChange={(e) => setObavijesti(e.target.checked)} />
            obavijesti klijenta
          </label>
          <button
            className={`${btn} border-red-300 text-red-700`}
            disabled={pending}
            onClick={() => {
              if (confirm(`Stornirati ponudu ${ponuda.broj}?`)) {
                run(() => storniraj(prijavaId, ponuda.id, obavijesti));
              }
            }}
          >
            Storniraj
          </button>
        </>
      )}
      {pending && <span className="text-gray-500 text-xs">Radim...</span>}
      {state.greska && <span className="text-red-600 text-xs">{state.greska}</span>}
      {state.poruka && <span className="text-green-700 text-xs">{state.poruka}</span>}
    </div>
  );
}

export function IzdajNovuGumb({ prijavaId }: { prijavaId: number }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminAkcijaState>({});
  return (
    <div className="flex items-center gap-3">
      <button
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
        disabled={pending}
        onClick={() => start(async () => setState(await izdajNovu(prijavaId)))}
      >
        {pending ? "Izdavanje..." : "Izdaj novu ponudu"}
      </button>
      {state.greska && <span className="text-red-600 text-xs">{state.greska}</span>}
      {state.poruka && <span className="text-green-700 text-xs">{state.poruka}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Stranica detalja**

`app/admin/prijave/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { ucitajPrijavu } from "@/lib/prijave/ucitaj";
import { formatDatumHr, formatIznos } from "@/lib/ponude/format";
import StatusBadge from "../../StatusBadge";
import UrediPrijavuForm from "./UrediPrijavuForm";
import { IzdajNovuGumb, PonudaAkcije } from "./PonudaAkcije";

export const dynamic = "force-dynamic";

export default async function PrijavaDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  await zahtijevajAdmina();
  const { id } = await params;
  const prijava = await ucitajPrijavu(Number(id));
  if (!prijava) notFound();

  const imaAktivnu = prijava.ponude.some((p) => p.status === "poslana" || p.status === "greska");

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/prijave" className="text-sm text-[var(--navy)] hover:underline">
          ← Sve prijave
        </Link>
        <h1 className="text-2xl font-semibold mt-2 flex items-center gap-3">
          {prijava.organizacija} <StatusBadge status={prijava.status} />
        </h1>
        <p className="text-gray-600 text-sm">{prijava.seminarTitle}</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Ponude</h2>
        {prijava.ponude.length === 0 && <p className="text-sm text-gray-500 mb-4">Nema izdanih ponuda.</p>}
        <ul className="space-y-3">
          {prijava.ponude.map((p) => (
            <li key={p.id} className="border border-gray-100 rounded-lg p-4 text-sm space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">{p.broj}</span>
                <StatusBadge status={p.status} />
                <span>izdana {formatDatumHr(p.datumIzdavanja)}</span>
                <span>vrijedi do {formatDatumHr(p.vrijediDo)}</span>
                <span>
                  {p.kolicina} × {formatIznos(p.cijena)} = <b>{formatIznos(p.ukupno)} EUR</b>
                </span>
                {p.pdfUrl && (
                  <a
                    href={`/admin/ponude/${p.id}/pdf`}
                    className="text-[var(--navy)] hover:underline"
                    target="_blank"
                  >
                    PDF
                  </a>
                )}
              </div>
              {p.greska && <p className="text-red-600 text-xs">Greška: {p.greska}</p>}
              {p.emailPoslanAt && (
                <p className="text-gray-500 text-xs">
                  Mail poslan: {p.emailPoslanAt.toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" })}
                </p>
              )}
              <PonudaAkcije prijavaId={prijava.id} ponuda={p} />
            </li>
          ))}
        </ul>
        {!imaAktivnu && (
          <div className="mt-4">
            <IzdajNovuGumb prijavaId={prijava.id} />
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold mb-1">Podaci prijave</h2>
        <p className="text-xs text-gray-500 mb-4">
          Izmjene ne mijenjaju već izdane ponude. Za ispravak: uredi → storniraj staru → izdaj novu.
        </p>
        <UrediPrijavuForm prijava={prijava} polaznici={prijava.polaznici} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: PDF download ruta (privatni blob)**

`app/admin/ponude/[id]/pdf/route.ts`:

```ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { jeAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { ponude, prijave } from "@/lib/db/schema";
import { downloadPonudaPdf } from "@/lib/ponude/blob";
import { nazivDatotekePonude } from "@/lib/ponude/format";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const [row] = await db
    .select({ pdfUrl: ponude.pdfUrl, broj: ponude.broj, organizacija: prijave.organizacija })
    .from(ponude)
    .innerJoin(prijave, eq(prijave.id, ponude.prijavaId))
    .where(eq(ponude.id, Number(id)));
  if (!row?.pdfUrl) return new NextResponse("Not found", { status: 404 });
  const pdf = await downloadPonudaPdf(row.pdfUrl);
  const filename = encodeURIComponent(nazivDatotekePonude(row.broj, row.organizacija));
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${filename}`,
    },
  });
}
```

- [ ] **Step 6: Ručni test (dry run)**

- Detalj prijave iz Taska 13: ponuda `poslana`, link PDF otvara isti PDF.
- "Pošalji mail ponovno" → `[EMAIL_DRY_RUN]` u konzoli, `emailPoslanAt` ažuriran.
- Uredi radno mjesto polaznika → "Izmjene spremljene..." → "Storniraj" (s obavijesti) → status `stornirana`, `[EMAIL_DRY_RUN] Storno ponude` → pojavi se "Izdaj novu ponudu" → klik → nova ponuda `2-112/26`, status `poslana`, prijava `ponuda_poslana`.
- Simuliraj grešku: privremeno pokvari `BLOB_READ_WRITE_TOKEN` u `.env.local` (restart dev servera), storniraj pa izdaj novu → status `greska` s porukom; vrati token, restart → "Pokušaj ponovno" → `poslana`, isti broj.

- [ ] **Step 7: Lint + tipovi + commit**

Run: `npx tsc --noEmit && npm run lint`

```bash
git add app/admin/prijave app/admin/ponude
git commit -m "Add admin registration detail with edit, cancel, reissue and PDF download"
```

---

### Task 17: Admin – postavke

**Files:**
- Create: `app/admin/postavke/page.tsx`
- Create: `app/admin/postavke/actions.ts`
- Create: `app/admin/postavke/PostavkeForm.tsx`

- [ ] **Step 1: Akcija**

`app/admin/postavke/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { setPostavke } from "@/lib/postavke";

export type PostavkeState = { poruka?: string; greska?: string };

export async function spremiPostavke(_prev: PostavkeState, formData: FormData): Promise<PostavkeState> {
  await zahtijevajAdmina();
  const sredina = String(formData.get("brojPonudeSredina") ?? "").trim();
  const dani = Number(formData.get("daniValjanosti"));
  const potpisnik = String(formData.get("potpisnik") ?? "").trim();
  if (!/^\d+$/.test(sredina)) return { greska: "Srednji dio broja ponude mora biti broj (npr. 112)." };
  if (!Number.isInteger(dani) || dani < 0 || dani > 60) return { greska: "Dani valjanosti: cijeli broj 0–60." };
  if (!potpisnik) return { greska: "Potpisnik je obavezan." };
  await setPostavke({ brojPonudeSredina: sredina, daniValjanosti: dani, potpisnik });
  revalidatePath("/admin/postavke");
  return { poruka: "Postavke spremljene. Vrijede za sve sljedeće ponude." };
}
```

- [ ] **Step 2: Forma**

`app/admin/postavke/PostavkeForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import type { Postavke } from "@/lib/postavke";
import { spremiPostavke, type PostavkeState } from "./actions";

const input = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm";

export default function PostavkeForm({ postavke }: { postavke: Postavke }) {
  const [state, action, pending] = useActionState<PostavkeState, FormData>(spremiPostavke, {});
  return (
    <form action={action} className="space-y-4 max-w-md">
      <label className="block text-sm">
        Srednji dio broja ponude (npr. <b>112</b> u 8-<b>112</b>/26)
        <input name="brojPonudeSredina" defaultValue={postavke.brojPonudeSredina} className={input} required />
      </label>
      <label className="block text-sm">
        Dani valjanosti / rok plaćanja (od datuma izdavanja)
        <input
          name="daniValjanosti"
          type="number"
          min={0}
          max={60}
          defaultValue={postavke.daniValjanosti}
          className={input}
          required
        />
      </label>
      <label className="block text-sm">
        Potpisnik na ponudi
        <input name="potpisnik" defaultValue={postavke.potpisnik} className={input} required />
      </label>
      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      {state.poruka && <p className="text-green-700 text-sm">{state.poruka}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
      >
        {pending ? "Spremanje..." : "Spremi"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Stranica**

`app/admin/postavke/page.tsx`:

```tsx
import { zahtijevajAdmina } from "@/lib/admin/session";
import { getPostavke } from "@/lib/postavke";
import PostavkeForm from "./PostavkeForm";

export const dynamic = "force-dynamic";

export default async function PostavkePage() {
  await zahtijevajAdmina();
  const postavke = await getPostavke();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Postavke ponuda</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PostavkeForm postavke={postavke} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Ručni test + commit**

Promijeni dane na 3, spremi, reload → 3. Vrati na 2.

```bash
git add app/admin/postavke
git commit -m "Add admin settings page for offer numbering, validity and signer"
```

---

### Task 18: Cijeli test suite, build, deploy, produkcijski E2E

- [ ] **Step 1: Svi testovi**

Run: `npm test`
Expected: svi passed (datumi, format, pdf, email, izdaj, token).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: prolazi; u outputu `ƒ /admin/...` (dynamic) i `/edukacije/[slug]` (ISR).

- [ ] **Step 3: Neon skills – gitignore**

`.agents/skills/neon*` i `skills-lock.json` je instalirao `vercel integration add neon`. Dodaj u `.gitignore`:

```
# Neon agent skills (lokalni alat, instalira vercel CLI)
/.agents/
/skills-lock.json
```

- [ ] **Step 4: Push → Vercel deploy**

```bash
git add .gitignore
git commit -m "Ignore locally installed Neon agent skills"
git push
```

Vercel gradi `master`. Provjeri: `vercel ls` → zadnji deployment `Ready`. Migracija je već primijenjena na istu Neon bazu (jedna baza za sve okoline – free plan).

- [ ] **Step 5: Produkcijski E2E**

Na `https://www.localis.hr/edukacije/kako-izraditi-opci-akt-u-jlprs` pošalji **pravu** prijavu na vlastiti email (organizacija "TEST - obrisati", OIB `00000000000`).

Expected:
- Mail na tvoj inbox s PDF-om, tekst po specu.
- Mail na `CONTACT_TO` s istim PDF-om.
- `https://www.localis.hr/admin/prijave` → prijava vidljiva, PDF link radi.
- Storniraj testnu ponudu (bez obavijesti). Testnu prijavu ostavi kao storniranu (brojač je potrošen – očekivano).

- [ ] **Step 6: Predaj lozinku i upute**

Milada/Marija dobivaju: URL `https://www.localis.hr/admin`, lozinku (iz password managera), i tri rečenice: "Ponude idu same. Ako je klijent krivo upisao – Prijave → Detalji → ispravi → Storniraj → Izdaj novu. Ako je status crven (greška) – Pokušaj ponovno."

---

## Self-review

**Spec coverage:**
- Baza (5 tablica, brojač, snapshot, adresa) → Task 2, 12 ✓
- Tok prijave, "prijava se ne gubi", seminari bez ponude → Task 12, 13 ✓
- Email klijentu tekst → Task 11 ✓
- Storno (+ obavijest), uredi, izdaj novu, pokušaj ponovno (isti broj), pošalji ponovno → Task 12 (logika), 16 (UI) ✓
- `edukacije.ts` ponuda blok → Task 4 ✓
- PDF 1:1, Carlito, formati, naziv datoteke → Task 7, 8, 9 ✓
- Admin login/proxy/robots/lista/detalj/postavke → Task 14–17 ✓
- Env varijable, `.env.example` → Task 1 ✓ (infra već postoji)
- Testovi: datumi, format, broj, brojač paralelno, PDF tekst, email, token, ručni E2E → Task 6, 7, 9, 11, 12, 13, 14, 18 ✓
- Fallback kad DB padne: interni mail bez spremanja → Task 13 ✓

**Type consistency:** `PonudaPdfData` (Task 9) ↔ `pdfPodaci` (Task 12) ✓; `PolaznikZaIspis` iz `format.ts` u pdf/email ✓; `MailKlijentuInput`, `InterniMailInput` iz `email.ts` u `izdaj.ts` ✓; `DovrsiRezultat` ↔ admin akcije ✓; `InterniMailInput.ponuda.ukupno: string | number` jer Drizzle numeric vraća string ✓; `Tx` iz `lib/db` u `sljedeciRedniBroj` ✓; `IzmjenaPrijave` = `NovaPrijava` bez seminar polja ✓; `ADMIN_COOKIE`/`provjeriToken` iz `token.ts` u proxy i session ✓.

**Poznati rizici za izvođača:**
- `Font.register` s apsolutnim putem: ako Vercel bundle ne uključi fontove unatoč `outputFileTracingIncludes`, PDF pada s "ENOENT". Provjera: Vercel runtime log nakon E2E; fix = eksplicitniji glob ključ (`"/edukacije/[slug]"`, `"/admin/prijave/[id]"`).
- `pdf-parse@1.1.1` ima poznati bug pri importu bez `test/data` – ako test padne s ENOENT na `./test/data/05-versions-space.pdf`, importaj `pdf-parse/lib/pdf-parse.js` umjesto root paketa.
- `db.query.prijave.findMany` s `and(undefined, undefined)` – Drizzle to tolerira (vraća sve). Ako tip prigovori, filtriraj `undefined` prije `and(...)`.
- `renderToBuffer` u Next server akciji: ako se pojavi "Cannot find module 'canvas'" ili slično, dodaj i `"canvas"` u `serverExternalPackages` ili `webpack.externals`.
