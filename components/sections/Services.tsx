import Link from "next/link";
import { GraduationCap, CalendarDays, ArrowRight } from "lucide-react";

// Edukacije i seminari su glavni posao pa dobivaju veće blokove; ostalo ide u listu ispod.
const glavne = [
  {
    icon: GraduationCap,
    title: "Edukacija i praktične radionice",
    description:
      "Prilagođene edukacije za službenike lokalne samouprave i sve koji se u radu susreću s tim temama - od radionica do online tečajeva.",
    href: "/usluge#obrazovanje",
  },
  {
    icon: CalendarDays,
    title: "Organizacija seminara i poslovnih događaja",
    description:
      "Profesionalna organizacija stručnih skupova i poslovnih događaja, od ideje do zadnjeg detalja na dan događaja.",
    href: "/usluge#seminari",
  },
];

const ostale = [
  {
    title: "Poslovno savjetovanje",
    description:
      "Stručno savjetovanje u svim fazama poslovanja - od pokretanja obrta do EU fondova i strateškog planiranja.",
    href: "/usluge#savjetovanje",
  },
  {
    title: "Uredske i administrativne djelatnosti",
    description:
      "Priprema dokumenata, digitalizacija i administrativna podrška koja vam oslobađa vrijeme za ono što radite najbolje.",
    href: "/usluge#administracija",
  },
  {
    title: "Digitalne i podatkovne usluge",
    description:
      "Razvoj web stranica, aplikacija i baza podataka te analiza i vizualizacija podataka prilagođena vašim potrebama.",
    href: "/usluge#digitalne",
  },
];

export default function Services() {
  return (
    <section className="py-24 bg-[oklch(0.97_0.01_85)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
            Naše usluge
          </h2>
          <p className="text-gray-600 mt-4 text-lg leading-relaxed text-pretty">
            Edukacije i stručni seminari su ono čime se najviše bavimo. Uz njih nudimo
            savjetovanje, administrativnu podršku i digitalne usluge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {glavne.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl bg-[var(--navy)] p-8 md:p-10 text-white transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--navy)]/20 motion-reduce:hover:translate-y-0"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--gold)] flex items-center justify-center mb-8">
                <Icon size={22} className="text-[var(--navy)]" />
              </div>
              <h3 className="text-2xl md:text-[1.75rem] font-bold leading-tight mb-3 text-balance font-[family-name:var(--font-playfair)]">
                {title}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-8 text-pretty">{description}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)]">
                Saznajte više
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>

        <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-x-8 border-t border-gray-300/70">
          {ostale.map(({ title, description, href }) => (
            <li key={title} className="pt-7">
              <Link href={href} className="group block">
                <h3 className="font-bold text-[var(--navy)] text-lg mb-2 font-[family-name:var(--font-playfair)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed text-pretty">{description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
