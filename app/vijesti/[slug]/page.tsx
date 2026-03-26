import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

// Placeholder – zamijenit će se Sanity podacima
export default function PostPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/vijesti"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--navy)] transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          Nazad na vijesti
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
            Edukacija
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Calendar size={11} />
            15. ožujka 2026.
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={11} />
            4 min
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[var(--navy)] mb-6 font-[family-name:var(--font-playfair)] leading-tight">
          Kako uspješno organizirati edukacijski seminar
        </h1>

        <div className="aspect-[16/7] rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 mb-10 flex items-center justify-center">
          <span className="text-[var(--navy)]/15 text-8xl font-bold font-[family-name:var(--font-playfair)]">K</span>
        </div>

        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
          <p>
            Ovaj članak je placeholder. Kada povežete Sanity CMS, sadržaj će se
            automatski učitavati iz vašeg CMS-a. Marija ili vi kao developer
            možete dodavati nove članke direktno iz Sanity Studija bez
            ikakvih promjena u kodu.
          </p>
          <p>
            Sanity Studio dostupan je na <code>/studio</code> rutu vaše
            stranice ili kao zasebna aplikacija.
          </p>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-gray-400 text-sm mb-4">Autor</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--navy)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-playfair)]">M</span>
            </div>
            <div>
              <div className="font-semibold text-[var(--navy)] text-sm">Marija Jungić</div>
              <div className="text-gray-400 text-xs">LOCALIS – Edukacija i savjetovanje</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
