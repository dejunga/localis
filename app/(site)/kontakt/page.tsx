import type { Metadata } from "next";
import KontaktContent from "./KontaktContent";

export const metadata: Metadata = {
  title: "Kontakt – LOCALIS",
  description:
    "Kontaktirajte LOCALIS, obrt za savjetovanje i edukaciju, Ljudevita Gaja 8, Grubišno Polje. Email: info@localis.hr, telefon: 095/313-5158.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return <KontaktContent />;
}
