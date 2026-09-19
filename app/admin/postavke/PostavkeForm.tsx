"use client";

import { useActionState } from "react";
import type { Postavke } from "@/lib/postavke";
import { spremiPostavke, type PostavkeState } from "./actions";

const input = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm";

export default function PostavkeForm({ postavke }: { postavke: Postavke }) {
  const [state, action, pending] = useActionState<PostavkeState, FormData>(spremiPostavke, {});
  return (
    <form action={action} className="space-y-4 max-w-md">
      <label className="block text-sm">
        Srednji dio broja ponude (npr. <b>112</b> u 8-<b>112</b>/26)
        <input name="brojPonudeSredina" defaultValue={postavke.brojPonudeSredina} className={input} required />
      </label>
      <label className="block text-sm">
        Dani valjanosti / rok plaćanja (od datuma izdavanja)
        <input
          name="daniValjanosti"
          type="number"
          min={0}
          max={60}
          defaultValue={postavke.daniValjanosti}
          className={input}
          required
        />
      </label>
      <label className="block text-sm">
        Potpisnik na ponudi
        <input name="potpisnik" defaultValue={postavke.potpisnik} className={input} required />
      </label>
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
