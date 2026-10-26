import CTA from "@/components/sections/CTA";
import PopisPredavaca from "@/components/sections/PopisPredavaca";
import type { Predavac } from "@/lib/edukacije";
import { getTekstovi, odlomci, stavke } from "@/lib/tekstovi";

// Ključevi tekstova iz lib/tekstovi.ts (uređuju se u adminu).
const blokovi = [
  { title: "onama.kome.naslov", tekst: "onama.kome" },
  { title: "onama.zasto.naslov", tekst: "onama.zasto" },
] as const;

const vrijednosti = [
  { title: "onama.vrijednosti.ciljano.naslov", description: "onama.vrijednosti.ciljano" },
  { title: "onama.vrijednosti.transparentnost.naslov", description: "onama.vrijednosti.transparentnost" },
  { title: "onama.vrijednosti.zajednica.naslov", description: "onama.vrijednosti.zajednica" },
] as const;

export default async function ONamaContent({ predavaci }: { predavaci: Predavac[] }) {
  const t = await getTekstovi();
  return (
    <>
      <section className="bg-[var(--navy)] pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
            {t["onama.naslov"]}
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
            {t["onama.uvod"]}
          </p>
        </div>
      </section>

      {/* Priča: misao lijevo, tekst desno */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16">
          <div>
            <h2 className="text-sm font-semibold text-[var(--gold)] mb-4">{t["onama.prica.oznaka"]}</h2>
            <p className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight text-balance font-[family-name:var(--font-playfair)]">
              {t["onama.prica.misao"]}
            </p>
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-[1.8] text-gray-700">
            {odlomci(t["onama.prica.tekst"]).map((o, i) => (
              <p key={i} className="text-pretty">
                {o}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Što radimo: područja iz zakona kao oznake */}
      <section className="py-20 md:py-24 bg-[oklch(0.97_0.01_85)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight font-[family-name:var(--font-playfair)]">
              {t["onama.radimo.naslov"]}
            </h2>
            <p className="mt-5 text-gray-700 leading-relaxed text-pretty">
              {t["onama.radimo.tekst"]}
            </p>
          </div>
          <div>
            <ul className="flex flex-wrap gap-2.5">
              {/* Područja iz čl. 19. Zakona o lokalnoj i područnoj (regionalnoj) samoupravi. */}
              {stavke(t["onama.radimo.podrucja"]).map((p) => (
                <li
                  key={p}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    p === t["onama.radimo.istaknuto"]
                      ? "bg-[var(--navy)] text-white"
                      : "bg-white text-[var(--navy)] border border-gray-200"
                  }`}
                >
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              {t["onama.radimo.napomena"]}
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
              {blokovi.map((b) => (
                <div key={b.title} className="border-t-2 border-[var(--gold)] pt-5">
                  <h3 className="text-xl font-bold text-[var(--navy)] mb-3 font-[family-name:var(--font-playfair)]">
                    {t[b.title]}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-pretty">{t[b.tekst]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Predavači - stvarni ljudi s edukacija */}
      {predavaci.length > 0 && (
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight font-[family-name:var(--font-playfair)]">
                {t["onama.predavaci.naslov"]}
              </h2>
              <p className="mt-5 text-gray-700 text-[1.0625rem] leading-relaxed text-pretty">
                {t["onama.predavaci"]}
              </p>
            </div>
            <PopisPredavaca predavaci={predavaci} />
          </div>
        </section>
      )}

      {/* Tim i vrijednosti */}
      <section className="py-20 md:py-24 bg-[oklch(0.97_0.01_85)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight mb-8 font-[family-name:var(--font-playfair)]">
              {t["onama.tim.naslov"]}
            </h2>
            <div className="relative overflow-hidden rounded-2xl bg-[var(--navy)] p-8 md:p-10 text-white">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-14 h-14 bg-[var(--gold)] rounded-xl flex items-center justify-center mb-6">
                  <span className="text-[var(--navy)] text-2xl font-bold font-[family-name:var(--font-playfair)]">
                    {t["tim.ime"].charAt(0)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">{t["tim.ime"]}</h3>
                <p className="mt-1 text-[var(--gold)] text-sm font-medium">{t["tim.uloga"]}</p>
                <p className="mt-5 text-gray-300 leading-relaxed text-pretty">
                  &ldquo;{t["tim.citat"]}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight mb-8 font-[family-name:var(--font-playfair)]">
              {t["onama.vrijednosti.naslov"]}
            </h2>
            <dl className="divide-y divide-gray-300/70 border-y border-gray-300/70">
              {vrijednosti.map((v) => (
                <div key={v.title} className="py-6">
                  <dt className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
                    {t[v.title]}
                  </dt>
                  <dd className="mt-2 text-gray-700 leading-relaxed text-pretty">{t[v.description]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
