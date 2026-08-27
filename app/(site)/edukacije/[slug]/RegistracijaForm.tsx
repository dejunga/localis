"use client";

import { startTransition, useActionState } from "react";
import { sendSeminarRegistration, type RegistrationState } from "../actions";

const initialState: RegistrationState = { status: "idle" };

export default function RegistracijaForm({ seminarTitle }: { seminarTitle: string }) {
  const [state, formAction, pending] = useActionState(sendSeminarRegistration, initialState);

  // Submitamo ručno umjesto preko <form action> jer React inače resetira
  // polja nakon svake akcije – i onda korisnik izgubi unos kad padne validacija.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
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
            Ime i prezime *
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
            Telefon
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="+385 91 234 5678"
          />
        </div>
        <div>
          <label htmlFor="oib" className="block text-sm font-medium text-gray-700 mb-1.5">
            OIB ustanove/tvrtke
          </label>
          <input
            id="oib"
            name="oib"
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="12345678901"
          />
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
        <label htmlFor="napomena" className="block text-sm font-medium text-gray-700 mb-1.5">
          Napomena
        </label>
        <textarea
          id="napomena"
          name="napomena"
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all resize-none"
          placeholder="Broj polaznika, pitanja ili napomene uz prijavu..."
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
