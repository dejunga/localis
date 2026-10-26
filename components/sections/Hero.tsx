"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import HeroPozadina from "./HeroPozadina";
import KartaHrvatske from "./KartaHrvatske";

export type SljedecaEdukacija = {
  naslov: string;
  datum: string;
  mjesto: string;
  slug: string;
};

export default function Hero({
  sljedeca,
  istaknuti,
}: {
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
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-[var(--gold)] text-lg md:text-xl font-medium mb-5 font-[family-name:var(--font-playfair)]"
          >
            Savjetovanje i edukacija za lokalnu samoupravu
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white text-5xl md:text-6xl font-bold leading-[1.08] text-balance mb-6 font-[family-name:var(--font-playfair)]"
          >
            Pitanja koja muče struku, konačno na dnevnom redu.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-lg leading-relaxed mb-9 max-w-xl text-pretty"
          >
            Osnažujemo one koji svakodnevno vode gradove i općine - uz
            edukaciju, organizaciju seminara i poslovno savjetovanje
            prilagođeno vašim potrebama.
          </motion.p>

          {sljedeca && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mt-10 max-w-xl"
            >
              <Link
                href={`/edukacije/${sljedeca.slug}`}
                className="group block rounded-xl border border-white/15 bg-white/[0.06] backdrop-blur-sm px-5 py-4 transition-colors duration-200 hover:border-[var(--gold)]/60 hover:bg-white/[0.09]"
              >
                <p className="text-sm text-gray-400 mb-1">Sljedeća edukacija</p>
                <p className="text-white text-lg font-semibold leading-snug text-pretty font-[family-name:var(--font-playfair)]">
                  {sljedeca.naslov}
                </p>
                <p className="mt-1.5 text-sm text-gray-300">
                  {sljedeca.datum}, {sljedeca.mjesto}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--gold)]">
                  Program i prijava
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </p>
              </Link>
            </motion.div>
          )}
        </div>

        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <KartaHrvatske istaknuti={istaknuti} />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/40"
        >
          <ChevronDown size={28} />
        </motion.div>
      </motion.div>
    </section>
  );
}
