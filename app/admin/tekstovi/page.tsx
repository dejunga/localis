import Link from "next/link";
import { zahtijevajAdmina } from "@/lib/admin/session";
import { GRUPE_TEKSTOVA, MAX_DULJINA_TEKSTA, getIzmijenjeniKljucevi, getTekstovi } from "@/lib/tekstovi";
import TekstoviForm from "./TekstoviForm";

export const dynamic = "force-dynamic";

// Prikazuje se jedna grupa (stranica) odjednom; ?grupa=<id> bira koja.
export default async function TekstoviPage({ searchParams }: { searchParams: Promise<{ grupa?: string }> }) {
  await zahtijevajAdmina();
  const { grupa } = await searchParams;
  const odabrana = GRUPE_TEKSTOVA.find((g) => g.id === grupa) ?? GRUPE_TEKSTOVA[0];
  const [tekstovi, izmijenjeni] = await Promise.all([getTekstovi(), getIzmijenjeniKljucevi()]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Tekstovi na stranicama</h1>
      <p className="text-sm text-gray-600 mb-6">
        Promjene se vide na stranici odmah nakon spremanja. Polja označena kao „promijenjeno” razlikuju
        se od izvornog teksta.
      </p>
      <nav className="flex flex-wrap gap-2 mb-6 text-sm">
        {GRUPE_TEKSTOVA.map((g) => {
          const aktivna = g.id === odabrana.id;
          const brojIzmjena = g.polja.filter((p) => izmijenjeni.has(p.kljuc)).length;
          return (
            <Link
              key={g.id}
              href={`/admin/tekstovi?grupa=${g.id}`}
              aria-current={aktivna ? "page" : undefined}
              className={`px-3 py-1.5 rounded-full border ${
                aktivna
                  ? "bg-[var(--navy)] border-[var(--navy)] text-white"
                  : "bg-white border-gray-200 hover:border-[var(--navy)]"
              }`}
            >
              {g.naslov}
              {brojIzmjena > 0 && <span className={aktivna ? "text-white/70" : "text-gray-400"}> · {brojIzmjena}</span>}
            </Link>
          );
        })}
      </nav>
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">{odabrana.naslov}</h2>
          {"opis" in odabrana && <p className="text-sm text-gray-500 mt-1">{odabrana.opis}</p>}
        </div>
        <TekstoviForm
          key={odabrana.id}
          maxDuljina={MAX_DULJINA_TEKSTA}
          polja={odabrana.polja.map((p) => ({
            kljuc: p.kljuc,
            oznaka: p.oznaka,
            vrsta: p.vrsta,
            vrijednost: tekstovi[p.kljuc],
            zadano: p.zadano,
            izmijenjeno: izmijenjeni.has(p.kljuc),
          }))}
        />
      </section>
    </div>
  );
}
