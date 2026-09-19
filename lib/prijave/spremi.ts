import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, prijave } from "@/lib/db/schema";

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

// tx1: prijava + polaznici zajedno ili ništa.
export async function spremiPrijavu(p: NovaPrijava): Promise<number> {
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
