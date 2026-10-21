"use client";

import { useState, useTransition } from "react";
import { povuciPrivolu, type AdminAkcijaState } from "./actions";

export default function PovuciPrivoluGumb({ prijavaId }: { prijavaId: number }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminAkcijaState>({});
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="px-3 py-1.5 rounded-lg text-sm border border-red-300 text-red-700 disabled:opacity-60"
        disabled={pending}
        onClick={() => {
          if (confirm("Označiti da je kontakt osoba povukla privolu za obavijesti?")) {
            start(async () => setState(await povuciPrivolu(prijavaId)));
          }
        }}
      >
        {pending ? "Spremanje..." : "Povuci privolu"}
      </button>
      {state.greska && <span className="text-red-600 text-xs">{state.greska}</span>}
      {state.poruka && <span className="text-green-700 text-xs">{state.poruka}</span>}
    </div>
  );
}
