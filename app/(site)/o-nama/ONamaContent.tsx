import CTA from "@/components/sections/CTA";
import PopisPredavaca from "@/components/sections/PopisPredavaca";
import type { Predavac } from "@/lib/edukacije";

// Područja iz čl. 19. Zakona o lokalnoj i područnoj (regionalnoj) samoupravi koja obrađujemo.
const podrucja = [
  "Uređenje naselja i stanovanje",
  "Prostorno i urbanističko planiranje",
  "Komunalno gospodarstvo",
  "Predškolski odgoj i osnovno obrazovanje",
  "Socijalna skrb",
  "Primarna zdravstvena zaštita",
  "Kultura i šport",
  "Zaštita potrošača",
  "Zaštita okoliša",
  "Protupožarna i civilna zaštita",
  "Promet",
];

const blokovi = [
  {
    title: "Kome se obraćamo",
    text: "Program je namijenjen službenicima gradova i općina, ali i zaposlenicima u ustanovama i trgovačkim društvima osnovanima za obavljanje poslova od značaja za lokalnu samoupravu - te svima onima kojima je u poslu potreban pouzdan, ažuran i primjenjiv izvor znanja o pitanjima koja se tiču lokalne samouprave.",
  },
  {
    title: "Zašto LOCALIS",
    text: "Teme biramo prema stvarnim potrebama struke, a ne prema trenutnim trendovima, i ne bježimo od pitanja koja se godinama zaobilaze. Naši predavači podjednako dobro poznaju teoriju i praksu, pa iz svake radionice polaznici izlaze s jasnim, primjenjivim zaključcima.",
  },
];

const vrijednosti = [
  {
    title: "Ciljano djelovanje",
    description: "Svaki program i savjet prilagođen je vašim specifičnim potrebama i ciljevima.",
  },
  {
    title: "Transparentnost",
    description: "Otvorena komunikacija i jasni dogovori - bez skrivenih troškova ili iznenađenja.",
  },
  {
    title: "Predanost zajednici",
    description: "Ukorijenjeni smo u lokalnoj zajednici i posvećeni njenom razvoju.",
  },
];

export default function ONamaContent({ predavaci }: { predavaci: Predavac[] }) {
  return (
    <>
      <section className="bg-[var(--navy)] pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
            O nama
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
            Osnažujemo one koji svakodnevno vode gradove i općine - edukacijama i savjetovanjem
            koji polaze od stvarnih pitanja iz prakse.
          </p>
        </div>
      </section>

      {/* Priča: misao lijevo, tekst desno */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16">
          <div>
            <h2 className="text-sm font-semibold text-[var(--gold)] mb-4">Naša priča</h2>
            <p className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight text-balance font-[family-name:var(--font-playfair)]">
              Pitanja koja muče struku, konačno na dnevnom redu.
            </p>
          </div>
          <div className="space-y-5 text-[1.0625rem] leading-[1.8] text-gray-700">
            <p className="text-pretty">
              LOCALIS je osnovan s ciljem da pomogne u rješavanju svakodnevnih izazova s kojima se u
              stvarnosti suočavaju službenici jedinica lokalne samouprave i zaposlenici pravnih osoba
              koje su osnovane za obavljanje poslova od značaja za lokalnu samoupravu - ali i ostali
              koji se u svakodnevnom radu susreću s temama iz sustava lokalne samouprave: pravnici u
              javnom i privatnom sektoru, zaposlenici u kadrovskim odjelima, poduzetnici, obrtnici i
              drugi stručnjaci koji u svom radu primjenjuju pravne propise.
            </p>
            <p className="text-pretty">
              LOCALIS je nastao iz prepoznate potrebe za profesionalnim edukacijskim i savjetodavnim
              uslugama koje su dostupne i izvan velikih gradskih centara.
            </p>
            <p className="text-pretty">
              Zato smo ovdje mi, LOCALIS - zajedno s vama obrađujemo teme koje muče struku i koje
              napokon dolaze na dnevni red. Svaku temu obrađujemo stručno, ali prije svega praktično -
              polaznici odlaze s konkretnim smjernicama koje mogu odmah primijeniti u svom radu.
            </p>
          </div>
        </div>
      </section>

      {/* Što radimo: područja iz zakona kao oznake */}
      <section className="py-20 md:py-24 bg-[oklch(0.97_0.01_85)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight font-[family-name:var(--font-playfair)]">
              Što radimo
            </h2>
            <p className="mt-5 text-gray-700 leading-relaxed text-pretty">
              Polazimo od samog izvora - članka 19. Zakona o lokalnoj i područnoj (regionalnoj)
              samoupravi - i prolazimo kroz sva područja koja taj zakon stavlja u nadležnost gradova
              i općina, uključujući i često zapostavljene nadležnosti poput prometa.
            </p>
          </div>
          <div>
            <ul className="flex flex-wrap gap-2.5">
              {podrucja.map((p) => (
                <li
                  key={p}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    p === "Komunalno gospodarstvo"
                      ? "bg-[var(--navy)] text-white"
                      : "bg-white text-[var(--navy)] border border-gray-200"
                  }`}
                >
                  {p}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Istaknuto: komunalno gospodarstvo, koje najviše opterećuje svakodnevni rad.
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10">
              {blokovi.map((b) => (
                <div key={b.title} className="border-t-2 border-[var(--gold)] pt-5">
                  <h3 className="text-xl font-bold text-[var(--navy)] mb-3 font-[family-name:var(--font-playfair)]">
                    {b.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-pretty">{b.text}</p>
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
                Naši predavači
              </h2>
              <p className="mt-5 text-gray-700 text-[1.0625rem] leading-relaxed text-pretty">
                Radionice i predavanja vode vrhunski iskusni stručnjaci i rukovodeći službenici,
                dokazani u praktičnom rješavanju problema lokalne samouprave, uz fakultetske profesore
                koji svoje akademsko znanje pretaču u primjenjiva rješenja. Ta kombinacija prakse i
                znanosti jamči da svaka edukacija donosi odgovore koji doista vrijede u svakodnevnom
                radu, a ne teoriju koja ostaje na papiru.
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
              Naš tim
            </h2>
            <div className="relative overflow-hidden rounded-2xl bg-[var(--navy)] p-8 md:p-10 text-white">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-14 h-14 bg-[var(--gold)] rounded-xl flex items-center justify-center mb-6">
                  <span className="text-[var(--navy)] text-2xl font-bold font-[family-name:var(--font-playfair)]">M</span>
                </div>
                <h3 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">Milada Sofka</h3>
                <p className="mt-1 text-[var(--gold)] text-sm font-medium">Voditeljica ureda</p>
                <p className="mt-5 text-gray-300 leading-relaxed text-pretty">
                  &ldquo;Vjerujem da svaka osoba i svaka organizacija ima potencijal za rast. Moja je
                  uloga pomoći im da ga prepoznaju i razviju.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight mb-8 font-[family-name:var(--font-playfair)]">
              Naše vrijednosti
            </h2>
            <dl className="divide-y divide-gray-300/70 border-y border-gray-300/70">
              {vrijednosti.map((v) => (
                <div key={v.title} className="py-6">
                  <dt className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
                    {v.title}
                  </dt>
                  <dd className="mt-2 text-gray-700 leading-relaxed text-pretty">{v.description}</dd>
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
