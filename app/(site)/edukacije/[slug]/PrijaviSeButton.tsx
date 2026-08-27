"use client";

const NAVBAR_OFFSET = 96;
const DURATION = 700;

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function PrijaviSeButton() {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById("prijava");
    if (!target) return;

    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + startY - NAVBAR_OFFSET;
    const distance = targetY - startY;
    let startTime: number | null = null;

    function step(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / DURATION, 1);
      window.scrollTo(0, startY + distance * easeInOutQuad(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
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
