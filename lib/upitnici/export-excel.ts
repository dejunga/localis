import ExcelJS from "exceljs";
import type { UpitnikOdgovor } from "@/lib/db/schema";
import type { Seminar } from "@/lib/edukacije";

const PREPORUKA = { da: "Da", mozda: "Možda", ne: "Ne" } as const;

// "28.10.2026. 16:05" po zagrebačkom vremenu.
function datumVrijeme(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Zagreb",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}.${p.month}.${p.year}. ${p.hour}:${p.minute}`;
}

export function nazivDatotekeUpitnika(s: Pick<Seminar, "title" | "date">): string {
  return `Upitnik - ${s.title.slice(0, 80)} - ${s.date}.xlsx`;
}

// Jedan red = jedan odgovor; jedna kolona po predavaču (imena iz snapshota odgovora).
export async function generirajExcelUpitnika(
  s: Pick<Seminar, "title" | "dateLabel">,
  odgovori: UpitnikOdgovor[],
): Promise<Buffer> {
  const predavaci = [...new Set(odgovori.flatMap((o) => o.ocjenePredavaca.map((p) => p.ime)))];
  const wb = new ExcelJS.Workbook();
  wb.title = s.title;
  // Ime sheeta smije imati najviše 31 znak.
  const ws = wb.addWorksheet(`Upitnik ${s.dateLabel}`.slice(0, 31));
  ws.columns = [
    { width: 18 },
    { width: 9 },
    { width: 11 },
    ...predavaci.map(() => ({ width: 16 })),
    { width: 11 },
    { width: 40 },
    { width: 40 },
    { width: 40 },
    { width: 40 },
    { width: 24 },
    { width: 28 },
    { width: 28 },
  ];
  const header = ws.addRow([
    "Datum",
    "Ukupno",
    "Korisnost",
    ...predavaci,
    "Preporuka",
    "Svidjelo",
    "Popraviti",
    "Recenzija",
    "Objava dopuštena",
    "Stručna pomoć",
    "Ime",
    "Ustanova",
    "Email",
  ]);
  header.font = { bold: true };

  for (const o of odgovori) {
    const row = ws.addRow([
      datumVrijeme(o.createdAt),
      o.ocjenaUkupno,
      o.ocjenaKorisnost,
      ...predavaci.map((ime) => o.ocjenePredavaca.find((p) => p.ime === ime)?.ocjena ?? ""),
      o.preporuka ? PREPORUKA[o.preporuka] : "",
      o.svidjelo ?? "",
      o.popraviti ?? "",
      o.recenzija ?? "",
      o.privolaObjavaAt ? "Da" : "",
      o.strucnaPomoc ?? "",
      o.kontaktIme ?? "",
      o.kontaktUstanova ?? "",
      o.kontaktEmail ?? "",
    ]);
    row.alignment = { wrapText: true, vertical: "top" };
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}
