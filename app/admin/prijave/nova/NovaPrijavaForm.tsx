"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import PopustPolja from "../PopustPolja";
import { spremiNovuPrijavu, type NovaPrijavaState } from "./actions";

const input =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20";

export type SeminarOpcija = { slug: string; label: string; imaPonudu: boolean };

export default function NovaPrijavaForm({ seminari }: { seminari: SeminarOpcija[] }) {
  const [state, action, pending] = useActionState<NovaPrijavaState, FormData>(spremiNovuPrijavu, {});
  const [redovi, setRedovi] = useState([{ key: 0 }]);
  const [slug, setSlug] = useState("");
  const imaPonudu = seminari.find((s) => s.slug === slug)?.imaPonudu ?? true;

  // Ručni submit umjesto <form action>: React nakon action-a resetira formu, pa bi greška validacije
  // obrisala sve upisano. Submitter nosi "akcija" (izdaj / spremi).
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="text-sm block">
        Edukacija
        <select
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={`${input} bg-white`}
          required
        >
          <option value="">- odaberi -</option>
          {seminari.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
              {!s.imaPonudu && " (bez ponude)"}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm sm:col-span-2">
          Organizacija
          <input name="organizacija" className={input} required />
        </label>
        <label className="text-sm sm:col-span-2">
          Adresa
          <input name="adresa" className={input} required />
        </label>
        <label className="text-sm">
          OIB
          <input name="oib" className={input} required pattern="\d{11}" />
        </label>
        <label className="text-sm">
          Kontakt osoba
          <input name="kontaktIme" className={input} required />
        </label>
        <label className="text-sm">
          Email (na njega ide ponuda)
          <input name="email" type="email" className={input} required />
        </label>
        <label className="text-sm">
          Telefon
          <input name="telefon" className={input} required />
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-1.5">Polaznici</div>
        <div className="space-y-2">
          {redovi.map((r, i) => (
            <div key={r.key} className="flex gap-2">
              <input name="polaznik_ime" placeholder="Ime i prezime" className={input} required />
              <input name="polaznik_radno_mjesto" placeholder="Radno mjesto" className={input} required />
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
          onClick={() => setRedovi([...redovi, { key: Date.now() }])}
          className="mt-2 text-sm text-[var(--navy)] hover:underline"
        >
          + Dodaj polaznika
        </button>
      </div>

      {imaPonudu && <PopustPolja popust={null} />}

      <label className="text-sm block">
        Napomena
        <textarea name="napomena" rows={3} className={input} />
      </label>

      {state.greska && <p className="text-red-600 text-sm">{state.greska}</p>}

      <div className="flex flex-wrap gap-3">
        {imaPonudu && (
          <button
            type="submit"
            name="akcija"
            value="izdaj"
            disabled={pending}
            className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60"
          >
            {pending ? "Spremanje..." : "Spremi i pošalji ponudu klijentu"}
          </button>
        )}
        <button
          type="submit"
          name="akcija"
          value="spremi"
          disabled={pending}
          className="px-4 py-2 border border-[var(--navy)] text-[var(--navy)] rounded-lg text-sm disabled:opacity-60"
        >
          Samo spremi prijavu
        </button>
      </div>
    </form>
  );
}
