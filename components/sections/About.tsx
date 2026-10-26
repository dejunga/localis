import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export type Predavac = {
  ime: string;
  uloga?: string;
  foto: { url: string; alt: string; position?: string };
};

const highlights = [
  "Teme biramo prema stvarnim potrebama struke, ne prema trendovima",
  "Predavači koji podjednako dobro poznaju teoriju i praksu",
  "Praktične smjernice koje polaznici odmah primjenjuju u radu",
  "Ukorijenjeni u lokalnoj zajednici i posvećeni njenom razvoju",
];

export default function About({ predavaci }: { predavaci: Predavac[] }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--navy)] leading-tight mb-6 text-balance font-[family-name:var(--font-playfair)]">
              Stručno, ali prije svega praktično
            </h2>

            <p className="text-gray-600 leading-relaxed mb-5 text-lg text-pretty">
              LOCALIS je osnovan s ciljem da pomogne u rješavanju
              svakodnevnih izazova s kojima se suočavaju službenici jedinica
              lokalne samouprave - ali i svi koji se u svom radu susreću s
              temama iz sustava lokalne samouprave: pravnici, zaposlenici u
              kadrovskim odjelima, poduzetnici i obrtnici.
            </p>

            <p className="text-gray-600 leading-relaxed mb-8 text-pretty">
              Teme koje obrađujemo napokon dolaze na dnevni red - svaku
              obrađujemo stručno, ali prije svega praktično, tako da
              polaznici odlaze s konkretnim smjernicama koje mogu odmah
              primijeniti u svom radu.
            </p>

            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 size={18} className="text-[var(--gold)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/o-nama"
              className="inline-flex items-center px-6 py-3 bg-[var(--navy)] text-white font-medium rounded transition-colors hover:bg-[var(--navy-light)]"
            >
              Više o nama
            </Link>
          </div>

          {/* Visual block */}
          <div className="relative bg-[var(--navy)] rounded-2xl p-10 text-white overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="w-16 h-16 bg-[var(--gold)] rounded-xl flex items-center justify-center mb-6">
                <span className="text-[var(--navy)] text-3xl font-bold font-[family-name:var(--font-playfair)]">M</span>
              </div>

              <h3 className="text-2xl font-bold mb-1 font-[family-name:var(--font-playfair)]">
                Milada Sofka
              </h3>
              <p className="text-[var(--gold)] text-sm font-medium mb-4">Voditeljica ureda</p>
              <p className="text-gray-300 leading-relaxed text-pretty">
                &ldquo;Vjerujem da svaka osoba i svaka organizacija ima potencijal
                za rast. Moja je uloga pomoći im da ga prepoznaju i razviju.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {predavaci.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)]">
              Predavači na našim edukacijama
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl text-pretty">
              Stručnjaci iz pravosuđa, državne uprave, sveučilišta i prakse koji o temama
              govore iz prve ruke.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              {predavaci.map((p) => (
                <li key={p.ime} className="flex items-start gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[var(--navy)]/8 outline outline-1 -outline-offset-1 outline-black/10">
                    <Image
                      src={p.foto.url}
                      alt={p.foto.alt}
                      fill
                      sizes="64px"
                      className="object-cover"
                      style={{ objectPosition: p.foto.position }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--navy)] leading-snug">{p.ime}</p>
                    {p.uloga && (
                      <p className="mt-1 text-sm text-gray-500 leading-snug line-clamp-3">{p.uloga}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
