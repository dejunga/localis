import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Predavac } from "@/lib/edukacije";
import { getTekstovi, odlomci, stavke } from "@/lib/tekstovi";
import PopisPredavaca from "./PopisPredavaca";

export default async function About({ predavaci }: { predavaci: Predavac[] }) {
  const t = await getTekstovi();
  const tekst = odlomci(t["pocetna.onama.tekst"]);
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] leading-tight mb-6 text-balance font-[family-name:var(--font-playfair)]">
              {t["pocetna.onama.naslov"]}
            </h2>

            {/* Prvi odlomak je veći uvod, ostali obični. */}
            {tekst.map((o, i) => (
              <p
                key={i}
                className={`text-gray-600 leading-relaxed text-pretty ${i === 0 ? "text-lg" : ""} ${i === tekst.length - 1 ? "mb-8" : "mb-5"}`}
              >
                {o}
              </p>
            ))}

            <ul className="space-y-3 mb-10">
              {stavke(t["pocetna.onama.istaknuto"]).map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/o-nama"
              className="inline-flex items-center px-6 py-3 bg-[var(--navy)] text-white font-medium rounded transition-colors hover:bg-[var(--navy-light)]"
            >
              {t["pocetna.onama.gumb"]}
            </Link>
          </div>

          {/* Visual block */}
          <div className="relative bg-[var(--navy)] rounded-2xl p-10 text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="w-16 h-16 bg-[var(--gold)] rounded-xl flex items-center justify-center mb-6">
                <span className="text-[var(--navy)] text-3xl font-bold font-[family-name:var(--font-playfair)]">
                  {t["tim.ime"].charAt(0)}
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-1 font-[family-name:var(--font-playfair)]">
                {t["tim.ime"]}
              </h3>
              <p className="text-[var(--gold)] text-sm font-medium mb-4">{t["tim.uloga"]}</p>
              <p className="text-gray-300 leading-relaxed text-pretty">
                &ldquo;{t["tim.citat"]}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {predavaci.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)]">
              {t["pocetna.predavaci.naslov"]}
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl text-pretty">
              {t["pocetna.predavaci.uvod"]}
            </p>
            <PopisPredavaca predavaci={predavaci} />
          </div>
        )}
      </div>
    </section>
  );
}
