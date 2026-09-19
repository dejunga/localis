"use client";

import { useState, useTransition } from "react";
import type { Ponuda } from "@/lib/db/schema";
import {
  izdajNovu,
  pokusajPonovno,
  posaljiMailPonovno,
  storniraj,
  type AdminAkcijaState,
} from "./actions";

const btn = "px-3 py-1.5 rounded-lg text-sm border disabled:opacity-60";

export function PonudaAkcije({ prijavaId, ponuda }: { prijavaId: number; ponuda: Ponuda }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminAkcijaState>({});
  const [obavijesti, setObavijesti] = useState(true);
  const run = (fn: () => Promise<AdminAkcijaState>) => start(async () => setState(await fn()));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ponuda.status === "greska" && (
        <button
          className={`${btn} border-[var(--navy)] text-[var(--navy)]`}
          disabled={pending}
          onClick={() => run(() => pokusajPonovno(prijavaId, ponuda.id))}
        >
          Pokušaj ponovno
        </button>
      )}
      {ponuda.status === "poslana" && (
        <button
          className={`${btn} border-gray-300`}
          disabled={pending}
          onClick={() => run(() => posaljiMailPonovno(prijavaId, ponuda.id))}
        >
          Pošalji mail ponovno
        </button>
      )}
      {ponuda.status !== "stornirana" && (
        <>
          <label className="text-xs flex items-center gap-1">
            <input type="checkbox" checked={obavijesti} onChange={(e) => setObavijesti(e.target.checked)} />
            obavijesti klijenta
          </label>
          <button
            className={`${btn} border-red-300 text-red-700`}
            disabled={pending}
            onClick={() => {
              if (confirm(`Stornirati ponudu ${ponuda.broj}?`)) {
                run(() => storniraj(prijavaId, ponuda.id, obavijesti));
              }
            }}
          >
            Storniraj
          </button>
        </>
      )}
      {pending && <span className="text-gray-500 text-xs">Radim...</span>}
      {state.greska && <span className="text-red-600 text-xs">{state.greska}</span>}
      {state.poruka && <span className="text-green-700 text-xs">{state.poruka}</span>}
    </div>
  );
}

export function IzdajNovuGumb({ prijavaId }: { prijavaId: number }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<AdminAkcijaState>({});
  return (
    <div className="flex items-center gap-3">
      <button
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
        disabled={pending}
        onClick={() => start(async () => setState(await izdajNovu(prijavaId)))}
      >
        {pending ? "Izdavanje..." : "Izdaj novu ponudu"}
      </button>
      {state.greska && <span className="text-red-600 text-xs">{state.greska}</span>}
      {state.poruka && <span className="text-green-700 text-xs">{state.poruka}</span>}
    </div>
  );
}
