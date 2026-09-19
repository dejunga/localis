import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, TRAJANJE_MS, jednakoKonstantno, napraviToken, provjeriToken } from "./token";

export function lozinkaIspravna(unos: string): boolean {
  const prava = process.env.ADMIN_PASSWORD ?? "";
  return prava.length > 0 && jednakoKonstantno(unos, prava);
}

export async function postaviSesiju(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, await napraviToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TRAJANJE_MS / 1000,
  });
}

export async function obrisiSesiju(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function jeAdmin(): Promise<boolean> {
  return provjeriToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

// Za server komponente i akcije - proxy je samo optimistična provjera.
export async function zahtijevajAdmina(): Promise<void> {
  if (!(await jeAdmin())) redirect("/admin/login");
}
