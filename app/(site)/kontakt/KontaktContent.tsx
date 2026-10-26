"use client";

import { Check, Copy, Mail, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import SlanjeOverlay, { saMinimalnimTrajanjem } from "@/components/SlanjeOverlay";
import { sendContactMessage, type ContactState } from "./actions";

const initialState: ContactState = { status: "idle" };

const KORACI = ["Provjera poruke", "Slanje poruke"];

const posaljiPoruku = saMinimalnimTrajanjem(sendContactMessage);

const SLUZBENI_PODACI = [
  { label: "Naziv subjekta", value: "LOCALIS" },
  { label: "Voditeljica ureda", value: "Milada Sofka" },
  { label: "OIB", value: "07277793412", kopiraj: true },
  { label: "MB", value: "99344858", kopiraj: true },
  { label: "IBAN", value: "HR2124020061140660868", kopiraj: true },
];

const POLJE =
  "w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-[border-color,box-shadow]";

// OIB, MB i IBAN se često prepisuju u račune i naloge - jedan klik ih kopira.
function KopirajGumb({ vrijednost, naziv }: { vrijednost: string; naziv: string }) {
  const [kopirano, setKopirano] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(vrijednost);
          setKopirano(true);
          setTimeout(() => setKopirano(false), 1500);
        } catch {
          // Preglednik ne dopušta pristup međuspremniku - vrijednost se i dalje može označiti ručno.
        }
      }}
      aria-label={kopirano ? `${naziv} kopiran` : `Kopiraj ${naziv}`}
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-[var(--navy)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
    >
      {kopirano ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
    </button>
  );
}

export default function KontaktContent() {
  const [state, formAction, pending] = useActionState(posaljiPoruku, initialState);

  // Submitamo ručno umjesto preko <form action> jer React inače resetira
  // polja nakon svake akcije - i onda korisnik izgubi unos kad padne validacija.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <>
      {pending && <SlanjeOverlay naslov="Šaljemo vašu poruku" koraci={KORACI} />}

      <section className="bg-[var(--navy)] pt-32 pb-28">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
            Kontakt
          </h1>
          <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
            Pišite nam ili nazovite. Na poruke odgovaramo u roku od 24 sata.
          </p>
        </div>
      </section>

      {/* flow-root: negativna margina kartice ide preko zaglavlja umjesto da povuče cijelu sekciju */}
      <section className="flow-root pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 -mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-14 items-start">
          {/* Izravni kontakt i službeni podaci */}
          <div className="lg:pt-24 order-2 lg:order-1">
            <div className="space-y-5">
              <a href="mailto:info@localis.hr" className="group flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--gold)] text-[var(--navy)] transition-colors group-hover:bg-[var(--gold-light)]">
                  <Mail size={20} />
                </span>
                <span>
                  <span className="block text-sm text-gray-500">E-mail</span>
                  <span className="block text-xl md:text-2xl font-semibold text-[var(--navy)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                    info@localis.hr
                  </span>
                </span>
              </a>
              <a href="tel:+385953135158" className="group flex items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[var(--navy)] text-white transition-colors group-hover:bg-[var(--navy-light)]">
                  <Phone size={20} />
                </span>
                <span>
                  <span className="block text-sm text-gray-500">Telefon</span>
                  <span className="block text-xl md:text-2xl font-semibold text-[var(--navy)] tabular-nums group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                    095/313-5158
                  </span>
                </span>
              </a>
            </div>

            <Link
              href="/edukacije"
              className="group mt-10 flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-5 py-4 transition-colors hover:border-[var(--navy)]"
            >
              <span>
                <span className="block font-semibold text-[var(--navy)]">Želite se prijaviti na edukaciju?</span>
                <span className="block text-sm text-gray-500">
                  Prijava je na stranici svake edukacije, uz automatsku ponudu na e-mail.
                </span>
              </span>
              <ArrowRight
                size={18}
                className="shrink-0 text-[var(--gold)] transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

            <div className="mt-12">
              <h2 className="text-lg font-bold text-[var(--navy)] mb-4 font-[family-name:var(--font-playfair)]">
                Službeni podaci
              </h2>
              <dl className="divide-y divide-gray-100 border-y border-gray-100">
                {SLUZBENI_PODACI.map(({ label, value, kopiraj }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 text-sm">
                    <dt className="w-36 shrink-0 text-gray-500">{label}</dt>
                    <dd className="min-w-0 flex-1 text-gray-800 tabular-nums break-all">{value}</dd>
                    {kopiraj && <KopirajGumb vrijednost={value} naziv={label} />}
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Obrazac - kartica koja prelazi preko ruba zaglavlja */}
          <div className="order-1 lg:order-2 rounded-2xl bg-white border border-gray-100 shadow-xl p-6 sm:p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)]">
              Pošaljite poruku
            </h2>
            <p className="text-gray-600 mb-8">Napišite nam pitanje ili što trebate, javit ćemo vam se.</p>

            {state.status === "sent" ? (
              <div className="rounded-xl bg-green-50 border border-green-200 p-8 text-center animate-in fade-in zoom-in-95 duration-500 motion-reduce:animate-none">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-600 text-white">
                  <Check size={24} />
                </span>
                <h3 className="text-lg font-semibold text-green-800 mb-1">Poruka je poslana</h3>
                <p className="text-green-700 text-sm">Javit ćemo vam se u roku od 24 sata.</p>
              </div>
            ) : (
              // inert: dok traje slanje, polja se ne mogu dohvatiti ni tipkovnicom
              <form onSubmit={handleSubmit} inert={pending} className="space-y-5">
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
                      maxLength={120}
                      type="text"
                      autoComplete="name"
                      required
                      className={POLJE}
                      placeholder="Marko Marković"
                    />
                    {state.errors?.ime && <p className="text-red-600 text-xs mt-1.5">{state.errors.ime}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      maxLength={254}
                      type="email"
                      autoComplete="email"
                      required
                      className={POLJE}
                      placeholder="marko@email.com"
                    />
                    {state.errors?.email && <p className="text-red-600 text-xs mt-1.5">{state.errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefon <span className="font-normal text-gray-400">(neobavezno)</span>
                  </label>
                  <input
                    id="telefon"
                    name="telefon"
                    maxLength={40}
                    type="tel"
                    autoComplete="tel"
                    className={POLJE}
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
                    maxLength={5000}
                    required
                    rows={6}
                    className={`${POLJE} resize-y`}
                    placeholder="Opišite što trebate..."
                  />
                  {state.errors?.poruka && <p className="text-red-600 text-xs mt-1.5">{state.errors.poruka}</p>}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3.5 bg-[var(--navy)] text-white font-semibold rounded-lg shadow-md shadow-[var(--navy)]/20 transition-[transform,background-color] duration-150 ease-out hover:bg-[var(--navy-light)] active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {pending ? "Slanje..." : "Pošalji poruku"}
                </button>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Podatke iz poruke koristimo samo za odgovor i daljnju komunikaciju, kako je opisano u{" "}
                  <Link
                    href="/politika-privatnosti"
                    target="_blank"
                    className="text-[var(--navy)] underline underline-offset-2"
                  >
                    Politici privatnosti
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
