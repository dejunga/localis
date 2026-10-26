import { zahtijevajAdmina } from "@/lib/admin/session";
import { GRUPE_TEKSTOVA, MAX_DULJINA_TEKSTA, getTekstovi } from "@/lib/tekstovi";
import TekstoviForm from "./TekstoviForm";

export const dynamic = "force-dynamic";

export default async function TekstoviPage() {
  await zahtijevajAdmina();
  const tekstovi = await getTekstovi();
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Tekstovi na stranicama</h1>
      <p className="text-sm text-gray-600 mb-8">
        Promjene se vide na stranici odmah nakon spremanja. Ako polje ispraznite i spremite, vraća
        se izvorni tekst.
      </p>
      <nav className="flex flex-wrap gap-2 mb-8 text-sm">
        {GRUPE_TEKSTOVA.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[var(--navy)]">
            {g.naslov}
          </a>
        ))}
      </nav>
      <div className="space-y-8">
        {GRUPE_TEKSTOVA.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-6 bg-white border border-gray-200 rounded-xl p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">{g.naslov}</h2>
              {"opis" in g && <p className="text-sm text-gray-500 mt-1">{g.opis}</p>}
            </div>
            <TekstoviForm
              maxDuljina={MAX_DULJINA_TEKSTA}
              polja={g.polja.map((p) => ({ kljuc: p.kljuc, oznaka: p.oznaka, vrsta: p.vrsta, vrijednost: tekstovi[p.kljuc] }))}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
