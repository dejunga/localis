"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";

// Placeholder posts – will be replaced by Sanity data
const placeholderPosts = [
  {
    slug: "primjer-clanka-1",
    title: "Kako uspješno organizirati edukacijski seminar",
    excerpt:
      "Organizacija seminara zahtijeva pažljivo planiranje. U ovom članku donosimo ključne korake za uspješan događaj.",
    category: "Edukacija",
    date: "15. ožujka 2026.",
    readTime: "4 min",
  },
  {
    slug: "primjer-clanka-2",
    title: "Važnost kontinuiranog poslovnog savjetovanja",
    excerpt:
      "Savjetovanje nije jednokratna usluga – to je partnerstvo koje donosi dugoročne rezultate za vaše poslovanje.",
    category: "Savjetovanje",
    date: "8. ožujka 2026.",
    readTime: "3 min",
  },
  {
    slug: "primjer-clanka-3",
    title: "Računovodstvo bez stresa: savjeti za poduzetnike",
    excerpt:
      "Uredna dokumentacija i pravovremene prijave osnova su zdravog poslovanja. Evo što trebate znati.",
    category: "Računovodstvo",
    date: "1. ožujka 2026.",
    readTime: "5 min",
  },
];

const categoryColors: Record<string, string> = {
  Edukacija: "bg-blue-50 text-blue-700",
  Savjetovanje: "bg-amber-50 text-amber-700",
  Računovodstvo: "bg-green-50 text-green-700",
};

export default function NewsPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[var(--gold)]" />
              <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                Vijesti
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
              Najnoviji članci
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/vijesti"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--navy)] border border-[var(--navy)]/20 px-5 py-2.5 rounded hover:bg-[var(--navy)] hover:text-white transition-all duration-200"
            >
              Svi članci
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {placeholderPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col"
            >
              {/* Image placeholder */}
              <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/5 mb-5 overflow-hidden flex items-center justify-center">
                <div className="text-[var(--navy)]/20 text-6xl font-bold font-[family-name:var(--font-playfair)]">
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

              <h3 className="text-lg font-bold text-[var(--navy)] mb-2 leading-snug group-hover:text-[var(--navy-light)] transition-colors font-[family-name:var(--font-playfair)]">
                <Link href={`/vijesti/${post.slug}`}>{post.title}</Link>
              </h3>

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
  );
}
