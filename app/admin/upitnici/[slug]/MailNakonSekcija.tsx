"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { DOPUSTENI_NASTAVCI, MAX_VELICINA, sigurnoImeDatoteke } from "@/lib/upitnici/materijali-format";
import {
  obrisiMaterijalAkcija,
  posaljiProbniAkcija,
  posaljiSadaAkcija,
  spremiDatumSlanja,
  spremiMaterijal,
  type AkcijaState,
} from "./actions";
import type { Primatelj } from "@/lib/upitnici/slanje";

type Materijal = { id: number; naziv: string; velicina: string };

type Props = {
  slug: string;
  materijali: Materijal[];
  datumSlanja: string | null; // "YYYY-MM-DD"
  datumSlanjaLabel: string | null; // "2.11.2026."
  danas: string; // "YYYY-MM-DD" po Zagrebu, min za date input
  primatelji: Primatelj[]; // tko još nije dobio mail
  zavrsila: boolean;
};

const MAX_MB = MAX_VELICINA / (1024 * 1024);

function Poruka({ s }: { s: AkcijaState | undefined }) {
  if (s?.greska) return <p className="text-sm text-red-600 mt-2">{s.greska}</p>;
  if (s?.poruka) return <p className="text-sm text-green-700 mt-2">{s.poruka}</p>;
  return null;
}

const gumbPrimarni =
  "px-4 py-2 bg-[var(--navy)] text-white rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed";
const gumbSekundarni =
  "px-4 py-2 border border-[var(--navy)] text-[var(--navy)] rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60";

export default function MailNakonSekcija(p: Props) {
  const brojPrimatelja = p.primatelji.length;
  const inputRef = useRef<HTMLInputElement>(null);
  const [napredak, setNapredak] = useState<string>();
  const [uploadGreska, setUploadGreska] = useState<string>();
  const [uploadaSe, setUploadaSe] = useState(false);
  const [datum, setDatum] = useState(p.datumSlanja ?? "");
  const [stanjeDatuma, setStanjeDatuma] = useState<AkcijaState>();
  const [stanjeProbe, setStanjeProbe] = useState<AkcijaState>();
  const [stanjeSlanja, setStanjeSlanja] = useState<AkcijaState>();
  const [stanjeBrisanja, setStanjeBrisanja] = useState<AkcijaState>();
  const [pending, start] = useTransition();
  // Novi ključ ponovno učita iframe pregleda nakon promjene materijala ili termina.
  const [pregledKljuc, setPregledKljuc] = useState(0);
  const osvjeziPregled = () => setPregledKljuc((k) => k + 1);

  async function uploadaj(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadaSe(true);
    setUploadGreska(undefined);
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_VELICINA) {
          setUploadGreska(`„${file.name}” je veći od ${MAX_MB} MB.`);
          continue;
        }
        const blob = await upload(`materijali/${p.slug}/${sigurnoImeDatoteke(file.name)}`, file, {
          access: "private",
          handleUploadUrl: `/admin/upitnici/${p.slug}/upload`,
          multipart: file.size > 20 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => setNapredak(`${file.name}: ${Math.round(percentage)} %`),
        });
        const r = await spremiMaterijal(p.slug, blob.url, file.name);
        if (r.greska) setUploadGreska(r.greska);
      }
      osvjeziPregled();
    } catch (error) {
      console.error(error);
      setUploadGreska("Upload nije uspio. Provjerite vrstu i veličinu datoteke pa pokušajte ponovno.");
    } finally {
      setUploadaSe(false);
      setNapredak(undefined);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Mail nakon edukacije</h2>
        <p className="text-sm text-gray-500 mt-1">
          Kontakt osobe prijava dobivaju zahvalu, materijale, upitnik (gumb i QR) i nadolazeće edukacije. Tekst se
          uređuje u Tekstovi → Mail nakon edukacije.
        </p>
      </div>

      <div>
        <h3 className="font-medium mb-2">1. Materijali</h3>
        {p.materijali.length === 0 ? (
          <p className="text-sm text-gray-500">Nema materijala - mail ide bez gumba za preuzimanje.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg text-sm">
            {p.materijali.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="break-all">
                  {m.naziv} <span className="text-gray-400">· {m.velicina}</span>
                </span>
                <button
                  className="px-2.5 py-1 rounded-lg text-xs border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60"
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Obrisati „${m.naziv}”? Neće ga moći preuzeti ni oni koji su mail već dobili.`)) {
                      start(async () => {
                        setStanjeBrisanja(await obrisiMaterijalAkcija(m.id, p.slug));
                        osvjeziPregled();
                      });
                    }
                  }}
                >
                  Obriši
                </button>
              </li>
            ))}
          </ul>
        )}
        <Poruka s={stanjeBrisanja} />
        <label className={`${gumbSekundarni} inline-block cursor-pointer mt-3 ${uploadaSe ? "opacity-60" : ""}`}>
          {uploadaSe ? "Upload u tijeku..." : "Dodaj datoteke"}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={DOPUSTENI_NASTAVCI}
            className="hidden"
            disabled={uploadaSe}
            onChange={(e) => uploadaj(e.target.files)}
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">PDF, PowerPoint, Word, Excel, ZIP ili slika, do {MAX_MB} MB po datoteci.</p>
        {napredak && <p className="text-sm text-gray-600 mt-2">{napredak}</p>}
        {uploadGreska && <p className="text-sm text-red-600 mt-2">{uploadGreska}</p>}
      </div>

      <div>
        <h3 className="font-medium mb-2">2. Pregled</h3>
        <iframe
          key={pregledKljuc}
          src={`/admin/upitnici/${p.slug}/pregled`}
          title="Pregled maila"
          className="w-full h-[640px] border border-gray-200 rounded-lg bg-gray-50"
        />
        <button
          className={`${gumbSekundarni} mt-3`}
          disabled={pending}
          onClick={() => start(async () => setStanjeProbe(await posaljiProbniAkcija(p.slug)))}
        >
          Pošalji probni mail meni
        </button>
        <Poruka s={stanjeProbe} />
      </div>

      <div>
        <h3 className="font-medium mb-2">3. Termin slanja</h3>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={datum}
            min={p.danas}
            onChange={(e) => setDatum(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            className={gumbPrimarni}
            disabled={pending || !datum || datum === (p.datumSlanja ?? "")}
            onClick={() =>
              start(async () => {
                setStanjeDatuma(await spremiDatumSlanja(p.slug, datum));
                osvjeziPregled();
              })
            }
          >
            Spremi termin
          </button>
          {p.datumSlanja && (
            <button
              className="text-sm text-gray-500 hover:underline disabled:opacity-60"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setDatum("");
                  setStanjeDatuma(await spremiDatumSlanja(p.slug, ""));
                  osvjeziPregled();
                })
              }
            >
              Ukloni termin
            </button>
          )}
        </div>
        <p className="text-sm mt-2">
          {p.datumSlanjaLabel ? (
            <span className="text-green-700">Mail odlazi {p.datumSlanjaLabel} ujutro (oko 8 h).</span>
          ) : (
            <span className="text-amber-700">Termin nije zadan - mail neće otići.</span>
          )}{" "}
          <span className="text-gray-500">Adresa koje mail još nisu dobile: {brojPrimatelja}.</span>
        </p>
        <Poruka s={stanjeDatuma} />
      </div>

      <div>
        <h3 className="font-medium mb-2">4. Pošalji odmah</h3>
        <button
          className={gumbPrimarni}
          disabled={pending || !p.zavrsila || brojPrimatelja === 0}
          onClick={() => {
            if (confirm(`Poslati mail na ${brojPrimatelja} adresa sada? Ovo se ne može poništiti.`)) {
              start(async () => setStanjeSlanja(await posaljiSadaAkcija(p.slug)));
            }
          }}
        >
          {pending ? "Radim..." : `Pošalji sada (${brojPrimatelja})`}
        </button>
        {!p.zavrsila && <p className="text-xs text-gray-500 mt-2">Moguće tek nakon završetka edukacije.</p>}
        <Poruka s={stanjeSlanja} />
        {brojPrimatelja > 0 ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Mail će dobiti (nakon slanja kopija s popisom stiže i na info@localis.hr):
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-sm">
              {p.primatelji.map((r) => (
                <li key={r.email}>
                  <span className="font-medium">{r.email}</span>{" "}
                  <span className="text-gray-500">
                    · {r.organizacija} · {r.kontaktIme}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-4">Svi primatelji su mail već dobili.</p>
        )}
      </div>
    </section>
  );
}
