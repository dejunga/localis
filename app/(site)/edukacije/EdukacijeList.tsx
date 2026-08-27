"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, MapPin } from "lucide-react";
import type { Seminar } from "@/lib/edukacije";

export default function EdukacijeList({ seminars }: { seminars: Seminar[] }) {
  if (seminars.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10">
        Trenutno pripremamo raspored nadolazećih edukacija. Vratite se uskoro.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {seminars.map((seminar, i) => (
        <motion.article
          key={seminar.slug}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="group flex flex-col"
        >
          <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 mb-5 overflow-hidden flex items-center justify-center">
            {seminar.coverImage ? (
              <Image
                src={seminar.coverImage.url}
                alt={seminar.coverImage.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="text-[var(--navy)]/15 text-7xl font-bold font-[family-name:var(--font-playfair)]">
                {seminar.title[0]}
              </div>
            )}
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--gold)]/10 text-[var(--navy)] w-fit mb-3">
            {seminar.kicker}
          </span>

          <h2 className="text-lg font-bold text-[var(--navy)] mb-2 leading-snug group-hover:text-[var(--navy-light)] transition-colors font-[family-name:var(--font-playfair)]">
            <Link href={`/edukacije/${seminar.slug}`}>{seminar.title}</Link>
          </h2>

          <div className="flex flex-col gap-1.5 mb-4 text-gray-400 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              {seminar.dateLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} />
              {seminar.location}
            </div>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{seminar.excerpt}</p>

          <Link
            href={`/edukacije/${seminar.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold)] group-hover:gap-3 transition-all duration-200"
          >
            Saznaj više
            <ArrowRight size={14} />
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
