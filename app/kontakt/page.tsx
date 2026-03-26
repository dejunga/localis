"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { useState } from "react";

export default function KontaktPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // Placeholder – ovdje dodati logiku slanja (Resend, Formspree, itd.)
    await new Promise((r) => setTimeout(r, 1000));
    setStatus("sent");
  }

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
                Javite se
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
              Kontakt
            </h1>
            <p className="text-gray-300 mt-4 max-w-xl text-lg">
              Imate pitanje ili trebate uslugu? Tu smo za vas.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-2xl font-bold text-[var(--navy)] mb-8 font-[family-name:var(--font-playfair)]">
                Informacije
              </h2>

              <div className="space-y-6 mb-12">
                {[
                  {
                    icon: MapPin,
                    label: "Adresa",
                    value: "Ljudevita Gaja 8\n43 290 Grubišno Polje",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "info@localis.hr",
                    href: "mailto:info@localis.hr",
                  },
                  {
                    icon: Phone,
                    label: "Telefon",
                    value: "+385 xx xxx xxxx",
                    href: "tel:+385",
                  },
                  {
                    icon: Clock,
                    label: "Radno vrijeme",
                    value: "Pon – Pet: 8:00 – 16:00",
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[var(--navy)]/8 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[var(--navy)]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                        {label}
                      </div>
                      {href ? (
                        <a href={href} className="text-gray-700 hover:text-[var(--navy)] transition-colors text-sm">
                          {value}
                        </a>
                      ) : (
                        <p className="text-gray-700 text-sm whitespace-pre-line">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="rounded-xl overflow-hidden border border-gray-100 h-56 bg-[var(--navy)]/5 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin size={32} className="mx-auto mb-2 text-[var(--navy)]/30" />
                  <p className="text-sm">Grubišno Polje, Hrvatska</p>
                </div>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-[var(--navy)] mb-8 font-[family-name:var(--font-playfair)]">
                Pošaljite poruku
              </h2>

              {status === "sent" ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="text-3xl mb-3">✓</div>
                  <h3 className="font-semibold text-green-800 mb-1">Poruka poslana!</h3>
                  <p className="text-green-600 text-sm">Odgovorimo vam u roku od 24 sata.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ime i prezime *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                        placeholder="Marko Marković"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                        placeholder="marko@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                      placeholder="+385 91 234 5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tema
                    </label>
                    <select className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all text-gray-700 bg-white">
                      <option value="">Odaberite temu</option>
                      <option>Obrazovanje i poučavanje</option>
                      <option>Organizacija seminara</option>
                      <option>Poslovno savjetovanje</option>
                      <option>Računovodstvene usluge</option>
                      <option>Ostalo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Poruka *
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all resize-none"
                      placeholder="Opišite što trebate..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3.5 bg-[var(--navy)] text-white font-medium rounded-lg transition-all hover:bg-[var(--navy-light)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? "Slanje..." : "Pošalji poruku"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
