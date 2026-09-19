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
  if (!/^\d+$/.test(sredina)) return { greska: "Srednji dio broja ponude mora biti broj (npr. 112)." };
  if (!Number.isInteger(dani) || dani < 0 || dani > 60) return { greska: "Dani valjanosti: cijeli broj 0–60." };
  if (!potpisnik) return { greska: "Potpisnik je obavezan." };
  await setPostavke({ brojPonudeSredina: sredina, daniValjanosti: dani, potpisnik });
  revalidatePath("/admin/postavke");
  return { poruka: "Postavke spremljene. Vrijede za sve sljedeće ponude." };
}
