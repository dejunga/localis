"use client";

import { useState, useTransition } from "react";
import { obrisiOdgovor } from "./actions";

export default function ObrisiOdgovorGumb({ id, slug }: { id: number; slug: string }) {
  const [pending, start] = useTransition();
  const [greska, setGreska] = useState<string>();
  return (
    <span className="inline-flex items-center gap-2">
      <button
        className="px-2.5 py-1 rounded-lg text-xs border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
        disabled={pending}
        onClick={() => {
          if (confirm("Trajno obrisati ovaj odgovor? Ovo se ne može poništiti.")) {
            start(async () => setGreska((await obrisiOdgovor(id, slug)).greska));
          }
        }}
      >
        {pending ? "Brisanje..." : "Obriši"}
      </button>
      {greska && <span className="text-red-600 text-xs">{greska}</span>}
    </span>
  );
}
