"use client";

import { useActionState, useState } from "react";
import type { Polaznik, Prijava } from "@/lib/db/schema";
import { spremiIzmjene, type AdminAkcijaState } from "./actions";

const input =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20";

function uRedove(polaznici: Polaznik[]) {
  return polaznici.map((p) => ({ key: p.id, ime: p.ime, radnoMjesto: p.radnoMjesto }));
}

export default function UrediPrijavuForm({ prijava, polaznici }: { prijava: Prijava; polaznici: Polaznik[] }) {
  const [state, action, pending] = useActionState<AdminAkcijaState, FormData>(
    spremiIzmjene.bind(null, prijava.id),
    {},
  );
  const [redovi, setRedovi] = useState(() => uRedove(polaznici));
  // Nakon spremanja polaznici se brišu i ponovno upisuju (novi id-evi) i stranica se revalidira.
  // Bez ovoga bi redovi ostali na starim vrijednostima jer se state inicijalizira samo jednom.
  const kljuc = polaznici.map((p) => p.id).join(",");
  const [zadnjiKljuc, setZadnjiKljuc] = useState(kljuc);
  if (kljuc !== zadnjiKljuc) {
    setZadnjiKljuc(kljuc);
    setRedovi(uRedove(polaznici));
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm">
          Kontakt osoba
          <input name="kontaktIme" defaultValue={prijava.kontaktIme} className={input} required />
        </label>
        <label className="text-sm">
          Email
          <input name="email" type="email" defaultValue={prijava.email} className={input} required />
        </label>
        <label className="text-sm">
          Telefon
          <input name="telefon" defaultValue={prijava.telefon} className={input} required />
        </label>
        <label className="text-sm">
          OIB
          <input name="oib" defaultValue={prijava.oib} className={input} required pattern="\d{11}" />
        </label>
        <label className="text-sm sm:col-span-2">
          Organizacija
          <input name="organizacija" defaultValue={prijava.organizacija} className={input} required />
        </label>
        <label className="text-sm sm:col-span-2">
          Adresa
          <input name="adresa" defaultValue={prijava.adresa} className={input} required />
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-1.5">Polaznici</div>
        <div className="space-y-2">
          {redovi.map((r, i) => (
            <div key={r.key} className="flex gap-2">
              <input name="polaznik_ime" defaultValue={r.ime} placeholder="Ime i prezime" className={input} required />
              <input
                name="polaznik_radno_mjesto"
                defaultValue={r.radnoMjesto}
                placeholder="Radno mjesto"
                className={input}
                required
              />
              {redovi.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRedovi(redovi.filter((_, j) => j !== i))}
                  className="px-3 text-gray-400 hover:text-red-600"
                  aria-label="Ukloni"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRedovi([...redovi, { key: Date.now(), ime: "", radnoMjesto: "" }])}
          className="mt-2 text-sm text-[var(--navy)] hover:underline"
        >
          + Dodaj polaznika
        </button>
      </div>

      <label className="text-sm block">
        Napomena
        <textarea name="napomena" defaultValue={prijava.napomena ?? ""} rows={3} className={input} />
      </label>

      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}
      {state.poruka && <p className="text-green-700 text-sm">{state.poruka}</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
      >
        {pending ? "Spremanje..." : "Spremi izmjene"}
      </button>
    </form>
  );
}
