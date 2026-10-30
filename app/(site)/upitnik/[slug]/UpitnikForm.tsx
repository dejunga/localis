"use client";

import { startTransition, useActionState } from "react";
import Link from "next/link";
import { UPITNIK_MAX_DULJINA, UPITNIK_OBJAVA_TEKST, UPITNIK_PRIVOLA_TEKST } from "@/lib/upitnici/pitanja";
import { posaljiUpitnik, type UpitnikState } from "./actions";

const initialState: UpitnikState = { status: "idle" };

const inputClass =
  "w-full px-4 py-3 rounded-lg border border-gray-200 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const odabirClass =
  "flex items-center justify-center rounded-lg border border-gray-200 font-medium text-gray-700 transition-colors peer-checked:border-[var(--navy)] peer-checked:bg-[var(--navy)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--navy)]/30";

const PREPORUKE = [
  ["da", "Da"],
  ["mozda", "Možda"],
  ["ne", "Ne"],
] as const;

function Greska({ poruka }: { poruka?: string }) {
  return poruka ? <p className="text-red-600 text-xs mt-1.5">{poruka}</p> : null;
}

function Neobavezno() {
  return <span className="font-normal text-gray-400">(neobavezno)</span>;
}

// Pet velikih gumba - polaznici upitnik ispunjavaju na mobitelu odmah nakon skeniranja QR koda.
function Skala({ name, label }: { name: string; label: string }) {
  return (
    <fieldset>
      <legend className="text-sm text-gray-700 mb-2">{label}</legend>
      <div className="grid grid-cols-5 gap-2 max-w-sm">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} className="peer sr-only" />
            <span className={`h-12 text-base ${odabirClass}`}>{n}</span>
          </label>
        ))}
      </div>
      <div className="mt-1 flex max-w-sm justify-between text-xs text-gray-400">
        <span>slabo</span>
        <span>odlično</span>
      </div>
    </fieldset>
  );
}

function Tekst({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label} <Neobavezno />
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        maxLength={UPITNIK_MAX_DULJINA.tekst}
        className={`${inputClass} resize-none`}
      />
    </div>
  );
}

export default function UpitnikForm({ seminarSlug, predavaci }: { seminarSlug: string; predavaci: string[] }) {
  const [state, formAction, pending] = useActionState(posaljiUpitnik, initialState);

  // Ručni submit da React ne resetira polja kad padne validacija (isto kao forma prijave).
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  if (state.status === "sent") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="text-3xl mb-3">✓</div>
        <h2 className="font-semibold text-green-800 mb-1">Hvala!</h2>
        <p className="text-green-600 text-sm">Vaši odgovori su zaprimljeni.</p>
      </div>
    );
  }

  const e = state.errors ?? {};

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <input type="hidden" name="slug" value={seminarSlug} />
      {/* Honeypot - skriveno od ljudi */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {(state.message || Object.keys(e).length > 0) && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {state.message ?? "Provjerite označena pitanja."}
        </div>
      )}

      <div>
        <Skala name="ocjena_ukupno" label="Kako biste ukupno ocijenili edukaciju? *" />
        <Greska poruka={e.ocjenaUkupno} />
      </div>

      {predavaci.length > 0 && (
        <div>
          <p className={labelClass}>
            {predavaci.length === 1 ? "Kako biste ocijenili predavača? *" : "Kako biste ocijenili predavače? *"}
          </p>
          <div className="space-y-4">
            {predavaci.map((ime, i) => (
              <Skala key={i} name={`ocjena_predavac_${i}`} label={ime} />
            ))}
          </div>
          <Greska poruka={e.ocjenePredavaca} />
        </div>
      )}

      <div>
        <Skala name="ocjena_korisnost" label="Koliko vam je edukacija korisna za vaš posao? *" />
        <Greska poruka={e.ocjenaKorisnost} />
      </div>

      <fieldset>
        <legend className={labelClass}>
          Biste li edukaciju preporučili kolegi? <Neobavezno />
        </legend>
        <div className="flex flex-wrap gap-2">
          {PREPORUKE.map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="preporuka" value={value} className="peer sr-only" />
              <span className={`h-11 min-w-20 px-4 text-sm ${odabirClass}`}>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Tekst name="svidjelo" label="Što vam se svidjelo?" />
      <Tekst name="popraviti" label="Što bismo trebali popraviti ili promijeniti?" />
      <div className="space-y-3">
        <Tekst name="recenzija" label="Vaša recenzija edukacije" />
        <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            name="privola_objava"
            value="da"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--navy)]"
          />
          <span>{UPITNIK_OBJAVA_TEKST}</span>
        </label>
      </div>
      <Tekst
        name="strucna_pomoc"
        label="Trebate li stručnu pomoć oko nekog konkretnog problema? Opišite ukratko."
      />
      <Greska poruka={e.tekst} />

      <fieldset className="rounded-xl border border-gray-200 p-5 space-y-4">
        <legend className="px-1 text-sm font-medium text-gray-700">
          Kontakt <span className="font-normal text-gray-400">(neobavezno - ako želite da vam se javimo)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kontakt_ime" className={labelClass}>
              Ime i prezime
            </label>
            <input id="kontakt_ime" name="kontakt_ime" maxLength={UPITNIK_MAX_DULJINA.ime} className={inputClass} />
          </div>
          <div>
            <label htmlFor="kontakt_ustanova" className={labelClass}>
              Ustanova
            </label>
            <input
              id="kontakt_ustanova"
              name="kontakt_ustanova"
              maxLength={UPITNIK_MAX_DULJINA.ustanova}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="kontakt_email" className={labelClass}>
            E-mail
          </label>
          <input
            id="kontakt_email"
            name="kontakt_email"
            type="email"
            maxLength={UPITNIK_MAX_DULJINA.email}
            className={inputClass}
          />
          <Greska poruka={e.kontaktEmail} />
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              name="privola_kontakt"
              value="da"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--navy)]"
            />
            <span>
              {UPITNIK_PRIVOLA_TEKST}{" "}
              <Link href="/politika-privatnosti#upitnik" className="text-[var(--navy)] underline underline-offset-2">
                Politika privatnosti
              </Link>
            </span>
          </label>
          <Greska poruka={e.privola} />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-[var(--navy)] text-white font-medium rounded-lg shadow-md shadow-[var(--navy)]/20 transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-[var(--navy-light)] active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Šaljem..." : "Pošalji upitnik"}
      </button>
    </form>
  );
}
