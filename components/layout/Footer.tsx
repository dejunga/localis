import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const services = [
  "Obrazovanje i poučavanje",
  "Organizacija seminara",
  "Poslovno savjetovanje",
  "Uredske i računovodstvene usluge",
];

const navLinks = [
  { href: "/", label: "Početna" },
  { href: "/usluge", label: "Usluge" },
  { href: "/o-nama", label: "O nama" },
  { href: "/vijesti", label: "Vijesti" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--gold)] rounded-sm flex items-center justify-center">
                <span className="text-[var(--navy)] font-bold text-sm font-[family-name:var(--font-playfair)]">L</span>
              </div>
              <span className="font-bold text-lg tracking-wide font-[family-name:var(--font-playfair)]">
                LOCALIS
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Edukacija i savjetovanje za bolji poslovni razvoj.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--gold)] mb-4">
              Stranice
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--gold)] mb-4">
              Usluge
            </h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service} className="text-gray-400 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-[var(--gold)] mb-4">
              Kontakt
            </h4>
            <ul className="space-y-3">
<li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail size={15} className="shrink-0 text-[var(--gold)]" />
                <a href="mailto:info@localis.hr" className="hover:text-white transition-colors">
                  info@localis.hr
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone size={15} className="shrink-0 text-[var(--gold)]" />
                <a href="tel:+385" className="hover:text-white transition-colors">
                  +385 xx xxx xxxx
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} LOCALIS – Marija Jungić. Sva prava pridržana.
          </p>
          <p className="text-gray-600 text-xs">
            OIB: xxxxxxxxxx
          </p>
        </div>
      </div>
    </footer>
  );
}
