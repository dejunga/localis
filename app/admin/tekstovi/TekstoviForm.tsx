"use client";

import { useActionState } from "react";
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

export type PoljeForme = { kljuc: string; oznaka: string; vrsta: VrstaTeksta; vrijednost: string };

function brojRedaka(p: PoljeForme): number {
  if (p.vrsta === "popis") return Math.max(4, p.vrijednost.split("\n").length + 1);
  return Math.min(14, Math.max(3, Math.ceil(p.vrijednost.length / 80) + p.vrijednost.split("\n").length));
}

export default function TekstoviForm({ polja, maxDuljina }: { polja: PoljeForme[]; maxDuljina: number }) {
  const [state, action, pending] = useActionState<TekstoviState, FormData>(spremiTekstoveAkcija, {});
  return (
    <form action={action} className="space-y-5">
      {polja.map((p) => (
        <label key={p.kljuc} className="block text-sm">
          <span className="block font-medium mb-1">{p.oznaka}</span>
          {UPUTA[p.vrsta] && <span className="block text-xs text-gray-500 mb-1.5">{UPUTA[p.vrsta]}</span>}
          {TIP_POLJA[p.vrsta] ? (
            <input
              name={p.kljuc}
              type={TIP_POLJA[p.vrsta]}
              defaultValue={p.vrijednost}
              maxLength={maxDuljina}
              className={input}
            />
          ) : (
            <textarea
              name={p.kljuc}
              defaultValue={p.vrijednost}
              maxLength={maxDuljina}
              rows={brojRedaka(p)}
              className={`${input} resize-y`}
            />
          )}
        </label>
      ))}
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
