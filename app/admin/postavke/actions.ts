"use server";

import { revalidatePath } from "next/cache";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { setPostavke } from "@/lib/postavke";

export type PostavkeState = { poruka?: string; greska?: string };

export async function spremiPostavke(_prev: PostavkeState, formData: FormData): Promise<PostavkeState> {
  await zahtijevajAdmina();
  const sredina = String(formData.get("brojPonudeSredina") ?? "").trim();
  const dani = Number(formData.get("daniValjanosti"));
  const potpisnik = String(formData.get("potpisnik") ?? "").trim();
  const maxMjesta = Number(formData.get("maxMjesta"));
  if (!/^\d+$/.test(sredina)) return { greska: "Srednji dio broja ponude mora biti broj (npr. 112)." };
  if (!Number.isInteger(dani) || dani < 0 || dani > 60) return { greska: "Radni dani valjanosti: cijeli broj 0–60." };
  if (!potpisnik) return { greska: "Potpisnik je obavezan." };
  if (!Number.isInteger(maxMjesta) || maxMjesta < 1 || maxMjesta > 500) {
    return { greska: "Broj mjesta: cijeli broj 1–500." };
  }
  await setPostavke({ brojPonudeSredina: sredina, daniValjanosti: dani, potpisnik, maxMjesta });
  revalidatePath("/admin/postavke");
  // Stranice edukacija prikazuju "popunjeno" ovisno o broju mjesta.
  revalidatePath("/edukacije/[slug]", "page");
  return { poruka: "Postavke spremljene. Vrijede za sve sljedeće ponude i prijave." };
}
