import { eq, sql } from "drizzle-orm";
import { db, type Tx } from "@/lib/db";
import { brojacPonuda, ponude, prijave, type Ponuda } from "@/lib/db/schema";
import { getSeminar, type Seminar } from "@/lib/edukacije";
import { getPostavke } from "@/lib/postavke";
import { ucitajPrijavu, type PrijavaDetalji } from "@/lib/prijave/ucitaj";
import { downloadPonudaPdf, uploadPonudaPdf } from "./blob";
import { danasZagreb, izracunajDatumePonude } from "./datumi";
import {
  posaljiInterniMail,
  posaljiPonuduKlijentu,
  posaljiStornoKlijentu,
  type InterniMailInput,
  type MailKlijentuInput,
} from "./email";
import { nazivDatotekePonude, sastaviBrojPonude } from "./format";
import { renderPonudaPdf, type PonudaPdfData } from "./pdf";

type SeminarSPonudom = Seminar & { ponuda: NonNullable<Seminar["ponuda"]> };

// INSERT ... ON CONFLICT DO UPDATE je atomaran - dvije paralelne transakcije nikad ne dobiju isti broj.
export async function sljedeciRedniBroj(tx: Tx, godina: number): Promise<number> {
  const [row] = await tx
    .insert(brojacPonuda)
    .values({ godina, zadnjiBroj: 1 })
    .onConflictDoUpdate({
      target: brojacPonuda.godina,
      set: { zadnjiBroj: sql`${brojacPonuda.zadnjiBroj} + 1` },
    })
    .returning({ zadnjiBroj: brojacPonuda.zadnjiBroj });
  return row.zadnjiBroj;
}

async function seminarSPonudom(slug: string): Promise<SeminarSPonudom> {
  const seminar = await getSeminar(slug);
  if (!seminar?.ponuda) throw new Error(`Edukacija "${slug}" nema definiran blok ponuda.`);
  return seminar as SeminarSPonudom;
}

// tx2: brojač + insert ponude u statusu "greska". Vraća id ponude.
export async function kreirajPonudu(prijavaId: number): Promise<number> {
  const prijava = await ucitajPrijavu(prijavaId);
  if (!prijava) throw new Error(`Prijava ${prijavaId} ne postoji.`);
  if (prijava.ponude.some((p) => p.status === "poslana" || p.status === "greska")) {
    throw new Error("Prijava već ima aktivnu ponudu - prvo je storniraj.");
  }
  const seminar = await seminarSPonudom(prijava.seminarSlug);
  const postavke = await getPostavke();

  const danas = danasZagreb();
  const godina = Number(danas.slice(0, 4));
  const datumi = izracunajDatumePonude({
    danas,
    daniValjanosti: postavke.daniValjanosti,
    datumEdukacije: seminar.date,
  });
  const kolicina = prijava.polaznici.length;
  const cijena = seminar.ponuda.cijena;
  const ukupno = kolicina * cijena;

  return db.transaction(async (tx) => {
    const redniBroj = await sljedeciRedniBroj(tx, godina);
    const [row] = await tx
      .insert(ponude)
      .values({
        prijavaId,
        redniBroj,
        godina,
        broj: sastaviBrojPonude(redniBroj, postavke.brojPonudeSredina, godina),
        datumIzdavanja: datumi.datumIzdavanja,
        vrijediDo: datumi.vrijediDo,
        rokPlacanja: datumi.rokPlacanja,
        kolicina,
        cijena: cijena.toFixed(2),
        ukupno: ukupno.toFixed(2),
        status: "greska",
      })
      .returning({ id: ponude.id });
    return row.id;
  });
}

function pdfPodaci(
  prijava: PrijavaDetalji,
  ponuda: Ponuda,
  seminar: SeminarSPonudom,
  potpisnik: string,
): PonudaPdfData {
  return {
    broj: ponuda.broj,
    datumIzdavanja: ponuda.datumIzdavanja,
    vrijediDo: ponuda.vrijediDo,
    rokPlacanja: ponuda.rokPlacanja,
    klijent: {
      naziv: prijava.organizacija,
      adresa: prijava.adresa,
      oib: prijava.oib,
      kontakt: prijava.kontaktIme,
      telefon: prijava.telefon,
      email: prijava.email,
    },
    edukacija: {
      kicker: seminar.kicker,
      naslov: seminar.title,
      predavac: seminar.ponuda.predavac,
      datumLabel: seminar.dateLabel,
      mjesto: seminar.ponuda.mjesto,
      ukljuceno: seminar.ponuda.ukljuceno,
      nazivStavke: seminar.ponuda.nazivStavke ?? `${seminar.kicker} – ${seminar.title}`,
    },
    polaznici: prijava.polaznici.map((p) => ({ ime: p.ime, radnoMjesto: p.radnoMjesto })),
    kolicina: ponuda.kolicina,
    cijena: Number(ponuda.cijena),
    ukupno: Number(ponuda.ukupno),
    potpisnik,
  };
}

function mailKlijentuInput(
  prijava: PrijavaDetalji,
  ponuda: Ponuda,
  seminar: SeminarSPonudom,
  potpisnik: string,
): MailKlijentuInput {
  return {
    kontaktIme: prijava.kontaktIme,
    naslov: seminar.title,
    datumLabel: seminar.dateLabel,
    mjesto: seminar.ponuda.mjesto,
    broj: ponuda.broj,
    rokPlacanja: ponuda.rokPlacanja,
    polaznici: prijava.polaznici.map((p) => ({ ime: p.ime, radnoMjesto: p.radnoMjesto })),
    potpisnik,
  };
}

export function interniInput(prijava: PrijavaDetalji): InterniMailInput {
  return {
    seminarTitle: prijava.seminarTitle,
    kontaktIme: prijava.kontaktIme,
    email: prijava.email,
    telefon: prijava.telefon,
    organizacija: prijava.organizacija,
    adresa: prijava.adresa,
    oib: prijava.oib,
    napomena: prijava.napomena,
    polaznici: prijava.polaznici.map((p) => ({ ime: p.ime, radnoMjesto: p.radnoMjesto })),
    prijavaId: prijava.id,
    ponuda: null,
  };
}

async function interniMailBezRusenja(input: InterniMailInput, privitak?: { filename: string; content: Buffer }) {
  try {
    await posaljiInterniMail(input, privitak);
  } catch (e) {
    console.error("Interni mail nije poslan.", e);
  }
}

export type DovrsiRezultat = { ok: true } | { ok: false; greska: string };

// PDF -> Blob -> mail klijentu -> statusi -> interni mail. Idempotentno: može se ponoviti za ponudu u "greska".
export async function dovrsiPonudu(ponudaId: number): Promise<DovrsiRezultat> {
  const [ponuda] = await db.select().from(ponude).where(eq(ponude.id, ponudaId));
  if (!ponuda) return { ok: false, greska: `Ponuda ${ponudaId} ne postoji.` };
  if (ponuda.status === "stornirana") return { ok: false, greska: "Ponuda je stornirana." };

  const prijava = await ucitajPrijavu(ponuda.prijavaId);
  if (!prijava) return { ok: false, greska: "Prijava ne postoji." };

  try {
    const seminar = await seminarSPonudom(prijava.seminarSlug);
    const postavke = await getPostavke();
    const filename = nazivDatotekePonude(ponuda.broj, prijava.organizacija);

    const pdf = await renderPonudaPdf(pdfPodaci(prijava, ponuda, seminar, postavke.potpisnik));
    const pdfUrl = ponuda.pdfUrl ?? (await uploadPonudaPdf(filename, pdf));
    await db.update(ponude).set({ pdfUrl }).where(eq(ponude.id, ponudaId));

    await posaljiPonuduKlijentu(
      prijava.email,
      mailKlijentuInput(prijava, ponuda, seminar, postavke.potpisnik),
      { filename, content: pdf },
    );

    await db.transaction(async (tx) => {
      await tx
        .update(ponude)
        .set({ status: "poslana", emailPoslanAt: new Date(), greska: null })
        .where(eq(ponude.id, ponudaId));
      await tx.update(prijave).set({ status: "ponuda_poslana" }).where(eq(prijave.id, prijava.id));
    });

    // Interni mail ne smije srušiti tok - klijent je već dobio ponudu.
    await interniMailBezRusenja(
      { ...interniInput(prijava), ponuda: { broj: ponuda.broj, ukupno: ponuda.ukupno } },
      { filename, content: pdf },
    );
    return { ok: true };
  } catch (e) {
    const greska = e instanceof Error ? e.message : String(e);
    console.error(`Ponuda ${ponudaId}: dovršavanje nije uspjelo.`, e);
    await db.update(ponude).set({ status: "greska", greska }).where(eq(ponude.id, ponudaId));
    return { ok: false, greska };
  }
}

// Puni tok za novu prijavu. Nikad ne baca - greška se vraća i zapisuje.
export async function izdajPonudu(prijavaId: number): Promise<DovrsiRezultat & { ponudaId?: number }> {
  let ponudaId: number;
  try {
    ponudaId = await kreirajPonudu(prijavaId);
  } catch (e) {
    const greska = e instanceof Error ? e.message : String(e);
    console.error(`Prijava ${prijavaId}: kreiranje ponude nije uspjelo.`, e);
    const prijava = await ucitajPrijavu(prijavaId);
    if (prijava) await interniMailBezRusenja({ ...interniInput(prijava), greska });
    return { ok: false, greska };
  }
  const rezultat = await dovrsiPonudu(ponudaId);
  if (!rezultat.ok) {
    const prijava = await ucitajPrijavu(prijavaId);
    if (prijava) await interniMailBezRusenja({ ...interniInput(prijava), greska: rezultat.greska });
  }
  return { ...rezultat, ponudaId };
}

export async function stornirajPonudu(ponudaId: number, obavijestiKlijenta: boolean): Promise<void> {
  const [ponuda] = await db.select().from(ponude).where(eq(ponude.id, ponudaId));
  if (!ponuda) throw new Error("Ponuda ne postoji.");
  if (ponuda.status === "stornirana") return;
  const bilaPoslana = ponuda.status === "poslana";
  await db.transaction(async (tx) => {
    await tx
      .update(ponude)
      .set({ status: "stornirana", storniranaAt: new Date() })
      .where(eq(ponude.id, ponudaId));
    await tx.update(prijave).set({ status: "stornirana" }).where(eq(prijave.id, ponuda.prijavaId));
  });
  if (obavijestiKlijenta && bilaPoslana) {
    const prijava = await ucitajPrijavu(ponuda.prijavaId);
    const postavke = await getPostavke();
    if (prijava) await posaljiStornoKlijentu(prijava.email, ponuda.broj, postavke.potpisnik);
  }
}

// Ponovno slanje maila s postojećim PDF-om (bez novog renderiranja).
export async function ponovnoPosaljiMail(ponudaId: number): Promise<void> {
  const [ponuda] = await db.select().from(ponude).where(eq(ponude.id, ponudaId));
  if (!ponuda || ponuda.status !== "poslana" || !ponuda.pdfUrl) {
    throw new Error("Mail se može ponovno poslati samo za poslanu ponudu s PDF-om.");
  }
  const prijava = await ucitajPrijavu(ponuda.prijavaId);
  if (!prijava) throw new Error("Prijava ne postoji.");
  const seminar = await seminarSPonudom(prijava.seminarSlug);
  const postavke = await getPostavke();
  const pdf = await downloadPonudaPdf(ponuda.pdfUrl);
  await posaljiPonuduKlijentu(prijava.email, mailKlijentuInput(prijava, ponuda, seminar, postavke.potpisnik), {
    filename: nazivDatotekePonude(ponuda.broj, prijava.organizacija),
    content: pdf,
  });
  await db.update(ponude).set({ emailPoslanAt: new Date() }).where(eq(ponude.id, ponudaId));
}
