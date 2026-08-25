"use client";

import { startTransition, useActionState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter, type NewsletterState } from "./newsletter-actions";

const initialState: NewsletterState = { status: "idle" };

export default function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  // Submitamo ručno umjesto preko <form action> jer React inače resetira
  // polja nakon svake akcije – i onda korisnik izgubi unos kad padne validacija.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <section className="py-20 bg-[oklch(0.97_0.01_85)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[var(--navy)] rounded-2xl px-8 py-14 md:px-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative max-w-lg mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-[family-name:var(--font-playfair)]">
              Prijavite se na newsletter!
            </h2>
            <p className="text-gray-300 mb-8">
              Prijavite se i prvi saznajte sve o aktualnim edukacijama i
              novitetima.
            </p>

            {state.status === "sent" ? (
              <div className="flex items-center justify-center gap-2 text-[var(--gold)] font-medium">
                <CheckCircle2 size={20} />
                Hvala na prijavi!
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                <div className="relative flex-1">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e-mail adresa"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-6 py-3 bg-[var(--gold)] text-[var(--navy)] font-semibold text-sm rounded-lg hover:bg-[var(--gold-light)] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Slanje..." : "Pošaljite zahtjev"}
                </button>
              </form>
            )}
            {state.status === "error" && state.message && (
              <p
                aria-live="polite"
                className="mt-4 text-red-300 text-sm"
              >
                {state.message}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
