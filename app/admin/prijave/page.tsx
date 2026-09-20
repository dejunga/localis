import Link from "next/link";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { getSeminars } from "@/lib/edukacije";
import { ucitajPrijave } from "@/lib/prijave/ucitaj";
import type { Prijava } from "@/lib/db/schema";
import StatusBadge from "../StatusBadge";

export const dynamic = "force-dynamic";

const STATUSI: Prijava["status"][] = ["nova", "ponuda_poslana", "stornirana"];

function fmtDatum(d: Date) {
  return new Intl.DateTimeFormat("hr-HR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  }).format(d);
}

export default async function PrijavePage({
  searchParams,
}: {
  searchParams: Promise<{ edukacija?: string; status?: string }>;
}) {
  await zahtijevajAdmina();
  const { edukacija, status } = await searchParams;
  const statusFilter = STATUSI.find((s) => s === status);
  const [prijave, seminari] = await Promise.all([
    ucitajPrijave({ seminarSlug: edukacija || undefined, status: statusFilter }),
    getSeminars(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Prijave</h1>

      <form className="flex flex-wrap gap-3 mb-6 text-sm" method="get">
        <select name="edukacija" defaultValue={edukacija ?? ""} className="border rounded-lg px-3 py-2 bg-white">
          <option value="">Sve edukacije</option>
          {seminari.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className="border rounded-lg px-3 py-2 bg-white">
          <option value="">Svi statusi</option>
          <option value="nova">nova</option>
          <option value="ponuda_poslana">ponuda poslana</option>
          <option value="stornirana">stornirana</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-[var(--navy)] text-white rounded-lg">
          Filtriraj
        </button>
        {edukacija ? (
          <a
            href={`/admin/prijave/export?edukacija=${encodeURIComponent(edukacija)}`}
            className="px-4 py-2 border border-[var(--navy)] text-[var(--navy)] rounded-lg hover:bg-gray-50"
          >
            Export za računovodstvo
          </a>
        ) : (
          <span
            title="Odaberi edukaciju za export"
            className="px-4 py-2 border border-gray-300 text-gray-400 rounded-lg cursor-not-allowed"
          >
            Export za računovodstvo
          </span>
        )}
      </form>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Edukacija</th>
              <th className="px-3 py-2">Organizacija</th>
              <th className="px-3 py-2">Kontakt</th>
              <th className="px-3 py-2 text-center">Polaznici</th>
              <th className="px-3 py-2">Ponuda</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {prijave.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  Nema prijava.
                </td>
              </tr>
            )}
            {prijave.map((p) => (
              <tr key={p.id} className="border-t border-gray-100">
                <td className="px-3 py-2 whitespace-nowrap">{fmtDatum(p.createdAt)}</td>
                <td className="px-3 py-2 max-w-xs truncate" title={p.seminarTitle}>
                  {p.seminarTitle}
                </td>
                <td className="px-3 py-2">{p.organizacija}</td>
                <td className="px-3 py-2">
                  {p.kontaktIme}
                  <div className="text-gray-500 text-xs">{p.email}</div>
                </td>
                <td className="px-3 py-2 text-center">{p.brojPolaznika}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {p.zadnjaPonuda ? (
                    <>
                      {p.zadnjaPonuda.broj} <StatusBadge status={p.zadnjaPonuda.status} />
                    </>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/prijave/${p.id}`} className="text-[var(--navy)] hover:underline">
                    Detalji
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
