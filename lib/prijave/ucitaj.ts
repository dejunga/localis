import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { polaznici, ponude, prijave, type Polaznik, type Ponuda, type Prijava } from "@/lib/db/schema";

export type PrijavaDetalji = Prijava & { polaznici: Polaznik[]; ponude: Ponuda[] };

export async function ucitajPrijavu(id: number): Promise<PrijavaDetalji | null> {
  const [p] = await db.select().from(prijave).where(eq(prijave.id, id));
  if (!p) return null;
  const [pol, pon] = await Promise.all([
    db.select().from(polaznici).where(eq(polaznici.prijavaId, id)).orderBy(polaznici.id),
    db.select().from(ponude).where(eq(ponude.prijavaId, id)).orderBy(desc(ponude.id)),
  ]);
  return { ...p, polaznici: pol, ponude: pon };
}

export type PrijavaRed = Prijava & { brojPolaznika: number; zadnjaPonuda: Ponuda | null };

export async function ucitajPrijave(filter?: {
  seminarSlug?: string;
  status?: Prijava["status"];
}): Promise<PrijavaRed[]> {
  const rows = await db.query.prijave.findMany({
    where: (t, { and, eq: e }) =>
      and(
        filter?.seminarSlug ? e(t.seminarSlug, filter.seminarSlug) : undefined,
        filter?.status ? e(t.status, filter.status) : undefined,
      ),
    orderBy: (t, { desc: d }) => [d(t.createdAt)],
    with: { polaznici: true, ponude: { orderBy: (t, { desc: d }) => [d(t.id)], limit: 1 } },
  });
  return rows.map((r) => ({
    ...r,
    brojPolaznika: r.polaznici.length,
    zadnjaPonuda: r.ponude[0] ?? null,
  }));
}
