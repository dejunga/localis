"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

// Overlay ostaje barem ovoliko, da ne bljesne kad server odgovori brzo
const MIN_TRAJANJE_MS = 2000;
const TRAJANJE_KORAKA_MS = 650;

/**
 * Omata server akciju tako da uspješan odgovor stigne najranije nakon MIN_TRAJANJE_MS.
 * Greške u poljima vraćaju se odmah - korisnik ih treba vidjeti bez čekanja.
 */
export function saMinimalnimTrajanjem<S extends { errors?: object }>(
  akcija: (prev: S, formData: FormData) => Promise<S>,
) {
  return async (prev: S, formData: FormData): Promise<S> => {
    const pocetak = Date.now();
    const rezultat = await akcija(prev, formData);
    if (rezultat.errors) return rezultat;
    const preostalo = MIN_TRAJANJE_MS - (Date.now() - pocetak);
    if (preostalo > 0) await new Promise((resolve) => setTimeout(resolve, preostalo));
    return rezultat;
  };
}

// Server action ne javlja napredak - koraci se mijenjaju po vremenu i zadnji
// ostaje aktivan dok ne stigne stvarni odgovor.
export default function SlanjeOverlay({ naslov, koraci }: { naslov: string; koraci: string[] }) {
  const [korak, setKorak] = useState(0);
  const [napredak, setNapredak] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => setNapredak(true), 50);
    const interval = setInterval(
      () => setKorak((k) => Math.min(k + 1, koraci.length - 1)),
      TRAJANJE_KORAKA_MS,
    );
    const prije = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(start);
      clearInterval(interval);
      document.body.style.overflow = prije;
    };
  }, [koraci.length]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
      >
        <h3 className="text-lg font-semibold text-[var(--navy)]">{naslov}</h3>
        <p className="mt-1 text-sm text-gray-500">Molimo ne zatvarajte stranicu.</p>

        <ol className="mt-6 space-y-4">
          {koraci.map((naziv, i) => {
            const gotov = i < korak;
            const aktivan = i === korak;
            return (
              <li key={naziv} className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                    gotov
                      ? "border-green-600 bg-green-600 text-white"
                      : aktivan
                        ? "border-[var(--navy)] text-[var(--navy)]"
                        : "border-gray-200 text-gray-300"
                  }`}
                >
                  {gotov ? (
                    <Check size={15} strokeWidth={3} aria-hidden="true" className="animate-in zoom-in-50 duration-200" />
                  ) : aktivan ? (
                    <Loader2 size={15} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                  ) : null}
                </span>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    gotov ? "text-gray-500" : aktivan ? "font-medium text-[var(--navy)]" : "text-gray-400"
                  }`}
                >
                  {naziv}
                  {aktivan && "…"}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gold transition-[width] ease-out motion-reduce:transition-none"
            style={{ width: napredak ? "90%" : "5%", transitionDuration: "6000ms" }}
          />
        </div>
      </div>
    </div>
  );
}
