import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, prijave, type Prijava } from "@/lib/db/schema";
import type { Popust } from "@/lib/ponude/popust";
import { NemaMjestaError, zauzetaMjesta } from "./mjesta";

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

// tx1: prijava + polaznici zajedno ili ništa. S maxMjesta baca NemaMjestaError ako polaznici
// ne stanu; lock po edukaciji sprječava da dvije istovremene prijave zajedno prijeđu limit.
export async function spremiPrijavu(
  p: NovaPrijava,
  privola: PrivolaObavijesti,
  dodatak?: AdminDodatak,
  maxMjesta?: number,
): Promise<number> {
  return db.transaction(async (tx) => {
    if (maxMjesta !== undefined) {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`mjesta:${p.seminarSlug}`}))`);
      const slobodno = Math.max(0, maxMjesta - (await zauzetaMjesta(p.seminarSlug, tx)));
      if (p.polaznici.length > slobodno) throw new NemaMjestaError(slobodno);
    }
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

// Označavanje ne dira datum plaćanja - admin ga upisuje ručno. Odznačavanje ga briše.
export async function spremiPlaceno(id: number, placeno: boolean): Promise<void> {
  await db
    .update(prijave)
    .set(placeno ? { placeno } : { placeno, datumPlacanja: null })
    .where(eq(prijave.id, id));
}

// Ispravak datuma (npr. uplata stigla ranije nego što je označena). Datum = "YYYY-MM-DD".
export async function spremiDatumPlacanja(id: number, datum: string): Promise<void> {
  await db.update(prijave).set({ placeno: true, datumPlacanja: datum }).where(eq(prijave.id, id));
}

// Prazan string briše broj narudžbenice.
export async function spremiBrojNarudzbenice(id: number, broj: string | null): Promise<void> {
  await db.update(prijave).set({ brojNarudzbenice: broj }).where(eq(prijave.id, id));
}
