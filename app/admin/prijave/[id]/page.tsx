import Link from "next/link";
import { notFound } from "next/navigation";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { ucitajPrijavu } from "@/lib/prijave/ucitaj";
import { formatDatumHr, formatIznos } from "@/lib/ponude/format";
import StatusBadge from "../../StatusBadge";
import UrediPrijavuForm from "./UrediPrijavuForm";
import { IzdajNovuGumb, PonudaAkcije } from "./PonudaAkcije";

export const dynamic = "force-dynamic";

export default async function PrijavaDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  await zahtijevajAdmina();
  const { id } = await params;
  const prijavaId = Number(id);
  if (!Number.isInteger(prijavaId)) notFound();
  const prijava = await ucitajPrijavu(prijavaId);
  if (!prijava) notFound();

  const imaAktivnu = prijava.ponude.some((p) => p.status === "poslana" || p.status === "greska");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <Link href="/admin/prijave" className="text-sm text-[var(--navy)] hover:underline">
          ← Sve prijave
        </Link>
        <h1 className="text-2xl font-semibold mt-2 flex items-center gap-3">
          {prijava.organizacija} <StatusBadge status={prijava.status} />
        </h1>
        <p className="text-gray-600 text-sm">{prijava.seminarTitle}</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Ponude</h2>
        {prijava.ponude.length === 0 && <p className="text-sm text-gray-500 mb-4">Nema izdanih ponuda.</p>}
        <ul className="space-y-3">
          {prijava.ponude.map((p) => (
            <li key={p.id} className="border border-gray-100 rounded-lg p-4 text-sm space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">{p.broj}</span>
                <StatusBadge status={p.status} />
                <span>izdana {formatDatumHr(p.datumIzdavanja)}</span>
                <span>vrijedi do {formatDatumHr(p.vrijediDo)}</span>
                <span>
                  {p.kolicina} × {formatIznos(p.cijena)} = <b>{formatIznos(p.ukupno)} EUR</b>
                </span>
                {p.pdfUrl && (
                  <a
                    href={`/admin/ponude/${p.id}/pdf`}
                    className="text-[var(--navy)] hover:underline"
                    target="_blank"
                  >
                    PDF
                  </a>
                )}
              </div>
              {p.greska && <p className="text-red-600 text-xs">Greška: {p.greska}</p>}
              {p.emailPoslanAt && (
                <p className="text-gray-500 text-xs">
                  Mail poslan: {p.emailPoslanAt.toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" })}
                </p>
              )}
              <PonudaAkcije prijavaId={prijava.id} ponuda={p} />
            </li>
          ))}
        </ul>
        {!imaAktivnu && (
          <div className="mt-4">
            <IzdajNovuGumb prijavaId={prijava.id} />
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold mb-1">Podaci prijave</h2>
        <p className="text-xs text-gray-500 mb-4">
          Izmjene ne mijenjaju već izdane ponude. Za ispravak: uredi → storniraj staru → izdaj novu.
        </p>
        <UrediPrijavuForm prijava={prijava} polaznici={prijava.polaznici} />
      </section>
    </div>
  );
}
