import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LOCALIS admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-[var(--navy)] text-white">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6 text-sm">
          <span className="font-semibold tracking-wide">LOCALIS admin</span>
          <Link href="/admin/prijave" className="hover:underline">
            Prijave
          </Link>
          <Link href="/admin/postavke" className="hover:underline">
            Postavke
          </Link>
          <form action="/admin/login/odjava" method="post" className="ml-auto">
            <button type="submit" className="hover:underline">
              Odjava
            </button>
          </form>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
