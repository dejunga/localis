"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { sendSeminarRegistration, type RegistrationState } from "../actions";

const initialState: RegistrationState = { status: "idle" };

export default function RegistracijaForm({ seminarTitle }: { seminarTitle: string }) {
  const [state, formAction, pending] = useActionState(sendSeminarRegistration, initialState);
  const [participantRows, setParticipantRows] = useState<number[]>([0]);
  const nextRowId = useRef(1);

  // Submitamo ručno umjesto preko <form action> jer React inače resetira
  // polja nakon svake akcije – i onda korisnik izgubi unos kad padne validacija.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function addParticipant() {
    setParticipantRows((rows) => [...rows, nextRowId.current++]);
  }

  function removeParticipant(id: number) {
    setParticipantRows((rows) => rows.filter((rowId) => rowId !== id));
  }

  if (state.status === "sent") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-semibold text-green-800 mb-1">Prijava zaprimljena!</h3>
        <p className="text-green-600 text-sm">Javit ćemo vam se s potvrdom u roku od 24 sata.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="seminar" value={seminarTitle} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state.message && (
        <p
          aria-live="polite"
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
        >
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="ime" className="block text-sm font-medium text-gray-700 mb-1.5">
            Ime i prezime (kontakt osoba) *
          </label>
          <input
            id="ime"
            name="ime"
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="Marko Marković"
          />
          {state.errors?.ime && <p className="text-red-600 text-xs mt-1.5">{state.errors.ime}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="marko@email.com"
          />
          {state.errors?.email && (
            <p className="text-red-600 text-xs mt-1.5">{state.errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1.5">
            Telefon *
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="+385 91 234 5678"
          />
        </div>
        <div>
          <label htmlFor="oib" className="block text-sm font-medium text-gray-700 mb-1.5">
            OIB ustanove/tvrtke *
          </label>
          <input
            id="oib"
            name="oib"
            type="text"
            inputMode="numeric"
            required
            pattern="\d{11}"
            maxLength={11}
            title="OIB mora imati točno 11 znamenaka."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="12345678901"
          />
          {state.errors?.oib && <p className="text-red-600 text-xs mt-1.5">{state.errors.oib}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="organizacija" className="block text-sm font-medium text-gray-700 mb-1.5">
          Ustanova/tvrtka *
        </label>
        <input
          id="organizacija"
          name="organizacija"
          type="text"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
          placeholder="Naziv jedinice lokalne samouprave, tvrtke ili ureda"
        />
        {state.errors?.organizacija && (
          <p className="text-red-600 text-xs mt-1.5">{state.errors.organizacija}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Polaznici *</label>
        <div className="space-y-2.5">
          {participantRows.map((id) => (
            <div key={id} className="flex items-center gap-2.5">
              <input
                name="polaznik_ime"
                type="text"
                required
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                placeholder="Ime i prezime polaznika"
              />
              {participantRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(id)}
                  aria-label="Ukloni polaznika"
                  className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {state.errors?.polaznici && (
          <p className="text-red-600 text-xs mt-1.5">{state.errors.polaznici}</p>
        )}
        <button
          type="button"
          onClick={addParticipant}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--navy)] hover:text-[var(--navy-light)] transition-colors"
        >
          <Plus size={16} />
          Dodaj polaznika
        </button>
      </div>

      <div>
        <label htmlFor="napomena" className="block text-sm font-medium text-gray-700 mb-1.5">
          Napomena
        </label>
        <textarea
          id="napomena"
          name="napomena"
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all resize-none"
          placeholder="Pitanja ili napomene uz prijavu..."
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-[var(--navy)] text-white font-medium rounded-lg transition-all hover:bg-[var(--navy-light)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Slanje..." : "Pošalji prijavu"}
      </button>
    </form>
  );
}
