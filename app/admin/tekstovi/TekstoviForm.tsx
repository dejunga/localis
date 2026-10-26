"use client";

import { startTransition, useActionState, useRef, useState } from "react";
// Samo tip - lib/tekstovi povlači bazu i ne smije u klijentski bundle.
import type { VrstaTeksta } from "@/lib/tekstovi";
import { spremiTekstoveAkcija, type TekstoviState } from "./actions";

const input = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm leading-relaxed";

const UPUTA: Record<VrstaTeksta, string | null> = {
  redak: null,
  tekst: null,
  odlomci: "Prazan red između dva dijela počinje novi odlomak.",
  popis: "Svaki redak je jedna stavka.",
  telefon: null,
  email: null,
};

const TIP_POLJA: Partial<Record<VrstaTeksta, string>> = { redak: "text", telefon: "tel", email: "email" };

export type PoljeForme = {
  kljuc: string;
  oznaka: string;
  vrsta: VrstaTeksta;
  vrijednost: string;
  zadano: string;
  izmijenjeno: boolean;
};

function brojRedaka(p: PoljeForme): number {
  if (p.vrsta === "popis") return Math.max(4, p.vrijednost.split("\n").length + 1);
  return Math.min(14, Math.max(3, Math.ceil(p.vrijednost.length / 80) + p.vrijednost.split("\n").length));
}

export default function TekstoviForm({ polja, maxDuljina }: { polja: PoljeForme[]; maxDuljina: number }) {
  const [state, action, pending] = useActionState<TekstoviState, FormData>(spremiTekstoveAkcija, {});
  const formRef = useRef<HTMLFormElement>(null);
  // Polja vraćena na izvorni tekst, a još nespremljena.
  const [vraceni, setVraceni] = useState<Set<string>>(new Set());

  // Ručni submit umjesto <form action>: React inače resetira polja nakon akcije,
  // pa bi se kod greške (npr. krivi e-mail) izgubio unos.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
    setVraceni(new Set());
  }

  // Upisuje izvorni tekst u polje; sprema se tek na "Spremi", zajedno s ostalim izmjenama.
  function vratiIzvorno(p: PoljeForme) {
    const el = formRef.current?.elements.namedItem(p.kljuc);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = p.zadano;
    setVraceni((s) => new Set(s).add(p.kljuc));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {polja.map((p) => {
        const id = `tekst-${p.kljuc}`;
        return (
          <div key={p.kljuc} className="text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
              <label htmlFor={id} className="font-medium">
                {p.oznaka}
                {p.izmijenjeno && !vraceni.has(p.kljuc) && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-normal text-amber-800">
                    promijenjeno
                  </span>
                )}
              </label>
              {p.izmijenjeno &&
                (vraceni.has(p.kljuc) ? (
                  <span className="text-xs text-gray-500">Izvorni tekst upisan - kliknite Spremi.</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => vratiIzvorno(p)}
                    className="text-xs text-[var(--navy)] underline underline-offset-2 hover:no-underline"
                  >
                    Vrati izvorni tekst
                  </button>
                ))}
            </div>
            {UPUTA[p.vrsta] && <p className="text-xs text-gray-500 mb-1.5">{UPUTA[p.vrsta]}</p>}
            {TIP_POLJA[p.vrsta] ? (
              <input
                id={id}
                name={p.kljuc}
                type={TIP_POLJA[p.vrsta]}
                defaultValue={p.vrijednost}
                maxLength={maxDuljina}
                className={input}
              />
            ) : (
              <textarea
                id={id}
                name={p.kljuc}
                defaultValue={p.vrijednost}
                maxLength={maxDuljina}
                rows={brojRedaka(p)}
                className={`${input} resize-y`}
              />
            )}
          </div>
        );
      })}
      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      {state.poruka && <p className="text-green-700 text-sm">{state.poruka}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
      >
        {pending ? "Spremanje..." : "Spremi"}
      </button>
    </form>
  );
}
