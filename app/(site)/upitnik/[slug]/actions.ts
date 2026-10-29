"use server";

import { checkBotId } from "botid/server";
import { db } from "@/lib/db";
import { upitniciOdgovori } from "@/lib/db/schema";
import { getSeminar } from "@/lib/edukacije";
import { dopustiPokusaj, hashiraniIp } from "@/lib/rate-limit";
import { stanjeUpitnika } from "@/lib/upitnici/rok";
import { procitajOdgovor, type UpitnikPolje } from "@/lib/upitnici/validacija";

export type UpitnikState = {
  status: "idle" | "sent" | "error";
  message?: string;
  errors?: Partial<Record<UpitnikPolje, string>>;
};

export async function posaljiUpitnik(_prev: UpitnikState, fd: FormData): Promise<UpitnikState> {
  // Honeypot - botovi popunjavaju skrivena polja, ljudi ne
  if (fd.get("website")) return { status: "sent" };

  const botId = await checkBotId();
  if (botId.isBot) {
    return {
      status: "error",
      message: "Slanje nije uspjelo. Osvježite stranicu i pokušajte ponovno ili nam pišite na info@localis.hr.",
    };
  }

  const slug = String(fd.get("slug") ?? "").trim();
  const seminar = await getSeminar(slug);
  if (!seminar || seminar.odgodeno || stanjeUpitnika(seminar) !== "otvoren") {
    return { status: "error", message: "Upitnik više nije otvoren." };
  }

  const rezultat = procitajOdgovor(fd, seminar);
  if (!rezultat.ok) return { status: "error", errors: rezultat.errors };

  // Cijela dvorana na hotelskom Wi-Fi-ju dijeli jedan IP - limit je visok, glavna zaštita je BotID.
  const ip = await hashiraniIp();
  const dopusteno = await dopustiPokusaj([
    { kljuc: `upitnik-ip:${slug}:${ip}`, max: 60, prozorMs: 60 * 60 * 1000 },
  ]);
  if (!dopusteno) {
    return { status: "error", message: "Previše slanja s ove mreže. Pokušajte ponovno za sat vremena." };
  }

  try {
    await db.insert(upitniciOdgovori).values(rezultat.odgovor);
  } catch (error) {
    console.error(`Upitnik ${slug}: spremanje nije uspjelo.`, error);
    return {
      status: "error",
      message: "Slanje nije uspjelo. Pokušajte ponovno ili nam pišite na info@localis.hr.",
    };
  }
  return { status: "sent" };
}
