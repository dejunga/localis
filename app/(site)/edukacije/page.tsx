import type { Metadata } from "next";
import { aktualnaCijena, getSeminars, isSeminarPast, type Seminar } from "@/lib/edukacije";
import { getPostavke } from "@/lib/postavke";
import { mjestaZaPrikaz } from "@/lib/prijave/limiti";
import { zauzetaMjestaPoEdukaciji } from "@/lib/prijave/mjesta";
import EdukacijeHero from "./EdukacijeHero";
import {
  IstaknutaEdukacija,
  KratkiPopis,
  RedoviEdukacija,
  type EdukacijaPrikaz,
} from "./EdukacijeList";

export const metadata: Metadata = {
  title: "Edukacije - LOCALIS",
  description:
    "Radionice, seminari i predavanja za službenike lokalne samouprave i sve koji se u svom radu susreću s upravnim pravom.",
  alternates: { canonical: "/edukacije" },
};

// Regenerira se svakih 5 minuta da edukacije koje su počele prijeđu među održane.
export const revalidate = 300;

// null = baza nedostupna (npr. build bez DATABASE_URL) - tada se mjesta ne prikazuju.
async function slobodnaMjesta(): Promise<((slug: string) => number) | null> {
  try {
    const [{ maxMjesta }, zauzeto] = await Promise.all([getPostavke(), zauzetaMjestaPoEdukaciji()]);
    return (slug) => Math.max(0, maxMjesta - (zauzeto.get(slug) ?? 0));
  } catch {
    return null;
  }
}

function prikaz(s: Seminar, slobodno: ((slug: string) => number) | null): EdukacijaPrikaz {
  const cijena = aktualnaCijena(s);
  const mjesta = slobodno?.(s.slug) ?? null;
  return {
    slug: s.slug,
    naslov: s.title,
    sazetak: s.excerpt,
    datum: s.date,
    datumLabel: s.dateLabel,
    vrijeme: s.time,
    mjesto: s.location,
    cijena: cijena.price,
    rana: cijena.rana && s.ranaPrijava ? { doLabel: s.ranaPrijava.doLabel, redovna: s.price } : undefined,
    grupniPopust: Boolean(s.ponuda),
    slobodno: mjestaZaPrikaz(mjesta),
    predavaci: s.lecturers.map((l) => ({ ime: l.name, uloga: l.role, foto: l.photo })),
  };
}

// 1 nadolazeća edukacija, 2-4 nadolazeće edukacije, 5+ nadolazećih edukacija
function brojEdukacija(n: number): string {
  const d = n % 10;
  const s = n % 100;
  if (d === 1 && s !== 11) return `${n} nadolazeća edukacija`;
  if (d >= 2 && d <= 4 && (s < 12 || s > 14)) return `${n} nadolazeće edukacije`;
  return `${n} nadolazećih edukacija`;
}

export default async function EdukacijePage() {
  const seminari = await getSeminars(); // najnovije prvo
  const odgodene = seminari.filter((s) => s.odgodeno);
  const odrzane = seminari.filter((s) => !s.odgodeno && isSeminarPast(s));
  const nadolazeceSeminari = seminari.filter((s) => !s.odgodeno && !isSeminarPast(s)).reverse();

  const slobodno = nadolazeceSeminari.length > 0 ? await slobodnaMjesta() : null;
  const [istaknuta, ...ostale] = nadolazeceSeminari.map((s) => prikaz(s, slobodno));

  const sazetak = istaknuta
    ? `${brojEdukacija(nadolazeceSeminari.length)}. Sljedeća: ${istaknuta.datumLabel} ${istaknuta.mjesto}.`
    : "Trenutno pripremamo nove termine. Pratite stranicu ili nam se javite.";

  const kratko = (s: Seminar) => ({
    slug: s.slug,
    naslov: s.title,
    datumLabel: s.dateLabel,
    mjesto: s.location,
    predavaci: s.lecturers.map((l) => ({ ime: l.name })),
  });

  return (
    <>
      <EdukacijeHero sazetak={sazetak} />

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          {istaknuta && <IstaknutaEdukacija e={istaknuta} />}

          {ostale.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] mb-6 font-[family-name:var(--font-playfair)]">
                Ostale nadolazeće edukacije
              </h2>
              <RedoviEdukacija edukacije={ostale} />
            </div>
          )}

          {odgodene.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)]">
                Odgođene edukacije
              </h2>
              <p className="text-gray-600 mb-6">Novi termini bit će objavljeni naknadno. Prijave su do tada zatvorene.</p>
              <KratkiPopis edukacije={odgodene.map(kratko)} napomena="Novi termin uskoro" />
            </div>
          )}

          {odrzane.length > 0 && (
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] mb-6 font-[family-name:var(--font-playfair)]">
                Održane edukacije
              </h2>
              <KratkiPopis edukacije={odrzane.map(kratko)} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
