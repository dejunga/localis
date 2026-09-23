import { createHash } from "node:crypto";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { rateLimitPokusaji } from "@/lib/db/schema";

export type Limit = { kljuc: string; max: number; prozorMs: number };

// Koliko dugo čuvamo pokušaje - mora biti >= najdulji prozor u upotrebi.
const ZADRZAVANJE_MS = 24 * 60 * 60 * 1000;

// Na Vercelu x-forwarded-for postavlja platforma (klijent ga ne može podmetnuti);
// prva adresa u listi je stvarni klijent.
export function ipIzZaglavlja(h: Pick<Headers, "get">): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || "nepoznato";
}

// IP i email ne spremamo u čistom obliku - dovoljan je hash za usporedbu.
export function hashKljuca(vrijednost: string): string {
  return createHash("sha256").update(vrijednost.toLowerCase()).digest("hex").slice(0, 32);
}

export async function hashiraniIp(): Promise<string> {
  return hashKljuca(ipIzZaglavlja(await headers()));
}

/**
 * Bilježi pokušaj pod svim ključevima i vraća false ako je bilo koji limit već dosegnut
 * (tada se ništa ne bilježi). Ako baza ne radi, propušta - prijava ima vlastiti fallback
 * na interni mail i ne želimo zbog limitera odbiti stvarne korisnike.
 */
export async function dopustiPokusaj(limiti: Limit[]): Promise<boolean> {
  try {
    return await db.transaction(async (tx) => {
      // Serijaliziraj paralelne zahtjeve s istim ključem, inače bi svi prošli count prije inserta.
      for (const l of [...limiti].sort((a, b) => a.kljuc.localeCompare(b.kljuc))) {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${l.kljuc}))`);
      }

      await tx
        .delete(rateLimitPokusaji)
        .where(lt(rateLimitPokusaji.createdAt, new Date(Date.now() - ZADRZAVANJE_MS)));

      for (const l of limiti) {
        const [{ n }] = await tx
          .select({ n: count() })
          .from(rateLimitPokusaji)
          .where(
            and(
              eq(rateLimitPokusaji.kljuc, l.kljuc),
              gte(rateLimitPokusaji.createdAt, new Date(Date.now() - l.prozorMs)),
            ),
          );
        if (n >= l.max) return false;
      }

      await tx.insert(rateLimitPokusaji).values(limiti.map((l) => ({ kljuc: l.kljuc })));
      return true;
    });
  } catch (error) {
    console.error("Rate limit: provjera nije uspjela, zahtjev propušten.", error);
    return true;
  }
}
