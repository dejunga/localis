import { describe, expect, it } from "vitest";
import { SVA_POLJA, normalizirajTekst, odlomci, stavke } from "./tekstovi";

describe("normalizirajTekst", () => {
  it("pretvara \\r\\n u \\n i reže razmake na krajevima redaka", () => {
    expect(normalizirajTekst("  prvi  \r\ndrugi \r\n")).toBe("prvi\ndrugi");
  });

  it("sažima višestruke prazne redove u jedan", () => {
    expect(normalizirajTekst("a\n\n\n\nb")).toBe("a\n\nb");
  });
});

describe("odlomci i stavke", () => {
  it("odlomci dijeli po praznom redu", () => {
    expect(odlomci("prvi\n\ndrugi\n \ntreći")).toEqual(["prvi", "drugi", "treći"]);
  });

  it("stavke preskače prazne retke", () => {
    expect(stavke("a\n\n b \n")).toEqual(["a", "b"]);
  });
});

describe("SVA_POLJA", () => {
  const polja = SVA_POLJA;

  it("ključevi su jedinstveni", () => {
    expect(new Set(polja.map((p) => p.kljuc)).size).toBe(polja.length);
  });

  // Inače bi spremanje neizmijenjene forme upisalo izvorni tekst u bazu.
  it("izvorni tekstovi su već normalizirani", () => {
    for (const p of polja) expect(normalizirajTekst(p.zadano)).toBe(p.zadano);
  });
});
