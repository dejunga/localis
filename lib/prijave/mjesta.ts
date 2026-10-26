import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, prijave } from "@/lib/db/schema";

type Izvrsitelj = Pick<typeof db, "select">;

// Mjesto zauzima svaki polaznik prijave koja nije stornirana (nova ili s poslanom ponudom).
export async function zauzetaMjesta(seminarSlug: string, izvrsitelj: Izvrsitelj = db): Promise<number> {
  const [r] = await izvrsitelj
    .select({ broj: count() })
    .from(polaznici)
    .innerJoin(prijave, eq(polaznici.prijavaId, prijave.id))
    .where(and(eq(prijave.seminarSlug, seminarSlug), ne(prijave.status, "stornirana")));
  return r?.broj ?? 0;
}

// Za admin: zauzeta mjesta svih edukacija odjednom.
export async function zauzetaMjestaPoEdukaciji(): Promise<Map<string, number>> {
  const rows = await db
    .select({ slug: prijave.seminarSlug, broj: count() })
    .from(polaznici)
    .innerJoin(prijave, eq(polaznici.prijavaId, prijave.id))
    .where(ne(prijave.status, "stornirana"))
    .groupBy(prijave.seminarSlug);
  return new Map(rows.map((r) => [r.slug, r.broj]));
}

// Baca spremiPrijavu kad nova prijava ne stane u preostala mjesta.
export class NemaMjestaError extends Error {
  constructor(public readonly slobodno: number) {
    super(slobodno > 0 ? `Slobodnih mjesta: ${slobodno}.` : "Sva mjesta su popunjena.");
  }
}
