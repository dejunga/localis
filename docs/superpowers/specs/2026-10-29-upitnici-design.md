# Završni upitnik za polaznike edukacija

Datum: 2026-10-29

## Cilj

Nakon svake edukacije prikupiti kratku povratnu informaciju polaznika: ocjene, što je bilo
dobro, što treba popraviti, recenziju i eventualnu potrebu za stručnom pomoći. Sve bez
ručnog rada: termini dolaze iz `lib/edukacije.ts`, mail kontakt osobama ide sam, a Marija
odgovore gleda u adminu.

Polazište je Zoranov Google Forms upitnik, ali je namjerno skraćen i generičan (vrijedi za
sve teme, ne samo za digitalizaciju). Zamjenjuje Google Forms za edukacije LOCALIS-a.

## Ne-ciljevi

- Objavljivanje recenzija na stranici - zasad se samo skupljaju.
- Pitanja po temi ili po edukaciji - zasad jedan generički upitnik za sve.
- Uređivanje pitanja iz admina - pitanja su u kodu.
- Osobni QR kodovi / praćenje tko je ispunio - upitnik je anoniman.
- Mail svakom polazniku - polaznici u bazi nemaju email.

## Anti-ciljevi (što bi bio promašaj)

- Upitnik koji traje dulje od ~1-2 minute ili traži puno obaveznih polja.
- Ručno dodavanje termina ili ručno slanje mailova.
- Mail koji kontakt osoba dobije dvaput.

## Odluke

| Pitanje | Odluka |
|---|---|
| Kako polaznik dolazi do upitnika | QR kod na zadnjem slajdu i na poleđini kartice s imenom; mail kontakt osobi |
| QR kod | Jedan po edukaciji, isti za sve. Link `https://localis.hr/upitnik/<slug>`. Ne sprema se u bazu - generira se na zahtjev u adminu |
| Anonimnost | Odgovori su anonimni; kontakt samo ako ga polaznik sam upiše |
| Kome ide mail | Samo kontakt osobi (`prijave.email`) svake ne-stornirane prijave na tu edukaciju; ona ga prosljeđuje kolegama |
| Jedan link, više odgovora | Da - link nije jednokratan |
| Kad ide mail | Vercel Hobby cron jednom dnevno (vidi §4) |
| Otvaranje | Na **početku** edukacije (početak iz `seminar.time`, isti izračun kao `isSeminarPast`) - polaznici skeniraju QR već tijekom diskusije ili s kartice |
| Rok | 96 sati od **kraja** edukacije, isti za QR i mail. Kasniji mail ne produžuje rok. Iznimka: opcionalno polje `upitnikRokDo` na edukaciji (vidi §7) |
| Kraj edukacije | Iz `seminar.time` (npr. `"9.00 - 15.00"` -> 15:00), po zagrebačkom vremenu |
| Gdje Marija vidi odgovore | Novi tab "Upitnici" u adminu |
| Vercel plan | Hobby |

## 1. Pitanja

Redom kako se prikazuju. Sve skale 1-5.

| # | Pitanje | Tip | Obavezno |
|---|---|---|---|
| 1 | Kako biste ukupno ocijenili edukaciju? | skala 1-5 | da |
| 2 | Kako biste ocijenili predavača? - jedna skala po predavaču, s imenom iz `seminar.lecturers` | skala 1-5 | da |
| 3 | Koliko vam je edukacija korisna za vaš posao? | skala 1-5 | da |
| 4 | Biste li edukaciju preporučili kolegi? | Da / Možda / Ne | ne |
| 5 | Što vam se svidjelo? | tekst | ne |
| 6 | Što bismo trebali popraviti ili promijeniti? | tekst | ne |
| 7 | Vaša recenzija edukacije | tekst | ne |
| 8 | Trebate li stručnu pomoć oko nekog konkretnog problema? Opišite ukratko. | tekst | ne |
| 9 | Kontakt (ako želite da vam se javimo): ime i prezime, ustanova, email | tekst | ne |

- Ako se upiše email u #9, obavezna je kvačica privole za kontakt (tekst i verzija po
  uzoru na `lib/prijave/privola.ts`, npr. `UPITNIK_PRIVOLA_TEKST` / `UPITNIK_PRIVOLA_VERZIJA`).
- Pitanje #8 čuva Zoranov cilj (prikupljanje potreba za stručnom podrškom) bez
  produljenja upitnika. *(Claudeova odluka - korisnik nije odbio.)*
- Na vrhu stranice: naslov, datum i lokacija edukacije. Pitanje "koju ste radionicu
  pohađali" ne postoji - edukacija je određena linkom.
- Tekstualna polja imaju gornju granicu duljine (u stilu `MAX_DULJINA` u `lib/prijave/limiti.ts`).

## 2. Javna stranica `/upitnik/[slug]`

- Edukacija se dohvaća s `getSeminar(slug)` - skrivene edukacije nemaju upitnik (404).
  Odgođene (`odgodeno`) također nemaju upitnik.
- Stanja:
  - **prije početka edukacije** - "Upitnik se otvara na dan edukacije."
  - **otvoren** - forma
  - **nakon roka (kraj + 96 h)** - "Upitnik je zatvoren."
  - **poslano** - zahvala
- `noindex`, ne ide u `sitemap.ts`.
- Mobilni prikaz je primaran (polaznici skeniraju QR mobitelom).
- Zaštita kao kod prijave (`app/(site)/edukacije/actions.ts`): honeypot polje `website`,
  `checkBotId()`, `dopustiPokusaj` s ključem po hashiranom IP-u **i slugu**:
  `upitnik-ip:<slug>:<ip>` max 60 / sat. Cijela dvorana dijeli jedan IP na hotelskom Wi-Fi-ju,
  pa glavna zaštita od spama ostaje BotID + honeypot. *(Claudeova odluka.)*
  Server action ponovno provjerava je li upitnik otvoren.
- Jedna osoba može tehnički poslati više odgovora - prihvaćeno (anonimno, rate-limit dovoljan).

## 3. Baza

Nova migracija u `drizzle/` (`npm run db:generate`), shema u `lib/db/schema.ts`.

### `upitnici_odgovori`

| kolona | tip | napomena |
|---|---|---|
| id | serial PK | |
| created_at | timestamptz | |
| seminar_slug | text | veza na `edukacije.ts` |
| seminar_title | text | snapshot, kao u `prijave` |
| ocjena_ukupno | integer | 1-5 |
| ocjena_korisnost | integer | 1-5 |
| ocjene_predavaca | jsonb | `[{ ime, ocjena }]` - snapshot imena predavača |
| preporuka | enum `da`/`mozda`/`ne`, nullable | |
| svidjelo | text, nullable | |
| popraviti | text, nullable | |
| recenzija | text, nullable | |
| strucna_pomoc | text, nullable | |
| kontakt_ime, kontakt_ustanova, kontakt_email | text, nullable | |
| privola_kontakt_at, privola_kontakt_verzija | timestamptz / text, nullable | |

Indeks na `seminar_slug`.

### `upitnici_mailovi`

Jedan red = mail s upitnikom za kontakt osobu jedne prijave.

| kolona | tip | napomena |
|---|---|---|
| id | serial PK | |
| prijava_id | integer FK -> `prijave.id`, **unique** | štiti od dvostrukog slanja |
| seminar_slug | text | |
| email | text | snapshot adrese na koju je poslano |
| poslan_at | timestamptz, nullable | NULL dok slanje ne uspije |
| greska | text, nullable | zadnja greška slanja |

## 4. Slanje maila (cron)

- Route handler `app/api/cron/upitnici/route.ts`, `GET`.
- Zaštita: Vercel šalje `Authorization: Bearer ${CRON_SECRET}`; bez ispravnog headera 401.
  `CRON_SECRET` je nova env varijabla (dodati u `.env.example` i Vercel).
- `vercel.json` (novi):
  ```json
  { "crons": [{ "path": "/api/cron/upitnici", "schedule": "0 17 * * *" }] }
  ```
  17:00 UTC = 18 h zimi / 19 h ljeti. Hobby ne garantira minutu, samo unutar tog sata.
  *(Claudeova odluka: 15:00 UTC iz razgovora pomaknuto na 17:00 UTC jer neke edukacije
  završavaju u 17.00, npr. Rijeka 11.00 - 17.00.)*
- Logika pri svakom pokretanju:
  1. Edukacije s istim filterom kao §2 (vidljive, ne odgođene) kojima je **kraj prošao, a rok
     nije** (rok = kraj + 96 h ili `upitnikRokDo`). Time se pokupe i edukacije koje je propušteni cron preskočio.
  2. Za svaku: prijave sa `status <> 'stornirana'` i bez uspješnog reda u `upitnici_mailovi`.
  3. Za svaku prijavu: upiši/zaključaj red, pošalji mail, postavi `poslan_at` ili `greska`.
     Ponovno se šalje samo red s upisanom `greska` (SMTP odbio). Red bez `poslan_at` i bez
     `greska` (npr. SMTP prihvatio, a upis u bazu pao) smatra se poslanim - radije nijedan
     mail nego dva. *(Claudeova odluka: at-most-once.)*
  4. Vraća JSON sažetak (broj poslanih / grešaka) - vidljivo u Vercel logovima.
- Više prijava s istom email adresom na istu edukaciju dobije jedan mail. *(Claudeova odluka.)*
- Mail (`lib/email/transport.ts` -> `sendMail`, s `info@localis.hr`):
  - Predmet npr. "Kako vam je bilo na edukaciji: <naslov>?"
  - Tijelo: zahvala, link `/upitnik/<slug>`, rok (datum i sat), molba da proslijedi
    kolegama koji su bili na edukaciji. Plain text + jednostavan HTML.
  - `EMAIL_DRY_RUN=1` radi kao i drugdje.

## 5. Admin - tab "Upitnici"

- Link "Upitnici" u `app/admin/layout.tsx`, između "Prijave" i "Tekstovi".
- `/admin/upitnici` - lista vidljivih edukacija, najnovija prva: naslov, datum, stanje
  upitnika (uskoro / otvoren do ... / zatvoren), broj odgovora, prosjek ukupne ocjene,
  broj poslanih mailova.
- `/admin/upitnici/[slug]`:
  - prosjeci (ukupno, korisnost, svaki predavač) i raspodjela preporuke
  - svi odgovori, najnoviji prvi, s tekstovima
  - gumb **Preuzmi QR (PNG)** - generira QR za `https://localis.hr/upitnik/<slug>`
    (nova ovisnost, npr. `qrcode`); dovoljno velik za ispis
  - popis mailova: prijava (organizacija, kontakt), adresa, poslano / greška
  - **Excel export** odgovora (`exceljs`, po uzoru na `app/admin/prijave/export/route.ts`)
- QR je dostupan i prije edukacije (da se stavi na slajd i kartice) - stranica do početka
  edukacije samo kaže da se upitnik još nije otvorio.
- Svaka admin stranica/route koristi postojeću zaštitu (`zahtijevajAdmina()`).

## 6. Ostalo

- **Politika privatnosti** (`app/(site)/politika-privatnosti`): dodati odjeljak o upitniku.
  Tekst piše Claude, korisnik ga pregledava prije objave. Sadržaj:
  - odgovori su anonimni i čuvaju se trajno (služe za poboljšanje edukacija)
  - kontakt podaci (ime, ustanova, email) su opcionalni, koriste se samo da bi se LOCALIS
    javio u vezi s odgovorom, čuvaju se 2 godine ili do povlačenja privole
  - mail s upitnikom kontakt osobi prijave šalje se na temelju legitimnog interesa
    (povratna informacija o pruženoj usluzi)
- Brisanje kontakt podataka nakon 2 godine je zasad ručno - bez automatike. *(Odluka korisnika.)*
- Testovi (vitest) za: izračun kraja edukacije i roka iz `time` (uključujući neparsabilan
  `time` - tada kraj = 23:59 na dan edukacije), odabir prijava za slanje, validaciju forme.

## 7. Prvo pokretanje i `upitnikRokDo`

- Novo opcionalno polje na `Seminar` u `lib/edukacije.ts`: `upitnikRokDo?: string`
  (ISO, npr. `"2026-11-03T18:00:00+01:00"`). Ako je zadano, zamjenjuje "kraj + 96 h" i za
  stranicu i za cron.
- Edukacija `izvlastenje-prakticna-primjena-u-jls` (28.10.) nije dobila Google Form i
  **treba dobiti upitnik**. Korisnik želi da za nju rok bude 96 h od slanja maila.
  Pri deployu se njoj postavi `upitnikRokDo` = očekivano vrijeme prvog crona nakon deploya
  (17:00 UTC tog dana) + 96 h. *(Claudeova odluka: ručno postavljen datum umjesto
  računanja iz `poslan_at`, jer je jednokratno i jednostavnije.)*
- Ostale prošle edukacije ne dobivaju mail (rok im je već istekao).

## Ostavljeno builderu

- Izgled forme i admin stranica - u stilu postojećeg weba / admina.
- Točni tekstovi maila i poruka (hrvatski, u tonu postojećih mailova).
- Raspodjela koda u `lib/upitnici/*`.
