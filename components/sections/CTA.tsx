import { Mail, Phone } from "lucide-react";
import { getTekstovi, telefonZaPoziv } from "@/lib/tekstovi";

export default async function CTA() {
  const t = await getTekstovi();
  return (
    <section className="py-24 bg-[oklch(0.97_0.01_85)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative bg-[var(--navy)] rounded-2xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>

          <div className="relative px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] items-center gap-10">
            <div className="text-white max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-playfair)] leading-tight">
                {t["cta.naslov"]}
              </h2>
              <p className="text-gray-300 leading-relaxed text-pretty">{t["cta.tekst"]}</p>
            </div>

            {/* Kontakt odmah ovdje - jedan klik do e-maila ili poziva umjesto još jedne stranice. */}
            <div className="flex flex-col gap-4">
              <a
                href={`mailto:${t["kontakt.email"]}`}
                className="group inline-flex items-center gap-4 text-white"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)] text-[var(--navy)] transition-colors group-hover:bg-[var(--gold-light)]">
                  <Mail size={20} />
                </span>
                <span className="text-xl md:text-2xl font-semibold group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                  {t["kontakt.email"]}
                </span>
              </a>
              <a href={`tel:${telefonZaPoziv(t["kontakt.telefon"])}`} className="group inline-flex items-center gap-4 text-white">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-white/30 transition-colors group-hover:bg-white/10">
                  <Phone size={20} />
                </span>
                <span className="text-xl md:text-2xl font-semibold tabular-nums group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                  {t["kontakt.telefon"]}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
