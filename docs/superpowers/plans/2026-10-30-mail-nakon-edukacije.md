# Mail nakon edukacije - plan implementacije

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mail nakon edukacije (zahvala, materijali, upitnik s QR-om, nadolazeće edukacije) iz podataka i predloška, s uploadom materijala i terminom slanja u adminu.

**Architecture:** Čista funkcija `renderMailNakon` slaže mail iz edukacije, tekstova i materijala; koriste je pregled, probni mail, "Pošalji sada" i cron. Materijali su privatni Blob + javna stranica s HMAC ključem; preuzimanje je redirect na presigned URL. Termin slanja je red u `upitnici_slanja`.

**Tech Stack:** Next.js 16 (app router, server actions), Drizzle + Postgres, Vercel Blob (`@vercel/blob`, `@vercel/blob/client`), nodemailer (Zoho), `qrcode`, vitest.

**Spec:** `docs/superpowers/specs/2026-10-30-mail-nakon-edukacije-design.md`

## Global Constraints

- Bez termina slanja ne ide nijedan mail (ni cron).
- Jedan mail po prijavi - `upitnici_mailovi` unique na `prijava_id` ostaje jedini čuvar.
- Termin = 07:00 UTC na `datum_slanja`. Rok = `upitnikRokDo` ako postoji, inače max(kraj + 96 h, termin + 96 h).
- Cron `0 7 * * *`.
- Materijali: 100 MB po datoteci; PDF, PPT(X), DOC(X), XLS(X), ZIP, slike.
- Ključ materijala: HMAC-SHA256(`materijali:` + slug, `ADMIN_SESSION_SECRET`), base64url, 22 znaka.
- Polja u tekstu: `{naziv}`, `{datum}`, `{predavaci}`, `{rok}`; nepoznato polje ostaje doslovno.
- Hrvatski u UI-u i komentarima, imena u stilu postojećeg koda.

## Review Focus

- Naziv edukacije s `<`, `&`, `"` - HTML mora biti escapean (test u Task 4).
- Datoteka s dijakriticima/razmacima u imenu - pathname siguran, prikazni naziv izvoran (Task 5: `sigurnoImeDatoteke`).
- "Pošalji sada" dvaput za redom - drugi klik ne šalje nikome (postojeći `odaberiPrimatelje` testovi to pokrivaju).
- Materijal drugog sluga s ispravnim ključem prvog - 404 (Task 7 provjerava slug materijala).
- Nema nadolazećih / nema materijala - odjeljci nestaju, nema praznih naslova (Task 4).

---

### Task 1: Tablice

**Files:** Modify `lib/db/schema.ts`; Create `drizzle/0010_mail_nakon.sql` (`npm run db:generate`).

**Produces:** `upitniciMaterijali` (`id, seminarSlug, naziv, blobUrl, pathname, velicina, contentType, createdAt`), `upitniciSlanja` (`seminarSlug` PK, `datumSlanja: string | null` (date), `updatedAt`), tipovi `UpitnikMaterijal`.

- [ ] Dodati tablice (index na `seminar_slug` materijala).
- [ ] `npm run db:generate`, preimenovati u `0010_mail_nakon.sql` (+ tag u `drizzle/meta/_journal.json`).
- [ ] `npx tsc --noEmit` prolazi. Commit.

### Task 2: Rok od termina slanja

**Files:** Modify `lib/upitnici/rok.ts`, `lib/upitnici/rok.test.ts`.

**Produces:** `terminSlanja(datum: string): Date`, `rokUpitnika(s, datumSlanja?: string | null): Date`, `stanjeUpitnika(s, now?, datumSlanja?)`.

- [ ] Testovi: `rokUpitnika(s, "2026-11-02")` = `2026-11-06T07:00:00.000Z`; `rokUpitnika(s, "2026-10-28")` = `2026-11-01T14:30:00.000Z`; `upitnikRokDo` pobjeđuje termin; `stanjeUpitnika(s, 2026-11-05T12:00Z, "2026-11-02")` = `"otvoren"`.
- [ ] Implementacija, testovi zeleni. Commit.

### Task 3: Predložak teksta

**Files:** Modify `lib/tekstovi.ts`, `lib/tekstovi.test.ts`.

**Produces:** grupa `mailNakon` s ključevima i zadanim tekstovima iz spec §3; `opis` grupe nabraja polja; `zamijeniPolja(tekst: string, polja: Record<string, string>): string`.

- [ ] Test `zamijeniPolja("Hvala {naziv}, {nepoznato}", { naziv: "X" })` = `"Hvala X, {nepoznato}"`.
- [ ] Implementacija, commit.

### Task 4: Renderer maila

**Files:** Create `lib/upitnici/mail-nakon.ts`, `lib/upitnici/mail-nakon.test.ts`.

**Consumes:** `zamijeniPolja`, `Tekstovi`, `formatRoka`, `upitnikUrl`.
**Produces:**
- `spojiImena(imena: string[]): string` - `"A"`, `"A i B"`, `"A, B i C"`.
- `nadolazeceEdukacije(seminari: Seminar[], now: Date, limit = 5): Seminar[]` - `!odgodeno && !skriveno && !isSeminarPast(s, now)`, uzlazno po datumu.
- `type MailNakon = { subject: string; html: string; text: string; qrPng: Buffer }`, `QR_CID = "upitnik-qr"`.
- `renderMailNakon(p: { seminar; tekstovi; rok: Date; materijaliUrl: string | null; nadolazece: Seminar[] }): Promise<MailNakon>`.

- [ ] Testovi: subject = `Hvala što ste bili s nama: <naziv>`; `materijaliUrl: null` → bez "Preuzmi materijale"; `nadolazece: []` → bez "Što slijedi"; naziv `A & <B>` → `A &amp; &lt;B&gt;`; text sadrži upitnik URL, materijali URL i `/edukacije/<slug>`; HTML sadrži `cid:upitnik-qr`; `nadolazeceEdukacije` filtrira, sortira, limit.
- [ ] Implementacija (tablični HTML 600 px, inline stilovi, logo `https://www.localis.hr/ponuda/logo.png`). Commit.

### Task 5: Materijali (lib)

**Files:** Create `lib/upitnici/materijali.ts`, `lib/upitnici/materijali.test.ts`.

**Produces:** `kljucMaterijala(slug)`, `provjeriKljucMaterijala(slug, kljuc: string | null)`, `materijaliUrl(slug)` (`https://www.localis.hr/materijali/<slug>?k=<kljuc>`), `sigurnoImeDatoteke(naziv)`, `DOPUSTENI_TIPOVI`, `MAX_VELICINA`, `formatVelicine(bajtovi)`, `getMaterijali(slug)`, `presignedPreuzimanje(pathname)`, `obrisiMaterijal(id, slug)`.

- [ ] Testovi: isti slug → isti ključ duljine 22; drugi slug → drugi; kriv/null → false; `sigurnoImeDatoteke("Prezentacija Kvakarić 28.10.pptx")` = `"Prezentacija-Kvakaric-28.10.pptx"`; `formatVelicine(2_500_000)` = `"2,4 MB"`.
- [ ] Implementacija (presign: `issueSignedToken` + `presignUrl`, 10 min). Commit.

### Task 6: Slanje

**Files:** Modify `lib/upitnici/slanje.ts`, `lib/upitnici/slanje.test.ts`, `app/api/cron/upitnici/route.ts`, `vercel.json`.

**Produces:** `getSlanje(slug)`, `getSlanja()`, `pripremiMail(seminar, datumSlanja)`, `posaljiZaEdukaciju(seminar, datumSlanja, krajRada?)`, `posaljiUpitnike(now?)`, `posaljiProbni(seminar, datumSlanja)`, `brojPrimatelja(slug)`, `edukacijeZaSlanje(seminari, slanja: Map<string, string>, now)`.

- [ ] Testovi `edukacijeZaSlanje`: bez termina → []; termin sutra → []; termin danas (Zagreb) → [s]; odgođena → []; zatvoren upitnik → []. `tekstMaila` testovi se brišu.
- [ ] Implementacija; cron bez `UPITNICI_SLANJE`; `vercel.json` `0 7 * * *`; pozivatelji `rokUpitnika`/`stanjeUpitnika` (javni upitnik, akcija, admin lista i detalj) dobivaju `datumSlanja`. Commit.

### Task 7: Javna stranica materijala

**Files:** Create `app/(site)/materijali/[slug]/page.tsx`, `app/(site)/materijali/[slug]/[id]/route.ts`.

- [ ] Stranica: edukacija + ključ, inače `notFound()`; noindex; popis s veličinom; napomena o autorskom djelu; prazno → "Materijali još nisu objavljeni."
- [ ] Ruta: ključ + materijal s tim `id` i `seminarSlug`, inače 404; redirect 302 na presigned URL, `Cache-Control: no-store`. Commit.

### Task 8: Admin

**Files:** Create `app/admin/upitnici/[slug]/upload/route.ts`, `app/admin/upitnici/[slug]/pregled/route.ts`, `app/admin/upitnici/[slug]/MailNakonSekcija.tsx`; Modify `app/admin/upitnici/[slug]/actions.ts`, `app/admin/upitnici/[slug]/page.tsx`, `app/admin/upitnici/page.tsx`.

- [ ] Upload ruta: `handleUpload`; `onBeforeGenerateToken` provjerava admina i prefiks `materijali/<slug>/`, vraća tipove, limit, `addRandomSuffix: true`. Upis u bazu radi akcija `spremiMaterijal` nakon `upload()` (callback ne radi na localhostu).
- [ ] Pregled ruta: admin → HTML iz `pripremiMail`, `cid:` zamijenjen data URL-om.
- [ ] Akcije: `spremiMaterijal`, `obrisiMaterijalAkcija`, `spremiDatumSlanja`, `posaljiProbniAkcija`, `posaljiSadaAkcija`; page `maxDuration = 300`.
- [ ] Sekcija: materijali (upload, popis, obriši), iframe pregleda, datum, probni mail, Pošalji sada s `confirm` i brojem adresa. Lista: stupac "Slanje".
- [ ] `npm run build`, ručna provjera s `EMAIL_DRY_RUN=1`. Commit.

### Task 9: Čišćenje i deploy

- [ ] Maknuti `upitnikRokDo` s Izvlaštenja. Testovi, lint, build. Commit.
- [ ] `npm run db:migrate` i push - uz potvrdu korisnika.
