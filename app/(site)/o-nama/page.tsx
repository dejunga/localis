import type { Metadata } from "next";
import ONamaContent from "./ONamaContent";

export const metadata: Metadata = {
  title: "O nama – LOCALIS",
  description:
    "LOCALIS je obrt za savjetovanje i edukaciju iz Grubišnog Polja koji pomaže službenicima jedinica lokalne samouprave i svima koji se u radu susreću s pravnim propisima lokalne samouprave. Vlasnica Marija Jungić.",
  alternates: { canonical: "/o-nama" },
};

export default function ONamaPage() {
  return <ONamaContent />;
}
