"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Plus, X } from "lucide-react";
import SlanjeOverlay, { saMinimalnimTrajanjem } from "@/components/SlanjeOverlay";
import { MAX_DULJINA, MAX_POLAZNIKA } from "@/lib/prijave/limiti";
import { PRIVOLA_OBAVIJESTI_TEKST } from "@/lib/prijave/privola";
import { formatIznos } from "@/lib/ponude/format";
import { cijenePoPolazniku, postotakGrupnogPopusta } from "@/lib/ponude/popust";
import { sendSeminarRegistration, type RegistrationState } from "../actions";

const initialState: RegistrationState = { status: "idle" };

const KORACI_S_PONUDOM = ["Spremanje prijave", "Izrada ponude", "Slanje ponude na e-mail"];
const KORACI_BEZ_PONUDE = ["Spremanje prijave", "Slanje prijave"];

const posaljiPrijavu = saMinimalnimTrajanjem(sendSeminarRegistration);

export default function RegistracijaForm({
  seminarSlug,
  seminarTitle,
  imaPonudu,
  cijena,
  maxPolaznika = MAX_POLAZNIKA,
}: {
  seminarSlug: string;
  seminarTitle: string;
  imaPonudu: boolean;
  // Cijena po polazniku za izračun ispod forme; bez nje (edukacija bez ponude) izračuna nema.
  cijena?: number;
  // Manje od MAX_POLAZNIKA kad je na edukaciji ostalo malo slobodnih mjesta.
  maxPolaznika?: number;
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
      rows.length >= maxPolaznika ? rows : [...rows, nextRowId.current++],
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
      {/* S izračunom: na desktopu polja lijevo, izračun i gumb desno (sticky). */}
      <form
        onSubmit={handleSubmit}
        inert={pending}
        className={
          cijena != null
            ? "space-y-5 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-x-8 lg:gap-y-5"
            : "space-y-5"
        }
      >
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
            className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 lg:col-span-2"
          >
            {state.message}
          </p>
        )}

        <div className="space-y-5">
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
                <div
                  key={id}
                  className={`flex items-center gap-2.5 ${
                    id > 0
                      ? "animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none"
                      : ""
                  }`}
                >
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
            {participantRows.length < maxPolaznika && (
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
  
          <div>
            <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                name="privola_obrada"
                value="da"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--navy)]"
              />
              <span>
                Upoznat/a sam s obradom osobnih podataka u svrhu prijave, organizacije i provedbe
                edukacije te izdavanja ponude, računa i potvrde o sudjelovanju, kako je opisano u{" "}
                <Link
                  href="/politika-privatnosti#edukacije"
                  target="_blank"
                  className="text-[var(--navy)] underline underline-offset-2"
                >
                  Politici privatnosti
                </Link>
                . *
              </span>
            </label>
            {state.errors?.privola && (
              <p className="text-red-600 text-xs mt-1.5">{state.errors.privola}</p>
            )}
          </div>

          {/* Neobavezno i neoznačeno po defaultu - privola mora biti aktivna radnja korisnika. */}
          <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="privola_obavijesti"
              value="da"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--navy)]"
            />
            <span>{PRIVOLA_OBAVIJESTI_TEKST}</span>
          </label>
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {cijena != null && <IzracunKotizacije brojPolaznika={participantRows.length} cijena={cijena} />}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 bg-[var(--navy)] text-white font-medium rounded-lg shadow-md shadow-[var(--navy)]/20 transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-[var(--navy-light)] hover:shadow-lg hover:shadow-[var(--navy)]/25 active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "Slanje..." : "Pošalji prijavu"}
          </button>

          <p className="text-xs text-gray-500 leading-relaxed">
            Na radionici se fotografira. Polaznici privolu za fotografiranje daju osobno na licu
            mjesta i mogu je uskratiti bez ikakvih posljedica.
          </p>
        </div>
      </form>
    </>
  );
}

// Isti izračun kao automatska ponuda (lib/ponude/izdaj.ts), pa iznos odgovara ponudi na e-mailu.
function IzracunKotizacije({ brojPolaznika, cijena }: { brojPolaznika: number; cijena: number }) {
  const cijene = cijenePoPolazniku(brojPolaznika, cijena);
  const ukupno = cijene.reduce((s, c) => s + Math.round(c * 100), 0) / 100;
  const usteda = Math.round(brojPolaznika * cijena * 100 - ukupno * 100) / 100;

  return (
    <div aria-live="polite" className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm">
      <p className="font-medium text-gray-800 mb-2">Izračun kotizacije</p>
      <ul className="space-y-1 text-gray-600">
        {cijene.map((c, i) => {
          const postotak = postotakGrupnogPopusta(i + 1);
          return (
            <li
              key={i}
              className={`flex justify-between gap-4 ${
                i > 0
                  ? "animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none"
                  : ""
              }`}
            >
              <span>
                {i + 1}. polaznik
                {postotak > 0 && <span className="ml-1.5 text-green-700">−{postotak} %</span>}
              </span>
              <span className="tabular-nums">{formatIznos(c)} €</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 pt-2 border-t border-gray-200 flex items-baseline justify-between gap-4 font-semibold text-gray-900">
        <span>Ukupno</span>
        <span className="text-lg">
          <AnimiraniIznos iznos={ukupno} /> €
        </span>
      </div>
      {usteda > 0 && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-800 animate-in fade-in zoom-in-95 duration-300 motion-reduce:animate-none">
          <span className="font-medium">Ušteda za grupnu prijavu</span>
          <span className="font-bold">
            <AnimiraniIznos iznos={usteda} /> €
          </span>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
        {brojPolaznika === 1
          ? "Prijavite više polaznika: drugi ima 10 % popusta, treći i svaki sljedeći 20 %. "
          : ""}
        Ponudu s ovim iznosom šaljemo na vaš e-mail.
      </p>
    </div>
  );
}

// Iznos "otkucava" do nove vrijednosti; prekinuta animacija nastavlja od trenutnog broja.
function AnimiraniIznos({ iznos }: { iznos: number }) {
  const vrijednost = useMotionValue(iznos);
  const tekst = useTransform(vrijednost, (v) => formatIznos(Math.round(v * 100) / 100));
  const smanjiPokrete = useReducedMotion();

  useEffect(() => {
    if (smanjiPokrete) {
      vrijednost.set(iznos);
      return;
    }
    const kontrole = animate(vrijednost, iznos, { duration: 0.45, ease: "easeOut" });
    return () => kontrole.stop();
  }, [iznos, smanjiPokrete, vrijednost]);

  return <motion.span className="tabular-nums">{tekst}</motion.span>;
}
