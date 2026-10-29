import { describe, expect, it } from "vitest";
import { UPITNIK_PRIVOLA_VERZIJA } from "./pitanja";
import { procitajOdgovor } from "./validacija";

function bez(polja: Record<string, string>, kljuc: string): Record<string, string> {
  return Object.fromEntries(Object.entries(polja).filter(([k]) => k !== kljuc));
}

function fd(polja: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(polja)) f.set(k, v);
  return f;
}

const seminar = {
  slug: "x",
  title: "X",
  lecturers: [
    { name: "A", bio: "" },
    { name: "B", bio: "" },
  ],
};
const min = { ocjena_ukupno: "5", ocjena_korisnost: "4", ocjena_predavac_0: "5", ocjena_predavac_1: "3" };

describe("procitajOdgovor", () => {
  it("prihvaća samo obavezne ocjene", () => {
    expect(procitajOdgovor(fd(min), seminar)).toMatchObject({
      ok: true,
      odgovor: {
        seminarSlug: "x",
        seminarTitle: "X",
        ocjenaUkupno: 5,
        ocjenaKorisnost: 4,
        ocjenePredavaca: [
          { ime: "A", ocjena: 5 },
          { ime: "B", ocjena: 3 },
        ],
        preporuka: null,
        svidjelo: null,
        kontaktEmail: null,
        privolaKontaktAt: null,
      },
    });
  });

  it("traži ocjenu svakog predavača", () => {
    const r = procitajOdgovor(fd(bez(min, "ocjena_predavac_1")), seminar);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.errors.ocjenePredavaca).toBeTruthy();
  });

  it.each(["0", "6", "4.5", "abc", ""])("odbija ukupnu ocjenu %j", (v) => {
    const r = procitajOdgovor(fd({ ...min, ocjena_ukupno: v }), seminar);
    expect(!r.ok && r.errors.ocjenaUkupno).toBeTruthy();
  });

  it("odbija kad ukupna ocjena nedostaje", () => {
    const r = procitajOdgovor(fd(bez(min, "ocjena_ukupno")), seminar);
    expect(!r.ok && r.errors.ocjenaUkupno).toBeTruthy();
  });

  it("odbija kad ocjena korisnosti nedostaje", () => {
    const r = procitajOdgovor(fd(bez(min, "ocjena_korisnost")), seminar);
    expect(!r.ok && r.errors.ocjenaKorisnost).toBeTruthy();
  });

  it("edukacija bez predavača ne traži njihove ocjene", () => {
    const r = procitajOdgovor(fd({ ocjena_ukupno: "4", ocjena_korisnost: "4" }), { ...seminar, lecturers: [] });
    expect(r).toMatchObject({ ok: true, odgovor: { ocjenePredavaca: [] } });
  });

  it("preporuka: poznata vrijednost ili null", () => {
    expect(procitajOdgovor(fd({ ...min, preporuka: "mozda" }), seminar)).toMatchObject({
      ok: true,
      odgovor: { preporuka: "mozda" },
    });
    expect(procitajOdgovor(fd({ ...min, preporuka: "nesto" }), seminar)).toMatchObject({
      ok: true,
      odgovor: { preporuka: null },
    });
  });

  it("prazan tekst postaje null, predug je greška", () => {
    expect(procitajOdgovor(fd({ ...min, svidjelo: "   " }), seminar)).toMatchObject({
      ok: true,
      odgovor: { svidjelo: null },
    });
    const r = procitajOdgovor(fd({ ...min, svidjelo: "a".repeat(2001) }), seminar);
    expect(!r.ok && r.errors.tekst).toBeTruthy();
  });

  it("email bez privole je greška", () => {
    const r = procitajOdgovor(fd({ ...min, kontakt_email: "a@b.hr" }), seminar);
    expect(!r.ok && r.errors.privola).toBeTruthy();
  });

  it("neispravan email je greška", () => {
    const r = procitajOdgovor(fd({ ...min, kontakt_email: "a@b", privola_kontakt: "da" }), seminar);
    expect(!r.ok && r.errors.kontaktEmail).toBeTruthy();
  });

  it("email s privolom bilježi privolu", () => {
    const now = new Date("2026-10-30T10:00:00Z");
    const r = procitajOdgovor(
      fd({ ...min, kontakt_email: "a@b.hr", kontakt_ime: "Ana", privola_kontakt: "da" }),
      seminar,
      now,
    );
    expect(r).toMatchObject({
      ok: true,
      odgovor: {
        kontaktEmail: "a@b.hr",
        kontaktIme: "Ana",
        privolaKontaktAt: now,
        privolaKontaktVerzija: UPITNIK_PRIVOLA_VERZIJA,
      },
    });
  });

  it("privola bez emaila se ne bilježi", () => {
    const r = procitajOdgovor(fd({ ...min, privola_kontakt: "da" }), seminar);
    expect(r).toMatchObject({ ok: true, odgovor: { privolaKontaktAt: null, privolaKontaktVerzija: null } });
  });
});
