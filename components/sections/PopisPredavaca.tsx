import Image from "next/image";
import type { Predavac } from "@/lib/edukacije";

// Predavači s fotografijom, imenom i funkcijom - početna (About) i stranica O nama.
export default function PopisPredavaca({ predavaci }: { predavaci: Predavac[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
      {predavaci.map((p) => (
        <li key={p.ime} className="flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-[var(--navy)]/8 outline -outline-offset-1 outline-black/10">
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
            {p.uloga && <p className="mt-1 text-sm text-gray-500 leading-snug line-clamp-3">{p.uloga}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
