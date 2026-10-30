import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import type { UpitnikOdgovor } from "@/lib/db/schema";
import { generirajExcelUpitnika, nazivDatotekeUpitnika } from "./export-excel";

const odgovor = (id: number, ocjena: number): UpitnikOdgovor => ({
  id,
  createdAt: new Date("2026-10-28T15:00:00Z"),
  seminarSlug: "s",
  seminarTitle: "Naslov",
  ocjenaUkupno: ocjena,
  ocjenaKorisnost: 4,
  ocjenePredavaca: [{ ime: "A", ocjena }],
  preporuka: "da",
  svidjelo: "Primjeri",
  popraviti: null,
  recenzija: null,
  strucnaPomoc: null,
  kontaktIme: null,
  kontaktUstanova: null,
  kontaktEmail: null,
  privolaKontaktAt: null,
  privolaKontaktVerzija: null,
  privolaObjavaAt: null,
  privolaObjavaVerzija: null,
});

describe("generirajExcelUpitnika", () => {
  it("zaglavlje s kolonom po predavaču i red po odgovoru", async () => {
    const buffer = await generirajExcelUpitnika({ title: "Naslov", dateLabel: "28. listopada 2026." }, [
      odgovor(1, 5),
      odgovor(2, 4),
    ]);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
    const ws = wb.worksheets[0];
    const zaglavlje = (ws.getRow(1).values as unknown[]).map(String);
    expect(zaglavlje).toContain("Ukupno");
    expect(zaglavlje).toContain("A");
    expect(ws.rowCount).toBe(3);
  });
});

describe("nazivDatotekeUpitnika", () => {
  it("skraćuje naslov i dodaje datum", () => {
    const n = nazivDatotekeUpitnika({ title: "x".repeat(100), date: "2026-10-28" });
    expect(n).toBe(`Upitnik - ${"x".repeat(80)} - 2026-10-28.xlsx`);
  });
});
