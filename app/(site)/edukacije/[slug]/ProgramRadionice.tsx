"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AgendaItem, AgendaPoint } from "@/lib/edukacije";

// Blok bez oznake modula i bez podtočaka (registracija, pauza, rasprava, kraj) prikazuje se kao tanki red.
function jeKratkiBlok(item: AgendaItem) {
  return item.topics.every((t) => !t.label && !t.points?.length);
}

function Tocka({ point }: { point: AgendaPoint }) {
  if (typeof point === "string") {
    return (
      <li className="flex items-start gap-2 text-sm text-gray-600">
        <span className="text-[var(--gold)] mt-0.5">→</span>
        {point}
      </li>
    );
  }
  return (
    <li>
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <span className="text-[var(--gold)] mt-0.5">→</span>
        {point.label}
      </div>
      <ul className="pl-6 mt-1.5 space-y-1">
        {point.subPoints.map((sub) => (
          <li key={sub} className="flex items-start gap-2 text-sm text-gray-500">
            <span className="text-gray-300 mt-0.5">-</span>
            {sub}
          </li>
        ))}
      </ul>
    </li>
  );
}

// Program kao pregled dana: vrijeme lijevo, sadržaj desno. Moduli pokazuju naslove tema,
// a podtočke se otvaraju po modulu ili sve odjednom. Skrivene podtočke ostaju u HTML-u.
export default function ProgramRadionice({ agenda }: { agenda: AgendaItem[] }) {
  const moduli = agenda.flatMap((item, i) => (jeKratkiBlok(item) ? [] : [i]));
  const [otvoreni, setOtvoreni] = useState<Set<number>>(new Set());
  const sveOtvoreno = moduli.length > 0 && moduli.every((i) => otvoreni.has(i));

  function prebaci(i: number) {
    setOtvoreni((prije) => {
      const novo = new Set(prije);
      if (novo.has(i)) novo.delete(i);
      else novo.add(i);
      return novo;
    });
  }

  return (
    <section className="mb-20">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
          Program radionice
        </h2>
        {moduli.length > 0 && (
          <button
            type="button"
            onClick={() => setOtvoreni(sveOtvoreno ? new Set() : new Set(moduli))}
            className="text-sm font-semibold text-[var(--navy)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--navy-light)]"
          >
            {sveOtvoreno ? "Zatvori sve detalje" : "Otvori cijeli program"}
          </button>
        )}
      </div>

      <ol className="relative border-l-2 border-[var(--navy)]/10 ml-[5.5rem] sm:ml-28">
        {agenda.map((item, i) => {
          const kratko = jeKratkiBlok(item);
          const otvoreno = otvoreni.has(i);
          // Prva tema s oznakom ("Modul 1") je naslov bloka, ostale su teme unutar njega.
          const glava = item.topics[0]?.label ? item.topics[0] : undefined;
          const teme = glava ? item.topics.slice(1) : item.topics;
          const imaDetalje = teme.some((t) => t.points?.length);

          return (
            <li key={i} className={`relative pl-6 sm:pl-8 ${kratko ? "py-3" : "py-5"}`}>
              {/* Vrijeme lijevo od crte */}
              <span
                className={`absolute right-full mr-4 sm:mr-6 w-20 text-right text-sm tabular-nums ${
                  kratko ? "top-3 text-gray-500" : "top-6 font-semibold text-[var(--navy)]"
                }`}
              >
                {item.time}
              </span>
              <span
                aria-hidden="true"
                className={`absolute -left-[7px] rounded-full ${
                  kratko
                    ? "top-[1.15rem] size-3 bg-white border-2 border-[var(--navy)]/25"
                    : "top-[1.6rem] size-3 bg-[var(--gold)]"
                }`}
              />

              {kratko ? (
                <p className="text-gray-600">{item.topics.map((t) => t.title).join(", ")}</p>
              ) : (
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6">
                  {glava && (
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-[var(--gold)]">{glava.label}</span>
                      <h3 className="mt-1 text-xl font-bold text-[var(--navy)] leading-snug text-balance font-[family-name:var(--font-playfair)]">
                        {glava.title}
                      </h3>
                    </div>
                  )}

                  <ul className={otvoreno ? "space-y-6" : "space-y-1.5"}>
                    {teme.map((tema, ti) => (
                      <li key={ti}>
                        <p
                          className={
                            otvoreno
                              ? "font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)] text-lg"
                              : "flex items-start gap-2 text-gray-700"
                          }
                        >
                          {!otvoreno && <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--gold)]" />}
                          {tema.title}
                        </p>
                        {tema.points && (
                          <ul className="space-y-1.5" hidden={!otvoreno}>
                            {tema.points.map((point, pi) => (
                              <Tocka key={pi} point={point} />
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>

                  {imaDetalje && (
                    <button
                      type="button"
                      onClick={() => prebaci(i)}
                      aria-expanded={otvoreno}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] hover:text-[var(--navy-light)]"
                    >
                      {otvoreno ? "Sakrij detalje" : "Prikaži detalje"}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 motion-reduce:transition-none ${otvoreno ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
