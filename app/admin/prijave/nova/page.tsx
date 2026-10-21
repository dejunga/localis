import Link from "next/link";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { getSeminars, isSeminarPast } from "@/lib/edukacije";
import NovaPrijavaForm from "./NovaPrijavaForm";

export const dynamic = "force-dynamic";

// "2026-10-14" -> "14.10.2026"
function fmtDatumEdukacije(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default async function NovaPrijavaPage() {
  await zahtijevajAdmina();
  // Prošle edukacije nemaju smisla za novu prijavu; skrivene i odgođene ostaju - admin zna zašto.
  const seminari = (await getSeminars(undefined, { skrivene: true }))
    .filter((s) => !isSeminarPast(s))
    .map((s) => ({
      slug: s.slug,
      label: `${fmtDatumEdukacije(s.date)} – ${s.title} (${s.location})`,
      imaPonudu: Boolean(s.ponuda),
    }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/admin/prijave" className="text-sm text-[var(--navy)] hover:underline">
          ← Sve prijave
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Nova prijava</h1>
        <p className="text-gray-600 text-sm">
          Za klijente koji se jave telefonom ili mailom. Ponuda ide na email kontakt osobe, isto kao kod prijave
          preko stranice. Privola za obavijesti se ne bilježi.
        </p>
      </div>
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <NovaPrijavaForm seminari={seminari} />
      </section>
    </div>
  );
}
