"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { upitniciOdgovori } from "@/lib/db/schema";

export type BrisanjeState = { greska?: string };

// Trajno brisanje odgovora (spam, testni odgovori, GDPR zahtjev za brisanje).
export async function obrisiOdgovor(id: number, slug: string): Promise<BrisanjeState> {
  await zahtijevajAdmina();
  if (!Number.isInteger(id) || id <= 0) return { greska: "Neispravan odgovor." };
  try {
    await db
      .delete(upitniciOdgovori)
      .where(and(eq(upitniciOdgovori.id, id), eq(upitniciOdgovori.seminarSlug, slug)));
  } catch (error) {
    console.error(`Upitnik ${slug}: brisanje odgovora ${id} nije uspjelo.`, error);
    return { greska: "Brisanje nije uspjelo." };
  }
  revalidatePath(`/admin/upitnici/${slug}`);
  revalidatePath("/admin/upitnici");
  return {};
}
