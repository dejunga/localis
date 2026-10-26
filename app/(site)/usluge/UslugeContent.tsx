import Link from "next/link";
import { GraduationCap, CalendarDays, Briefcase, ClipboardList, Code2, ArrowRight } from "lucide-react";
import CTA from "@/components/sections/CTA";
import { getTekstovi, stavke } from "@/lib/tekstovi";

export type UslugaEdukacija = { slug: string; naslov: string; datum: string; mjesto: string };

// id-jevi su sidra na koja vode linkovi s početne i iz podnožja (/usluge#obrazovanje...).
// naziv, opis i ukljucuje = ključevi tekstova iz lib/tekstovi.ts (uređuju se u adminu).
const services = [
  {
    id: "obrazovanje",
    icon: GraduationCap,
    naziv: "usluge.obrazovanje.naziv",
    opis: "usluge.obrazovanje.opis",
    ukljucuje: "usluge.obrazovanje.ukljucuje",
  },
  {
    id: "seminari",
    icon: CalendarDays,
    naziv: "usluge.seminari.naziv",
    opis: "usluge.seminari.opis",
    ukljucuje: "usluge.seminari.ukljucuje",
  },
  {
    id: "savjetovanje",
    icon: Briefcase,
    naziv: "usluge.savjetovanje.naziv",
    opis: "usluge.savjetovanje.opis",
    ukljucuje: "usluge.savjetovanje.ukljucuje",
  },
  {
    id: "administracija",
    icon: ClipboardList,
    naziv: "usluge.administracija.naziv",
    opis: "usluge.administracija.opis",
    ukljucuje: "usluge.administracija.ukljucuje",
  },
  {
    id: "digitalne",
    icon: Code2,
    naziv: "usluge.digitalne.naziv",
    opis: "usluge.digitalne.opis",
    ukljucuje: "usluge.digitalne.ukljucuje",
  },
] as const;

// Svaka usluga: opis lijevo, popis onoga što uključuje desno. Kod edukacija ispod opisa
// stoje stvarne nadolazeće edukacije umjesto ilustracije.
export default async function UslugeContent({ nadolazece }: { nadolazece: UslugaEdukacija[] }) {
  const t = await getTekstovi();
  return (
    <>
      <section className="bg-[var(--navy)] pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
            {t["usluge.naslov"]}
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
            {t["usluge.uvod"]}
          </p>

          <nav aria-label="Usluge na ovoj stranici" className="mt-10">
            <ul className="flex flex-wrap gap-2.5">
              {services.map(({ id, naziv }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-gray-200 transition-colors hover:border-[var(--gold)] hover:text-white"
                  >
                    {t[naziv]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 divide-y divide-gray-200">
          {services.map(({ id, icon: Icon, naziv, opis, ukljucuje }) => (
            <article
              key={id}
              id={id}
              className="scroll-mt-24 py-14 md:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 lg:gap-16"
            >
              <div>
                <div className="flex size-12 items-center justify-center rounded-lg bg-[var(--navy)] mb-6">
                  <Icon size={22} className="text-[var(--gold)]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight text-balance font-[family-name:var(--font-playfair)]">
                  {t[naziv]}
                </h2>
                <p className="mt-5 text-gray-600 text-lg leading-relaxed text-pretty">{t[opis]}</p>

                {id === "obrazovanje" ? (
                  <div className="mt-8">
                    {nadolazece.length > 0 && (
                      <>
                        <p className="text-sm font-semibold text-[var(--navy)] mb-3">{t["usluge.nadolazece.oznaka"]}</p>
                        <ul className="mb-6 divide-y divide-gray-200 border-y border-gray-200">
                          {nadolazece.map((e) => (
                            <li key={e.slug}>
                              <Link href={`/edukacije/${e.slug}`} className="group block py-3">
                                <span className="block text-sm text-gray-500">
                                  {e.datum}, {e.mjesto}
                                </span>
                                <span className="mt-0.5 block font-semibold text-[var(--navy)] leading-snug group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                                  {e.naslov}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <Link
                      href="/edukacije"
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--navy)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--navy-light)]"
                    >
                      {t["usluge.nadolazece.gumb"]}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/kontakt"
                    className="mt-8 inline-flex items-center gap-1.5 font-semibold text-[var(--navy)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--navy-light)]"
                  >
                    {t["usluge.ponuda.gumb"]}
                    <ArrowRight size={16} className="text-[var(--gold)]" />
                  </Link>
                )}
              </div>

              <div className="lg:pt-[4.5rem]">
                <p className="text-sm font-semibold text-[var(--navy)] mb-3">{t["usluge.ukljucuje.oznaka"]}</p>
                <ul className="divide-y divide-gray-200 border-y border-gray-200">
                  {stavke(t[ukljucuje]).map((f) => (
                    <li key={f} className="flex items-start gap-3 py-3.5 text-gray-700 leading-snug">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CTA />
    </>
  );
}
