"use client";

export default function PrijaviSeButton() {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.getElementById("prijava")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <a
      href="#prijava"
      onClick={handleClick}
      className="inline-flex items-center px-8 py-3.5 bg-[var(--navy)] text-white font-medium rounded hover:bg-[var(--navy-light)] transition-colors"
    >
      Prijavite se
    </a>
  );
}
