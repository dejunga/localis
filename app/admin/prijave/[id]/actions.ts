"use server";

import { revalidatePath } from "next/cache";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { azurirajPrijavu } from "@/lib/prijave/spremi";
import { dovrsiPonudu, izdajPonudu, ponovnoPosaljiMail, stornirajPonudu } from "@/lib/ponude/izdaj";

export type AdminAkcijaState = { poruka?: string; greska?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OIB_RE = /^\d{11}$/;

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
  const imena = formData.getAll("polaznik_ime").map((v) => String(v).trim());
  const radna = formData.getAll("polaznik_radno_mjesto").map((v) => String(v).trim());
  const polaznici = imena
    .map((ime, i) => ({ ime, radnoMjesto: radna[i] ?? "" }))
    .filter((p) => p.ime || p.radnoMjesto);
  const p = {
    kontaktIme: String(formData.get("kontaktIme") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telefon: String(formData.get("telefon") ?? "").trim(),
    organizacija: String(formData.get("organizacija") ?? "").trim(),
    adresa: String(formData.get("adresa") ?? "").trim(),
    oib: String(formData.get("oib") ?? "").trim(),
    napomena: String(formData.get("napomena") ?? "").trim() || null,
    polaznici,
  };
  if (!p.kontaktIme || !p.organizacija || !p.adresa || !p.telefon) {
    return { greska: "Sva polja osim napomene su obavezna." };
  }
  if (!EMAIL_RE.test(p.email)) return { greska: "Neispravan email." };
  if (!OIB_RE.test(p.oib)) return { greska: "OIB mora imati 11 znamenaka." };
  if (polaznici.length === 0 || polaznici.some((x) => !x.ime || !x.radnoMjesto)) {
    return { greska: "Svaki polaznik treba ime i radno mjesto." };
  }
  await azurirajPrijavu(prijavaId, p);
  osvjezi(prijavaId);
  return { poruka: "Izmjene spremljene. Postojeća ponuda NIJE promijenjena - storniraj je i izdaj novu." };
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
