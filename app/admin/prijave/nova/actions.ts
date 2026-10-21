"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { aktualnaCijena, getSeminar } from "@/lib/edukacije";
import { procitajPodatkePrijave } from "@/lib/prijave/admin-forma";
import { spremiPrijavu } from "@/lib/prijave/spremi";
import { izdajPonudu } from "@/lib/ponude/izdaj";
import { izracunajPonudu, procitajPopust } from "@/lib/ponude/popust";

export type NovaPrijavaState = { greska?: string };

// Ručni unos prijave (klijent se javio telefonom/mailom). Bez privole za obavijesti -
// nju može dati samo kontakt osoba. "izdaj" odmah izdaje ponudu i šalje je klijentu.
export async function spremiNovuPrijavu(_prev: NovaPrijavaState, formData: FormData): Promise<NovaPrijavaState> {
  await zahtijevajAdmina();
  const seminar = await getSeminar(String(formData.get("slug") ?? ""), { skrivene: true });
  if (!seminar) return { greska: "Odaberi edukaciju." };
  const podaci = procitajPodatkePrijave(formData);
  if ("greska" in podaci) return { greska: podaci.greska };
  const popust = procitajPopust(formData);
  if ("greska" in popust) return { greska: popust.greska };

  // Provjera prije spremanja: popust veći od ponude inače bi ostavio prijavu bez ponude.
  if (popust.popust && seminar.ponuda) {
    const cijena = aktualnaCijena(seminar).cijena ?? seminar.ponuda.cijena;
    try {
      izracunajPonudu(podaci.podaci.polaznici.length, cijena, popust.popust);
    } catch (e) {
      return { greska: e instanceof Error ? e.message : String(e) };
    }
  }

  const prijavaId = await spremiPrijavu(
    { ...podaci.podaci, seminarSlug: seminar.slug, seminarTitle: seminar.title },
    null,
    { izvor: "admin", popust: popust.popust },
  );
  // Neuspjelo izdavanje se zapisuje na ponudu i vidi na detalju prijave (Pokušaj ponovno).
  if (formData.get("akcija") === "izdaj" && seminar.ponuda) await izdajPonudu(prijavaId);

  revalidatePath("/admin/prijave");
  redirect(`/admin/prijave/${prijavaId}`);
}
