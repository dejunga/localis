"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function EdukacijePage() {
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
                Znanje koje pokreće
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
              Edukacije
            </h1>
            <p className="text-gray-300 mt-4 max-w-xl text-lg">
              Radionice, seminari i predavanja za službenike lokalne samouprave
              i sve koji se u svom radu susreću s tim temama.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-[var(--navy)] mb-4 font-[family-name:var(--font-playfair)]">
              Popis edukacija uskoro
            </h2>
            <p className="text-gray-500 mb-8">
              Trenutno pripremamo raspored nadolazećih edukacija. Za pitanja o
              aktualnim programima ili prijave, javite nam se izravno.
            </p>
            <Link
              href="/kontakt"
              className="inline-flex items-center px-8 py-3.5 bg-[var(--navy)] text-white font-medium rounded hover:bg-[var(--navy-light)] transition-colors"
            >
              Kontaktirajte nas
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
