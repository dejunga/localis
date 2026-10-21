// Popust na cijelu ponudu: postotak od osnovice ili fiksni iznos u EUR.
export type PopustTip = "postotak" | "iznos";
export type Popust = { tip: PopustTip; vrijednost: number; opis: string | null };

export type IzracunPonude = {
  osnovica: number; // kolicina × cijena
  popustIznos: number; // 0 bez popusta
  ukupno: number; // osnovica - popust
};

const centi = (n: number) => Math.round(n * 100);

// Računa u centima da 15 % od 3 × 199,00 ne završi na 89,55000000000001.
export function izracunajPonudu(kolicina: number, cijena: number, popust: Popust | null): IzracunPonude {
  const osnovicaC = kolicina * centi(cijena);
  let popustC = 0;
  if (popust) {
    popustC = popust.tip === "postotak" ? Math.round((osnovicaC * popust.vrijednost) / 100) : centi(popust.vrijednost);
    if (popustC <= 0) throw new Error("Popust mora biti veći od nule.");
    if (popustC >= osnovicaC) throw new Error("Popust ne može biti jednak ili veći od iznosa ponude.");
  }
  return { osnovica: osnovicaC / 100, popustIznos: popustC / 100, ukupno: (osnovicaC - popustC) / 100 };
}

const hrPostotak = new Intl.NumberFormat("hr-HR", { maximumFractionDigits: 2 });

// Tekst reda na PDF-u: vlastiti opis ako ga je admin upisao, inače "Popust (15 %)" / "Popust".
export function opisPopusta(popust: Popust): string {
  if (popust.opis) return popust.opis;
  return popust.tip === "postotak" ? `Popust (${hrPostotak.format(popust.vrijednost)} %)` : "Popust";
}

// Admin forma: polja popust_tip, popust_vrijednost (prihvaća "12,5"), popust_opis. Prazan tip = bez popusta.
export function procitajPopust(formData: FormData): { popust: Popust | null } | { greska: string } {
  const tip = String(formData.get("popust_tip") ?? "");
  if (!tip) return { popust: null };
  if (tip !== "postotak" && tip !== "iznos") return { greska: "Nepoznata vrsta popusta." };
  const sirovo = String(formData.get("popust_vrijednost") ?? "").trim().replace(",", ".");
  const vrijednost = Number(sirovo);
  if (!sirovo || !Number.isFinite(vrijednost) || vrijednost <= 0) {
    return { greska: "Upiši vrijednost popusta veću od nule." };
  }
  if (tip === "postotak" && vrijednost >= 100) return { greska: "Postotak popusta mora biti manji od 100." };
  if (!/^\d+(\.\d{1,2})?$/.test(sirovo)) return { greska: "Popust može imati najviše dvije decimale." };
  const opis = String(formData.get("popust_opis") ?? "").trim();
  if (opis.length > 100) return { greska: "Opis popusta može imati najviše 100 znakova." };
  return { popust: { tip, vrijednost, opis: opis || null } };
}

// Iz DB redova (numeric dolazi kao string) u Popust; null kad popusta nema.
export function popustIzReda(r: {
  popustTip: PopustTip | null;
  popustVrijednost: string | null;
  popustOpis: string | null;
}): Popust | null {
  if (!r.popustTip || r.popustVrijednost == null) return null;
  return { tip: r.popustTip, vrijednost: Number(r.popustVrijednost), opis: r.popustOpis };
}
