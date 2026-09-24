"use server";

import { checkBotId } from "botid/server";
import { redirect } from "next/navigation";
import { lozinkaIspravna, postaviSesiju } from "@/lib/admin/session";
import { dopustiPokusaj, hashiraniIp } from "@/lib/rate-limit";

export type LoginState = { greska?: string };

export async function prijaviSe(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const lozinka = String(formData.get("lozinka") ?? "");
  const next = String(formData.get("next") ?? "/admin/prijave");

  if ((await checkBotId()).isBot) {
    return { greska: "Prijava nije uspjela. Osvježite stranicu i pokušajte ponovno." };
  }

  // Zaštita od pogađanja lozinke: po IP-u i ukupno (ako napad ide s puno adresa).
  const ip = await hashiraniIp();
  const dopusteno = await dopustiPokusaj([
    { kljuc: `admin-login-ip:${ip}`, max: 5, prozorMs: 15 * 60 * 1000 },
    // Namjerno velikodušno - napadač ovim limitom može i admina zaključati na sat vremena.
    { kljuc: "admin-login-ukupno", max: 100, prozorMs: 60 * 60 * 1000 },
  ]);
  if (!dopusteno) {
    return { greska: "Previše pokušaja prijave. Pokušajte ponovno za 15 minuta." };
  }

  if (!lozinkaIspravna(lozinka)) {
    return { greska: "Neispravna lozinka." };
  }
  await postaviSesiju();
  // Samo interni /admin putovi - bez open redirecta (npr. "//evil.com" ili "/admin.evil").
  redirect(next === "/admin" || next.startsWith("/admin/") ? next : "/admin/prijave");
}
