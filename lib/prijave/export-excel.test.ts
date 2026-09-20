import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import type { PrijavaRed } from "./ucitaj";
import {
  generirajExcel,
  nazivDatoteke,
  nazivSheeta,
  nazivUsluge,
  redoviZaExport,
  spojiImena,
  type SeminarZaExport,
} from "./export-excel";

const seminar = {
  slug: "opci-akt",
  title: "Kako izraditi opći akt u JLP(R)S",
  date: "2026-09-28",
  dateLabel: "28. rujna 2026.",
  ponuda: {
    cijena: 199,
    predavac: "Vikica Duvnjak dipl.iur.",
    mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
    ukljuceno: "",
  },
} as unknown as SeminarZaExport;

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
