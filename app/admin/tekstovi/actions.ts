"use server";

import { revalidatePath } from "next/cache";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { MAX_DULJINA_TEKSTA, jeKljucTeksta, spremiTekstove } from "@/lib/tekstovi";

export type TekstoviState = { poruka?: string; greska?: string };

// Svaka grupa (stranica) ima svoju formu - spremaju se samo polja iz poslane forme.
export async function spremiTekstoveAkcija(_prev: TekstoviState, formData: FormData): Promise<TekstoviState> {
  await zahtijevajAdmina();
  const unosi = new Map<string, string>();
  for (const [kljuc, vrijednost] of formData) {
    if (typeof vrijednost !== "string" || !jeKljucTeksta(kljuc)) continue;
    if (vrijednost.length > MAX_DULJINA_TEKSTA) {
      return { greska: `Tekst je predug (najviše ${MAX_DULJINA_TEKSTA} znakova po polju).` };
    }
    unosi.set(kljuc, vrijednost);
  }
  if (unosi.size === 0) return { greska: "Nema polja za spremanje." };
  await spremiTekstove(unosi);
  // Isti tekst (npr. okvir s kontaktom) stoji na više stranica - osvježi cijeli site.
  revalidatePath("/", "layout");
  return { poruka: "Spremljeno. Promjene su odmah vidljive na stranici." };
}
