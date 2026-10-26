"use server";

import { revalidatePath } from "next/cache";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { procitajPodatkePrijave } from "@/lib/prijave/admin-forma";
import {
  azurirajPrijavu,
  povuciPrivoluObavijesti,
  spremiBrojNarudzbenice,
  spremiDatumPlacanja,
  spremiPlaceno,
  spremiPopust,
} from "@/lib/prijave/spremi";
import { procitajPopust } from "@/lib/ponude/popust";
import { danasZagreb } from "@/lib/ponude/datumi";
import { dovrsiPonudu, izdajPonudu, ponovnoPosaljiMail, stornirajPonudu } from "@/lib/ponude/izdaj";

export type AdminAkcijaState = { poruka?: string; greska?: string };

function osvjezi(prijavaId: number) {
  revalidatePath(`/admin/prijave/${prijavaId}`);
  revalidatePath("/admin/prijave");
}

export async function spremiIzmjene(
  prijavaId: number,
  _prev: AdminAkcijaState,
  formData: FormData,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const r = procitajPodatkePrijave(formData);
  if ("greska" in r) return { greska: r.greska };
  await azurirajPrijavu(prijavaId, r.podaci);
  osvjezi(prijavaId);
  return { poruka: "Izmjene spremljene. Postojeća ponuda NIJE promijenjena - storniraj je i izdaj novu." };
}

export async function spremiNarudzbenicu(
  prijavaId: number,
  _prev: AdminAkcijaState,
  formData: FormData,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const broj = String(formData.get("brojNarudzbenice") ?? "").trim();
  if (broj.length > 100) return { greska: "Broj narudžbenice je predug." };
  await spremiBrojNarudzbenice(prijavaId, broj || null);
  osvjezi(prijavaId);
  return { poruka: broj ? "Broj narudžbenice spremljen." : "Broj narudžbenice obrisan." };
}

export async function spremiPopustAkcija(
  prijavaId: number,
  _prev: AdminAkcijaState,
  formData: FormData,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const r = procitajPopust(formData);
  if ("greska" in r) return { greska: r.greska };
  await spremiPopust(prijavaId, r.popust);
  osvjezi(prijavaId);
  return {
    poruka: r.popust
      ? "Popust spremljen. Vrijedi za sljedeću ponudu - postojeću storniraj i izdaj novu."
      : "Popust uklonjen.",
  };
}

export async function oznaciPlaceno(prijavaId: number, placeno: boolean): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  await spremiPlaceno(prijavaId, placeno);
  osvjezi(prijavaId);
  return {};
}

export async function spremiDatumPlacanjaAkcija(
  prijavaId: number,
  _prev: AdminAkcijaState,
  formData: FormData,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const datum = String(formData.get("datumPlacanja") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || Number.isNaN(Date.parse(datum))) {
    return { greska: "Upiši ispravan datum plaćanja." };
  }
  if (datum > danasZagreb()) return { greska: "Datum plaćanja ne može biti u budućnosti." };
  await spremiDatumPlacanja(prijavaId, datum);
  osvjezi(prijavaId);
  return { poruka: "Datum plaćanja spremljen." };
}

export async function povuciPrivolu(prijavaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  await povuciPrivoluObavijesti(prijavaId);
  osvjezi(prijavaId);
  return { poruka: "Privola za obavijesti povučena." };
}

export async function storniraj(
  prijavaId: number,
  ponudaId: number,
  obavijesti: boolean,
): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  try {
    await stornirajPonudu(ponudaId, obavijesti);
    osvjezi(prijavaId);
    return { poruka: "Ponuda stornirana." };
  } catch (e) {
    return { greska: e instanceof Error ? e.message : String(e) };
  }
}

export async function izdajNovu(prijavaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const r = await izdajPonudu(prijavaId);
  osvjezi(prijavaId);
  return r.ok ? { poruka: "Nova ponuda izdana i poslana." } : { greska: `Ponuda nije dovršena: ${r.greska}` };
}

export async function pokusajPonovno(prijavaId: number, ponudaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  const r = await dovrsiPonudu(ponudaId);
  osvjezi(prijavaId);
  return r.ok ? { poruka: "Ponuda dovršena i poslana." } : { greska: r.greska };
}

export async function posaljiMailPonovno(prijavaId: number, ponudaId: number): Promise<AdminAkcijaState> {
  await zahtijevajAdmina();
  try {
    await ponovnoPosaljiMail(ponudaId);
    osvjezi(prijavaId);
    return { poruka: "Mail ponovno poslan." };
  } catch (e) {
    return { greska: e instanceof Error ? e.message : String(e) };
  }
}
