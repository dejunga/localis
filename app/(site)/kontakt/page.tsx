import type { Metadata } from "next";
import { KLJUCEVI_KONTAKT, getTekstovi, odaberi, telefonZaPoziv } from "@/lib/tekstovi";
import KontaktContent from "./KontaktContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTekstovi();
  return {
    title: "Kontakt - LOCALIS",
    description: `Kontaktirajte LOCALIS. Email: ${t["kontakt.email"]}, telefon: ${t["kontakt.telefon"]}.`,
    alternates: { canonical: "/kontakt" },
  };
}

// Tekstovi iz admina osvježavaju se odmah po spremanju; ovo je rezerva ako je build bio bez baze.
export const revalidate = 300;

export default async function KontaktPage() {
  const t = await getTekstovi();
  return (
    <KontaktContent t={odaberi(t, KLJUCEVI_KONTAKT)} telefonZaPoziv={telefonZaPoziv(t["kontakt.telefon"])} />
  );
}
