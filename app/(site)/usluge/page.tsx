import type { Metadata } from "next";
import UslugeContent from "./UslugeContent";

export const metadata: Metadata = {
  title: "Usluge – LOCALIS",
  description:
    "Edukacija i praktične radionice, organizacija seminara, poslovno savjetovanje, uredske i administrativne djelatnosti te digitalne usluge za jedinice lokalne samouprave.",
  alternates: { canonical: "/usluge" },
};

export default function UslugePage() {
  return <UslugeContent />;
}
