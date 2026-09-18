# Automatsko izdavanje ponuda za prijave na edukacije

Datum: 2026-09-19

## Cilj

Kad se netko prijavi na edukaciju preko forme na `/edukacije/[slug]`, sistem bez ljudskog
klika: spremi prijavu u bazu, izda ponudu s jedinstvenim brojem, generira PDF identičan
današnjim ručno rađenim ponudama i pošalje ga klijentu i LOCALIS-u. Ručni unos podataka
u ponudu nestaje - time nestaju i greške (tipfeleri u naslovu, krivo kopirana radna mjesta,
ručno računani datumi, ručno upisani brojevi ponuda).

Admin panel služi za pregled, storno, ispravak i ponovno izdavanje - ne za redovni tok.

## Odluke

| Pitanje | Odluka |
|---|---|
| Kad se ponuda izdaje | Automatski, odmah nakon prijave. Bez pregleda prije slanja. |
| Krivi podaci od klijenta | Odgovornost klijenta. Rješava se stornom + novom ponudom u adminu. |
| Format broja ponude | `{redni}-{sredina}/{yy}`, npr. `8-112/26`. Redni = brojač po godini. Sredina = postavka (trenutno `112`). |
| Vrijedi do / rok plaćanja | Oba = datum izdavanja + `dani_valjanosti` (postavka, trenutno 2). Cap: nikad nakon datuma edukacije. |
| Baza | Neon Postgres (Vercel Marketplace) + Drizzle ORM |
| PDF-ovi | Vercel Blob |
| PDF generiranje | `@react-pdf/renderer`, font Carlito (metrički Calibri) |
| Admin auth | Jedna zajednička lozinka (`ADMIN_PASSWORD`), potpisani httpOnly cookie |
| Email | Postojeći Zoho SMTP (`info@localis.hr`) |

## Što ide na ponudu i odakle

| Polje na ponudi | Izvor |
|---|---|
| Naziv, adresa, OIB, IBAN, SWIFT LOCALIS-a | konstanta u kodu (`lib/ponude/izdavatelj.ts`) |
| Potpisnik | postavka `potpisnik` |
| Mjesto i datum izdavanja | "Grubišno Polje, " + danas |
| Ponuda vrijedi do, rok plaćanja | izračun |
| Klijent: naziv, OIB, kontakt osoba, tel, email | forma prijave |
| Broj ponude | brojač iz baze |
| Predmet (kicker + naslov), predavač, datum, mjesto održavanja, uključeno | `lib/edukacije.ts` |
| Ime i prezime polaznika | forma prijave, `Ime Prezime, radno mjesto` |
| Količina | broj polaznika |
| Cijena | `edukacije.ts` → `ponuda.cijena` |
| Iznos, ukupno, rabat (0), PDV (0 %) | izračun |

## 1. Baza

Neon Postgres, Drizzle ORM, migracije u `drizzle/`.

### `prijave`

Jedna po submitu forme.

| kolona | tip | napomena |
|---|---|---|
| id | serial PK | |
| created_at | timestamptz | |
| seminar_slug | text | veza na `edukacije.ts` |
| seminar_title | text | snapshot naslova u trenutku prijave |
| kontakt_ime | text | |
| email | text | |
| telefon | text | |
| organizacija | text | |
| oib | char(11) | |
| napomena | text | nullable |
| status | enum | `nova`, `ponuda_poslana`, `stornirana` |

### `polaznici`

| kolona | tip |
|---|---|
| id | serial PK |
| prijava_id | FK → prijave, on delete cascade |
| ime | text |
| radno_mjesto | text |

### `ponude`

Jedna ili više po prijavi (storno → nova ponuda na istu prijavu). Ponuda je snapshot:
sve što je pisalo na PDF-u sprema se u red, ništa se ne izračunava retroaktivno.

| kolona | tip | napomena |
|---|---|---|
| id | serial PK | |
| prijava_id | FK → prijave | |
| created_at | timestamptz | |
| redni_broj | int | |
| godina | int | puna godina, npr. 2026 |
| broj | text | gotov string `8-112/26`; unique |
| datum_izdavanja | date | |
| vrijedi_do | date | |
| rok_placanja | date | |
| kolicina | int | |
| cijena | numeric(10,2) | |
| ukupno | numeric(10,2) | |
| pdf_url | text | nullable dok upload ne uspije |
| status | enum | `poslana`, `stornirana`, `greska` |
| stornirana_at | timestamptz | nullable |
| email_poslan_at | timestamptz | nullable |
| greska | text | nullable, zadnja greška iz PDF/Blob/email koraka |

### `postavke`

Key/value, `kljuc text PK`, `vrijednost text`. Početne vrijednosti (seed):

- `broj_ponude_sredina` = `112`
- `dani_valjanosti` = `2`
- `potpisnik` = `Milada Sofka, voditeljica ureda`

### `brojac_ponuda`

| kolona | tip |
|---|---|
| godina | int PK |
| zadnji_broj | int |

Increment: `INSERT ... ON CONFLICT (godina) DO UPDATE SET zadnji_broj = zadnji_broj + 1 RETURNING zadnji_broj`
unutar iste transakcije koja inserta ponudu. Dvije prijave u istoj sekundi dobiju dva različita broja.

## 2. Tok prijave

```
RegistracijaForm  ── submit ──►  actions.ts: sendSeminarRegistration
                                     │
                                     ├─ validacija (postojeća)   ── greška ──► vrati errors, ništa spremljeno
                                     │
                                     ▼
                       lib/prijave/spremi.ts        tx1: INSERT prijave + polaznici
                                     │
                                     ▼   (samo ako seminar ima `ponuda` blok)
                       lib/ponude/izdaj.ts          tx2: brojač++ , INSERT ponude (status greska dok ne prođe sve)
                                     │
                                     ▼
                       lib/ponude/pdf.ts            renderToBuffer(<PonudaPdf .../>)
                                     │
                                     ▼
                       lib/ponude/blob.ts           put() → pdf_url
                                     │
                                     ▼
                       lib/ponude/email.ts          1. klijentu (PDF privitak)
                                                    2. interno na CONTACT_TO (postojeći tekst + PDF privitak)
                                     │
                                     ▼
                       UPDATE ponude: status=poslana, email_poslan_at, pdf_url
                       UPDATE prijave: status=ponuda_poslana
                                     │
                                     ▼
                       korisniku: "Prijava zaprimljena! Ponudu smo poslali na {email}."
```

Sinkrono, u jednoj server akciji. Očekivano 3-5 s; gumb već pokazuje "Slanje...".
Ako se pokaže presporo, korak od PDF-a nadalje ide u `after()` - ali ne u v1.

### Pravilo: prijava se ne gubi

| Gdje pukne | Što se dogodi |
|---|---|
| Validacija | Greške korisniku, ništa u bazi (kao danas). |
| tx1 (DB nedostupan) | Korisniku "Prijava nije uspjela...", interni mail se pokuša poslati kao danas (fallback). |
| tx2 / PDF / Blob / email klijentu | Prijava ostaje `nova`. Ponuda dobije `status=greska`, `greska=<poruka>`. Korisniku "Prijava zaprimljena" (istina). Interni mail bez PDF-a s napomenom "Ponuda nije izdana - provjeri /admin". Admin ima "Pokušaj ponovno". |
| Samo interni mail | Logira se, ne blokira; klijent je već dobio ponudu. |

Ako `izdaj.ts` pukne prije nego brojač uspije, brojač se ne pomiče (ista transakcija).
Ako pukne nakon (PDF/Blob/email), broj je potrošen i ostaje na ponudi sa statusom `greska`;
"Pokušaj ponovno" koristi isti broj - ne izdaje novi.

### Seminari bez ponude

Ako `Seminar.ponuda` ne postoji (npr. besplatna edukacija), tok stane nakon tx1 i šalje
samo postojeći interni mail. Poruka korisniku ostaje postojeća "Javit ćemo vam se...".

### Email klijentu

From: `"LOCALIS" <info@localis.hr>`, replyTo isto. Subject: `Ponuda br. {broj} - {naslov edukacije}`.
Privitak: PDF. Tekst (plain):

```
Poštovani/a {kontakt_ime},

zahvaljujemo na prijavi na edukaciju „{naslov}" ({datum}, {mjesto}).

U privitku dostavljamo ponudu br. {broj}.
Rok plaćanja: {rok_placanja}.
Prilikom plaćanja pozovite se na broj: HR00 {broj}.

Polaznici:
{1. Ime Prezime, radno mjesto}
{...}

Za sva pitanja stojimo na raspolaganju: info@localis.hr, +385 95 3135 158.

LOCALIS, obrt za savjetovanje i edukaciju
{potpisnik}
```

### Storno i ispravak (admin)

- **Storniraj**: `ponude.status=stornirana`, `stornirana_at=now()`, `prijave.status=stornirana`.
  Checkbox "Pošalji klijentu obavijest o stornu" (default uključen) → kratki mail
  "Ponuda br. X je stornirana. Nova ponuda slijedi / kontaktirajte nas."
- **Uredi prijavu**: kontakt, email, telefon, organizacija, OIB, polaznici (dodaj/ukloni/uredi).
- **Izdaj novu ponudu**: dozvoljeno samo ako nema aktivne (`poslana`) ponude na prijavi.
  Pokreće isti `izdaj → pdf → blob → email` tok s novim brojem. `prijave.status=ponuda_poslana`.
- **Pokušaj ponovno**: za ponudu u `greska` - isti broj, ponovi PDF → Blob → email.
- **Pošalji ponovno mail**: za `poslana` - samo email s postojećim PDF-om.

## 3. Promjene u `lib/edukacije.ts`

Dodati u `Seminar`:

```ts
ponuda?: {
  cijena: number;          // 199 - broj, ne string
  predavac: string;        // "Dipl.iur. Vikica Duvnjak i dipl.iur. Aleksandra Jozić-Ileković"
  mjesto: string;          // "Hotel Antunović, Zagrebačka avenija 100a"
  ukljuceno: string;       // "radni materijali, coffee break, potvrda o sudjelovanju"
  nazivStavke?: string;    // default `${kicker} – ${title}`
};
```

Postojeći `price: string` ostaje za web. Za obje postojeće edukacije dodati `ponuda` blok.
`date` (ISO) se koristi za cap datuma valjanosti, `dateLabel` za "Datum održavanja".

Komentar iznad niza `seminars` dopuniti: "Bez `ponuda` bloka prijava ne šalje ponudu."

## 4. PDF (`lib/ponude/PonudaPdf.tsx`)

Vizualno 1:1 s postojećom ponudom (referenca: `Ponuda Čabar.pdf`):

- A4, margine ~20 mm. Font Carlito regular + bold, TTF u `public/fonts/`, registriran preko `Font.register`.
- Logo `localis_logo` gore lijevo.
- Zaglavlje izdavatelja (naziv bold navy, vl., adresa, T, E, W, OIB, IBAN + banka, SWIFT).
- "Mjesto i datum: Grubišno Polje, {datum}." / "Ponuda vrijedi do: {datum}."
- Blok klijenta desno, bold: NAZIV (uppercase kako je unesen), OIB, Kontakt osoba, Tel, e-mail.
- "PONUDA BROJ: {broj}" centrirano, navy, zlatna linija ispod.
- "Predmet ponude: {kicker}" + naslov u kurzivu u navodnicima „…".
- Tablica meta: Predavač / Datum održavanja / Mjesto održavanja / Ime i prezime polaznika (bold) / Uključeno.
- Tablica stavki: Rb. | Naziv usluge | Jmj | Količina | Cijena (EUR) | Iznos (EUR); zaglavlje navy s bijelim tekstom.
  Jedan red: `1. | {nazivStavke} | kom | {kolicina},00 | {cijena} | {ukupno}`.
- Zbroj desno: Ukupno bez PDV-a / Rabat 0,00 / PDV (0 %) 0,00 / **UKUPNO ZA PLAĆANJE (EUR)**.
- Napomene: PDV čl. 90, "Rok plaćanja: {datum}.", **"Prilikom plaćanja pozovite se na broj: HR00 {broj}"**,
  "Ovaj dokument služi kao informacija o cijenama...", "Ovo nije fiskalizirani račun."
- Potpis desno: "LOCALIS, obrt za savjetovanje i edukaciju" / "{potpisnik}".

Formatiranje (`lib/ponude/format.ts`):

- Datumi: `28. rujna 2026.` (hr genitiv mjeseca, ručna tablica - ne `Intl`, zbog dosljednosti na serveru).
- Iznosi: `1.199,00` (`Intl.NumberFormat("hr-HR", {minimumFractionDigits: 2})`).
- Polaznici: 1 → `Ime, radno mjesto`; 2 → `A, rm i B, rm`; 3+ → `A, rm; B, rm i C, rm`.
- Naziv datoteke: `Ponuda {broj s / zamijenjeno -} - {organizacija}.pdf`.

## 5. Admin (`app/admin/`)

Lozinka `ADMIN_PASSWORD`. Login postavlja httpOnly cookie s HMAC potpisom (`ADMIN_SESSION_SECRET`),
trajanje 30 dana. `proxy.ts` (Next 16 naziv za middleware - provjeriti u `node_modules/next/dist/docs/`)
preusmjerava neautoriziran `/admin/*` na `/admin/login`. `/admin` nije u sitemapu, `robots` disallow.

Stranice:

- `/admin/login` - forma s lozinkom.
- `/admin/prijave` - tablica: datum, edukacija, organizacija, kontakt, br. polaznika, broj ponude,
  status, link PDF. Filter: edukacija, status. Sort po datumu desc.
- `/admin/prijave/[id]` - svi podaci prijave (editabilni), popis ponuda na prijavi s statusima,
  gumbi iz odjeljka "Storno i ispravak".
- `/admin/postavke` - tri polja iz `postavke`.

UI: shadcn komponente koje već postoje + tablica. Funkcionalno, bez dizajnerskih ambicija.
Server akcije u `app/admin/actions.ts`, svaka prvo provjerava sesiju.

## 6. Struktura datoteka

```
lib/db/schema.ts            Drizzle shema
lib/db/index.ts             klijent (neon-http)
drizzle/                    migracije
drizzle.config.ts
lib/email/transport.ts      zajednički nodemailer transport (kontakt, prijava, ponuda)
lib/prijave/spremi.ts
lib/ponude/izdavatelj.ts    konstante LOCALIS
lib/ponude/izdaj.ts         brojač + insert ponude + orkestracija pdf/blob/email
lib/ponude/datumi.ts        vrijediDo(izdavanje, dani, datumEdukacije)
lib/ponude/format.ts
lib/ponude/PonudaPdf.tsx
lib/ponude/pdf.ts           renderToBuffer wrapper
lib/ponude/blob.ts
lib/ponude/email.ts         klijent + interni mail; EMAIL_DRY_RUN
lib/admin/session.ts        cookie potpis/provjera
proxy.ts                    zaštita /admin
app/admin/...
public/fonts/Carlito-Regular.ttf, Carlito-Bold.ttf
```

Postojeći `nodemailer` transport iz `kontakt/actions.ts` i `edukacije/actions.ts` seli u
`lib/email/transport.ts`.

## 7. Env varijable

Nove, dodati u `.env.example` i Vercel:

```
DATABASE_URL=            # Neon, iz Vercel Marketplace integracije
BLOB_READ_WRITE_TOKEN=   # Vercel Blob
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=    # random 32+ znakova
EMAIL_DRY_RUN=           # 1 lokalno → mailovi se logiraju, ne šalju
```

## 8. Testiranje

Test runner: Vitest (dodati, projekt ga nema).

- Unit `datumi.ts`: +2 dana; cap na datum edukacije; edukacija već prošla → cap na danas.
- Unit `format.ts`: datum hr; iznos `1.199,00`; join polaznika 1/2/3; naziv datoteke.
- Unit sastavljanje broja: `(8, "112", 2026)` → `8-112/26`.
- Integracija brojač (Neon test branch ili lokalni Postgres): 10 paralelnih poziva → 10 različitih brojeva, `zadnji_broj=10`.
- PDF: renderiraj podatke iz Čabar ponude, izvuci tekst (`pdf-parse`), provjeri da sadrži broj, klijenta,
  oba polaznika, `398,00`, `HR00`.
- Email: `EMAIL_DRY_RUN=1`, provjeri subject, privitak, tekst.
- Ručni E2E: `npm run dev`, prijava s vlastitim mailom, otvori PDF, usporedi s referencom.

## Izvan opsega (v1)

- Praćenje uplata / računi.
- Login po korisniku, audit tko je što storno-irao.
- Asinkrono generiranje u pozadini.
- Uređivanje izgleda ponude bez koda.
