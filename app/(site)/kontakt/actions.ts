"use server";

import { checkBotId } from "botid/server";
import { getMailConfig, sendMail } from "@/lib/email/transport";
import { dopustiPokusaj, hashiraniIp } from "@/lib/rate-limit";

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
  // Honeypot - botovi popunjavaju skrivena polja, ljudi ne
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
  else if (poruka.length > 5000) errors.poruka = "Poruka može imati najviše 5000 znakova.";
  if (ime.length > 120) errors.ime = "Najviše 120 znakova.";
  if (email.length > 254) errors.email = "Unesite ispravnu email adresu.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }
  if (telefon.length > 40) {
    return { status: "error", message: "Telefon može imati najviše 40 znakova." };
  }

  // Vercel BotID - nevidljiva provjera da zahtjev dolazi iz pravog preglednika
  // (u lokalnom devu uvijek prolazi).
  const botId = await checkBotId();
  if (botId.isBot) {
    return {
      status: "error",
      message: "Slanje nije uspjelo. Osvježite stranicu i pokušajte ponovno ili nam pišite na info@localis.hr.",
    };
  }

  const ip = await hashiraniIp();
  const dopusteno = await dopustiPokusaj([
    { kljuc: `kontakt-ip:${ip}`, max: 5, prozorMs: 10 * 60 * 1000 },
    { kljuc: `kontakt-ip-dan:${ip}`, max: 20, prozorMs: 24 * 60 * 60 * 1000 },
  ]);
  if (!dopusteno) {
    return {
      status: "error",
      message: "Poslali ste previše poruka. Pokušajte ponovno kasnije ili nam pišite na info@localis.hr.",
    };
  }

  const mail = getMailConfig();
  if (!mail) {
    console.error("Kontakt forma: ZOHO_SMTP_USER ili ZOHO_SMTP_PASSWORD nisu postavljeni.");
    return {
      status: "error",
      message: "Slanje trenutno nije moguće. Javite nam se na info@localis.hr.",
    };
  }

  try {
    await sendMail({
      from: `"LOCALIS web" <${mail.user}>`,
      to: mail.internalTo,
      replyTo: `"${ime}" <${email}>`,
      subject: `Nova poruka s weba - ${ime}`,
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
