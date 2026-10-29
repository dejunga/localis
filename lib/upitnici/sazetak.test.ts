import { describe, expect, it } from "vitest";
import { sazmi } from "./sazetak";

const o = (
  ocjenaUkupno: number,
  ocjenePredavaca: { ime: string; ocjena: number }[] = [],
  preporuka: "da" | "mozda" | "ne" | null = null,
) => ({ ocjenaUkupno, ocjenaKorisnost: 4, ocjenePredavaca, preporuka });

describe("sazmi", () => {
  it("prazan popis", () => {
    expect(sazmi([])).toEqual({
      broj: 0,
      prosjekUkupno: null,
      prosjekKorisnost: null,
      predavaci: [],
      preporuka: { da: 0, mozda: 0, ne: 0, bez: 0 },
    });
  });

  it("prosjek na jednu decimalu", () => {
    const s = sazmi([o(5), o(4), o(4)]);
    expect(s.broj).toBe(3);
    expect(s.prosjekUkupno).toBe(4.3);
    expect(s.prosjekKorisnost).toBe(4);
  });

  it("predavači po imenu, redom pojavljivanja", () => {
    const s = sazmi([
      o(5, [
        { ime: "A", ocjena: 5 },
        { ime: "B", ocjena: 3 },
      ]),
      o(4, [{ ime: "A", ocjena: 4 }]),
    ]);
    expect(s.predavaci).toEqual([
      { ime: "A", prosjek: 4.5, broj: 2 },
      { ime: "B", prosjek: 3, broj: 1 },
    ]);
  });

  it("preporuka bez odgovora broji se u bez", () => {
    expect(sazmi([o(5, [], "da"), o(5, [], null), o(5, [], "ne")]).preporuka).toEqual({
      da: 1,
      mozda: 0,
      ne: 1,
      bez: 1,
    });
  });
});
