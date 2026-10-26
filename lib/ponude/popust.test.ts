import { describe, expect, it } from "vitest";
import {
  cijenePoPolazniku,
  GRUPNI_POPUST_OPIS,
  grupniPopust,
  izracunajPonudu,
  opisPopusta,
  popustIzReda,
  procitajPopust,
} from "./popust";

function forma(polja: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(polja)) fd.set(k, v);
  return fd;
}

describe("izracunajPonudu", () => {
  it("bez popusta ukupno = osnovica", () => {
    expect(izracunajPonudu(3, 199, null)).toEqual({ osnovica: 597, popustIznos: 0, ukupno: 597 });
  });

  it("postotak se zaokružuje na cente", () => {
    expect(izracunajPonudu(3, 199, { tip: "postotak", vrijednost: 15, opis: null })).toEqual({
      osnovica: 597,
      popustIznos: 89.55,
      ukupno: 507.45,
    });
    expect(izracunajPonudu(1, 199.99, { tip: "postotak", vrijednost: 12.5, opis: null }).popustIznos).toBe(25);
  });

  it("fiksni iznos se oduzima od osnovice", () => {
    expect(izracunajPonudu(2, 500, { tip: "iznos", vrijednost: 100, opis: null })).toEqual({
      osnovica: 1000,
      popustIznos: 100,
      ukupno: 900,
    });
  });

  it("odbija popust jednak ili veći od osnovice", () => {
    expect(() => izracunajPonudu(1, 100, { tip: "iznos", vrijednost: 100, opis: null })).toThrow();
    expect(() => izracunajPonudu(1, 100, { tip: "iznos", vrijednost: 150, opis: null })).toThrow();
  });
});

describe("grupni popust", () => {
  it("2. polaznik -10 %, 3. i svaki sljedeći -20 %", () => {
    expect(cijenePoPolazniku(4, 200)).toEqual([200, 180, 160, 160]);
  });

  it("jedan polaznik nema popust", () => {
    expect(grupniPopust(1, 200)).toBeNull();
  });

  it("ponuda dobiva zbroj popusta kao fiksni iznos", () => {
    const popust = grupniPopust(3, 200);
    expect(popust).toEqual({ tip: "iznos", vrijednost: 60, opis: GRUPNI_POPUST_OPIS });
    expect(izracunajPonudu(3, 200, popust).ukupno).toBe(540);
  });

  it("zaokružuje svakog polaznika na cente kao forma", () => {
    expect(cijenePoPolazniku(3, 199.99)).toEqual([199.99, 179.99, 159.99]);
    expect(izracunajPonudu(3, 199.99, grupniPopust(3, 199.99)).ukupno).toBe(539.97);
  });
});

describe("opisPopusta", () => {
  it("default tekst ovisi o vrsti", () => {
    expect(opisPopusta({ tip: "postotak", vrijednost: 12.5, opis: null })).toBe("Popust (12,5 %)");
    expect(opisPopusta({ tip: "iznos", vrijednost: 100, opis: null })).toBe("Popust");
  });

  it("vlastiti opis ima prednost", () => {
    expect(opisPopusta({ tip: "iznos", vrijednost: 100, opis: "Popust za 3+ polaznika" })).toBe(
      "Popust za 3+ polaznika",
    );
  });
});

describe("procitajPopust", () => {
  it("prazan tip = bez popusta", () => {
    expect(procitajPopust(forma({ popust_tip: "", popust_vrijednost: "15" }))).toEqual({ popust: null });
  });

  it("prihvaća decimalni zarez i opis", () => {
    expect(
      procitajPopust(forma({ popust_tip: "postotak", popust_vrijednost: "12,5", popust_opis: " Vjerni klijent " })),
    ).toEqual({ popust: { tip: "postotak", vrijednost: 12.5, opis: "Vjerni klijent" } });
  });

  it("odbija neispravne vrijednosti", () => {
    for (const polja of [
      { popust_tip: "postotak", popust_vrijednost: "" },
      { popust_tip: "postotak", popust_vrijednost: "0" },
      { popust_tip: "postotak", popust_vrijednost: "100" },
      { popust_tip: "iznos", popust_vrijednost: "-5" },
      { popust_tip: "iznos", popust_vrijednost: "abc" },
      { popust_tip: "iznos", popust_vrijednost: "10,555" },
      { popust_tip: "rabat", popust_vrijednost: "10" },
    ]) {
      expect(procitajPopust(forma(polja))).toHaveProperty("greska");
    }
  });
});

describe("popustIzReda", () => {
  it("numeric string u broj, null bez tipa", () => {
    expect(popustIzReda({ popustTip: "iznos", popustVrijednost: "100.00", popustOpis: null })).toEqual({
      tip: "iznos",
      vrijednost: 100,
      opis: null,
    });
    expect(popustIzReda({ popustTip: null, popustVrijednost: null, popustOpis: null })).toBeNull();
  });
});
