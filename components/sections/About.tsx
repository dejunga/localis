"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  "Individualni pristup svakom klijentu",
  "Iskustvo u privatnom i javnom sektoru",
  "Lokalna zajednica – naša snaga",
  "Kontinuirano stručno usavršavanje",
];

export default function About() {
  return (
    <section className="py-24 bg-[oklch(0.97_0.01_85)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                O nama
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] leading-tight mb-6 font-[family-name:var(--font-playfair)]">
              Stručnost u službi vaše zajednice
            </h2>

            <p className="text-gray-600 leading-relaxed mb-5 text-lg">
              LOCALIS je obrt osnovan s ciljem pružanja kvalitetnih usluga
              edukacije i savjetovanja u Bjelovarsko-bilogorskoj županiji i šire.
              Na čelu je Marija Jungić, dugogodišnja stručnjakinja u području
              poslovnog savjetovanja i organizacije edukacijskih programa.
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              Vjerujemo da znanje i profesionalni razvoj nisu privilegija
              velikih gradova. Naša misija je dostupna, kvalitetna i
              praktična edukacija za sve – bez obzira na lokaciju.
            </p>

            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
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
              Više o nama
            </Link>
          </motion.div>

          {/* Visual block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative bg-[var(--navy)] rounded-2xl p-10 text-white overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative">
                <div className="w-16 h-16 bg-[var(--gold)] rounded-xl flex items-center justify-center mb-6">
                  <span className="text-[var(--navy)] text-3xl font-bold font-[family-name:var(--font-playfair)]">M</span>
                </div>

                <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-playfair)]">
                  Marija Jungić
                </h3>
                <p className="text-[var(--gold)] text-sm font-medium mb-4 uppercase tracking-wider">
                  Vlasnica i osnivačica
                </p>
                <p className="text-gray-300 leading-relaxed text-sm">
                  &ldquo;Vjerujem da svaka osoba i svaka organizacija ima potencijal
                  za rast. Moja je uloga pomoći im da ga prepoznaju i razviju.&rdquo;
                </p>

                <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-[var(--gold)] font-[family-name:var(--font-playfair)]">10+</div>
                    <div className="text-gray-400 text-sm mt-1">Godina iskustva</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[var(--gold)] font-[family-name:var(--font-playfair)]">200+</div>
                    <div className="text-gray-400 text-sm mt-1">Klijenata</div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
