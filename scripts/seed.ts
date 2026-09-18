import { db } from "../lib/db";
import { postavke } from "../lib/db/schema";

const pocetne = [
  { kljuc: "broj_ponude_sredina", vrijednost: "112" },
  { kljuc: "dani_valjanosti", vrijednost: "2" },
  { kljuc: "potpisnik", vrijednost: "Milada Sofka, voditeljica ureda" },
];

async function main() {
  await db.insert(postavke).values(pocetne).onConflictDoNothing();
  const rows = await db.select().from(postavke);
  console.log(rows);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
