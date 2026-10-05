import { describe, expect, it } from "vitest";
import { tekstInternogMaila, tekstMailaKlijentu } from "./email";

describe("tekstMailaKlijentu", () => {
  it("sadrži broj ponude i potpis, bez roka plaćanja i popisa polaznika", () => {
    const t = tekstMailaKlijentu({
      kontaktIme: "Ines Loknar Josić",
      naslov: "Kako izraditi opći akt u JLP(R)S",
      datumLabel: "28. rujna 2026.",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      broj: "7-112/26",
      potpisnik: "Milada Sofka, voditeljica ureda",
    });
    expect(t).toContain("Poštovani/a Ines Loknar Josić,");
    expect(t).toContain("ponudu br. 7-112/26");
    expect(t).toContain("svoje mjesto osigurate dostavom narudžbenice");
    expect(t).not.toContain("Rok plaćanja");
    expect(t).not.toContain("HR00");
    expect(t).not.toContain("Polaznici:");
    expect(t).toContain("Milada Sofka, voditeljica ureda");
  });
});

describe("tekstInternogMaila", () => {
  it("navodi datum i lokaciju edukacije", () => {
    const t = tekstInternogMaila({
      seminarTitle: "Manje papira, manje gužve",
      seminarDatum: "22. listopada 2026.",
      seminarLokacija: "Hotel Park, Split",
      kontaktIme: "Ana Anić",
      email: "ana@example.com",
      telefon: "",
      organizacija: "Općina Primjer",
      adresa: "Ulica 1",
      oib: "12345678901",
      napomena: null,
      polaznici: [{ ime: "Ana Anić", radnoMjesto: "pročelnica" }],
      prijavaId: 1,
      ponuda: { broj: "1-112/26", ukupno: 199 },
    });
    expect(t).toContain("Datum: 22. listopada 2026.");
    expect(t).toContain("Lokacija: Hotel Park, Split");
  });
});
