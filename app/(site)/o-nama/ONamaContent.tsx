"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Target, Eye, Heart } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Target,
    title: "Ciljano djelovanje",
    description: "Svaki program i savjet prilagođen je vašim specifičnim potrebama i ciljevima.",
  },
  {
    icon: Eye,
    title: "Transparentnost",
    description: "Otvorena komunikacija i jasni dogovori – bez skrivenih troškova ili iznenađenja.",
  },
  {
    icon: Heart,
    title: "Predanost zajednici",
    description: "Ukorijenjeni smo u lokalnoj zajednici i posvećeni njenom razvoju.",
  },
];

export default function ONamaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--navy)] pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                Tko smo
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
              O nama
            </h1>
            <p className="text-gray-300 mt-4 max-w-xl text-lg">
              Pitanja koja muče struku, konačno na dnevnom redu – osnažujemo
              one koji svakodnevno vode gradove i općine.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl font-bold text-[var(--navy)] mb-6 font-[family-name:var(--font-playfair)]">
                Naša priča
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  LOCALIS je osnovan s ciljem da pomogne u rješavanju
                  svakodnevnih izazova s kojima se u stvarnosti suočavaju
                  službenici jedinica lokalne samouprave i zaposlenici
                  pravnih osoba koje su osnovane za obavljanje poslova od
                  značaja za lokalnu samoupravu – ali i ostali koji se u
                  svakodnevnom radu susreću s temama iz sustava lokalne
                  samouprave: pravnici u javnom i privatnom sektoru,
                  zaposlenici u kadrovskim odjelima, poduzetnici, obrtnici i
                  drugi stručnjaci koji u svom radu primjenjuju pravne
                  propise.
                </p>
                <p>
                  Osnivačica Marija Jungić prepoznala je potrebu za
                  profesionalnim edukacijskim i savjetodavnim uslugama koje
                  su dostupne i izvan velikih gradskih centara – djelujemo iz
                  Grubišnog Polja, srca Bjelovarsko-bilogorske županije.
                </p>
                <p>
                  Zato smo ovdje mi, LOCALIS – zajedno s vama obrađujemo teme
                  koje muče struku i koje napokon dolaze na dnevni red. Svaku
                  temu obrađujemo stručno, ali prije svega praktično –
                  polaznici odlaze s konkretnim smjernicama koje mogu odmah
                  primijeniti u svom radu.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="bg-[var(--navy)] rounded-2xl p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="relative">
                  <div className="w-16 h-16 bg-[var(--gold)] rounded-xl flex items-center justify-center mb-6">
                    <span className="text-[var(--navy)] text-3xl font-bold font-[family-name:var(--font-playfair)]">M</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1 font-[family-name:var(--font-playfair)]">Marija Jungić</h3>
                  <p className="text-[var(--gold)] text-sm uppercase tracking-wider font-medium mb-4">
                    Vlasnica i osnivačica · vl. LOCALIS
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-20 bg-[oklch(0.97_0.01_85)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14">
            {[
              {
                title: "Što radimo",
                text: "Polazimo od samog izvora – članka 19. Zakona o lokalnoj i područnoj (regionalnoj) samoupravi – i prolazimo kroz sva područja koja taj zakon stavlja u nadležnost gradova i općina. Od uređenja naselja, stanovanja i prostornog planiranja, preko komunalnog gospodarstva koje najviše opterećuje svakodnevni rad, do predškolskog i osnovnoškolskog odgoja, socijalne skrbi i primarne zdravstvene zaštite. Dotičemo se kulture, športa, zaštite potrošača, zaštite okoliša, protupožarne i civilne zaštite, ali i često zapostavljene nadležnosti u prometu.",
              },
              {
                title: "Naši predavači",
                text: "Radionice i predavanja vode vrhunski iskusni stručnjaci i rukovodeći službenici, dokazani u praktičnom rješavanju problema lokalne samouprave, uz fakultetske profesore koji svoje akademsko znanje pretaču u primjenjiva rješenja. Ta kombinacija prakse i znanosti jamči da svaka edukacija donosi odgovore koji doista vrijede u svakodnevnom radu, a ne teoriju koja ostaje na papiru.",
              },
              {
                title: "Kome se obraćamo",
                text: "Program je namijenjen službenicima gradova i općina, ali i zaposlenicima u ustanovama i trgovačkim društvima osnovanima za obavljanje poslova od značaja za lokalnu samoupravu – te svima onima kojima je u poslu potreban pouzdan, ažuran i primjenjiv izvor znanja o pitanjima koja se tiču lokalne samouprave.",
              },
              {
                title: "Zašto LOCALIS",
                text: "Teme biramo prema stvarnim potrebama struke, a ne prema trenutnim trendovima, i ne bježimo od pitanja koja se godinama zaobilaze. Naši predavači podjednako dobro poznaju teoriju i praksu, pa iz svake radionice polaznici izlaze s jasnim, primjenjivim zaključcima.",
              },
            ].map((block, i) => (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <h3 className="text-xl font-bold text-[var(--navy)] mb-3 font-[family-name:var(--font-playfair)]">
                  {block.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">{block.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-10 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                Ljudi iza LOCALIS-a
              </span>
              <div className="h-px w-10 bg-[var(--gold)]" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
              Naš tim
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                initial: "M",
                name: "Marija Jungić",
                role: "Vlasnica i osnivačica",
              },
              {
                initial: "M",
                name: "Milada Sofka",
                role: "Voditeljica ureda",
                quote:
                  "Vjerujem da svaka osoba i svaka organizacija ima potencijal za rast. Moja je uloga pomoći im da ga prepoznaju i razviju.",
              },
            ].map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[oklch(0.97_0.01_85)] rounded-xl p-8 border border-gray-100"
              >
                <div className="w-14 h-14 bg-[var(--navy)] rounded-xl flex items-center justify-center mb-5">
                  <span className="text-[var(--gold)] text-2xl font-bold font-[family-name:var(--font-playfair)]">
                    {person.initial}
                  </span>
                </div>
                <h3 className="font-bold text-[var(--navy)] mb-1 font-[family-name:var(--font-playfair)] text-lg">
                  {person.name}
                </h3>
                <p className="text-[var(--gold)] text-xs uppercase tracking-wider font-medium mb-4">
                  {person.role}
                </p>
                {person.quote && (
                  <p className="text-gray-500 text-sm leading-relaxed">
                    &ldquo;{person.quote}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[oklch(0.97_0.01_85)]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
              Naše vrijednosti
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white rounded-xl p-8 border border-gray-100"
                >
                  <div className="w-12 h-12 bg-[var(--navy)]/8 rounded-lg flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[var(--navy)]" />
                  </div>
                  <h3 className="font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)] text-lg">
                    {v.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get in touch */}
      <section className="py-20 bg-[var(--navy)]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
              Javite nam se
            </h2>
            <p className="text-gray-300 mb-8">
              Ako u svom radu prepoznajete pitanja koja godinama čekaju
              odgovor, LOCALIS je tu da ih zajedno raspravimo i riješimo.
              Prijavite se na naše seminare i radionice i osigurajte da ćete
              na nadolazeće izazove biti spremni dati pravilan i siguran
              odgovor.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center px-8 py-3.5 bg-[var(--gold)] text-[var(--navy)] font-semibold rounded hover:bg-[var(--gold-light)] transition-colors"
            >
              Kontaktirajte nas
            </Link>
          </motion.div>
        </div>
      </section>

    </>
  );
}
