import Link from "next/link";
import { GraduationCap, CalendarDays, ArrowRight } from "lucide-react";
import { getTekstovi } from "@/lib/tekstovi";

// Edukacije i seminari su glavni posao pa dobivaju veće blokove; ostalo ide u listu ispod.
// naziv i opis = ključevi tekstova iz lib/tekstovi.ts (uređuju se u adminu).
const glavne = [
  {
    icon: GraduationCap,
    naziv: "usluge.obrazovanje.naziv",
    opis: "pocetna.usluge.obrazovanje",
    href: "/usluge#obrazovanje",
  },
  {
    icon: CalendarDays,
    naziv: "usluge.seminari.naziv",
    opis: "pocetna.usluge.seminari",
    href: "/usluge#seminari",
  },
] as const;

const ostale = [
  {
    naziv: "usluge.savjetovanje.naziv",
    opis: "pocetna.usluge.savjetovanje",
    href: "/usluge#savjetovanje",
  },
  {
    naziv: "usluge.administracija.naziv",
    opis: "pocetna.usluge.administracija",
    href: "/usluge#administracija",
  },
  {
    naziv: "usluge.digitalne.naziv",
    opis: "pocetna.usluge.digitalne",
    href: "/usluge#digitalne",
  },
] as const;

export default async function Services() {
  const t = await getTekstovi();
  return (
    <section className="py-24 bg-[oklch(0.97_0.01_85)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
            {t["pocetna.usluge.naslov"]}
          </h2>
          <p className="text-gray-600 mt-4 text-lg leading-relaxed text-pretty">
            {t["pocetna.usluge.uvod"]}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {glavne.map(({ icon: Icon, naziv, opis, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-2xl bg-[var(--navy)] p-8 md:p-10 text-white transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--navy)]/20 motion-reduce:hover:translate-y-0"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--gold)] flex items-center justify-center mb-8">
                <Icon size={22} className="text-[var(--navy)]" />
              </div>
              <h3 className="text-2xl md:text-[1.75rem] font-bold leading-tight mb-3 text-balance font-[family-name:var(--font-playfair)]">
                {t[naziv]}
              </h3>
              <p className="text-gray-300 leading-relaxed mb-8 text-pretty">{t[opis]}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)]">
                {t["pocetna.usluge.gumb"]}
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>

        <ul className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-x-8 border-t border-gray-300/70">
          {ostale.map(({ naziv, opis, href }) => (
            <li key={href} className="pt-7">
              <Link href={href} className="group block">
                <h3 className="font-bold text-[var(--navy)] text-lg mb-2 font-[family-name:var(--font-playfair)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                  {t[naziv]}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed text-pretty">{t[opis]}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
