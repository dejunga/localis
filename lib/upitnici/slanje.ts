import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { prijave, upitniciMailovi } from "@/lib/db/schema";
import { getMailConfig, sendMail } from "@/lib/email/transport";
import { getSeminars, type Seminar } from "@/lib/edukacije";
import { edukacijaZavrsila, formatRoka, rokUpitnika, stanjeUpitnika } from "./rok";

export function upitnikUrl(slug: string): string {
  return `https://www.localis.hr/upitnik/${slug}`;
}

export type KandidatPrijava = { id: number; email: string; status: "nova" | "ponuda_poslana" | "stornirana" };
export type PostojeciMail = { prijavaId: number; email: string; poslanAt: Date | null; greska: string | null };

// Cron ruta ima maxDuration 300 s; ostavi rezervu za mail koji je u tijeku.
const ROK_SLANJA_MS = 200_000;

const kljucEmaila =(email: string) => email.trim().toLowerCase();
const zaPonovnoSlanje = (m: PostojeciMail) => m.greska !== null && m.poslanAt === null;

/**
 * Kome poslati upitnik: kontakt osobe ne-storniranih prijava, jedan mail po adresi.
 * Ponovno se šalje samo gdje je SMTP javio grešku. Red bez poslanAt i bez greske
 * (mail otišao, upis pao) smatra se poslanim - radije nijedan mail nego dva.
 */
export function odaberiPrimatelje(prijaveZaSlug: KandidatPrijava[], postojeci: PostojeciMail[]): KandidatPrijava[] {
  const poPrijavi = new Map(postojeci.map((m) => [m.prijavaId, m]));
  const zauzeti = new Set(postojeci.filter((m) => !zaPonovnoSlanje(m)).map((m) => kljucEmaila(m.email)));
  const odabrani: KandidatPrijava[] = [];
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

export function edukacijeZaSlanje(seminari: Seminar[], now: Date): Seminar[] {
  return seminari.filter(
    (s) => !s.odgodeno && edukacijaZavrsila(s, now) && stanjeUpitnika(s, now) === "otvoren",
  );
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function tekstMaila(
  seminar: Pick<Seminar, "title" | "dateLabel" | "slug">,
  rok: Date,
): { subject: string; text: string; html: string } {
  const url = upitnikUrl(seminar.slug);
  const odlomci = [
    "Poštovani,",
    `hvala vam što ste bili s nama na edukaciji „${seminar.title}” (${seminar.dateLabel}).`,
    "Zanima nas kako vam je bilo - što je bilo dobro i što možemo bolje. Kratki anonimni upitnik traje oko minutu:",
    url,
    `Upitnik je otvoren do ${formatRoka(rok)}.`,
    "Ako je s vaše ustanove na edukaciji bilo više polaznika, molimo proslijedite im ovu poveznicu - svaki polaznik može ispuniti svoj upitnik.",
    "Ako ne želite primati ovakve poruke, javite nam odgovorom na ovaj e-mail.",
    "Srdačan pozdrav,\nLOCALIS",
  ];
  const html = odlomci
    .map((o) =>
      o === url ? `<p><a href="${url}">${url}</a></p>` : `<p>${escapeHtml(o).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n");
  return {
    subject: `Kako vam je bilo na edukaciji: ${seminar.title}?`,
    text: odlomci.join("\n\n"),
    html,
  };
}

/** Pokreće ga dnevni cron: mail s upitnikom kontakt osobama edukacija koje su završile. */
export async function posaljiUpitnike(now = new Date()): Promise<{ poslano: number; greske: number }> {
  const mail = getMailConfig();
  if (!mail) {
    console.error("Upitnici: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return { poslano: 0, greske: 0 };
  }

  let poslano = 0;
  let greske = 0;
  // Ne uzimaj nove primatelje kad se približi maxDuration rute - neuzeti idu sljedeći dan,
  // a funkcija ugašena usred slanja ostavila bi red koji se nikad ne šalje ponovno.
  const krajRada = Date.now() + ROK_SLANJA_MS;
  for (const seminar of edukacijeZaSlanje(await getSeminars(), now)) {
    if (Date.now() > krajRada) break;
    const kandidati = await db
      .select({ id: prijave.id, email: prijave.email, status: prijave.status })
      .from(prijave)
      .where(eq(prijave.seminarSlug, seminar.slug));
    if (kandidati.length === 0) continue;
    const postojeci = await db
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
    const imaRed = new Set(postojeci.map((m) => m.prijavaId));
    const { subject, text, html } = tekstMaila(seminar, rokUpitnika(seminar));

    for (const p of odaberiPrimatelje(kandidati, postojeci)) {
      if (Date.now() > krajRada) break;
      // "Uzmi" red prije slanja: paralelni poziv crona ne dobije isti red i ne pošalje drugi mail.
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
        await sendMail({
          from: `"LOCALIS" <${mail.user}>`,
          to: p.email,
          replyTo: `"LOCALIS" <${mail.user}>`,
          subject,
          text,
          html,
        });
      } catch (error) {
        greske++;
        console.error(`Upitnik ${seminar.slug}: mail za prijavu ${p.id} nije poslan.`, error);
        await db
          .update(upitniciMailovi)
          .set({ greska: String(error).slice(0, 500) })
          .where(eq(upitniciMailovi.prijavaId, p.id))
          .catch((e) => console.error(`Upitnik: greška za prijavu ${p.id} nije upisana.`, e));
        continue;
      }
      poslano++;
      await db
        .update(upitniciMailovi)
        .set({ poslanAt: now })
        .where(eq(upitniciMailovi.prijavaId, p.id))
        .catch((e) => console.error(`Upitnik: mail za prijavu ${p.id} poslan, ali nije upisan.`, e));
    }
  }
  return { poslano, greske };
}
