import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getSeminar } from "@/lib/edukacije";
import { formatRoka, rokUpitnika, stanjeUpitnika } from "@/lib/upitnici/rok";
import UpitnikForm from "./UpitnikForm";

export const metadata: Metadata = {
  title: "Upitnik o edukaciji - LOCALIS",
  robots: { index: false, follow: false },
};

export default async function UpitnikPage({ params }: { params: Promise<{ slug: string }> }) {
  // Stanje (uskoro / otvoren / zatvoren) ovisi o trenutku zahtjeva - bez prerendera.
  await connection();
  const { slug } = await params;
  const seminar = await getSeminar(slug);
  if (!seminar || seminar.odgodeno) notFound();

  const stanje = stanjeUpitnika(seminar);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--navy)]/70">Upitnik o edukaciji</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
          {seminar.title}
        </h1>
        <p className="mt-2 text-gray-500">
          {seminar.dateLabel} · {seminar.location}
        </p>

        {stanje === "uskoro" && (
          <p className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
            Upitnik se otvara na dan edukacije.
          </p>
        )}
        {stanje === "zatvoren" && (
          <p className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
            Upitnik je zatvoren. Hvala na interesu.
          </p>
        )}
        {stanje === "otvoren" && (
          <>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Hvala što ste bili s nama. Vaše mišljenje pomaže nam da edukacije budu još bolje - upitnik je
              anoniman i traje oko minutu.
            </p>
            <div className="mt-8">
              <UpitnikForm
                seminarSlug={seminar.slug}
                predavaci={seminar.lecturers.map((l) => l.name)}
              />
            </div>
            <p className="mt-6 text-xs text-gray-500">Upitnik je otvoren do {formatRoka(rokUpitnika(seminar))}.</p>
          </>
        )}
      </div>
    </div>
  );
}
