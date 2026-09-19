const MJESECI_GENITIV = [
  "siječnja",
  "veljače",
  "ožujka",
  "travnja",
  "svibnja",
  "lipnja",
  "srpnja",
  "kolovoza",
  "rujna",
  "listopada",
  "studenoga",
  "prosinca",
];

// "2026-09-28" -> "28. rujna 2026."  Ručna tablica, ne Intl - da server i test daju isto.
export function formatDatumHr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${MJESECI_GENITIV[m - 1]} ${y}.`;
}

const hrBroj = new Intl.NumberFormat("hr-HR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// 1199 -> "1.199,00". Prima i string jer Drizzle numeric vraća string.
export function formatIznos(n: number | string): string {
  return hrBroj.format(Number(n));
}

export type PolaznikZaIspis = { ime: string; radnoMjesto: string };

// 1: "A, rm" | 2: "A, rm i B, rm" | 3+: "A, rm; B, rm i C, rm"
export function formatPolaznici(polaznici: PolaznikZaIspis[]): string {
  const items = polaznici.map((p) => `${p.ime}, ${p.radnoMjesto}`);
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join("; ")} i ${items[items.length - 1]}`;
}

export function sastaviBrojPonude(redniBroj: number, sredina: string, godina: number): string {
  return `${redniBroj}-${sredina}/${String(godina).slice(-2)}`;
}

export function nazivDatotekePonude(broj: string, organizacija: string): string {
  const safeBroj = broj.replace(/\//g, "-");
  const safeOrg = organizacija.replace(/[\\/:*?"<>|]/g, "").trim();
  return `Ponuda ${safeBroj} - ${safeOrg}.pdf`;
}
