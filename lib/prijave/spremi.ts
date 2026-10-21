import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, prijave, type Prijava } from "@/lib/db/schema";
import type { Popust } from "@/lib/ponude/popust";

export type NovaPrijava = {
  seminarSlug: string;
  seminarTitle: string;
  kontaktIme: string;
  email: string;
  telefon: string;
  organizacija: string;
  adresa: string;
  oib: string;
  napomena: string | null;
  polaznici: { ime: string; radnoMjesto: string }[];
};

// Ručni unos iz admina: oznaka izvora i popust za prvu ponudu.
export type AdminDodatak = { izvor: Prijava["izvor"]; popust: Popust | null };

// Verzija teksta privole na koju je kontakt osoba pristala; null = nije označila checkbox.
export type PrivolaObavijesti = { verzija: string } | null;

// tx1: prijava + polaznici zajedno ili ništa.
export async function spremiPrijavu(
  p: NovaPrijava,
  privola: PrivolaObavijesti,
  dodatak?: AdminDodatak,
): Promise<number> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(prijave)
      .values({
        seminarSlug: p.seminarSlug,
        seminarTitle: p.seminarTitle,
        kontaktIme: p.kontaktIme,
        email: p.email,
        telefon: p.telefon,
        organizacija: p.organizacija,
        adresa: p.adresa,
        oib: p.oib,
        napomena: p.napomena,
        privolaObavijestiAt: privola ? new Date() : null,
        privolaObavijestiVerzija: privola?.verzija ?? null,
        ...(dodatak && { izvor: dodatak.izvor, ...popustStupci(dodatak.popust) }),
      })
      .returning({ id: prijave.id });
    await tx
      .insert(polaznici)
      .values(p.polaznici.map((pl) => ({ prijavaId: row.id, ime: pl.ime, radnoMjesto: pl.radnoMjesto })));
    return row.id;
  });
}

export type IzmjenaPrijave = Omit<NovaPrijava, "seminarSlug" | "seminarTitle">;

// Uređivanje iz admina: podaci + polaznici se zamjenjuju u jednoj transakciji.
export async function azurirajPrijavu(id: number, p: IzmjenaPrijave): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(prijave)
      .set({
        kontaktIme: p.kontaktIme,
        email: p.email,
        telefon: p.telefon,
        organizacija: p.organizacija,
        adresa: p.adresa,
        oib: p.oib,
        napomena: p.napomena,
      })
      .where(eq(prijave.id, id));
    await tx.delete(polaznici).where(eq(polaznici.prijavaId, id));
    await tx
      .insert(polaznici)
      .values(p.polaznici.map((pl) => ({ prijavaId: id, ime: pl.ime, radnoMjesto: pl.radnoMjesto })));
  });
}

function popustStupci(popust: Popust | null) {
  return {
    popustTip: popust?.tip ?? null,
    popustVrijednost: popust ? popust.vrijednost.toFixed(2) : null,
    popustOpis: popust?.opis ?? null,
  };
}

// Popust vrijedi za sljedeću izdanu ponudu; već izdane ponude se ne mijenjaju.
export async function spremiPopust(id: number, popust: Popust | null): Promise<void> {
  await db.update(prijave).set(popustStupci(popust)).where(eq(prijave.id, id));
}

// Povlačenje privole za obavijesti (na zahtjev kontakt osobe). Verzija ostaje radi evidencije.
export async function povuciPrivoluObavijesti(id: number): Promise<void> {
  await db
    .update(prijave)
    .set({ privolaObavijestiAt: null, privolaPovucenaAt: new Date() })
    .where(eq(prijave.id, id));
}

// Prazan string briše broj narudžbenice.
export async function spremiBrojNarudzbenice(id: number, broj: string | null): Promise<void> {
  await db.update(prijave).set({ brojNarudzbenice: broj }).where(eq(prijave.id, id));
}
