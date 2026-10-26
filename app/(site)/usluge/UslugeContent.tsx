import Link from "next/link";
import { GraduationCap, CalendarDays, Briefcase, ClipboardList, Code2, ArrowRight } from "lucide-react";
import CTA from "@/components/sections/CTA";

export type UslugaEdukacija = { slug: string; naslov: string; datum: string; mjesto: string };

// id-jevi su sidra na koja vode linkovi s početne i iz podnožja (/usluge#obrazovanje...).
const services = [
  {
    id: "obrazovanje",
    icon: GraduationCap,
    title: "Edukacija i praktične radionice",
    description:
      "Nudimo prilagođene edukacije za službenike u jedinicama lokalne samouprave i zaposlenike pravnih osoba koje su osnovane za obavljanje poslova od značaja za lokalnu samoupravu. Naše edukacije pružaju akademski profesori i stručnjaci praktičari koji pokrivaju širok spektar tema - od mekih vještina do specifičnih stručnih znanja.",
    features: [
      "Prilagođene edukacije oblikovane prema stvarnim potrebama i specifičnostima svake jedinice",
      "Radionice i interaktivna predavanja o aktualnim temama i zakonodavnim novinama",
      "Analiza postojećeg stanja u praksi i konkretna, praktična rješenja",
      "Edukativni materijali, priručnici i radni listovi za polaznike",
      "Online tečajevi i e-learning moduli",
      "Stručni skupovi, konferencije i okrugli stolovi uz vanjske predavače",
      "Individualno mentorstvo za novoizabrane pročelnike i rukovoditelje",
      "Provjera znanja i potvrde o sudjelovanju",
    ],
  },
  {
    id: "seminari",
    icon: CalendarDays,
    title: "Organizacija seminara i poslovnih događaja",
    description:
      "Brinemo o kompletnoj organizaciji vaših poslovnih događaja. Od ideje do realizacije - logistika, program, predavači, materijali - sve na jednom mjestu.",
    features: [
      "Planiranje i koordinacija",
      "Odabir lokacije i tehničke opreme",
      "Organizacija predavača i panela",
      "Marketinška podrška događaju",
      "Post-event izvještaj i analiza",
    ],
  },
  {
    id: "savjetovanje",
    icon: Briefcase,
    title: "Poslovno savjetovanje",
    description:
      "Stručno savjetovanje u svim fazama poslovanja - od pokretanja obrta ili tvrtke do optimizacije postojećih procesa i dugoročnog strateškog planiranja.",
    features: [
      "Analiza poslovanja i preporuke",
      "Izrada poslovnih planova",
      "Podrška pri aplikacijama za EU fondove",
      "Upravljanje projektima",
      "Podrška pri pokretanju djelatnosti",
    ],
  },
  {
    id: "administracija",
    icon: ClipboardList,
    title: "Uredske i administrativne djelatnosti",
    description:
      "Administrativna podrška koja vam oslobađa vrijeme za ono što radite najbolje. Uredna dokumentacija bez stresa.",
    features: [
      "Priprema i uređivanje poslovnih dokumenata prema vašim smjernicama",
      "Prijepis dokumenata iz papirnatog u digitalni oblik",
      "Pisanje pisama, dopisa i sažetaka za internu ili vanjsku komunikaciju",
      "Izrada nacrta ugovora, odluka i drugih poslovnih dokumenata",
      "Digitalizacija postojeće dokumentacije radi lakšeg pretraživanja i pohrane",
      "Formatiranje i priprema e-knjiga i drugih digitalnih publikacija",
    ],
  },
  {
    id: "digitalne",
    icon: Code2,
    title: "Digitalne i podatkovne usluge",
    description:
      "Uz edukacije i savjetovanje za lokalnu samoupravu, LOCALIS nudi i razvoj digitalnih rješenja za treće strane - od jednostavnih web stranica i baza podataka do analize i vizualizacije podataka prilagođene potrebama klijenata.",
    features: [
      "Izrada i razvoj web stranica prilagođenih potrebama klijenta",
      "Razvoj web aplikacija po mjeri",
      "Izrada prijavnih sustava, baza klijenata i internih alata",
      "Optimizacija postojećih baza podataka",
      "Prilagodba, nadogradnja i održavanje postojećih softverskih rješenja",
      "Analiza podataka, izrada izvještaja i interaktivnih dashboarda",
      "Automatizacija ponavljajućih administrativnih procesa",
    ],
  },
];

// Svaka usluga: opis lijevo, popis onoga što uključuje desno. Kod edukacija ispod opisa
// stoje stvarne nadolazeće edukacije umjesto ilustracije.
export default function UslugeContent({ nadolazece }: { nadolazece: UslugaEdukacija[] }) {
  return (
    <>
      <section className="bg-[var(--navy)] pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
            Usluge
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
            Edukacije i stručni seminari za lokalnu samoupravu su ono čime se najviše bavimo. Uz
            njih nudimo savjetovanje, administrativnu podršku i digitalna rješenja.
          </p>

          <nav aria-label="Usluge na ovoj stranici" className="mt-10">
            <ul className="flex flex-wrap gap-2.5">
              {services.map(({ id, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm text-gray-200 transition-colors hover:border-[var(--gold)] hover:text-white"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 divide-y divide-gray-200">
          {services.map(({ id, icon: Icon, title, description, features }) => (
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
                  {title}
                </h2>
                <p className="mt-5 text-gray-600 text-lg leading-relaxed text-pretty">{description}</p>

                {id === "obrazovanje" ? (
                  <div className="mt-8">
                    {nadolazece.length > 0 && (
                      <>
                        <p className="text-sm font-semibold text-[var(--navy)] mb-3">Nadolazeće edukacije</p>
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
                      Sve edukacije
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/kontakt"
                    className="mt-8 inline-flex items-center gap-1.5 font-semibold text-[var(--navy)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--navy-light)]"
                  >
                    Zatražite ponudu
                    <ArrowRight size={16} className="text-[var(--gold)]" />
                  </Link>
                )}
              </div>

              <div className="lg:pt-[4.5rem]">
                <p className="text-sm font-semibold text-[var(--navy)] mb-3">Što uključuje</p>
                <ul className="divide-y divide-gray-200 border-y border-gray-200">
                  {features.map((f) => (
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
