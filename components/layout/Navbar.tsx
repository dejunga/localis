"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/usluge", label: "Usluge" },
  { href: "/o-nama", label: "O nama" },
  { href: "/vijesti", label: "Vijesti" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[var(--gold)] rounded-sm flex items-center justify-center">
            <span className="text-[var(--navy)] font-bold text-sm font-[family-name:var(--font-playfair)]">L</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className={`font-bold text-lg tracking-wide font-[family-name:var(--font-playfair)] transition-colors duration-300 ${scrolled ? "text-[var(--navy)]" : "text-white"}`}>
              LOCALIS
            </span>
            <span className="text-[10px] text-[var(--gold)] uppercase tracking-widest font-medium">
              edukacija i savjetovanje
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-[var(--gold)] after:transition-all after:duration-300 ${
                  scrolled
                    ? pathname === link.href
                      ? "text-[var(--navy)] after:w-full"
                      : "text-gray-600 hover:text-[var(--navy)] after:w-0 hover:after:w-full"
                    : pathname === link.href
                      ? "text-white after:w-full"
                      : "text-white/70 hover:text-white after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <Link
          href="/kontakt"
          className={`hidden md:inline-flex items-center px-5 py-2.5 text-sm font-medium rounded transition-all duration-300 ${
            scrolled
              ? "bg-[var(--navy)] text-white hover:bg-[var(--navy-light)]"
              : "border border-white/50 text-white hover:bg-white/10"
          }`}
        >
          Kontaktirajte nas
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 transition-colors duration-300 ${scrolled ? "text-[var(--navy)]" : "text-white"}`}
          aria-label="Izbornik"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block text-base font-medium py-1 transition-colors ${
                    pathname === link.href
                      ? "text-[var(--navy)]"
                      : "text-gray-600 hover:text-[var(--navy)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/kontakt"
                className="inline-flex items-center px-5 py-2.5 bg-[var(--navy)] text-white text-sm font-medium rounded mt-2"
              >
                Kontaktirajte nas
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
