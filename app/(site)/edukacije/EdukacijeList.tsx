import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin } from "lucide-react";

export type EdukacijaPrikaz = {
  slug: string;
  naslov: string;
  sazetak: string;
  datum: string; // ISO "2026-11-19"
  datumLabel: string;
  vrijeme: string;
  mjesto: string;
  cijena: string;
  // Dok traje rana prijava: do kad vrijedi i koja je cijena nakon toga.
  rana?: { doLabel: string; redovna: string };
  // Grupni popust računa samo automatska ponuda (lib/ponude/popust.ts).
  grupniPopust: boolean;
  // null = nepoznato (baza nedostupna) ili dovoljno mjesta da nije vrijedno spominjati
  slobodno: number | null;
  predavaci: { ime: string; uloga?: string; foto?: { url: string; alt: string; position?: string } }[];
};

const MJESECI = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"];

function Mjesta({ slobodno }: { slobodno: number | null }) {
  if (slobodno === null) return null;
  if (slobodno === 0) {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        Popunjeno
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      {slobodno === 1 ? "Još 1 slobodno mjesto" : `Još ${slobodno} slobodnih mjesta`}
    </span>
  );
}

function Portret({ foto, velicina }: { foto?: EdukacijaPrikaz["predavaci"][number]["foto"]; velicina: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-[var(--navy)]/8 outline outline-1 -outline-offset-1 outline-black/10"
      style={{ width: velicina, height: velicina }}
    >
      {foto && (
        <Image
          src={foto.url}
          alt={foto.alt}
          fill
          sizes={`${velicina}px`}
          className="object-cover"
          style={{ objectPosition: foto.position ?? "center top" }}
        />
      )}
    </div>
  );
}

// Najbliža edukacija: sve što treba za odluku na jednom mjestu.
export function IstaknutaEdukacija({ e }: { e: EdukacijaPrikaz }) {
  const popunjeno = e.slobodno === 0;
  return (
    <article className="rounded-2xl bg-[oklch(0.97_0.01_85)] p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-10">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--gold)]">Sljedeća edukacija</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight text-balance font-[family-name:var(--font-playfair)]">
          <Link href={`/edukacije/${e.slug}`} className="hover:underline decoration-[var(--gold)] decoration-2 underline-offset-[6px]">
            {e.naslov}
          </Link>
        </h2>
        <p className="mt-4 text-gray-600 leading-relaxed max-w-2xl text-pretty">{e.sazetak}</p>

        <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700">
          <span className="inline-flex items-center gap-2">
            <Clock size={16} className="text-[var(--navy)]" />
            {e.datumLabel}, {e.vrijeme}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin size={16} className="text-[var(--navy)]" />
            {e.mjesto}
          </span>
        </div>

        {e.predavaci.length > 0 && (
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {e.predavaci.map((p) => (
              <li key={p.ime} className="flex items-start gap-3">
                <Portret foto={p.foto} velicina={56} />
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--navy)] leading-snug">{p.ime}</p>
                  {p.uloga && <p className="mt-0.5 text-sm text-gray-500 leading-snug line-clamp-2">{p.uloga}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:border-l lg:border-gray-300/70 lg:pl-10 flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500">Kotizacija po polazniku</p>
          <p className="mt-1 text-3xl font-bold text-[var(--navy)] tabular-nums">{e.cijena}</p>
          {e.rana && (
            <p className="mt-2 text-sm text-gray-600 text-pretty">
              Cijena za rane prijave do {e.rana.doLabel}. Nakon toga {e.rana.redovna}.
            </p>
          )}
          {e.grupniPopust && (
            <p className="mt-2 text-sm text-green-700">Drugi polaznik −10 %, treći i svaki sljedeći −20 %.</p>
          )}
        </div>
        <div>
          <Mjesta slobodno={e.slobodno} />
        </div>
        <div className="mt-auto flex flex-col gap-3">
          {!popunjeno && (
            <Link
              href={`/edukacije/${e.slug}#prijava`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--navy)] px-6 py-3.5 font-semibold text-white shadow-md shadow-[var(--navy)]/20 transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--navy-light)] active:scale-[0.98] motion-reduce:active:scale-100"
            >
              Prijavite se
            </Link>
          )}
          <Link
            href={`/edukacije/${e.slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-[var(--navy)] transition-colors hover:border-[var(--navy)]"
          >
            Program i predavači
          </Link>
        </div>
      </div>
    </article>
  );
}

// Ostale nadolazeće: datum, tema, predavači, cijena - jedan red po edukaciji.
export function RedoviEdukacija({ edukacije }: { edukacije: EdukacijaPrikaz[] }) {
  return (
    <ul className="border-t border-gray-200">
      {edukacije.map((e) => {
        const [, mjesec, dan] = e.datum.split("-");
        return (
          <li key={e.slug} className="border-b border-gray-200">
            <Link
              href={`/edukacije/${e.slug}`}
              className="group grid grid-cols-[4.5rem_minmax(0,1fr)] md:grid-cols-[5.5rem_minmax(0,1fr)_auto] gap-x-6 gap-y-4 items-center py-7 -mx-4 px-4 rounded-lg transition-colors duration-200 hover:bg-[oklch(0.97_0.01_85)]"
            >
              <div className="text-center self-start md:self-center">
                <div className="text-4xl md:text-5xl font-bold leading-none text-[var(--navy)] tabular-nums font-[family-name:var(--font-playfair)]">
                  {Number(dan)}.
                </div>
                <div className="mt-1 text-sm font-medium text-[var(--gold)]">{MJESECI[Number(mjesec) - 1]}</div>
              </div>

              <div className="min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-[var(--navy)] leading-snug text-pretty font-[family-name:var(--font-playfair)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                  {e.naslov}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500">
                  {e.mjesto}, {e.vrijeme}
                </p>
                {e.predavaci.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    {e.predavaci.map((p) => (
                      <span key={p.ime} className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <Portret foto={p.foto} velicina={28} />
                        {p.ime}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-start-2 md:col-start-auto flex flex-wrap items-center gap-x-5 gap-y-2 md:flex-col md:items-end md:gap-2">
                <span className="text-base font-semibold text-[var(--navy)] tabular-nums whitespace-nowrap">
                  {e.cijena}
                </span>
                {e.rana && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">rana prijava do {e.rana.doLabel}</span>
                )}
                <Mjesta slobodno={e.slobodno} />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)] whitespace-nowrap">
                  {e.slobodno === 0 ? "Program" : "Prijava"}
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Održane i odgođene: kompaktna lista bez cijena i prijave.
export function KratkiPopis({
  edukacije,
  napomena,
}: {
  edukacije: Pick<EdukacijaPrikaz, "slug" | "naslov" | "datumLabel" | "mjesto" | "predavaci">[];
  napomena?: string;
}) {
  return (
    <ul className="divide-y divide-gray-200 border-y border-gray-200">
      {edukacije.map((e) => (
        <li key={e.slug}>
          <Link
            href={`/edukacije/${e.slug}`}
            className="group grid grid-cols-1 md:grid-cols-[11rem_minmax(0,1fr)] gap-x-6 gap-y-1 py-5"
          >
            <span className="text-sm text-gray-500 tabular-nums">{napomena ?? e.datumLabel}</span>
            <span className="min-w-0">
              <span className="block font-semibold text-[var(--navy)] leading-snug text-pretty group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                {e.naslov}
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                {e.mjesto}
                {e.predavaci.length > 0 && `, ${e.predavaci.map((p) => p.ime).join(" i ")}`}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
