import type { Seminar } from "@/lib/edukacije";
import type { upitniciOdgovori } from "@/lib/db/schema";
import { UPITNIK_MAX_DULJINA, UPITNIK_PRIVOLA_VERZIJA } from "./pitanja";

export type UpitnikPolje =
  | "ocjenaUkupno"
  | "ocjenaKorisnost"
  | "ocjenePredavaca"
  | "kontaktEmail"
  | "privola"
  | "tekst";

export type NoviOdgovor = Omit<typeof upitniciOdgovori.$inferInsert, "id" | "createdAt">;

// Isto pravilo kao u prijavi (app/(site)/edukacije/actions.ts).
const EMAIL_RE = /^[^\s@,;<>()"]+@[^\s@,;<>()"]+\.[^\s@,;<>()"]+$/;
const PREPORUKE = ["da", "mozda", "ne"] as const;
const PORUKA_OCJENA = "Odaberite ocjenu od 1 do 5.";

function ocjena(fd: FormData, polje: string): number | null {
  const v = String(fd.get(polje) ?? "").trim();
  return /^[1-5]$/.test(v) ? Number(v) : null;
}

function tekst(fd: FormData, polje: string): string | null {
  const v = String(fd.get(polje) ?? "").trim();
  return v || null;
}

export function procitajOdgovor(
  fd: FormData,
  seminar: Pick<Seminar, "slug" | "title" | "lecturers">,
  now = new Date(),
):
  | { ok: true; odgovor: NoviOdgovor }
  | { ok: false; errors: Partial<Record<UpitnikPolje, string>> } {
  const errors: Partial<Record<UpitnikPolje, string>> = {};

  const ocjenaUkupno = ocjena(fd, "ocjena_ukupno");
  if (ocjenaUkupno === null) errors.ocjenaUkupno = PORUKA_OCJENA;
  const ocjenaKorisnost = ocjena(fd, "ocjena_korisnost");
  if (ocjenaKorisnost === null) errors.ocjenaKorisnost = PORUKA_OCJENA;

  const ocjenePredavaca = seminar.lecturers.map((l, i) => ({
    ime: l.name,
    ocjena: ocjena(fd, `ocjena_predavac_${i}`),
  }));
  if (ocjenePredavaca.some((o) => o.ocjena === null)) {
    errors.ocjenePredavaca =
      seminar.lecturers.length > 1 ? "Ocijenite svakog predavača od 1 do 5." : PORUKA_OCJENA;
  }

  const preporukaUnos = String(fd.get("preporuka") ?? "");
  const preporuka = PREPORUKE.find((p) => p === preporukaUnos) ?? null;

  const svidjelo = tekst(fd, "svidjelo");
  const popraviti = tekst(fd, "popraviti");
  const recenzija = tekst(fd, "recenzija");
  const strucnaPomoc = tekst(fd, "strucna_pomoc");
  if ([svidjelo, popraviti, recenzija, strucnaPomoc].some((t) => t && t.length > UPITNIK_MAX_DULJINA.tekst)) {
    errors.tekst = `Odgovor može imati najviše ${UPITNIK_MAX_DULJINA.tekst} znakova.`;
  }

  const kontaktIme = tekst(fd, "kontakt_ime")?.slice(0, UPITNIK_MAX_DULJINA.ime) ?? null;
  const kontaktUstanova = tekst(fd, "kontakt_ustanova")?.slice(0, UPITNIK_MAX_DULJINA.ustanova) ?? null;
  const kontaktEmail = tekst(fd, "kontakt_email");
  const privola = fd.get("privola_kontakt") === "da";
  if (kontaktEmail) {
    if (!EMAIL_RE.test(kontaktEmail) || kontaktEmail.length > UPITNIK_MAX_DULJINA.email) {
      errors.kontaktEmail = "Unesite ispravnu email adresu.";
    } else if (!privola) {
      errors.privola = "Da bismo vam se mogli javiti, potvrdite privolu.";
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    odgovor: {
      seminarSlug: seminar.slug,
      seminarTitle: seminar.title,
      ocjenaUkupno: ocjenaUkupno!,
      ocjenaKorisnost: ocjenaKorisnost!,
      ocjenePredavaca: ocjenePredavaca.map((o) => ({ ime: o.ime, ocjena: o.ocjena! })),
      preporuka,
      svidjelo,
      popraviti,
      recenzija,
      strucnaPomoc,
      kontaktIme,
      kontaktUstanova,
      kontaktEmail,
      // Privola se bilježi samo kad postoji email na koji se odnosi.
      privolaKontaktAt: kontaktEmail ? now : null,
      privolaKontaktVerzija: kontaktEmail ? UPITNIK_PRIVOLA_VERZIJA : null,
    },
  };
}
