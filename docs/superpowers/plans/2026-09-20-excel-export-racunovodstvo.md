# Excel export za računovodstvo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gumb na `/admin/prijave` koji za odabranu edukaciju skida `.xlsx` u formatu koji računovodstvo već prima ("E-RAČUN Popis polaznika radionice 14.9.xlsx").

**Architecture:** Čiste funkcije u `lib/prijave/export-excel.ts` pretvaraju `PrijavaRed[]` + `Seminar` u redove i exceljs Buffer. Route handler `GET /admin/prijave/export?edukacija=<slug>` radi auth, učitava prijave sa statusom `ponuda_poslana` i vraća attachment. Stranica dobiva `<a>` gumb koji je onemogućen bez odabrane edukacije.

**Tech Stack:** Next.js App Router route handler, drizzle (`ucitajPrijave`), `exceljs`, vitest.

Spec: `docs/superpowers/specs/2026-09-20-excel-export-racunovodstvo-design.md`

---

## File Structure

- Create `lib/prijave/export-excel.ts` — čiste funkcije: `spojiImena`, `redoviZaExport`, `nazivUsluge`, `nazivDatoteke`, `nazivSheeta`, `generirajExcel`
- Create `lib/prijave/export-excel.test.ts` — vitest
- Modify `lib/prijave/ucitaj.ts` — `PrijavaRed` izlaže `polaznici`
- Create `app/admin/prijave/export/route.ts` — GET handler
- Modify `app/admin/prijave/page.tsx` — gumb

---

### Task 1: Ovisnost exceljs

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1:** `npm install exceljs`
- [ ] **Step 2:** `git add package.json package-lock.json && git commit -m "Add exceljs for accounting export"`

### Task 2: Čiste funkcije za redove i nazive

**Files:**
- Create: `lib/prijave/export-excel.ts`
- Modify: `lib/prijave/ucitaj.ts` (tip `PrijavaRed`)
- Test: `lib/prijave/export-excel.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, expect, it } from "vitest";
import type { Seminar } from "@/lib/edukacije";
import type { PrijavaRed } from "./ucitaj";
import { nazivDatoteke, nazivSheeta, nazivUsluge, redoviZaExport, spojiImena } from "./export-excel";

const seminar = {
  slug: "opci-akt",
  title: "Kako izraditi opći akt u JLP(R)S",
  date: "2026-09-28",
  dateLabel: "28. rujna 2026.",
  ponuda: { cijena: 199, predavac: "Vikica Duvnjak dipl.iur.", mjesto: "Hotel Antunović, Zagrebačka avenija 100a", ukljuceno: "" },
} as unknown as Seminar & { ponuda: NonNullable<Seminar["ponuda"]> };

function prijava(over: Partial<PrijavaRed> & { id: number }): PrijavaRed {
  return {
    createdAt: new Date("2026-09-01T10:00:00Z"),
    seminarSlug: "opci-akt",
    seminarTitle: seminar.title,
    kontaktIme: "Ivana Bagarić",
    email: "procelnik@viljevo.hr",
    telefon: "095 851 29 89",
    organizacija: "Općina Viljevo",
    adresa: "Braće Radića 87, 31531 Viljevo",
    oib: "09532532757",
    napomena: null,
    status: "ponuda_poslana",
    brojPolaznika: 1,
    zadnjaPonuda: { ukupno: "199.00", status: "poslana" } as PrijavaRed["zadnjaPonuda"],
    polaznici: [{ id: 1, prijavaId: over.id, ime: "Ivana Bagarić", radnoMjesto: "pročelnica" }],
    ...over,
  } as PrijavaRed;
}

describe("spojiImena", () => {
  it("1, 2 i 3+ imena", () => {
    expect(spojiImena(["A"])).toBe("A");
    expect(spojiImena(["A", "B"])).toBe("A i B");
    expect(spojiImena(["A", "B", "C"])).toBe("A, B i C");
  });
});

describe("redoviZaExport", () => {
  it("preskače prijave bez poslane ponude i sortira po datumu prijave", () => {
    const r = redoviZaExport([
      prijava({ id: 3, createdAt: new Date("2026-09-03T00:00:00Z"), organizacija: "C" }),
      prijava({ id: 1, createdAt: new Date("2026-09-01T00:00:00Z"), organizacija: "A" }),
      prijava({ id: 2, status: "stornirana", organizacija: "S" }),
      prijava({ id: 4, status: "nova", zadnjaPonuda: null, organizacija: "N" }),
    ]);
    expect(r.map((x) => x.nazivPartnera)).toEqual(["A", "C"]);
  });

  it("mapira stupce i spaja polaznike", () => {
    const [r] = redoviZaExport([
      prijava({
        id: 1,
        brojPolaznika: 2,
        zadnjaPonuda: { ukupno: "398.00", status: "poslana" } as PrijavaRed["zadnjaPonuda"],
        polaznici: [
          { id: 1, prijavaId: 1, ime: "Silvija Profeta", radnoMjesto: "x" },
          { id: 2, prijavaId: 1, ime: "Snježana Mezdić", radnoMjesto: "y" },
        ],
      }),
    ]);
    expect(r).toEqual({
      nazivPartnera: "Općina Viljevo",
      iznos: 398,
      oib: "09532532757",
      adresa: "Braće Radića 87, 31531 Viljevo",
      mail: "procelnik@viljevo.hr",
      telefon: "095 851 29 89",
      polaznici: "Silvija Profeta i Snježana Mezdić",
    });
  });
});

describe("nazivi", () => {
  it("naziv usluge, datoteke i sheeta", () => {
    expect(nazivUsluge(seminar)).toBe(
      "Sudjelovanje na radionici „Kako izraditi opći akt u JLP(R)S“ (Vikica Duvnjak dipl.iur.), 28. rujna 2026., Hotel Antunović, Zagrebačka avenija 100a",
    );
    expect(nazivDatoteke(seminar)).toBe("E-RAČUN Popis polaznika radionice 28.9.xlsx");
    expect(nazivSheeta(seminar)).toBe("POPIS ZA RAČUNE 28.9");
  });
});
```

- [ ] **Step 2:** `npx vitest run lib/prijave/export-excel` → FAIL (modul ne postoji)
- [ ] **Step 3: Implementacija**

`lib/prijave/ucitaj.ts` — proširi tip (podaci se već učitavaju kroz `with: { polaznici: true }`):

```ts
export type PrijavaRed = Prijava & { polaznici: Polaznik[]; brojPolaznika: number; zadnjaPonuda: Ponuda | null };
```

`lib/prijave/export-excel.ts`:

```ts
import type { Seminar } from "@/lib/edukacije";
import type { PrijavaRed } from "./ucitaj";

export type SeminarZaExport = Seminar & { ponuda: NonNullable<Seminar["ponuda"]> };

export type ExportRed = {
  nazivPartnera: string;
  iznos: number;
  oib: string;
  adresa: string;
  mail: string;
  telefon: string;
  polaznici: string;
};

export function spojiImena(imena: string[]): string {
  if (imena.length <= 1) return imena[0] ?? "";
  return `${imena.slice(0, -1).join(", ")} i ${imena[imena.length - 1]}`;
}

// Samo prijave s poslanom ponudom - to je ono što računovodstvo fakturira.
export function redoviZaExport(prijave: PrijavaRed[]): ExportRed[] {
  return prijave
    .filter((p) => p.status === "ponuda_poslana" && p.zadnjaPonuda)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((p) => ({
      nazivPartnera: p.organizacija,
      iznos: Number(p.zadnjaPonuda!.ukupno),
      oib: p.oib,
      adresa: p.adresa,
      mail: p.email,
      telefon: p.telefon,
      polaznici: spojiImena(p.polaznici.map((x) => x.ime)),
    }));
}

function danMjesec(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}`;
}

export function nazivUsluge(s: SeminarZaExport): string {
  return `Sudjelovanje na radionici „${s.title}“ (${s.ponuda.predavac}), ${s.dateLabel}, ${s.ponuda.mjesto}`;
}

export function nazivDatoteke(s: SeminarZaExport): string {
  return `E-RAČUN Popis polaznika radionice ${danMjesec(s.date)}.xlsx`;
}

export function nazivSheeta(s: SeminarZaExport): string {
  return `POPIS ZA RAČUNE ${danMjesec(s.date)}`;
}
```

- [ ] **Step 4:** `npx vitest run lib/prijave/export-excel` → PASS
- [ ] **Step 5:** `git add lib/prijave/export-excel.ts lib/prijave/export-excel.test.ts lib/prijave/ucitaj.ts && git commit -m "Add pure row/name builders for accounting Excel export"`

### Task 3: generirajExcel

**Files:** `lib/prijave/export-excel.ts`, `lib/prijave/export-excel.test.ts`

- [ ] **Step 1: Test** (dodati u isti test file)

```ts
import ExcelJS from "exceljs";
import { generirajExcel } from "./export-excel";

describe("generirajExcel", () => {
  it("piše zaglavlje, redove, SUM formulu i naziv usluge", async () => {
    const buf = await generirajExcel(seminar, [
      { nazivPartnera: "A", iznos: 199, oib: "09532532757", adresa: "a", mail: "a@a", telefon: "0911", polaznici: "X" },
      { nazivPartnera: "B", iznos: 398, oib: "22824951663", adresa: "b", mail: "b@b", telefon: "0922", polaznici: "Y i Z" },
    ]);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const ws = wb.getWorksheet("POPIS ZA RAČUNE 28.9")!;
    expect(ws.getCell("A1").value).toBe("NAZIV PARTNERA");
    expect(ws.getCell("G1").value).toBe("IME I PREZIME POLAZNIKA");
    expect(ws.getCell("A1").font?.bold).toBe(true);
    expect(ws.getCell("B2").value).toBe(199);
    expect(ws.getCell("B2").numFmt).toContain("€");
    expect(ws.getCell("C2").value).toBe("09532532757");
    expect(ws.getCell("G3").value).toBe("Y i Z");
    expect(ws.getCell("A4").value).toBe("UKUPNO");
    expect((ws.getCell("B4").value as { formula: string }).formula).toBe("SUM(B2:B3)");
    expect(ws.getCell("A6").value).toBe("Naziv usluge:");
    expect(String(ws.getCell("B6").value)).toContain("Sudjelovanje na radionici");
    expect(ws.model.merges).toContain("B6:E6");
  });

  it("bez redova: UKUPNO = 0 bez formule", async () => {
    const buf = await generirajExcel(seminar, []);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const ws = wb.worksheets[0];
    expect(ws.getCell("A2").value).toBe("UKUPNO");
    expect(ws.getCell("B2").value).toBe(0);
  });
});
```

- [ ] **Step 2:** run → FAIL (`generirajExcel` nije export)
- [ ] **Step 3: Implementacija** (dodati u `export-excel.ts`)

```ts
import ExcelJS from "exceljs";

const EUR_FMT = '#,##0.00 "€"';

export async function generirajExcel(s: SeminarZaExport, redovi: ExportRed[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(nazivSheeta(s));
  ws.columns = [
    { key: "nazivPartnera", width: 32 },
    { key: "iznos", width: 19 },
    { key: "oib", width: 19 },
    { key: "adresa", width: 39 },
    { key: "mail", width: 29 },
    { key: "telefon", width: 20 },
    { key: "polaznici", width: 37 },
  ];
  const header = ws.addRow(["NAZIV PARTNERA", "IZNOS", "OIB", "ADRESA", "MAIL", "TELEFON", "IME I PREZIME POLAZNIKA"]);
  header.font = { bold: true };

  for (const r of redovi) {
    const row = ws.addRow([r.nazivPartnera, r.iznos, r.oib, r.adresa, r.mail, r.telefon, r.polaznici]);
    row.getCell(2).numFmt = EUR_FMT;
    row.getCell(3).numFmt = "@";
    row.getCell(6).numFmt = "@";
  }

  const zadnji = ws.rowCount;
  const ukupno = ws.addRow(["UKUPNO", redovi.length ? { formula: `SUM(B2:B${zadnji})` } : 0]);
  ukupno.font = { bold: true };
  ukupno.getCell(2).numFmt = EUR_FMT;

  ws.addRow([]);
  const usluga = ws.addRow(["Naziv usluge:", nazivUsluge(s)]);
  ws.mergeCells(`B${usluga.number}:E${usluga.number}`);
  usluga.getCell(2).alignment = { wrapText: true, vertical: "top" };

  return Buffer.from(await wb.xlsx.writeBuffer());
}
```

- [ ] **Step 4:** run → PASS
- [ ] **Step 5:** `git add lib/prijave/export-excel.ts lib/prijave/export-excel.test.ts && git commit -m "Generate accounting Excel workbook with exceljs"`

### Task 4: Route handler

**Files:** Create `app/admin/prijave/export/route.ts`

- [ ] **Step 1: Implementacija** (nema unit testa — DB + auth; verificira se ručno u Task 5)

```ts
import { NextResponse } from "next/server";
import { jeAdmin } from "@/lib/admin/session";
import { getSeminar } from "@/lib/edukacije";
import { generirajExcel, nazivDatoteke, redoviZaExport, type SeminarZaExport } from "@/lib/prijave/export-excel";
import { ucitajPrijave } from "@/lib/prijave/ucitaj";

export async function GET(req: Request) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const slug = new URL(req.url).searchParams.get("edukacija");
  if (!slug) return new NextResponse("Nedostaje edukacija", { status: 400 });
  const seminar = await getSeminar(slug);
  if (!seminar) return new NextResponse("Not found", { status: 404 });
  if (!seminar.ponuda) return new NextResponse("Edukacija nema definiranu ponudu", { status: 400 });

  const prijave = await ucitajPrijave({ seminarSlug: slug, status: "ponuda_poslana" });
  const buffer = await generirajExcel(seminar as SeminarZaExport, redoviZaExport(prijave));
  const filename = encodeURIComponent(nazivDatoteke(seminar as SeminarZaExport));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
```

- [ ] **Step 2:** `npx tsc --noEmit -p .` → čisto
- [ ] **Step 3:** `git add app/admin/prijave/export/route.ts && git commit -m "Add /admin/prijave/export route for accounting Excel"`

### Task 5: Gumb na stranici

**Files:** Modify `app/admin/prijave/page.tsx` (form, iza gumba Filtriraj)

- [ ] **Step 1:** dodati unutar `<form>` nakon `Filtriraj` gumba:

```tsx
        {edukacija ? (
          <a
            href={`/admin/prijave/export?edukacija=${encodeURIComponent(edukacija)}`}
            className="px-4 py-2 border border-[var(--navy)] text-[var(--navy)] rounded-lg hover:bg-gray-50"
          >
            Export za računovodstvo
          </a>
        ) : (
          <span
            title="Odaberi edukaciju za export"
            className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed"
          >
            Export za računovodstvo
          </span>
        )}
```

- [ ] **Step 2:** `npx tsc --noEmit -p . && npm run lint` → čisto
- [ ] **Step 3:** ručno: `npm run dev`, login, `/admin/prijave?edukacija=<slug>`, klik → `.xlsx` skinut, otvori i usporedi s ručnim Excelom
- [ ] **Step 4:** `git add app/admin/prijave/page.tsx && git commit -m "Add accounting export button to admin registrations list"`
