"use client";

import { motion } from "framer-motion";

export default function VijestiHero() {
  return (
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
              Blog
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
            Vijesti i članci
          </h1>
          <p className="text-gray-300 mt-4 max-w-xl text-lg">
            Stručni članci, savjeti i novosti iz područja edukacije, savjetovanja i poslovanja.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
