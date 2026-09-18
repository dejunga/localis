import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export type MailConfig = {
  user: string; // Zoho račun s kojeg se šalje (info@localis.hr)
  internalTo: string; // kamo idu interne obavijesti (CONTACT_TO)
};

export function getMailConfig(): MailConfig | null {
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASSWORD;
  if (process.env.EMAIL_DRY_RUN === "1") {
    const u = user ?? "info@localis.hr";
    return { user: u, internalTo: process.env.CONTACT_TO ?? u };
  }
  if (!user || !pass) return null;
  return { user, internalTo: process.env.CONTACT_TO ?? user };
}

let cached: nodemailer.Transporter | null = null;

function getTransport() {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: "smtppro.zoho.eu",
    port: 465,
    secure: true,
    auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASSWORD },
  });
  return cached;
}

// EMAIL_DRY_RUN=1 -> mail se logira umjesto šalje (lokalno, testovi).
export async function sendMail(options: Mail.Options): Promise<void> {
  if (process.env.EMAIL_DRY_RUN === "1") {
    const attachments = (options.attachments ?? []).map((a) => a.filename).join(", ");
    console.log(
      `[EMAIL_DRY_RUN] to=${String(options.to)} subject=${options.subject} attachments=[${attachments}]\n${options.text}`,
    );
    return;
  }
  await getTransport().sendMail(options);
}
