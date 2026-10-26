import type { Metadata } from "next";
import { getTekstovi } from "@/lib/tekstovi";
import KontaktContent from "./KontaktContent";

export const metadata: Metadata = {
  title: "Kontakt - LOCALIS",
  description:
    "Kontaktirajte LOCALIS. Email: info@localis.hr, telefon: 095/313-5158.",
  alternates: { canonical: "/kontakt" },
};

// Tekstovi iz admina osvježavaju se odmah po spremanju; ovo je rezerva ako je build bio bez baze.
export const revalidate = 300;

export default async function KontaktPage() {
  const t = await getTekstovi();
  return <KontaktContent uvod={t["kontakt.uvod"]} uvodObrasca={t["kontakt.obrazac.uvod"]} />;
}
