"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, CalendarDays, Briefcase, Calculator, ClipboardList, Code2, ArrowRight } from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    title: "Edukacija i praktične radionice",
    description:
      "Prilagođene edukacije za službenike lokalne samouprave i sve koji se u radu susreću s tim temama – od radionica do online tečajeva.",
    href: "/usluge#obrazovanje",
  },
  {
    icon: CalendarDays,
    title: "Organizacija seminara i poslovnih događaja",
    description:
      "Profesionalna organizacija stručnih skupova i poslovnih događaja, od ideje do zadnjeg detalja na dan događaja.",
    href: "/usluge#seminari",
  },
  {
    icon: Briefcase,
    title: "Poslovno savjetovanje",
    description:
      "Stručno savjetovanje u svim fazama poslovanja – od pokretanja obrta do EU fondova i strateškog planiranja.",
    href: "/usluge#savjetovanje",
  },
  {
    icon: Calculator,
    title: "Uredske i računovodstvene usluge",
    description:
      "Vođenje poslovnih knjiga, obračun plaća i porezne prijave – uredna knjiga i redovne prijave bez stresa.",
    href: "/usluge#racunovodstvo",
  },
  {
    icon: ClipboardList,
    title: "Uredske i administrativne djelatnosti",
    description:
      "Priprema dokumenata, digitalizacija i administrativna podrška koja vam oslobađa vrijeme za ono što radite najbolje.",
    href: "/usluge#administracija",
  },
  {
    icon: Code2,
    title: "Digitalne i podatkovne usluge",
    description:
      "Razvoj web stranica, aplikacija i baza podataka te analiza i vizualizacija podataka prilagođena vašim potrebama.",
    href: "/usluge#digitalne",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
              Što nudimo
            </span>
            <div className="h-px w-10 bg-[var(--gold)]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
            Naše usluge
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
            Nudimo sveobuhvatna rješenja za edukaciju i razvoj vašeg poslovanja.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                className="group p-8 border border-gray-100 rounded-xl hover:border-[var(--navy)]/20 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 bg-[var(--navy)]/8 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[var(--navy)] transition-colors duration-300">
                  <Icon
                    size={22}
                    className="text-[var(--navy)] group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-[var(--navy)] mb-3 font-[family-name:var(--font-playfair)]">
                  {service.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-5">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold)] hover:gap-3 transition-all duration-200"
                >
                  Saznajte više
                  <ArrowRight size={15} />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
