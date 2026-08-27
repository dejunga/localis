"use server";

import nodemailer from "nodemailer";

export type RegistrationState = {
  status: "idle" | "sent" | "error";
  message?: string;
  errors?: Partial<
    Record<"ime" | "email" | "telefon" | "organizacija" | "oib" | "polaznici", string>
  >;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OIB_RE = /^\d{11}$/;

export async function sendSeminarRegistration(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  // Honeypot – botovi popunjavaju skrivena polja, ljudi ne
  if (formData.get("website")) {
    return { status: "sent" };
  }

  const seminarTitle = String(formData.get("seminar") ?? "").trim();
  const ime = String(formData.get("ime") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const organizacija = String(formData.get("organizacija") ?? "").trim();
  const oib = String(formData.get("oib") ?? "").trim();
  const napomena = String(formData.get("napomena") ?? "").trim();
  const polaznici = formData
    .getAll("polaznik_ime")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const errors: RegistrationState["errors"] = {};
  if (!ime) errors.ime = "Unesite ime i prezime.";
  if (!EMAIL_RE.test(email)) errors.email = "Unesite ispravnu email adresu.";
  if (!telefon) errors.telefon = "Unesite telefon.";
  if (!organizacija) errors.organizacija = "Unesite naziv ustanove/tvrtke.";
  if (!OIB_RE.test(oib)) errors.oib = "OIB mora imati točno 11 znamenaka.";
  if (polaznici.length === 0) errors.polaznici = "Unesite barem jednog polaznika.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;
  const to = process.env.CONTACT_TO ?? user;

  if (!user || !pass) {
    console.error("Prijava na edukaciju: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Prijava trenutno nije moguća. Javite nam se na info@localis.hr.",
    };
  }

  try {
    const transport = nodemailer.createTransport({
      host: "smtppro.zoho.eu",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transport.sendMail({
      from: `"LOCALIS web" <${user}>`,
      to,
      replyTo: `"${ime}" <${email}>`,
      subject: `Nova prijava na edukaciju – ${seminarTitle || "edukacija"}`,
      text: [
        `Edukacija: ${seminarTitle || "-"}`,
        "",
        `Ime i prezime: ${ime}`,
        `Email: ${email}`,
        `Telefon: ${telefon || "-"}`,
        `Ustanova/tvrtka: ${organizacija}`,
        `OIB: ${oib || "-"}`,
        "",
        "Polaznici:",
        ...polaznici.map((name, i) => `${i + 1}. ${name}`),
        "",
        napomena || "-",
      ].join("\n"),
    });

    return { status: "sent" };
  } catch (error) {
    console.error("Prijava na edukaciju: slanje nije uspjelo.", error);
    return {
      status: "error",
      message: "Prijava nije uspjela. Pokušajte ponovno ili nam pišite na info@localis.hr.",
    };
  }
}
