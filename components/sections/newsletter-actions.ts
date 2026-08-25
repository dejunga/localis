"use server";

import nodemailer from "nodemailer";

export type NewsletterState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot – botovi popunjavaju skrivena polja, ljudi ne
  if (formData.get("website")) {
    return { status: "sent" };
  }

  const email = String(formData.get("email") ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Unesite ispravnu email adresu." };
  }

  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;
  const to = process.env.NEWSLETTER_TO ?? process.env.CONTACT_TO ?? user;

  if (!user || !pass) {
    console.error("Newsletter: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Prijava trenutno nije moguća. Pokušajte kasnije.",
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
      replyTo: email,
      subject: "Nova prijava na newsletter",
      text: `Nova prijava na newsletter: ${email}`,
    });

    return { status: "sent" };
  } catch (error) {
    console.error("Newsletter: slanje nije uspjelo.", error);
    return {
      status: "error",
      message: "Prijava nije uspjela. Pokušajte ponovno.",
    };
  }
}
