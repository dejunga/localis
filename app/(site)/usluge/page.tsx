import type { Metadata } from "next";
import { getSeminars, isSeminarPast } from "@/lib/edukacije";
import UslugeContent from "./UslugeContent";

export const metadata: Metadata = {
  title: "Usluge - LOCALIS",
  description:
    "Edukacija i praktične radionice, organizacija seminara, poslovno savjetovanje, uredske i administrativne djelatnosti te digitalne usluge za jedinice lokalne samouprave.",
  alternates: { canonical: "/usluge" },
};

// Kao stranice edukacija: popis nadolazećih se osvježava svakih 5 minuta.
export const revalidate = 300;

export default async function UslugePage() {
  // getSeminars vraća najnovije prvo; okrenuto je najbliža prva.
  const nadolazece = (await getSeminars())
    .filter((s) => !s.odgodeno && !isSeminarPast(s))
    .reverse()
    .slice(0, 3)
    .map((s) => ({ slug: s.slug, naslov: s.title, datum: s.dateLabel, mjesto: s.location }));

  return <UslugeContent nadolazece={nadolazece} />;
}
