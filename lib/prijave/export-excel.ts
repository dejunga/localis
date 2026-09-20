import ExcelJS from "exceljs";
import type { Seminar } from "@/lib/edukacije";
import type { PrijavaRed } from "./ucitaj";

export type SeminarZaExport = Seminar & { ponuda: NonNullable<Seminar["ponuda"]> };

// Jedan red u Excelu za računovodstvo = jedna prijava (jedan račun).
export type ExportRed = {
  nazivPartnera: string;
  iznos: number;
  oib: string;
  adresa: string;
  mail: string;
  telefon: string;
  polaznici: string;
};

const EUR_FMT = '#,##0.00 "€"';

export function spojiImena(imena: string[]): string {
  if (imena.length <= 1) return imena[0] ?? "";
  return `${imena.slice(0, -1).join(", ")} i ${imena[imena.length - 1]}`;
}

// Samo prijave s poslanom ponudom - to je ono što računovodstvo fakturira. Iznos je snapshot iz ponude.
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

// "2026-09-28" -> "28.9"
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
  const header = ws.addRow([
    "NAZIV PARTNERA",
    "IZNOS",
    "OIB",
    "ADRESA",
    "MAIL",
    "TELEFON",
    "IME I PREZIME POLAZNIKA",
  ]);
  header.font = { bold: true };

  for (const r of redovi) {
    const row = ws.addRow([r.nazivPartnera, r.iznos, r.oib, r.adresa, r.mail, r.telefon, r.polaznici]);
    row.getCell(2).numFmt = EUR_FMT;
    // OIB i telefon kao tekst da Excel ne odbaci vodeću nulu.
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
