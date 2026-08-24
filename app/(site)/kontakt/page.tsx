"use client";

import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { startTransition, useActionState } from "react";
import { sendContactMessage, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

export default function KontaktPage() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  // Submitamo ručno umjesto preko <form action> jer React inače resetira
  // polja nakon svake akcije – i onda korisnik izgubi unos kad padne validacija.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
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
                    icon: Mail,
                    label: "Email",
                    value: "info@localis.hr",
                    href: "mailto:info@localis.hr",
                  },
                  {
                    icon: Phone,
                    label: "Telefon",
                    value: "095/313-5158",
                    href: "tel:+385953135158",
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

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-sm font-semibold text-[var(--navy)] uppercase tracking-wider mb-5">
                  Podaci o obrtu
                </h3>
                <dl className="space-y-3">
                  {[
                    ["Naziv subjekta", "LOCALIS, obrt za savjetovanje i edukaciju"],
                    ["Adresa", "Ljudevita Gaja 8, 43 290 Grubišno Polje"],
                    ["Vlasnica", "Marija Jungić, mag.iur."],
                    ["Voditeljica ureda", "Milada Sofka"],
                    ["OIB", "07277793412"],
                    ["MB", "99344858"],
                    ["IBAN", "HR2124020061140660868"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 text-sm">
                      <dt className="text-gray-400 sm:w-40 shrink-0">{label}</dt>
                      <dd className="text-gray-700">{value}</dd>
                    </div>
                  ))}
                </dl>
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

              {state.status === "sent" ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="text-3xl mb-3">✓</div>
                  <h3 className="font-semibold text-green-800 mb-1">Poruka poslana!</h3>
                  <p className="text-green-600 text-sm">Odgovorimo vam u roku od 24 sata.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />

                  {state.message && (
                    <p
                      aria-live="polite"
                      className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
                    >
                      {state.message}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="ime" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Ime i prezime *
                      </label>
                      <input
                        id="ime"
                        name="ime"
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                        placeholder="Marko Marković"
                      />
                      {state.errors?.ime && (
                        <p className="text-red-600 text-xs mt-1.5">{state.errors.ime}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                        placeholder="marko@email.com"
                      />
                      {state.errors?.email && (
                        <p className="text-red-600 text-xs mt-1.5">{state.errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefon
                    </label>
                    <input
                      id="telefon"
                      name="telefon"
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                      placeholder="+385 91 234 5678"
                    />
                  </div>

                  <div>
                    <label htmlFor="poruka" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Poruka *
                    </label>
                    <textarea
                      id="poruka"
                      name="poruka"
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all resize-none"
                      placeholder="Opišite što trebate..."
                    />
                    {state.errors?.poruka && (
                      <p className="text-red-600 text-xs mt-1.5">{state.errors.poruka}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full py-3.5 bg-[var(--navy)] text-white font-medium rounded-lg transition-all hover:bg-[var(--navy-light)] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {pending ? "Slanje..." : "Pošalji poruku"}
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
