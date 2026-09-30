import { describe, expect, it } from "vitest";
import { aktualnaCijena } from "./edukacije";

const ponuda = { cijena: 239, predavac: "", mjesto: "", ukljuceno: "" };
const seminar = {
  price: "239,00 EUR",
  ranaPrijava: { do: "2026-10-07", doLabel: "7. listopada 2026.", price: "199,00 EUR", cijena: 199 },
  ponuda,
};

describe("aktualnaCijena", () => {
  it("vraća cijenu rane prijave do kraja zadnjeg dana po zagrebačkom vremenu", () => {
    // 23:30 u Zagrebu (CEST, UTC+2)
    const r = aktualnaCijena(seminar, new Date("2026-10-07T21:30:00Z"));
    expect(r).toEqual({ price: "199,00 EUR", cijena: 199, rana: true });
  });

  it("vraća redovnu cijenu od ponoći idućeg dana", () => {
    // 00:30 u Zagrebu, 8. listopada
    const r = aktualnaCijena(seminar, new Date("2026-10-07T22:30:00Z"));
    expect(r).toEqual({ price: "239,00 EUR", cijena: 239, rana: false });
  });

  it("bez rane prijave vraća redovnu cijenu", () => {
    const r = aktualnaCijena({ price: "239,00 EUR", ponuda }, new Date("2026-01-01"));
    expect(r).toEqual({ price: "239,00 EUR", cijena: 239, rana: false });
  });
});
