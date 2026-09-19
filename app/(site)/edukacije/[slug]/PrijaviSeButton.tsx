// Nativni anchor: `html { scroll-smooth }` u globals.css radi animaciju, a `scroll-mt-24`
// na sekciji #prijava kompenzira navbar. Ručna rAF animacija se s tim sudarala
// (svaki scrollTo pokretao je novu smooth animaciju) pa je scroll trajao predugo.
export default function PrijaviSeButton() {
  return (
    <a
      href="#prijava"
      className="inline-flex items-center px-8 py-3.5 bg-[var(--navy)] text-white font-medium rounded hover:bg-[var(--navy-light)] transition-colors"
    >
      Prijavite se
    </a>
  );
}
