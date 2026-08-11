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
              LOCALIS je osnovan s jednom misijom: dostupna, kvalitetna edukacija
              i savjetovanje za sve.
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
                  LOCALIS je obrt za edukaciju i savjetovanje koji djeluje u
                  Grubišnom Polju, srcu Bjelovarsko-bilogorske županije. Osnivačica
                  Marija Jungić prepoznala je potrebu za profesionalnim
                  edukacijskim i savjetodavnim uslugama koje su dostupne i izvan
                  velikih gradskih centara.
                </p>
                <p>
                  S višegodišnjim iskustvom u poslovnom savjetovanju, organizaciji
                  edukacijskih programa i računovodstvenim uslugama, Marija je
                  izgradila tim koji razumije lokalne posebnosti i potrebe.
                </p>
                <p>
                  Danas LOCALIS pruža usluge poduzećima, obrtnicima, udrugama i
                  pojedincima koji žele unaprijediti svoje znanje i poslovanje –
                  bez kompromisa po pitanju kvalitete.
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
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    &ldquo;Moj je cilj biti most između znanja i prakse – pomoći
                    ljudima i organizacijama da rastu, bez obzira gdje se nalaze.&rdquo;
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    <div>
                      <div className="text-2xl font-bold text-[var(--gold)] font-[family-name:var(--font-playfair)]">10+</div>
                      <div className="text-gray-400 text-xs mt-1">Godina iskustva</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[var(--gold)] font-[family-name:var(--font-playfair)]">200+</div>
                      <div className="text-gray-400 text-xs mt-1">Zadovoljnih klijenata</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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

      {/* Legal info */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-10 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                Poslovni podaci
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Naziv", value: "LOCALIS" },
                { label: "Vlasnik", value: "Marija Jungić" },
                { label: "Djelatnost", value: "Obrazovanje, seminari, savjetovanje, računovodstvo" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="group p-6 rounded-xl border border-gray-100 hover:border-[var(--gold)]/40 hover:shadow-md transition-all duration-300 bg-[oklch(0.98_0.005_85)]"
                >
                  <div className="w-1 h-5 bg-[var(--gold)] rounded-full mb-4" />
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1.5">
                    {label}
                  </p>
                  <p className="text-[var(--navy)] font-semibold text-sm leading-snug">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
