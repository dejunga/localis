import type { SendMailOptions } from "nodemailer";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { prijave, upitniciMailovi, upitniciSlanja } from "@/lib/db/schema";
import { getMailConfig, sendMail, type MailConfig } from "@/lib/email/transport";
import { getSeminars, type Seminar } from "@/lib/edukacije";
import { getTekstovi } from "@/lib/tekstovi";
import { nadolazeceEdukacije, QR_CID, renderMailNakon, type MailNakon } from "./mail-nakon";
import { getMaterijali, materijaliUrl } from "./materijali";
import { edukacijaZavrsila, rokUpitnika, stanjeUpitnika } from "./rok";

export { upitnikUrl } from "./mail-nakon";

export type KandidatPrijava = { id: number; email: string; status: "nova" | "ponuda_poslana" | "stornirana" };
export type PostojeciMail = { prijavaId: number; email: string; poslanAt: Date | null; greska: string | null };
export type RezultatSlanja = { poslano: number; greske: number };

// Cron ruta ima maxDuration 300 s; ostavi rezervu za mail koji je u tijeku.
const ROK_SLANJA_MS = 200_000;

const kljucEmaila =(email: string) => email.trim().toLowerCase();
const zaPonovnoSlanje = (m: PostojeciMail) => m.greska !== null && m.poslanAt === null;

/**
 * Kome poslati upitnik: kontakt osobe ne-storniranih prijava, jedan mail po adresi.
 * Ponovno se šalje samo gdje je SMTP javio grešku. Red bez poslanAt i bez greske
 * (mail otišao, upis pao) smatra se poslanim - radije nijedan mail nego dva.
 */
export function odaberiPrimatelje<T extends KandidatPrijava>(prijaveZaSlug: T[], postojeci: PostojeciMail[]): T[] {
  const poPrijavi = new Map(postojeci.map((m) => [m.prijavaId, m]));
  const zauzeti = new Set(postojeci.filter((m) => !zaPonovnoSlanje(m)).map((m) => kljucEmaila(m.email)));
  const odabrani: T[] = [];
  for (const p of [...prijaveZaSlug].sort((a, b) => a.id - b.id)) {
    if (p.status === "stornirana") continue;
    const red = poPrijavi.get(p.id);
    if (red && !zaPonovnoSlanje(red)) continue;
    const kljuc = kljucEmaila(p.email);
    if (zauzeti.has(kljuc)) continue;
    zauzeti.add(kljuc);
    odabrani.push(p);
  }
  return odabrani;
}

// "YYYY-MM-DD" po zagrebačkom vremenu.
export function danasZagreb(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zagreb" }).format(now);
}

/** Edukacije kojima je danas (ili ranije) termin maila, završile su i upitnik je još otvoren. */
export function edukacijeZaSlanje(seminari: Seminar[], slanja: Map<string, string>, now: Date): Seminar[] {
  const danas = danasZagreb(now);
  return seminari.filter((s) => {
    const datum = slanja.get(s.slug);
    return (
      datum !== undefined &&
      datum <= danas &&
      !s.odgodeno &&
      edukacijaZavrsila(s, now) &&
      stanjeUpitnika(s, now, datum) === "otvoren"
    );
  });
}

export async function getSlanja(): Promise<Map<string, string>> {
  const redovi = await db
    .select({ slug: upitniciSlanja.seminarSlug, datum: upitniciSlanja.datumSlanja })
    .from(upitniciSlanja)
    .where(isNotNull(upitniciSlanja.datumSlanja));
  return new Map(redovi.map((r) => [r.slug, r.datum!]));
}

export async function getSlanje(slug: string): Promise<string | null> {
  const [red] = await db
    .select({ datum: upitniciSlanja.datumSlanja })
    .from(upitniciSlanja)
    .where(eq(upitniciSlanja.seminarSlug, slug));
  return red?.datum ?? null;
}

/** Mail točno kakav odlazi - za pregled, probni mail i slanje. */
export async function pripremiMail(seminar: Seminar, datumSlanja: string | null, now = new Date()): Promise<MailNakon> {
  const [tekstovi, materijali, seminari] = await Promise.all([
    getTekstovi(),
    getMaterijali(seminar.slug),
    getSeminars(),
  ]);
  return renderMailNakon({
    seminar,
    tekstovi,
    rok: rokUpitnika(seminar, datumSlanja),
    materijaliUrl: materijali.length > 0 ? await materijaliUrl(seminar.slug) : null,
    nadolazece: nadolazeceEdukacije(seminari, now),
  });
}

function opcijeMaila(mail: MailConfig, to: string, m: MailNakon): SendMailOptions {
  return {
    from: `"LOCALIS" <${mail.user}>`,
    to,
    replyTo: `"LOCALIS" <${mail.user}>`,
    subject: m.subject,
    text: m.text,
    html: m.html,
    attachments: [{ filename: "upitnik-qr.png", content: m.qrPng, cid: QR_CID, contentType: "image/png" }],
  };
}

function trebaMailConfig(): MailConfig {
  const mail = getMailConfig();
  if (!mail) throw new Error("ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
  return mail;
}

async function kandidatiIPostojeci(slug: string) {
  const kandidati = await db
    .select({
      id: prijave.id,
      email: prijave.email,
      status: prijave.status,
      organizacija: prijave.organizacija,
      kontaktIme: prijave.kontaktIme,
    })
    .from(prijave)
    .where(eq(prijave.seminarSlug, slug));
  const postojeci: PostojeciMail[] =
    kandidati.length === 0
      ? []
      : await db
          .select({
            prijavaId: upitniciMailovi.prijavaId,
            email: upitniciMailovi.email,
            poslanAt: upitniciMailovi.poslanAt,
            greska: upitniciMailovi.greska,
          })
          .from(upitniciMailovi)
          .where(
            inArray(
              upitniciMailovi.prijavaId,
              kandidati.map((k) => k.id),
            ),
          );
  return { kandidati, postojeci };
}

export type Primatelj = { email: string; organizacija: string; kontaktIme: string };

/** Tko bi dobio mail da se sad pošalje (popis i potvrda u adminu). */
export async function getPrimatelji(slug: string): Promise<Primatelj[]> {
  const { kandidati, postojeci } = await kandidatiIPostojeci(slug);
  return odaberiPrimatelje(kandidati, postojeci).map(({ email, organizacija, kontaktIme }) => ({
    email,
    organizacija,
    kontaktIme,
  }));
}

/** Mail na internu adresu (CONTACT_TO) - ne upisuje se u upitnici_mailovi. */
export async function posaljiProbni(seminar: Seminar, datumSlanja: string | null): Promise<string> {
  const mail = trebaMailConfig();
  const m = await pripremiMail(seminar, datumSlanja);
  await sendMail(opcijeMaila(mail, mail.internalTo, { ...m, subject: `[PROBA] ${m.subject}` }));
  return mail.internalTo;
}

const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Kopija poslanog maila za LOCALIS: isti mail s popisom adresa na vrhu, kao potvrda da je otišao. */
export function kopijaZaLocalis(m: MailNakon, poslaniNa: string[], neuspjeli: string[]): MailNakon {
  const naslov = `Kopija za LOCALIS - poslano na ${poslaniNa.length} adresa${
    neuspjeli.length > 0 ? `, nije poslano na ${neuspjeli.length}` : ""
  }`;
  const popis = (oznaka: string, adrese: string[]) =>
    adrese.length === 0 ? "" : `<p style="margin:8px 0 4px"><b>${oznaka}</b></p><ol style="margin:0;padding-left:20px">${adrese
      .map((a) => `<li>${escHtml(a)}</li>`)
      .join("")}</ol>`;
  const okvir = `<div style="max-width:600px;margin:16px auto 0;padding:14px 18px;background:#fff8e6;border:1px solid #e6c36a;border-radius:8px;font:14px/1.5 Arial,Helvetica,sans-serif;color:#2b2b2b">
<p style="margin:0"><b>${escHtml(naslov)}.</b> Ispod je mail točno kakav su primatelji dobili.</p>
${popis("Poslano:", poslaniNa)}${popis("Nije poslano (greška):", neuspjeli)}
</div>`;
  const tekstPopis = [
    `${naslov}.`,
    `Poslano:\n${poslaniNa.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
    ...(neuspjeli.length > 0 ? [`Nije poslano (greška):\n${neuspjeli.map((a, i) => `${i + 1}. ${a}`).join("\n")}`] : []),
  ].join("\n\n");
  return {
    ...m,
    subject: `[POSLANO ${poslaniNa.length}] ${m.subject}`,
    html: m.html.replace(/<body([^>]*)>/, `<body$1>\n${okvir}`),
    text: `${tekstPopis}\n\n----------\n\n${m.text}`,
  };
}

/** Šalje mail svim primateljima jedne edukacije koji ga još nisu dobili. */
export async function posaljiZaEdukaciju(
  seminar: Seminar,
  datumSlanja: string | null,
  krajRada = Date.now() + ROK_SLANJA_MS,
): Promise<RezultatSlanja> {
  const mail = trebaMailConfig();
  let poslano = 0;
  let greske = 0;
  const { kandidati, postojeci } = await kandidatiIPostojeci(seminar.slug);
  const primatelji = odaberiPrimatelje(kandidati, postojeci);
  if (primatelji.length === 0) return { poslano, greske };
  const imaRed = new Set(postojeci.map((m) => m.prijavaId));
  const m = await pripremiMail(seminar, datumSlanja);
  const poslaniNa: string[] = [];
  const neuspjeli: string[] = [];

  for (const p of primatelji) {
    // Ne uzimaj nove primatelje kad se približi maxDuration - neuzeti idu sljedeći put,
    // a funkcija ugašena usred slanja ostavila bi red koji se nikad ne šalje ponovno.
    if (Date.now() > krajRada) break;
    // "Uzmi" red prije slanja: paralelni poziv ne dobije isti red i ne pošalje drugi mail.
    const uzet = imaRed.has(p.id)
      ? await db
          .update(upitniciMailovi)
          .set({ email: p.email, greska: null })
          .where(and(eq(upitniciMailovi.prijavaId, p.id), isNotNull(upitniciMailovi.greska)))
          .returning({ id: upitniciMailovi.id })
      : await db
          .insert(upitniciMailovi)
          .values({ prijavaId: p.id, seminarSlug: seminar.slug, email: p.email })
          .onConflictDoNothing()
          .returning({ id: upitniciMailovi.id });
    if (uzet.length === 0) continue;

    try {
      await sendMail(opcijeMaila(mail, p.email, m));
    } catch (error) {
      greske++;
      neuspjeli.push(p.email);
      console.error(`Upitnik ${seminar.slug}: mail za prijavu ${p.id} nije poslan.`, error);
      await db
        .update(upitniciMailovi)
        .set({ greska: String(error).slice(0, 500) })
        .where(eq(upitniciMailovi.prijavaId, p.id))
        .catch((e) => console.error(`Upitnik: greška za prijavu ${p.id} nije upisana.`, e));
      continue;
    }
    poslano++;
    poslaniNa.push(p.email);
    await db
      .update(upitniciMailovi)
      .set({ poslanAt: new Date() })
      .where(eq(upitniciMailovi.prijavaId, p.id))
      .catch((e) => console.error(`Upitnik: mail za prijavu ${p.id} poslan, ali nije upisan.`, e));
  }

  // Potvrda na info@localis.hr; ako ona ne prođe, slanje polaznicima se ne smatra neuspjelim.
  if (poslaniNa.length + neuspjeli.length > 0) {
    await sendMail(opcijeMaila(mail, mail.user, kopijaZaLocalis(m, poslaniNa, neuspjeli))).catch((e) =>
      console.error(`Upitnik ${seminar.slug}: kopija za LOCALIS nije poslana.`, e),
    );
  }
  return { poslano, greske };
}

/** Pokreće ga dnevni cron: mail nakon edukacije gdje je danas termin slanja. */
export async function posaljiUpitnike(now = new Date()): Promise<RezultatSlanja> {
  if (!getMailConfig()) {
    console.error("Upitnici: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return { poslano: 0, greske: 0 };
  }
  const krajRada = Date.now() + ROK_SLANJA_MS;
  const slanja = await getSlanja();
  const ukupno = { poslano: 0, greske: 0 };
  for (const seminar of edukacijeZaSlanje(await getSeminars(), slanja, now)) {
    if (Date.now() > krajRada) break;
    const r = await posaljiZaEdukaciju(seminar, slanja.get(seminar.slug)!, krajRada);
    ukupno.poslano += r.poslano;
    ukupno.greske += r.greske;
  }
  return ukupno;
}
