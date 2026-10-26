"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

// Traka pri dnu ekrana dok korisnik čita program: vidi se tek kad gumb "Prijavite se"
// ispod info kartica ode iz pogleda, a skriva se čim je forma (#prijava) na ekranu.
export default function PlutajucaPrijava({
  naslov,
  datum,
  cijena,
  mjesta,
}: {
  naslov: string;
  datum: string;
  cijena: string;
  mjesta?: number | null; // vidi mjestaZaPrikaz - samo kad ih je ostalo 5 ili manje
}) {
  const [gumbVidljiv, setGumbVidljiv] = useState(true);
  const [formaVidljiva, setFormaVidljiva] = useState(false);

  useEffect(() => {
    const gumb = document.getElementById("prijavi-se-gumb");
    const forma = document.getElementById("prijava");
    if (!gumb || !forma) return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // Gumb ispod ekrana (još nismo došli do njega) računa se kao vidljiv.
        if (entry.target === gumb) setGumbVidljiv(entry.isIntersecting || entry.boundingClientRect.top > 0);
        if (entry.target === forma) setFormaVidljiva(entry.isIntersecting);
      }
    });
    observer.observe(gumb);
    observer.observe(forma);
    return () => observer.disconnect();
  }, []);

  const prikazana = !gumbVidljiv && !formaVidljiva;

  return (
    <div
      inert={!prikazana}
      aria-hidden={!prikazana}
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:pb-6 pointer-events-none transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
        prikazana ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="pointer-events-auto max-w-3xl mx-auto flex items-center gap-4 rounded-xl bg-[var(--navy)] text-white shadow-2xl shadow-[var(--navy)]/30 ring-1 ring-white/10 px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="hidden sm:block truncate font-semibold font-[family-name:var(--font-playfair)]">
            {naslov}
          </p>
          <p className="text-sm text-gray-300 truncate">
            {datum} · <span className="text-[var(--gold)] font-semibold">{cijena}</span>
            {mjesta != null && mjesta > 0 && (
              <span className="text-red-300">
                {" "}
                · {mjesta === 1 ? "još 1 slobodno mjesto" : `još ${mjesta} slobodnih mjesta`}
              </span>
            )}
          </p>
        </div>
        <a
          href="#prijava"
          className="group shrink-0 inline-flex items-center gap-2 rounded-lg bg-[var(--gold)] px-4 py-2.5 sm:px-5 text-sm font-semibold text-[var(--navy)] transition-[transform,filter] duration-150 ease-out hover:brightness-110 active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Prijavite se
          <ArrowRight
            size={16}
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </div>
  );
}
