# Excel export prijava za računovodstvo

Datum: 2026-09-20

## Cilj

Na `/admin/prijave`, uz filter po edukaciji, gumb koji skida `.xlsx` u formatu koji
računovodstvo već prima ručno ("E-RAČUN Popis polaznika radionice 14.9.xlsx").
Jedan klik umjesto ručnog prepisivanja.

## Format datoteke (1:1 s postojećim ručnim Excelom)

Jedan sheet, naziv `POPIS ZA RAČUNE <d.M>` (npr. `POPIS ZA RAČUNE 28.9`).

| Stupac | Zaglavlje (bold)          | Vrijednost                                            | Format            |
|--------|---------------------------|-------------------------------------------------------|-------------------|
| A      | NAZIV PARTNERA            | `prijava.organizacija` (bez transformacije)           | tekst, širina 32  |
| B      | IZNOS                     | `zadnjaPonuda.ukupno` (snapshot iz ponude)            | `#,##0.00 "€"`, širina 19 |
| C      | OIB                       | `prijava.oib`                                         | tekst `@`, širina 19 |
| D      | ADRESA                    | `prijava.adresa`                                      | širina 39         |
| E      | MAIL                      | `prijava.email`                                       | širina 29         |
| F      | TELEFON                   | `prijava.telefon`                                     | tekst `@`, širina 20 |
| G      | IME I PREZIME POLAZNIKA   | imena polaznika spojena: "A", "A i B", "A, B i C"     | širina 37         |

Nakon zadnjeg reda podataka:

- red `UKUPNO` u A, formula `=SUM(B2:B<n>)` u B s istim number formatom
- prazan red
- red `Naziv usluge:` u A; B:E merged s tekstom:
  `Sudjelovanje na radionici „<title>“ (<ponuda.predavac>), <dateLabel>, <ponuda.mjesto>`

Ime datoteke: `E-RAČUN Popis polaznika radionice <d.M>.xlsx`, gdje je `<d.M>` iz
`seminar.date` (ISO) bez vodećih nula.

## Koji redovi ulaze

- `seminarSlug` = odabrana edukacija (obavezno)
- `prijava.status = 'ponuda_poslana'` (stornirane i nove bez ponude se preskaču)
- `zadnjaPonuda` = zadnja ne-stornirana ponuda; iznos se čita iz nje
- redoslijed: `createdAt` ASC (redoslijed prijavljivanja)

## Arhitektura

- `lib/prijave/export-excel.ts`
  - `redoviZaExport(prijave: PrijavaRed[]): ExportRed[]` — čista funkcija, filtrira status,
    mapira stupce, spaja polaznike
  - `nazivUsluge(seminar)`, `nazivDatoteke(seminar)`, `nazivSheeta(seminar)` — čiste funkcije
  - `generirajExcel(seminar, redovi): Promise<Buffer>` — exceljs workbook prema tablici gore
- `app/admin/prijave/export/route.ts` — `GET ?edukacija=<slug>`
  - `zahtijevajAdmina()`
  - 404 ako slug nepoznat; 400 ako edukacija nema `ponuda` blok
  - `ucitajPrijave({ seminarSlug, status: 'ponuda_poslana' })` → redovi → Buffer
  - `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
    `Content-Disposition: attachment; filename*=UTF-8''<encoded>`
- `app/admin/prijave/page.tsx` — gumb "Export za računovodstvo" pored "Filtriraj":
  `<a href="/admin/prijave/export?edukacija=<slug>">` kad je edukacija odabrana,
  inače siv `<span title="Odaberi edukaciju">` bez linka

Nova ovisnost: `exceljs`.

## Rubni slučajevi

- Nema prijava s poslanom ponudom → datoteka s zaglavljem, `UKUPNO` = `=SUM(B2:B1)` se
  ne generira; umjesto toga `UKUPNO` = 0 bez formule. Naziv usluge i dalje ispisan.
- Polaznik bez imena ne postoji (forma zahtijeva ime).
- OIB i telefon uvijek kao tekst da Excel ne odbaci vodeću nulu.

## Testiranje (vitest)

- `redoviZaExport`: preskače `nova`/`stornirana`, spaja 1/2/3 polaznika, iznos iz ponude,
  sortiranje po `createdAt`
- `nazivUsluge`, `nazivDatoteke`, `nazivSheeta` — fiksni ulaz → očekivani string
- `generirajExcel`: buffer se učita natrag exceljs-om; provjera zaglavlja, prvog reda,
  formule `=SUM`, merged raspona, number formata na B2
