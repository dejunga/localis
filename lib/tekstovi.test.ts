import { describe, expect, it } from "vitest";
import { SVA_POLJA, greskaUnosa, normalizirajTekst, odlomci, stavke, telefonZaPoziv, zamijeniPolja } from "./tekstovi";

describe("telefonZaPoziv", () => {
  it("domaći broj dobiva +385 umjesto vodeće nule", () => {
    expect(telefonZaPoziv("095/313-5158")).toBe("+385953135158");
  });

  it("međunarodni broj ostaje međunarodni", () => {
    expect(telefonZaPoziv("+385 95 313 5158")).toBe("+385953135158");
    expect(telefonZaPoziv("00385 95 313 5158")).toBe("+385953135158");
  });
});

describe("greskaUnosa", () => {
  it("prazno je uvijek ispravno (vraća izvorni tekst)", () => {
    expect(greskaUnosa("kontakt.email", "  ")).toBeNull();
  });

  it("provjerava e-mail", () => {
    expect(greskaUnosa("kontakt.email", "info@localis.hr")).toBeNull();
    expect(greskaUnosa("kontakt.email", "info localis")).not.toBeNull();
  });

  it("provjerava telefon", () => {
    expect(greskaUnosa("kontakt.telefon", "095/313-5158")).toBeNull();
    expect(greskaUnosa("kontakt.telefon", "nazovite nas")).not.toBeNull();
    expect(greskaUnosa("kontakt.telefon", "12")).not.toBeNull();
  });

  it("odbija predug tekst", () => {
    expect(greskaUnosa("cta.tekst", "a".repeat(5001))).not.toBeNull();
  });
});

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

describe("zamijeniPolja", () => {
  it("zamjenjuje poznata polja, nepoznata ostavlja", () => {
    expect(zamijeniPolja("Hvala {naziv}, {nepoznato}", { naziv: "X" })).toBe("Hvala X, {nepoznato}");
  });

  it("vrijednost s $ i vitičastim zagradama ide doslovno", () => {
    expect(zamijeniPolja("{naziv}", { naziv: "$& {datum}" })).toBe("$& {datum}");
  });
});
