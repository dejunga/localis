import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { prijave, upitniciMailovi, upitniciOdgovori } from "@/lib/db/schema";
import { getSeminar } from "@/lib/edukacije";
import { formatVelicine, getMaterijali } from "@/lib/upitnici/materijali";
import { edukacijaZavrsila, formatRoka, rokUpitnika, stanjeUpitnika } from "@/lib/upitnici/rok";
import { sazmi } from "@/lib/upitnici/sazetak";
import { danasZagreb, getPrimatelji, getSlanje, upitnikUrl } from "@/lib/upitnici/slanje";
import MailNakonSekcija from "./MailNakonSekcija";
import ObrisiOdgovorGumb from "./ObrisiOdgovorGumb";

export const dynamic = "force-dynamic";
// "Pošalji sada" (server akcija ove stranice) šalje mailove jedan po jedan.
export const maxDuration = 300;

// "2026-11-02" -> "2.11.2026."
function fmtDatumSlanja(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}.${m}.${y}.`;
}

const PREPORUKA = { da: "Da", mozda: "Možda", ne: "Ne" } as const;

function fmtDatum(d: Date) {
  return new Intl.DateTimeFormat("hr-HR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  }).format(d);
}

const prosjek = (n: number | null) => (n === null ? "–" : n.toFixed(1));

function Brojka({ label, vrijednost }: { label: string; vrijednost: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{vrijednost}</div>
    </div>
  );
}

export default async function UpitnikDetaljPage({ params }: { params: Promise<{ slug: string }> }) {
  await zahtijevajAdmina();
  const { slug } = await params;
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar) notFound();

  const [odgovori, mailovi, datumSlanja, materijali, primatelji] = await Promise.all([
    db
      .select()
      .from(upitniciOdgovori)
      .where(eq(upitniciOdgovori.seminarSlug, slug))
      .orderBy(desc(upitniciOdgovori.createdAt)),
    db
      .select({
        id: upitniciMailovi.id,
        email: upitniciMailovi.email,
        poslanAt: upitniciMailovi.poslanAt,
        greska: upitniciMailovi.greska,
        prijavaId: prijave.id,
        organizacija: prijave.organizacija,
        kontaktIme: prijave.kontaktIme,
      })
      .from(upitniciMailovi)
      .innerJoin(prijave, eq(prijave.id, upitniciMailovi.prijavaId))
      .where(eq(upitniciMailovi.seminarSlug, slug))
      .orderBy(prijave.organizacija),
    getSlanje(slug),
    getMaterijali(slug),
    getPrimatelji(slug),
  ]);
  const s = sazmi(odgovori);
  const stanje = stanjeUpitnika(seminar, undefined, datumSlanja);
  const url = upitnikUrl(slug);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/upitnici" className="text-sm text-gray-500 hover:underline">
          ← Upitnici
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{seminar.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {seminar.dateLabel} · {seminar.location} · upitnik{" "}
          {stanje === "uskoro" ? "se još nije otvorio" : stanje === "otvoren" ? "otvoren" : "zatvoren"}
          {stanje !== "zatvoren" && ` - otvoren do ${formatRoka(rokUpitnika(seminar, datumSlanja))}`}
        </p>
        <p className="text-sm mt-1">
          <a href={url} className="text-[var(--navy)] hover:underline" target="_blank" rel="noreferrer">
            {url}
          </a>
        </p>
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <a href={`/admin/upitnici/${slug}/qr`} className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg">
            Preuzmi QR (PNG)
          </a>
          <a
            href={`/admin/upitnici/${slug}/export`}
            className="px-4 py-2 border border-[var(--navy)] text-[var(--navy)] rounded-lg hover:bg-gray-50"
          >
            Excel
          </a>
        </div>
      </div>

      {!seminar.odgodeno && (
        <MailNakonSekcija
          slug={slug}
          materijali={materijali.map((m) => ({ id: m.id, naziv: m.naziv, velicina: formatVelicine(m.velicina) }))}
          datumSlanja={datumSlanja}
          datumSlanjaLabel={datumSlanja ? fmtDatumSlanja(datumSlanja) : null}
          danas={danasZagreb(new Date())}
          primatelji={primatelji}
          zavrsila={edukacijaZavrsila(seminar)}
        />
      )}

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Brojka label="Odgovori" vrijednost={String(s.broj)} />
        <Brojka label="Ukupna ocjena" vrijednost={prosjek(s.prosjekUkupno)} />
        <Brojka label="Korisnost" vrijednost={prosjek(s.prosjekKorisnost)} />
        <Brojka
          label="Preporučili bi (da / možda / ne)"
          vrijednost={`${s.preporuka.da} / ${s.preporuka.mozda} / ${s.preporuka.ne}`}
        />
        {s.predavaci.map((p) => (
          <Brojka key={p.ime} label={p.ime} vrijednost={prosjek(p.prosjek)} />
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Odgovori</h2>
        {odgovori.length === 0 && <p className="text-sm text-gray-500">Još nema odgovora.</p>}
        <div className="space-y-3">
          {odgovori.map((o) => (
            <article key={o.id} className="bg-white border border-gray-200 rounded-xl p-4 text-sm space-y-2">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                <span className="text-gray-400">{fmtDatum(o.createdAt)}</span>
                <span>
                  Ukupno: <b>{o.ocjenaUkupno}</b>
                </span>
                <span>
                  Korisnost: <b>{o.ocjenaKorisnost}</b>
                </span>
                {o.ocjenePredavaca.map((p) => (
                  <span key={p.ime}>
                    {p.ime}: <b>{p.ocjena}</b>
                  </span>
                ))}
                {o.preporuka && (
                  <span>
                    Preporuka: <b>{PREPORUKA[o.preporuka]}</b>
                  </span>
                )}
                <span className="ml-auto">
                  <ObrisiOdgovorGumb id={o.id} slug={slug} />
                </span>
              </div>
              {(
                [
                  ["Svidjelo", o.svidjelo],
                  ["Popraviti", o.popraviti],
                  [o.privolaObjavaAt ? "Recenzija (smije se objaviti, bez imena)" : "Recenzija", o.recenzija],
                  ["Stručna pomoć", o.strucnaPomoc],
                ] as const
              ).map(
                ([label, tekst]) =>
                  tekst && (
                    <p key={label} className="whitespace-pre-line">
                      <span className="font-medium">{label}:</span> {tekst}
                    </p>
                  ),
              )}
              {(o.kontaktIme || o.kontaktUstanova || o.kontaktEmail) && (
                <p className="text-gray-600">
                  <span className="font-medium">Kontakt:</span>{" "}
                  {[o.kontaktIme, o.kontaktUstanova, o.kontaktEmail].filter(Boolean).join(", ")}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Mailovi kontakt osobama</h2>
        {mailovi.length === 0 ? (
          <p className="text-sm text-gray-500">Mail se šalje automatski navečer na dan edukacije.</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">Organizacija</th>
                  <th className="px-3 py-2">Kontakt</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Stanje</th>
                </tr>
              </thead>
              <tbody>
                {mailovi.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <Link href={`/admin/prijave/${m.prijavaId}`} className="hover:underline">
                        {m.organizacija}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{m.kontaktIme}</td>
                    <td className="px-3 py-2">{m.email}</td>
                    <td className="px-3 py-2">
                      {m.poslanAt ? (
                        <span className="text-green-700">poslano {fmtDatum(m.poslanAt)}</span>
                      ) : m.greska ? (
                        <span className="text-red-600" title={m.greska}>
                          greška - ponovni pokušaj sutra
                        </span>
                      ) : (
                        <span className="text-gray-500">u slanju</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
