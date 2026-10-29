import { describe, expect, it } from "vitest";
import type { Seminar } from "@/lib/edukacije";
import { edukacijeZaSlanje, odaberiPrimatelje, tekstMaila, type KandidatPrijava } from "./slanje";

const p = (id: number, email: string, status: KandidatPrijava["status"] = "nova"): KandidatPrijava => ({
  id,
  email,
  status,
});
const ids = (xs: KandidatPrijava[]) => xs.map((x) => x.id);

describe("odaberiPrimatelje", () => {
  it("preskače stornirane prijave", () => {
    expect(ids(odaberiPrimatelje([p(1, "a@x.hr"), p(2, "b@x.hr", "stornirana")], []))).toEqual([1]);
  });

  it("isti email (velika/mala slova, razmaci) dobije jedan mail", () => {
    expect(ids(odaberiPrimatelje([p(1, "A@x.hr"), p(2, " a@x.hr ")], []))).toEqual([1]);
  });

  it("ne šalje ponovno kad je već poslano", () => {
    expect(
      odaberiPrimatelje([p(1, "a@x.hr")], [{ prijavaId: 1, email: "a@x.hr", poslanAt: new Date(), greska: null }]),
    ).toEqual([]);
  });

  it("ne šalje ponovno u nejasnom stanju (ni poslano ni greška)", () => {
    expect(
      odaberiPrimatelje([p(1, "a@x.hr")], [{ prijavaId: 1, email: "a@x.hr", poslanAt: null, greska: null }]),
    ).toEqual([]);
  });

  it("ponovno šalje nakon greške", () => {
    expect(
      ids(odaberiPrimatelje([p(1, "a@x.hr")], [{ prijavaId: 1, email: "a@x.hr", poslanAt: null, greska: "SMTP" }])),
    ).toEqual([1]);
  });

  it("druga prijava s emailom kojem je već poslano ne dobije mail", () => {
    expect(
      odaberiPrimatelje([p(2, "A@x.hr")], [{ prijavaId: 1, email: "a@x.hr", poslanAt: new Date(), greska: null }]),
    ).toEqual([]);
  });

  it("redoslijed po id-u", () => {
    expect(ids(odaberiPrimatelje([p(3, "c@x.hr"), p(1, "a@x.hr")], []))).toEqual([1, 3]);
  });
});

const seminar = (o: Partial<Seminar>) => ({ slug: "s", date: "2026-10-28", time: "9.30 - 15.30", ...o }) as Seminar;

describe("edukacijeZaSlanje", () => {
  const now = new Date("2026-10-29T17:00:00Z");
  it("uzima završene s otvorenim upitnikom", () => {
    expect(edukacijeZaSlanje([seminar({ slug: "a" })], now).map((s) => s.slug)).toEqual(["a"]);
  });
  it("preskače edukacije koje još nisu završile", () => {
    expect(edukacijeZaSlanje([seminar({ date: "2026-11-09" })], now)).toEqual([]);
  });
  it("preskače zatvorene", () => {
    expect(edukacijeZaSlanje([seminar({ date: "2026-10-14" })], now)).toEqual([]);
  });
  it("preskače odgođene", () => {
    expect(edukacijeZaSlanje([seminar({ odgodeno: true })], now)).toEqual([]);
  });
});

describe("tekstMaila", () => {
  const m = tekstMaila(
    { title: "Izvlaštenje", dateLabel: "28. listopada 2026.", slug: "izvlastenje-prakticna-primjena-u-jls" },
    new Date("2026-11-01T14:30:00Z"),
  );
  it("predmet sadrži naslov", () => {
    expect(m.subject).toContain("Izvlaštenje");
  });
  it("tekst sadrži link, molbu za prosljeđivanje i rok", () => {
    expect(m.text).toContain("https://www.localis.hr/upitnik/izvlastenje-prakticna-primjena-u-jls");
    expect(m.text).toContain("proslijedite");
    expect(m.text).toContain("1. 11. 2026. u 15:30");
    expect(m.html).toContain('href="https://www.localis.hr/upitnik/izvlastenje-prakticna-primjena-u-jls"');
  });
});
