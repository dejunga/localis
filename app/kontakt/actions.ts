"use server";

import nodemailer from "nodemailer";

export type ContactState = {
  status: "idle" | "sent" | "error";
  message?: string;
  errors?: Partial<Record<"ime" | "email" | "poruka", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot – botovi popunjavaju skrivena polja, ljudi ne
  if (formData.get("website")) {
    return { status: "sent" };
  }

  const ime = String(formData.get("ime") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim();
  const poruka = String(formData.get("poruka") ?? "").trim();

  const errors: ContactState["errors"] = {};
  if (!ime) errors.ime = "Unesite ime i prezime.";
  if (!EMAIL_RE.test(email)) errors.email = "Unesite ispravnu email adresu.";
  if (poruka.length < 10) errors.poruka = "Poruka mora imati barem 10 znakova.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;
  const to = process.env.CONTACT_TO ?? user;

  if (!user || !pass) {
    console.error("Kontakt forma: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Slanje trenutno nije moguće. Javite nam se na info@localis.hr.",
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
      subject: `Nova poruka s weba – ${ime}`,
      text: [
        `Ime i prezime: ${ime}`,
        `Email: ${email}`,
        `Telefon: ${telefon || "-"}`,
        "",
        poruka,
      ].join("\n"),
    });

    return { status: "sent" };
  } catch (error) {
    console.error("Kontakt forma: slanje nije uspjelo.", error);
    return {
      status: "error",
      message: "Slanje nije uspjelo. Pokušajte ponovno ili nam pišite na info@localis.hr.",
    };
  }
}
