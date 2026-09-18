import { db } from "@/lib/db";
import { postavke } from "@/lib/db/schema";

export type Postavke = {
  brojPonudeSredina: string;
  daniValjanosti: number;
  potpisnik: string;
};

// Defaulti vrijede dok seed ne prođe ili ako netko obriše red.
const DEFAULTI: Postavke = {
  brojPonudeSredina: "112",
  daniValjanosti: 2,
  potpisnik: "Milada Sofka, voditeljica ureda",
};

export async function getPostavke(): Promise<Postavke> {
  const rows = await db.select().from(postavke);
  const map = new Map(rows.map((r) => [r.kljuc, r.vrijednost]));
  const dani = Number(map.get("dani_valjanosti"));
  return {
    brojPonudeSredina: map.get("broj_ponude_sredina") ?? DEFAULTI.brojPonudeSredina,
    daniValjanosti: Number.isInteger(dani) && dani >= 0 ? dani : DEFAULTI.daniValjanosti,
    potpisnik: map.get("potpisnik") ?? DEFAULTI.potpisnik,
  };
}

export async function setPostavke(nove: Postavke): Promise<void> {
  const rows = [
    { kljuc: "broj_ponude_sredina", vrijednost: nove.brojPonudeSredina },
    { kljuc: "dani_valjanosti", vrijednost: String(nove.daniValjanosti) },
    { kljuc: "potpisnik", vrijednost: nove.potpisnik },
  ];
  for (const row of rows) {
    await db
      .insert(postavke)
      .values(row)
      .onConflictDoUpdate({ target: postavke.kljuc, set: { vrijednost: row.vrijednost } });
  }
}
