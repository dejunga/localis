"use client";

import { useActionState } from "react";
import type { Popust } from "@/lib/ponude/popust";
import PopustPolja from "../PopustPolja";
import { spremiPopustAkcija, type AdminAkcijaState } from "./actions";

export default function PopustForm({ prijavaId, popust }: { prijavaId: number; popust: Popust | null }) {
  const [state, action, pending] = useActionState<AdminAkcijaState, FormData>(
    spremiPopustAkcija.bind(null, prijavaId),
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <PopustPolja popust={popust} />
      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      {state.poruka && <p className="text-green-700 text-sm">{state.poruka}</p>}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
      >
        {pending ? "Spremanje..." : "Spremi popust"}
      </button>
    </form>
  );
}
