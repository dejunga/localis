import { describe, expect, it } from "vitest";
import { tekstMailaKlijentu } from "./email";

describe("tekstMailaKlijentu", () => {
  it("sadrži broj, rok, poziv na broj i polaznike", () => {
    const t = tekstMailaKlijentu({
      kontaktIme: "Ines Loknar Josić",
      naslov: "Kako izraditi opći akt u JLP(R)S",
      datumLabel: "28. rujna 2026.",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      broj: "7-112/26",
      rokPlacanja: "2026-09-19",
      polaznici: [
        { ime: "Ines Loknar Josić", radnoMjesto: "pročelnica" },
        { ime: "Marija Gašpar", radnoMjesto: "viša savjetnica" },
      ],
      potpisnik: "Milada Sofka, voditeljica ureda",
    });
    expect(t).toContain("Poštovani/a Ines Loknar Josić,");
    expect(t).toContain("ponudu br. 7-112/26");
    expect(t).toContain("Rok plaćanja: 19. rujna 2026.");
    expect(t).toContain("HR00 7-112/26");
    expect(t).toContain("1. Ines Loknar Josić, pročelnica");
    expect(t).toContain("2. Marija Gašpar, viša savjetnica");
    expect(t).toContain("Milada Sofka, voditeljica ureda");
  });
});
