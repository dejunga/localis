import { getTekstovi } from "@/lib/tekstovi";

// Uz naslov jedna konkretna rečenica: koliko je nadolazećih i kad je sljedeća.
export default async function EdukacijeHero({ sazetak }: { sazetak: string }) {
  const t = await getTekstovi();
  return (
    <section className="bg-[var(--navy)] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
          {t["edukacije.naslov"]}
        </h1>
        <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
          {t["edukacije.uvod"]}
        </p>
        <p className="mt-6 text-[var(--gold)] font-medium">{sazetak}</p>
      </div>
    </section>
  );
}
