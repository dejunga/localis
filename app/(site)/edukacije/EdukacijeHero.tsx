// Uz naslov jedna konkretna rečenica: koliko je nadolazećih i kad je sljedeća.
export default function EdukacijeHero({ sazetak }: { sazetak: string }) {
  return (
    <section className="bg-[var(--navy)] pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[family-name:var(--font-playfair)]">
          Edukacije
        </h1>
        <p className="text-gray-300 mt-4 max-w-2xl text-lg leading-relaxed text-pretty">
          Radionice, seminari i predavanja za službenike lokalne samouprave i sve koji se u
          svom radu susreću s tim temama.
        </p>
        <p className="mt-6 text-[var(--gold)] font-medium">{sazetak}</p>
      </div>
    </section>
  );
}
