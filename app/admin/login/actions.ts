"use server";

import { redirect } from "next/navigation";
import { lozinkaIspravna, postaviSesiju } from "@/lib/admin/session";

export type LoginState = { greska?: string };

export async function prijaviSe(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const lozinka = String(formData.get("lozinka") ?? "");
  const next = String(formData.get("next") ?? "/admin/prijave");
  if (!lozinkaIspravna(lozinka)) {
    return { greska: "Neispravna lozinka." };
  }
  await postaviSesiju();
  // Samo interni /admin putovi - bez open redirecta (npr. "//evil.com" ili "/admin.evil").
  redirect(next === "/admin" || next.startsWith("/admin/") ? next : "/admin/prijave");
}
