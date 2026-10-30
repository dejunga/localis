import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Download } from "lucide-react";
import { getSeminar } from "@/lib/edukacije";
import { formatVelicine, getMaterijali, provjeriKljucMaterijala } from "@/lib/upitnici/materijali";

export const metadata: Metadata = {
  title: "Materijali s edukacije - LOCALIS",
  robots: { index: false, follow: false },
};

// Stranica radi samo s ključem iz maila nakon edukacije; bez njega 404.
export default async function MaterijaliPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  await connection();
  const [{ slug }, { k }] = await Promise.all([params, searchParams]);
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar || !k || !(await provjeriKljucMaterijala(slug, k))) notFound();
  const materijali = await getMaterijali(slug);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--navy)]/70">Materijali s edukacije</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
          {seminar.title}
        </h1>
        <p className="mt-2 text-gray-500">
          {seminar.dateLabel} · {seminar.location}
        </p>

        {materijali.length === 0 ? (
          <p className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
            Materijali još nisu objavljeni.
          </p>
        ) : (
          <ul className="mt-10 divide-y divide-gray-200 rounded-xl border border-gray-200">
            {materijali.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 break-words">{m.naziv}</div>
                  <div className="text-sm text-gray-500">{formatVelicine(m.velicina)}</div>
                </div>
                <a
                  href={`/materijali/${slug}/${m.id}?k=${encodeURIComponent(k)}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--navy)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Preuzmi
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-sm text-gray-500 leading-relaxed">
          Materijali su autorsko djelo predavača i namijenjeni su Vašem osobnom radu. Molimo da ih ne umnožavate i ne
          prosljeđujete bez dopuštenja.
        </p>
      </div>
    </div>
  );
}
