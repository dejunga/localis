"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { PostCard } from "@/sanity/lib/posts";

const categoryColors: Record<string, string> = {
  Edukacija: "bg-blue-50 text-blue-700",
  Savjetovanje: "bg-amber-50 text-amber-700",
  Računovodstvo: "bg-green-50 text-green-700",
};

export default function VijestiList({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10">
        Trenutno nema objavljenih vijesti. Vratite se uskoro.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, i) => (
        <motion.article
          key={post.slug}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="group flex flex-col"
        >
          <div className="relative aspect-[16/9] rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 mb-5 overflow-hidden flex items-center justify-center">
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt={post.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="text-[var(--navy)]/15 text-7xl font-bold font-[family-name:var(--font-playfair)]">
                {post.title[0]}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                categoryColors[post.category] ?? "bg-gray-100 text-gray-600"
              }`}
            >
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

          <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{post.excerpt}</p>

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
  );
}
