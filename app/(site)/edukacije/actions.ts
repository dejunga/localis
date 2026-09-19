"use server";

import { getMailConfig } from "@/lib/email/transport";
import { getSeminar, isSeminarPast } from "@/lib/edukacije";
import { spremiPrijavu } from "@/lib/prijave/spremi";
import { izdajPonudu } from "@/lib/ponude/izdaj";
import { posaljiInterniMail } from "@/lib/ponude/email";

export type RegistrationState = {
  status: "idle" | "sent" | "error";
  message?: string;
  // Postavljeno kad je ponuda uspješno poslana - forma ispiše na koju adresu.
  ponudaPoslanaNa?: string;
  errors?: Partial<
    Record<
      "ime" | "email" | "telefon" | "organizacija" | "adresa" | "oib" | "polaznici",
      string
    >
  >;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OIB_RE = /^\d{11}$/;

export async function sendSeminarRegistration(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  // Honeypot - botovi popunjavaju skrivena polja, ljudi ne
  if (formData.get("website")) {
    return { status: "sent" };
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const seminar = await getSeminar(slug);
  if (!seminar || isSeminarPast(seminar)) {
    return {
      status: "error",
      message: "Prijave za ovu edukaciju više nisu moguće.",
    };
  }

  const ime = String(formData.get("ime") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const organizacija = String(formData.get("organizacija") ?? "").trim();
  const adresa = String(formData.get("adresa") ?? "").trim();
  const oib = String(formData.get("oib") ?? "").trim();
  const napomena = String(formData.get("napomena") ?? "").trim();
  const polaznikImena = formData.getAll("polaznik_ime").map((value) => String(value).trim());
  const polaznikRadnaMjesta = formData
    .getAll("polaznik_radno_mjesto")
    .map((value) => String(value).trim());
  const polaznici = polaznikImena
    .map((ime, i) => ({ ime, radnoMjesto: polaznikRadnaMjesta[i] ?? "" }))
    .filter((p) => p.ime || p.radnoMjesto);

  const errors: RegistrationState["errors"] = {};
  if (!ime) errors.ime = "Unesite ime i prezime.";
  if (!EMAIL_RE.test(email)) errors.email = "Unesite ispravnu email adresu.";
  if (!telefon) errors.telefon = "Unesite telefon.";
  if (!organizacija) errors.organizacija = "Unesite naziv ustanove/tvrtke.";
  if (!adresa) errors.adresa = "Unesite adresu ustanove/tvrtke.";
  if (!OIB_RE.test(oib)) errors.oib = "OIB mora imati točno 11 znamenaka.";
  if (polaznici.length === 0) {
    errors.polaznici = "Unesite barem jednog polaznika.";
  } else if (polaznici.some((p) => !p.ime || !p.radnoMjesto)) {
    errors.polaznici = "Unesite ime i radno mjesto za svakog polaznika.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const mail = getMailConfig();
  if (!mail) {
    console.error("Prijava na edukaciju: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Prijava trenutno nije moguća. Javite nam se na info@localis.hr.",
    };
  }

  const nova = {
    seminarSlug: seminar.slug,
    seminarTitle: seminar.title,
    kontaktIme: ime,
    email,
    telefon,
    organizacija,
    adresa,
    oib,
    napomena: napomena || null,
    polaznici,
  };

  // tx1 - ako baza padne, prijava se ne gubi u potpunosti: interni mail ide kao i prije.
  let prijavaId: number;
  try {
    prijavaId = await spremiPrijavu(nova);
  } catch (error) {
    console.error("Prijava na edukaciju: spremanje u bazu nije uspjelo.", error);
    try {
      await posaljiInterniMail({
        ...nova,
        prijavaId: 0,
        ponuda: null,
        greska: "Baza nedostupna - prijava NIJE spremljena, ručno je unesi.",
      });
    } catch (mailError) {
      console.error("Prijava na edukaciju: ni interni mail nije poslan.", mailError);
      return {
        status: "error",
        message: "Prijava nije uspjela. Pokušajte ponovno ili nam pišite na info@localis.hr.",
      };
    }
    return { status: "sent" };
  }

  // Besplatna edukacija / bez ponuda bloka: samo interni mail, kao do sada.
  if (!seminar.ponuda) {
    try {
      await posaljiInterniMail({ ...nova, prijavaId, ponuda: null });
    } catch (error) {
      console.error("Prijava na edukaciju: interni mail nije poslan.", error);
    }
    return { status: "sent" };
  }

  // I kad ponuda ne uspije (ili izdajPonudu neočekivano baci), prijava je spremljena -
  // korisniku je to "zaprimljeno".
  try {
    const rezultat = await izdajPonudu(prijavaId);
    return rezultat.ok ? { status: "sent", ponudaPoslanaNa: email } : { status: "sent" };
  } catch (error) {
    console.error(`Prijava ${prijavaId}: izdavanje ponude neočekivano nije uspjelo.`, error);
    return { status: "sent" };
  }
}
