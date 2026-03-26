"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";

// Placeholder – zamijenit će se Sanity podacima
const posts = [
  {
    slug: "kako-uspjesno-organizirati-edukacijski-seminar",
    title: "Kako uspješno organizirati edukacijski seminar",
    excerpt: "Organizacija seminara zahtijeva pažljivo planiranje. U ovom članku donosimo ključne korake za uspješan događaj koji ostavlja trag.",
    category: "Edukacija",
    date: "15. ožujka 2026.",
    readTime: "4 min",
  },
  {
    slug: "vaznost-kontinuiranog-poslovnog-savjetovanja",
    title: "Važnost kontinuiranog poslovnog savjetovanja",
    excerpt: "Savjetovanje nije jednokratna usluga – to je partnerstvo koje donosi dugoročne rezultate za vaše poslovanje i tim.",
    category: "Savjetovanje",
    date: "8. ožujka 2026.",
    readTime: "3 min",
  },
  {
    slug: "racunovodstvo-bez-stresa-savjeti-za-poduzetnike",
    title: "Računovodstvo bez stresa: savjeti za poduzetnike",
    excerpt: "Uredna dokumentacija i pravovremene prijave osnova su zdravog poslovanja. Evo što svaki poduzetnik treba znati.",
    category: "Računovodstvo",
    date: "1. ožujka 2026.",
    readTime: "5 min",
  },
  {
    slug: "eu-fondovi-kako-aplicirati",
    title: "EU fondovi: kako aplicirati i što izbjegavati",
    excerpt: "Pristup EU fondovima može biti presudan za rast vašeg poslovanja. Vodimo vas kroz proces aplikacije korak po korak.",
    category: "Savjetovanje",
    date: "20. veljače 2026.",
    readTime: "6 min",
  },
  {
    slug: "meke-vjestine-kljuc-poslovnog-uspjeha",
    title: "Meke vještine: ključ poslovnog uspjeha",
    excerpt: "Tehnička znanja su neophodna, ali meke vještine – komunikacija, timski rad, liderstvo – čine razliku između dobrog i izvrsnog.",
    category: "Edukacija",
    date: "10. veljače 2026.",
    readTime: "4 min",
  },
];

const categoryColors: Record<string, string> = {
  Edukacija: "bg-blue-50 text-blue-700",
  Savjetovanje: "bg-amber-50 text-amber-700",
  Računovodstvo: "bg-green-50 text-green-700",
};

export default function VijestiPage() {
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

      {/* Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group flex flex-col"
              >
                {/* Image placeholder */}
                <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 mb-5 overflow-hidden flex items-center justify-center">
                  <div className="text-[var(--navy)]/15 text-7xl font-bold font-[family-name:var(--font-playfair)]">
                    {post.title[0]}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category]}`}>
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar size={11} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock size={11} />
                    {post.readTime}
                  </div>
                </div>

                <h2 className="text-lg font-bold text-[var(--navy)] mb-2 leading-snug group-hover:text-[var(--navy-light)] transition-colors font-[family-name:var(--font-playfair)]">
                  <Link href={`/vijesti/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>

                <Link
                  href={`/vijesti/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold)] group-hover:gap-3 transition-all duration-200"
                >
                  Čitaj više
                  <ArrowRight size={14} />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
