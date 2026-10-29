import type { UpitnikOdgovor } from "@/lib/db/schema";

export type SazetakUpitnika = {
  broj: number;
  prosjekUkupno: number | null;
  prosjekKorisnost: number | null;
  predavaci: { ime: string; prosjek: number; broj: number }[];
  preporuka: { da: number; mozda: number; ne: number; bez: number };
};

const prosjek = (brojevi: number[]): number | null =>
  brojevi.length ? Math.round((brojevi.reduce((a, b) => a + b, 0) / brojevi.length) * 10) / 10 : null;

export function sazmi(
  odgovori: Pick<UpitnikOdgovor, "ocjenaUkupno" | "ocjenaKorisnost" | "ocjenePredavaca" | "preporuka">[],
): SazetakUpitnika {
  // Predavači po imenu iz snapshota, redom prvog pojavljivanja.
  const poPredavacu = new Map<string, number[]>();
  const preporuka = { da: 0, mozda: 0, ne: 0, bez: 0 };
  for (const o of odgovori) {
    for (const { ime, ocjena } of o.ocjenePredavaca) {
      poPredavacu.set(ime, [...(poPredavacu.get(ime) ?? []), ocjena]);
    }
    preporuka[o.preporuka ?? "bez"]++;
  }
  return {
    broj: odgovori.length,
    prosjekUkupno: prosjek(odgovori.map((o) => o.ocjenaUkupno)),
    prosjekKorisnost: prosjek(odgovori.map((o) => o.ocjenaKorisnost)),
    predavaci: [...poPredavacu].map(([ime, ocjene]) => ({ ime, prosjek: prosjek(ocjene)!, broj: ocjene.length })),
    preporuka,
  };
}
