"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import SlanjeOverlay, { saMinimalnimTrajanjem } from "@/components/SlanjeOverlay";
import { MAX_DULJINA, MAX_POLAZNIKA } from "@/lib/prijave/limiti";
import { sendSeminarRegistration, type RegistrationState } from "../actions";

const initialState: RegistrationState = { status: "idle" };

const KORACI_S_PONUDOM = ["Spremanje prijave", "Izrada ponude", "Slanje ponude na e-mail"];
const KORACI_BEZ_PONUDE = ["Spremanje prijave", "Slanje prijave"];

const posaljiPrijavu = saMinimalnimTrajanjem(sendSeminarRegistration);

export default function RegistracijaForm({
  seminarSlug,
  seminarTitle,
  imaPonudu,
}: {
  seminarSlug: string;
  seminarTitle: string;
  imaPonudu: boolean;
}) {
  const [state, formAction, pending] = useActionState(posaljiPrijavu, initialState);
  const [participantRows, setParticipantRows] = useState<number[]>([0]);
  const nextRowId = useRef(1);

  // Submitamo ručno umjesto preko <form action> jer React inače resetira
  // polja nakon svake akcije - i onda korisnik izgubi unos kad padne validacija.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function addParticipant() {
    setParticipantRows((rows) =>
      rows.length >= MAX_POLAZNIKA ? rows : [...rows, nextRowId.current++],
    );
  }

  function removeParticipant(id: number) {
    setParticipantRows((rows) => rows.filter((rowId) => rowId !== id));
  }

  if (state.status === "sent") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="font-semibold text-green-800 mb-1">Prijava zaprimljena!</h3>
        <p className="text-green-600 text-sm">
          {state.ponudaPoslanaNa
            ? `Ponudu smo poslali na ${state.ponudaPoslanaNa}. Provjerite i mapu neželjene pošte.`
            : "Javit ćemo vam se s potvrdom u roku od 24 sata."}
        </p>
      </div>
    );
  }

  return (
    <>
      {pending && (
        <SlanjeOverlay
          naslov={imaPonudu ? "Obrađujemo vašu prijavu" : "Šaljemo vašu prijavu"}
          koraci={imaPonudu ? KORACI_S_PONUDOM : KORACI_BEZ_PONUDE}
        />
      )}
      {/* inert: dok traje slanje, polja se ne mogu dohvatiti ni tipkovnicom */}
      <form onSubmit={handleSubmit} inert={pending} className="space-y-5">
        <input type="hidden" name="seminar" value={seminarTitle} />
        <input type="hidden" name="slug" value={seminarSlug} />
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
              maxLength={MAX_DULJINA.ime}
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
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
              maxLength={MAX_DULJINA.email}
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
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
              maxLength={MAX_DULJINA.telefon}
              type="tel"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
              placeholder="091 234 5678"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
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
            maxLength={MAX_DULJINA.organizacija}
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="Naziv jedinice lokalne samouprave, tvrtke ili ureda"
          />
          {state.errors?.organizacija && (
            <p className="text-red-600 text-xs mt-1.5">{state.errors.organizacija}</p>
          )}
        </div>
  
        <div>
          <label htmlFor="adresa" className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresa ustanove/tvrtke *
          </label>
          <input
            id="adresa"
            name="adresa"
            maxLength={MAX_DULJINA.adresa}
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
            placeholder="Ulica i broj, poštanski broj i mjesto"
          />
          {state.errors?.adresa && (
            <p className="text-red-600 text-xs mt-1.5">{state.errors.adresa}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Polaznici *</label>
          <div className="space-y-2.5">
            {participantRows.map((id) => (
              <div key={id} className="flex items-center gap-2.5">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    name="polaznik_ime"
                    maxLength={MAX_DULJINA.polaznikIme}
                    type="text"
                    required
                    className="px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                    placeholder="Ime i prezime polaznika"
                  />
                  <input
                    name="polaznik_radno_mjesto"
                    maxLength={MAX_DULJINA.polaznikRadnoMjesto}
                    type="text"
                    required
                    className="px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all"
                    placeholder="Radno mjesto"
                  />
                </div>
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
          {participantRows.length < MAX_POLAZNIKA && (
            <button
              type="button"
              onClick={addParticipant}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--navy)] hover:text-[var(--navy-light)] transition-colors"
            >
              <Plus size={16} />
              Dodaj polaznika
            </button>
          )}
        </div>
  
        <div>
          <label htmlFor="napomena" className="block text-sm font-medium text-gray-700 mb-1.5">
            Napomena
          </label>
          <textarea
            id="napomena"
            name="napomena"
            maxLength={MAX_DULJINA.napomena}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all resize-none"
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
    </>
  );
}
