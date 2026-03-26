"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-[oklch(0.97_0.01_85)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-[var(--navy)] rounded-2xl overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>

          <div className="relative px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[var(--gold)]" />
                <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                  Kontakt
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-playfair)] leading-tight">
                Zajedno do boljeg poslovanja
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Imate pitanje ili trebate konkretnu uslugu? Javite nam se –
                odgovorimo brzo i bez obveze.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--gold)] text-[var(--navy)] font-semibold rounded transition-all hover:bg-[var(--gold-light)] hover:shadow-lg hover:shadow-[var(--gold)]/20"
              >
                <Mail size={18} />
                Pišite nam
              </Link>
              <Link
                href="/usluge"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded transition-all hover:bg-white/10"
              >
                Naše usluge
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
