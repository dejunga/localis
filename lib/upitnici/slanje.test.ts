import { describe, expect, it } from "vitest";
import type { Seminar } from "@/lib/edukacije";
import { danasZagreb, edukacijeZaSlanje, kopijaZaLocalis, odaberiPrimatelje, type KandidatPrijava } from "./slanje";

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
const slanja = (datum: string, slug = "s") => new Map([[slug, datum]]);

describe("danasZagreb", () => {
  it("datum po zagrebačkom vremenu", () => {
    expect(danasZagreb(new Date("2026-11-01T23:30:00Z"))).toBe("2026-11-02");
    expect(danasZagreb(new Date("2026-11-02T07:00:00Z"))).toBe("2026-11-02");
  });
});

describe("edukacijeZaSlanje", () => {
  const now = new Date("2026-11-02T07:00:00Z");
  it("bez termina ne šalje ništa", () => {
    expect(edukacijeZaSlanje([seminar({})], new Map(), now)).toEqual([]);
  });
  it("šalje na dan termina i nakon njega", () => {
    expect(edukacijeZaSlanje([seminar({})], slanja("2026-11-02"), now).map((s) => s.slug)).toEqual(["s"]);
    expect(edukacijeZaSlanje([seminar({})], slanja("2026-10-30"), now).map((s) => s.slug)).toEqual(["s"]);
  });
  it("ne šalje prije termina", () => {
    expect(edukacijeZaSlanje([seminar({})], slanja("2026-11-03"), now)).toEqual([]);
  });
  it("preskače edukacije koje još nisu završile", () => {
    expect(edukacijeZaSlanje([seminar({ date: "2026-11-09" })], slanja("2026-11-02"), now)).toEqual([]);
  });
  it("preskače zatvorene upitnike", () => {
    expect(edukacijeZaSlanje([seminar({ date: "2026-10-14" })], slanja("2026-10-14"), now)).toEqual([]);
  });
  it("preskače odgođene", () => {
    expect(edukacijeZaSlanje([seminar({ odgodeno: true })], slanja("2026-11-02"), now)).toEqual([]);
  });
});

describe("kopijaZaLocalis", () => {
  const m = {
    subject: "Hvala",
    html: '<!DOCTYPE html><html><body style="margin:0"><p>Mail</p></body></html>',
    text: "Mail",
    qrPng: Buffer.from(""),
  };

  it("popis poslanih na vrhu, isti mail ispod", () => {
    const k = kopijaZaLocalis(m, ["a@x.hr", "b@x.hr"], []);
    expect(k.subject).toBe("[POSLANO 2] Hvala");
    expect(k.html).toMatch(/<body style="margin:0">\s*<div[^>]*>[\s\S]*a@x\.hr[\s\S]*b@x\.hr[\s\S]*<\/div>\s*<p>Mail<\/p>/);
    expect(k.html).not.toContain("Nije poslano");
    expect(k.text).toContain("1. a@x.hr\n2. b@x.hr");
    expect(k.text.endsWith("Mail")).toBe(true);
  });

  it("navodi neuspjele i escapea adrese", () => {
    const k = kopijaZaLocalis(m, ["a@x.hr"], ["<c>@x.hr"]);
    expect(k.html).toContain("Nije poslano (greška):");
    expect(k.html).toContain("&lt;c&gt;@x.hr");
    expect(k.text).toContain("nije poslano na 1");
  });
});
