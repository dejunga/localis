# Mail nakon edukacije: materijali, upitnik i nadolazeće edukacije

Datum: 2026-10-30. Nadograđuje §4 (slanje maila) iz `2026-10-29-upitnici-design.md`.

## Cilj

Jedan uredan mail kontakt osobama nakon edukacije koji sadrži zahvalu, poveznicu na
materijale (prezentacija i ostalo), upitnik (gumb + QR) i popis nadolazećih edukacija.
Ništa u mailu nije upisano u kod za pojedinu edukaciju: naziv, datum, predavači, materijali,
upitnik i nadolazeće edukacije dolaze iz podataka, a tekst iz predloška u adminu.

Marija nekoliko dana nakon edukacije u adminu (Upitnici → edukacija) uploada materijale,
pogleda pregled maila, pošalje probni mail sebi i zada termin slanja.

Zamjenjuje dosadašnji mail iz `lib/upitnici/slanje.ts` (samo poveznica na upitnik, kreće sam
nakon edukacije). Slanje je od 30. 10. pauzirano (`UPITNICI_SLANJE`) dok ovo ne bude gotovo.

## Ne-ciljevi

- Tekst po edukaciji (osobna poruka) - jedan opći predložak za sve.
- Materijali kao privitak u mailu.
- Praćenje tko je otvorio mail ili preuzeo materijale.
- Mail svakom polazniku - i dalje samo kontakt osoba prijave (polaznici nemaju email).

## Anti-ciljevi

- Mail koji ode bez Marijine odluke (bez zadanog termina ne ide ništa).
- Mail koji kontakt osoba dobije dvaput.
- Materijali dostupni svakome tko pogodi URL.
- Ručno pisanje popisa nadolazećih edukacija.

## Odluke

| Pitanje | Odluka |
|---|---|
| Okidač slanja | Marija zada **datum slanja** po edukaciji; cron šalje taj dan. Uz to gumb "Pošalji sada". Bez termina ništa ne ide |
| Vrijeme cron-a | Vercel Hobby = jednom dnevno. Pomiče se s 17:00 UTC na **07:00 UTC** (8 h zimi / 9 h ljeti) - mail stiže ujutro u radno vrijeme |
| Materijali | Upload u adminu (Vercel Blob, privatno). U mailu gumb "Preuzmi materijale" na stranicu s tajnim linkom |
| Tekst | Opći predložak u Admin → Tekstovi (nova grupa "Mail nakon edukacije") s poljima `{naziv}`, `{datum}`, `{predavaci}`, `{rok}` |
| QR u mailu | Inline PNG (CID privitak), isti link kao gumb; generira se pri slanju iz `upitnikUrl` |
| Nadolazeće edukacije | Iz `getSeminars()`: vidljive, nisu odgođene, počinju nakon trenutka slanja, najviše 5, sortirano uzlazno |
| Rok upitnika | Ako je zadan termin slanja: **termin + 96 h** (ali ne ranije od kraj + 96 h). Inače kraj + 96 h. `upitnikRokDo` i dalje ima prednost |
| Kad nema materijala | Odlomak i gumb za materijale se ne prikazuju |
| Kad nema nadolazećih | Odjeljak "Što slijedi" se ne prikazuje |

## 1. Podaci

Nova tablica `upitnici_materijali`:

| Stupac | Tip | Napomena |
|---|---|---|
| id | serial PK | |
| seminar_slug | text not null | index |
| naziv | text not null | izvorno ime datoteke, prikazuje se polaznicima |
| blob_url | text not null | privatni Blob URL |
| velicina | integer not null | bajtovi |
| content_type | text | |
| created_at | timestamptz default now() | |

Nova tablica `upitnici_slanja` (jedan red po edukaciji):

| Stupac | Tip | Napomena |
|---|---|---|
| seminar_slug | text PK | |
| datum_slanja | date | dan kad cron šalje; null = nije zadano |
| updated_at | timestamptz | |

Postojeća `upitnici_mailovi` ostaje i dalje čuva jedan mail po prijavi (unique), pa
"Pošalji sada" i cron ne mogu poslati isti mail dvaput.

## 2. Admin: Upitnici → edukacija

Nova sekcija "Mail nakon edukacije" iznad odgovora:

1. **Materijali** - popis (naziv, veličina, obriši) i upload jedne ili više datoteka.
   Upload ide iz preglednika ravno u Blob (`@vercel/blob/client` `upload` + `handleUpload`
   ruta koja provjerava admina), jer server action ne prima više od 4,5 MB. Limit 100 MB
   po datoteci. Dopušteni tipovi: PDF, PPT(X), DOC(X), XLS(X), ZIP, slike.
2. **Pregled maila** - iframe s HTML-om točno onakvim kakav će otići (isti renderer).
3. **Probni mail** - šalje isti mail na `CONTACT_TO`; ne upisuje se u `upitnici_mailovi`.
4. **Datum slanja** - date input + Spremi. Ispod: "Mail odlazi {datum} oko 8/9 h" ili
   "Termin nije zadan - mail neće otići".
5. **Pošalji sada** - potvrda ("Poslati mail na N adresa?"), zatim isti kod kao cron za
   tu edukaciju. Nakon slanja prikazuje rezultat (poslano / greške).

Lista Upitnici dobiva stupac "Slanje" (datum ili "nije zadano").

## 3. Predložak teksta

Nova grupa u `lib/tekstovi.ts` (`mailNakon.*`), vrste `redak` / `tekst` / `odlomci`:

| Ključ | Zadano |
|---|---|
| `mailNakon.naslov` | `Hvala što ste bili s nama: {naziv}` |
| `mailNakon.uvod` | `Poštovani,` ⏎⏎ `hvala Vam što ste {datum} bili s nama na edukaciji „{naziv}”. Vaša pitanja i primjeri iz prakse učinili su je živom i korisnom.` |
| `mailNakon.materijali` | `Kako smo i obećali, pripremili smo materijale s edukacije. Materijali su autorsko djelo predavača ({predavaci}) i namijenjeni su Vašem osobnom radu - molimo da ih ne umnožavate i ne prosljeđujete bez dopuštenja.` |
| `mailNakon.materijali.gumb` | `Preuzmi materijale` |
| `mailNakon.upitnik` | `Vaše mišljenje nam je važno. Zanima nas što Vam je bilo najkorisnije i koje bi Vas teme zanimale ubuduće. Upitnik je anoniman i traje oko dvije minute.` |
| `mailNakon.upitnik.gumb` | `Ispunite upitnik` |
| `mailNakon.upitnik.rok` | `Upitnik je otvoren do {rok}. Ako je s Vaše ustanove bilo više polaznika, molimo proslijedite im ovaj mail - svaki polaznik može ispuniti svoj upitnik.` |
| `mailNakon.nadolazece.naslov` | `Što slijedi` |
| `mailNakon.zakljucak` | `Veselimo se ponovnom susretu!` |
| `mailNakon.odjava` | `Ako ne želite primati ovakve poruke, javite nam odgovorom na ovaj e-mail.` |

Potpis (naziv, email, telefon, web) dolazi iz postojećih `firma.naziv`, `kontakt.email`,
`kontakt.telefon`. Polja u vitičastim zagradama zamjenjuju se pri slanju; nepoznato polje
ostaje kako je napisano. Admin Tekstovi uz grupu prikazuje popis dostupnih polja.

`{predavaci}` = imena iz `seminar.lecturers`, spojena s ", " i " i ".
`{datum}` = `seminar.dateLabel`. `{rok}` = `formatRoka(rokUpitnika(...))`.

## 4. Izgled maila

HTML tablični layout (radi u Outlooku), širina 600 px, bijela pozadina, navy zaglavlje s
logom (apsolutni URL na localis.hr), zlatni akcenti kao na stranici.

Redom: zaglavlje → uvod → [materijali + gumb] → upitnik + gumb + QR (160 px, ispod
gumba, uz tekst "ili skenirajte mobitelom") + rok → [Što slijedi: datum, grad - naslov
(poveznica na `/edukacije/<slug>`), predavač] → "Programi i prijave: www.localis.hr" →
zaključak → potpis → sitni tekst odjave.

Uvijek se šalje i `text` verzija s istim sadržajem (poveznice kao goli URL-ovi).

Renderer je čista funkcija `renderMailNakon({ seminar, tekstovi, materijaliUrl, rok,
nadolazece })` → `{ subject, html, text, qrPng }` - koriste je pregled, probni mail,
"Pošalji sada" i cron.

## 5. Javna stranica materijala `/materijali/[slug]?k=<kljuc>`

- `kljuc` = HMAC-SHA256(`materijali:` + slug, `ADMIN_SESSION_SECRET`), base64url,
  prvih 22 znaka. Ne sprema se; provjera konstantnim vremenom (`jednakoKonstantno`).
  Kriv ili bez ključa → 404.
- Prikaz: naziv i datum edukacije, popis datoteka s gumbom "Preuzmi", napomena o
  autorskom djelu. `noindex`, nije u sitemapu.
- Preuzimanje: `/materijali/[slug]/[id]?k=` provjeri ključ i da materijal pripada slugu,
  zatim redirect na kratkotrajni presigned GET URL iz Bloba (`presignUrl`, 10 min,
  `Content-Disposition: attachment` s izvornim nazivom). Funkcija ne prenosi bajtove pa
  nema limita veličine.
- Link ne istječe; Marija ga "gasi" brisanjem materijala.

## 6. Slanje

`edukacijeZaSlanje(seminari, slanja, now)`: edukacija ima `datum_slanja <= danas` (Zagreb),
nije odgođena, završila je i upitnik nije zatvoren. Ostatak `posaljiUpitnike` (odabir
primatelja, "uzimanje" reda prije slanja, ponovno slanje samo kod SMTP greške, granica
vremena) ostaje. Mail se renderira jednom po edukaciji; QR ide kao CID privitak.

"Pošalji sada" = `posaljiZaEdukaciju(slug)` - isti kod bez provjere datuma; server action
s `maxDuration` 300.

Kad je ovo deployano: `UPITNICI_SLANJE` provjera se briše iz cron rute (zamjenjuje je
"bez termina ništa ne ide"), `upitnikRokDo` za Izvlaštenje se briše (rok slijedi termin).

## 7. Testovi

- `renderMailNakon`: zamjena polja, bez materijala nema gumba, bez nadolazećih nema
  odjeljka, HTML escape naziva, text verzija sadrži sve poveznice.
- `nadolazeceEdukacije`: filtrira prošle/odgođene/skrivene, sortira, limit 5.
- `rokUpitnika` s terminom slanja.
- `edukacijeZaSlanje` s datumom slanja (prije, na dan, bez termina).
- Ključ materijala: isti slug → isti ključ, drugi slug → drugi, kriv ključ odbijen.
