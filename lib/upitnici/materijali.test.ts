import { beforeAll, describe, expect, it } from "vitest";
import { formatVelicine, kljucMaterijala, provjeriKljucMaterijala, sigurnoImeDatoteke } from "./materijali";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-tajna-dovoljno-duga";
});

describe("ključ materijala", () => {
  it("isti slug daje isti ključ od 22 znaka", async () => {
    const a = await kljucMaterijala("izvlastenje");
    expect(a).toHaveLength(22);
    expect(await kljucMaterijala("izvlastenje")).toBe(a);
  });

  it("drugi slug daje drugi ključ", async () => {
    expect(await kljucMaterijala("a")).not.toBe(await kljucMaterijala("b"));
  });

  it("odbija kriv, tuđi i prazan ključ", async () => {
    const tudi = await kljucMaterijala("b");
    expect(await provjeriKljucMaterijala("a", await kljucMaterijala("a"))).toBe(true);
    expect(await provjeriKljucMaterijala("a", tudi)).toBe(false);
    expect(await provjeriKljucMaterijala("a", "x")).toBe(false);
    expect(await provjeriKljucMaterijala("a", null)).toBe(false);
  });
});

describe("sigurnoImeDatoteke", () => {
  it("makne dijakritike i razmake", () => {
    expect(sigurnoImeDatoteke("Prezentacija Kvakarić 28.10.pptx")).toBe("Prezentacija-Kvakaric-28.10.pptx");
    expect(sigurnoImeDatoteke("Đurđa/../šifra?.pdf")).toBe("Durda-..-sifra-.pdf");
  });

  it("prazno ime dobije zamjenu", () => {
    expect(sigurnoImeDatoteke("čćž")).toBe("ccz");
    expect(sigurnoImeDatoteke("???")).toBe("datoteka");
  });
});

describe("formatVelicine", () => {
  it("KB i MB s decimalnim zarezom", () => {
    expect(formatVelicine(2_500_000)).toBe("2,4 MB");
    expect(formatVelicine(850_000)).toBe("830 KB");
    expect(formatVelicine(500)).toBe("1 KB");
  });
});
