import { describe, expect, it } from "vitest";
import {
  formatDatumHr,
  formatIznos,
  formatPolaznici,
  nazivDatotekePonude,
  sastaviBrojPonude,
} from "./format";

describe("formatDatumHr", () => {
  it("piše mjesec u genitivu s točkom na kraju", () => {
    expect(formatDatumHr("2026-09-28")).toBe("28. rujna 2026.");
    expect(formatDatumHr("2026-01-05")).toBe("5. siječnja 2026.");
    expect(formatDatumHr("2026-11-01")).toBe("1. studenoga 2026.");
  });
});

describe("formatIznos", () => {
  it("hr format s dvije decimale", () => {
    expect(formatIznos(199)).toBe("199,00");
    expect(formatIznos(1199)).toBe("1.199,00");
    expect(formatIznos("398.00")).toBe("398,00");
    expect(formatIznos(0)).toBe("0,00");
  });
});

describe("formatPolaznici", () => {
  const a = { ime: "Ana Anić", radnoMjesto: "pročelnica" };
  const b = { ime: "Bruno Brunić", radnoMjesto: "viši savjetnik" };
  const c = { ime: "Cvita Cvitić", radnoMjesto: "referentica" };
  it("jedan", () => expect(formatPolaznici([a])).toBe("Ana Anić, pročelnica"));
  it("dva", () =>
    expect(formatPolaznici([a, b])).toBe("Ana Anić, pročelnica i Bruno Brunić, viši savjetnik"));
  it("tri", () =>
    expect(formatPolaznici([a, b, c])).toBe(
      "Ana Anić, pročelnica; Bruno Brunić, viši savjetnik i Cvita Cvitić, referentica",
    ));
  it("prazno", () => expect(formatPolaznici([])).toBe(""));
});

describe("sastaviBrojPonude", () => {
  it("redni-sredina/yy", () => {
    expect(sastaviBrojPonude(8, "112", 2026)).toBe("8-112/26");
    expect(sastaviBrojPonude(1, "112", 2027)).toBe("1-112/27");
  });
});

describe("nazivDatotekePonude", () => {
  it("bez kose crte i zabranjenih znakova", () => {
    expect(nazivDatotekePonude("8-112/26", "Grad Čabar")).toBe("Ponuda 8-112-26 - Grad Čabar.pdf");
    expect(nazivDatotekePonude("8-112/26", 'Općina "X" / Y')).toBe("Ponuda 8-112-26 - Općina X  Y.pdf");
  });
});
