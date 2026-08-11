"use client";

import { motion } from "framer-motion";
import { GraduationCap, CalendarDays, Briefcase, Calculator, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "obrazovanje",
    icon: GraduationCap,
    title: "Obrazovanje i poučavanje",
    description:
      "Nudimo prilagođene edukacijske programe za zaposlenike, poduzetnike i organizacije. Naši programi pokrivaju širok spektar tema – od mekih vještina do specifičnih stručnih znanja.",
    features: [
      "Prilagođeni programi za tvrtke",
      "Individualno mentorstvo",
      "Radionice i interaktivna predavanja",
      "Certifikati o sudjelovanju",
      "Online i offline format",
    ],
  },
  {
    id: "seminari",
    icon: CalendarDays,
    title: "Organizacija seminara i sajmova",
    description:
      "Brinemo o kompletnoj organizaciji vaših poslovnih događaja. Od ideje do realizacije – logistika, program, predavači, materijali – sve na jednom mjestu.",
    features: [
      "Planiranje i koordinacija",
      "Odabir lokacije i tehničke opreme",
      "Organizacija predavača i panela",
      "Marketinška podrška događaju",
      "Post-event izvještaj i analiza",
    ],
  },
  {
    id: "savjetovanje",
    icon: Briefcase,
    title: "Poslovno savjetovanje",
    description:
      "Stručno savjetovanje u svim fazama poslovanja – od pokretanja obrta ili tvrtke do optimizacije postojećih procesa i dugoročnog strateškog planiranja.",
    features: [
      "Analiza poslovanja i preporuke",
      "Izrada poslovnih planova",
      "Podrška pri aplikacijama za EU fondove",
      "Upravljanje projektima",
      "Podrška pri pokretanju djelatnosti",
    ],
  },
  {
    id: "racunovodstvo",
    icon: Calculator,
    title: "Uredske i računovodstvene usluge",
    description:
      "Administrativna i računovodstvena podrška koja vam oslobađa vrijeme za ono što radite najbolje. Uredna knjiga i redovne prijave bez stresa.",
    features: [
      "Vođenje poslovnih knjiga",
      "Obračun plaća",
      "Porezne prijave i obrasci",
      "Fakturiranje i evidencija",
      "Savjetovanje o poreznim obvezama",
    ],
  },
];

export default function UslugeePage() {
  return (
    <>
      {/* Page hero */}
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
                Što nudimo
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
              Naše usluge
            </h1>
            <p className="text-gray-300 mt-4 max-w-xl text-lg">
              Sveobuhvatna podrška vašem poslovnom razvoju – edukacija,
              organizacija, savjetovanje i administracija.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services detail */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="w-14 h-14 bg-[var(--navy)]/8 rounded-xl flex items-center justify-center mb-6">
                    <Icon size={26} className="text-[var(--navy)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--navy)] mb-4 font-[family-name:var(--font-playfair)]">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-2.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                        <CheckCircle2 size={16} className="text-[var(--gold)] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-[var(--navy)]/8 to-[var(--navy)]/3 flex items-center justify-center">
                    <Icon size={80} className="text-[var(--navy)]/15" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[oklch(0.97_0.01_85)]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[var(--navy)] mb-4 font-[family-name:var(--font-playfair)]">
            Trebate konkretnu uslugu?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Kontaktirajte nas i zajedno ćemo pronaći najbolje rješenje za vaše potrebe.
          </p>
          <Link
            href="/kontakt"
            className="inline-flex items-center px-8 py-3.5 bg-[var(--navy)] text-white font-medium rounded hover:bg-[var(--navy-light)] transition-colors"
          >
            Kontaktirajte nas
          </Link>
        </div>
      </section>
    </>
  );
}
