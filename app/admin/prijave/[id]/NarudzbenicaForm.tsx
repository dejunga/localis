"use client";

import { useActionState } from "react";
import { spremiNarudzbenicu, type AdminAkcijaState } from "./actions";

export default function NarudzbenicaForm({
  prijavaId,
  brojNarudzbenice,
}: {
  prijavaId: number;
  brojNarudzbenice: string | null;
}) {
  const [state, action, pending] = useActionState<AdminAkcijaState, FormData>(
    spremiNarudzbenicu.bind(null, prijavaId),
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="brojNarudzbenice"
          defaultValue={brojNarudzbenice ?? ""}
          placeholder="npr. 45/2026"
          maxLength={100}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
        >
          {pending ? "Spremanje..." : "Spremi"}
        </button>
      </div>
      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      {state.poruka && <p className="text-green-700 text-sm">{state.poruka}</p>}
    </form>
  );
}
