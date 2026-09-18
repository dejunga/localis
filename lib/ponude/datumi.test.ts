import { describe, expect, it } from "vitest";
import { danasZagreb, dodajDane, izracunajDatumePonude } from "./datumi";

describe("dodajDane", () => {
  it("dodaje dane preko granice mjeseca", () => {
    expect(dodajDane("2026-09-30", 2)).toBe("2026-10-02");
  });
  it("dodaje dane preko granice godine", () => {
    expect(dodajDane("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("danasZagreb", () => {
  it("vraća ISO datum po zagrebačkom vremenu", () => {
    // 23:30 UTC 19.9. = 01:30 20.9. u Zagrebu (CEST)
    expect(danasZagreb(new Date("2026-09-19T23:30:00Z"))).toBe("2026-09-20");
  });
});

describe("izracunajDatumePonude", () => {
  it("vrijedi do = rok plaćanja = izdavanje + dani", () => {
    expect(
      izracunajDatumePonude({ danas: "2026-09-17", daniValjanosti: 2, datumEdukacije: "2026-09-28" }),
    ).toEqual({ datumIzdavanja: "2026-09-17", vrijediDo: "2026-09-19", rokPlacanja: "2026-09-19" });
  });
  it("ne prelazi datum edukacije", () => {
    expect(
      izracunajDatumePonude({ danas: "2026-09-27", daniValjanosti: 2, datumEdukacije: "2026-09-28" }),
    ).toEqual({ datumIzdavanja: "2026-09-27", vrijediDo: "2026-09-28", rokPlacanja: "2026-09-28" });
  });
  it("nikad prije dana izdavanja", () => {
    expect(
      izracunajDatumePonude({ danas: "2026-09-28", daniValjanosti: 2, datumEdukacije: "2026-09-28" }),
    ).toEqual({ datumIzdavanja: "2026-09-28", vrijediDo: "2026-09-28", rokPlacanja: "2026-09-28" });
  });
});
