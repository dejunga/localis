"use server";

import { revalidatePath } from "next/cache";
import { head } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { upitniciMaterijali, upitniciOdgovori, upitniciSlanja } from "@/lib/db/schema";
import { getSeminar } from "@/lib/edukacije";
import { obrisiMaterijal } from "@/lib/upitnici/materijali";
import { edukacijaZavrsila } from "@/lib/upitnici/rok";
import { danasZagreb, getSlanje, posaljiProbni, posaljiZaEdukaciju } from "@/lib/upitnici/slanje";

export type BrisanjeState = { greska?: string };
export type AkcijaState = { greska?: string; poruka?: string };

function osvjezi(slug: string) {
  revalidatePath(`/admin/upitnici/${slug}`);
  revalidatePath("/admin/upitnici");
}

// Upis materijala nakon što ga preglednik uploada u Blob. Veličina i tip čitaju se iz Bloba, ne s klijenta.
export async function spremiMaterijal(slug: string, url: string, naziv: string): Promise<AkcijaState> {
  await zahtijevajAdmina();
  try {
    const blob = await head(url);
    if (!blob.pathname.startsWith(`materijali/${slug}/`)) return { greska: "Neispravna datoteka." };
    await db.insert(upitniciMaterijali).values({
      seminarSlug: slug,
      naziv: naziv.trim().slice(0, 200) || "datoteka",
      blobUrl: blob.url,
      pathname: blob.pathname,
      velicina: blob.size,
      contentType: blob.contentType,
    });
  } catch (error) {
    console.error(`Materijali ${slug}: upis nije uspio.`, error);
    return { greska: "Datoteka je uploadana, ali nije upisana. Pokušajte ponovno." };
  }
  osvjezi(slug);
  return {};
}

export async function obrisiMaterijalAkcija(id: number, slug: string): Promise<AkcijaState> {
  await zahtijevajAdmina();
  try {
    await obrisiMaterijal(id, slug);
  } catch (error) {
    console.error(`Materijali ${slug}: brisanje ${id} nije uspjelo.`, error);
    return { greska: "Brisanje nije uspjelo." };
  }
  osvjezi(slug);
  return {};
}

async function postaviDatum(slug: string, datum: string | null) {
  await db
    .insert(upitniciSlanja)
    .values({ seminarSlug: slug, datumSlanja: datum })
    .onConflictDoUpdate({ target: upitniciSlanja.seminarSlug, set: { datumSlanja: datum, updatedAt: new Date() } });
}

// Prazno = ukloni termin (mail neće otići).
export async function spremiDatumSlanja(slug: string, datum: string): Promise<AkcijaState> {
  await zahtijevajAdmina();
  if (datum && !/^\d{4}-\d{2}-\d{2}$/.test(datum)) return { greska: "Neispravan datum." };
  if (datum && datum < danasZagreb(new Date())) return { greska: "Datum slanja ne može biti u prošlosti." };
  try {
    await postaviDatum(slug, datum || null);
  } catch (error) {
    console.error(`Upitnik ${slug}: datum slanja nije spremljen.`, error);
    return { greska: "Spremanje nije uspjelo." };
  }
  osvjezi(slug);
  return { poruka: datum ? "Termin je spremljen." : "Termin je uklonjen." };
}

export async function posaljiProbniAkcija(slug: string): Promise<AkcijaState> {
  await zahtijevajAdmina();
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar) return { greska: "Edukacija ne postoji." };
  try {
    const na = await posaljiProbni(seminar, (await getSlanje(slug)) ?? danasZagreb(new Date()));
    return { poruka: `Probni mail poslan na ${na}.` };
  } catch (error) {
    console.error(`Upitnik ${slug}: probni mail nije poslan.`, error);
    return { greska: "Probni mail nije poslan." };
  }
}

// Termin postaje danas, pa rok upitnika (96 h) vrijedi od ovog slanja.
export async function posaljiSadaAkcija(slug: string): Promise<AkcijaState> {
  await zahtijevajAdmina();
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar || seminar.odgodeno) return { greska: "Edukacija ne postoji ili je odgođena." };
  if (!edukacijaZavrsila(seminar)) return { greska: "Edukacija još nije završila." };
  const danas = danasZagreb(new Date());
  try {
    await postaviDatum(slug, danas);
    const r = await posaljiZaEdukaciju(seminar, danas);
    osvjezi(slug);
    if (r.poslano === 0 && r.greske === 0) return { poruka: "Nema novih primatelja - svi su mail već dobili." };
    return r.greske > 0
      ? { greska: `Poslano ${r.poslano}, greške: ${r.greske}. Ponovni klik šalje samo neuspjele.` }
      : { poruka: `Poslano ${r.poslano}.` };
  } catch (error) {
    console.error(`Upitnik ${slug}: slanje nije uspjelo.`, error);
    osvjezi(slug);
    return { greska: "Slanje nije uspjelo." };
  }
}

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
