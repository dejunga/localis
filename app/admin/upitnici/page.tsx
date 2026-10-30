import Link from "next/link";
import { and, avg, count, isNotNull, isNull, sql } from "drizzle-orm";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { upitniciMailovi, upitniciOdgovori } from "@/lib/db/schema";
import { getSeminars } from "@/lib/edukacije";
import { formatRoka, rokUpitnika, stanjeUpitnika } from "@/lib/upitnici/rok";
import { getSlanja } from "@/lib/upitnici/slanje";

export const dynamic = "force-dynamic";

// "2026-10-14" -> "14.10.2026"
function fmtDatumEdukacije(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default async function UpitniciPage() {
  await zahtijevajAdmina();
  const [seminari, odgovori, mailovi, slanja] = await Promise.all([
    getSeminars(),
    db
      .select({
        slug: upitniciOdgovori.seminarSlug,
        broj: count(),
        prosjek: avg(upitniciOdgovori.ocjenaUkupno),
      })
      .from(upitniciOdgovori)
      .groupBy(upitniciOdgovori.seminarSlug),
    db
      .select({
        slug: upitniciMailovi.seminarSlug,
        poslano: sql<number>`count(*) filter (where ${isNotNull(upitniciMailovi.poslanAt)})`.mapWith(Number),
        greske: sql<number>`count(*) filter (where ${and(
          isNull(upitniciMailovi.poslanAt),
          isNotNull(upitniciMailovi.greska),
        )})`.mapWith(Number),
      })
      .from(upitniciMailovi)
      .groupBy(upitniciMailovi.seminarSlug),
    getSlanja(),
  ]);
  const poOdgovorima = new Map(odgovori.map((o) => [o.slug, o]));
  const poMailovima = new Map(mailovi.map((m) => [m.slug, m]));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Upitnici</h1>
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Edukacija</th>
              <th className="px-3 py-2">Upitnik</th>
              <th className="px-3 py-2 text-center">Odgovori</th>
              <th className="px-3 py-2 text-center">Prosjek</th>
              <th className="px-3 py-2">Slanje</th>
              <th className="px-3 py-2">Mailovi</th>
            </tr>
          </thead>
          <tbody>
            {seminari.map((s) => {
              const datumSlanja = slanja.get(s.slug);
              const stanje = stanjeUpitnika(s, undefined, datumSlanja);
              const o = poOdgovorima.get(s.slug);
              const m = poMailovima.get(s.slug);
              return (
                <tr key={s.slug} className="border-t border-gray-100">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDatumEdukacije(s.date)}</td>
                  <td className="px-3 py-2 max-w-md">
                    <Link href={`/admin/upitnici/${s.slug}`} className="text-[var(--navy)] hover:underline">
                      {s.title}
                    </Link>
                    {s.odgodeno && <div className="text-xs text-amber-700">odgođeno - bez upitnika</div>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {stanje === "uskoro" && <span className="text-gray-500">uskoro</span>}
                    {stanje === "otvoren" && (
                      <span className="text-green-700">otvoren do {formatRoka(rokUpitnika(s, datumSlanja))}</span>
                    )}
                    {stanje === "zatvoren" && <span className="text-gray-500">zatvoren</span>}
                  </td>
                  <td className="px-3 py-2 text-center">{o?.broj ?? 0}</td>
                  <td className="px-3 py-2 text-center">{o?.prosjek ? Number(o.prosjek).toFixed(1) : "–"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {datumSlanja ? (
                      fmtDatumEdukacije(datumSlanja)
                    ) : (
                      <span className="text-gray-400">nije zadano</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {m ? (
                      <>
                        {m.poslano} poslano
                        {m.greske > 0 && <span className="text-red-600"> · greške: {m.greske}</span>}
                      </>
                    ) : (
                      <span className="text-gray-400">–</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
