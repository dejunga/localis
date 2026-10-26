import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type NadolazecaEdukacija = {
  slug: string;
  naslov: string;
  datum: string; // ISO "2026-11-19"
  mjesto: string;
  cijena: string;
};

const MJESECI = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"];

// Raspored nadolazećih edukacija: datum lijevo, tema u sredini, cijena i prijava desno.
export default function NadolazeceEdukacije({ edukacije }: { edukacije: NadolazecaEdukacija[] }) {
  if (edukacije.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
            Nadolazeće edukacije
          </h2>
          <Link
            href="/edukacije"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
          >
            Sve edukacije
            <ArrowRight size={15} />
          </Link>
        </div>

        <ul className="border-t border-gray-200">
          {edukacije.map((e) => {
            const [, mjesec, dan] = e.datum.split("-");
            return (
              <li key={e.slug} className="border-b border-gray-200">
                <Link
                  href={`/edukacije/${e.slug}`}
                  className="group grid grid-cols-[4.5rem_minmax(0,1fr)] md:grid-cols-[5.5rem_minmax(0,1fr)_auto] gap-x-6 gap-y-3 items-center py-7 -mx-4 px-4 rounded-lg transition-colors duration-200 hover:bg-[oklch(0.97_0.01_85)]"
                >
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold leading-none text-[var(--navy)] tabular-nums font-[family-name:var(--font-playfair)]">
                      {Number(dan)}.
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--gold)]">
                      {MJESECI[Number(mjesec) - 1]}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-[var(--navy)] leading-snug text-pretty font-[family-name:var(--font-playfair)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                      {e.naslov}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-500">{e.mjesto}</p>
                  </div>

                  <div className="col-start-2 md:col-start-auto flex items-center gap-5 md:justify-end">
                    <span className="text-base font-semibold text-[var(--navy)] tabular-nums whitespace-nowrap">
                      {e.cijena}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)] whitespace-nowrap">
                      Prijava
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
