import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import HeroPozadina from "./HeroPozadina";
import KartaHrvatske from "./KartaHrvatske";
// Samo tipovi - lib/tekstovi povlači bazu i ne smije u klijentski bundle.
import type { KLJUCEVI_HERO, Tekstovi } from "@/lib/tekstovi";

export type SljedecaEdukacija = {
  naslov: string;
  datum: string;
  mjesto: string;
  slug: string;
};

export default function Hero({
  t,
  sljedeca,
  istaknuti,
}: {
  t: Pick<Tekstovi, (typeof KLJUCEVI_HERO)[number]>;
  sljedeca?: SljedecaEdukacija;
  // Nazivi iz lib/karta-jls.ts ("Grad Zagreb") - mjesta edukacija označena na karti.
  istaknuti: string[];
}) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--navy)] via-[#1a3a5c] to-[#0a1f35]" />

      <HeroPozadina />

      {/* Gold accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent" />

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:gap-10 items-center">
        <div>
          <p className="animate-in fade-in [animation-fill-mode:both] motion-reduce:animate-none slide-in-from-bottom-5 duration-600 [animation-delay:50ms] text-[var(--gold)] text-lg md:text-xl font-medium mb-5 font-[family-name:var(--font-playfair)]">
            {t["pocetna.hero.nadnaslov"]}
          </p>

          <h1 className="animate-in fade-in [animation-fill-mode:both] motion-reduce:animate-none slide-in-from-bottom-8 duration-700 [animation-delay:100ms] text-white text-5xl md:text-6xl font-bold leading-[1.08] text-balance mb-6 font-[family-name:var(--font-playfair)]">
            {t["pocetna.hero.naslov"]}
          </h1>

          <p className="animate-in fade-in [animation-fill-mode:both] motion-reduce:animate-none slide-in-from-bottom-5 duration-600 [animation-delay:200ms] text-gray-300 text-lg leading-relaxed mb-9 max-w-xl text-pretty">
            {t["pocetna.hero.uvod"]}
          </p>

          {sljedeca && (
            <div className="animate-in fade-in [animation-fill-mode:both] motion-reduce:animate-none slide-in-from-bottom-5 duration-600 [animation-delay:450ms] mt-10 max-w-xl">
              <Link
                href={`/edukacije/${sljedeca.slug}`}
                className="group block rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm px-5 py-4 transition-colors duration-200 hover:border-[var(--gold)]/60 hover:bg-white/[0.09]"
              >
                <p className="text-sm text-gray-400 mb-1">{t["pocetna.hero.sljedeca"]}</p>
                <p className="text-white text-lg font-semibold leading-snug text-pretty font-[family-name:var(--font-playfair)]">
                  {sljedeca.naslov}
                </p>
                <p className="mt-1.5 text-sm text-gray-300">
                  {sljedeca.datum}, {sljedeca.mjesto}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)]">
                  {t["pocetna.hero.sljedeca.gumb"]}
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </p>
              </Link>
            </div>
          )}
        </div>

        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <KartaHrvatske istaknuti={istaknuti} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-500 [animation-delay:1000ms] [animation-fill-mode:both] motion-reduce:animate-none">
        <div className="text-white/40 animate-[poskakivanje_2s_ease-in-out_infinite] motion-reduce:animate-none">
          <ChevronDown size={28} />
        </div>
      </div>
    </section>
  );
}
