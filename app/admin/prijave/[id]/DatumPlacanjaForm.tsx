"use client";

import { useActionState } from "react";
import { spremiDatumPlacanjaAkcija, type AdminAkcijaState } from "./actions";

export default function DatumPlacanjaForm({
  prijavaId,
  datumPlacanja,
  danas,
}: {
  prijavaId: number;
  datumPlacanja: string | null;
  danas: string;
}) {
  const [state, action, pending] = useActionState<AdminAkcijaState, FormData>(
    spremiDatumPlacanjaAkcija.bind(null, prijavaId),
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="datumPlacanja" className="text-sm text-gray-700">
          Datum plaćanja
        </label>
        <input
          id="datumPlacanja"
          name="datumPlacanja"
          type="date"
          required
          max={danas}
          defaultValue={datumPlacanja ?? ""}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20"
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
