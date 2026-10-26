"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const TOCKE = "radial-gradient(circle, white 1px, transparent 1px)";

// Zlatno svjetlo koje s blagim zaostatkom prati miš i oko sebe otkriva točkastu mrežu.
// Na dodirnim uređajima i uz smanjene animacije svjetlo stoji na mjestu.
export default function HeroPozadina() {
  const ref = useRef<HTMLDivElement>(null);
  const smanjiPokrete = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.6 });

  const svjetlo = useMotionTemplate`radial-gradient(550px circle at ${sx}px ${sy}px, color-mix(in oklch, var(--gold) 22%, transparent), transparent 65%)`;
  const maska = useMotionTemplate`radial-gradient(320px circle at ${sx}px ${sy}px, black, transparent 75%)`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const pocetak = el.getBoundingClientRect();
    x.jump(pocetak.width * 0.7);
    y.jump(pocetak.height * 0.4);
    sx.jump(pocetak.width * 0.7);
    sy.jump(pocetak.height * 0.4);

    if (smanjiPokrete || !window.matchMedia("(pointer: fine)").matches) return;

    function pomakni(e: PointerEvent) {
      const r = el!.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    }
    window.addEventListener("pointermove", pomakni, { passive: true });
    return () => window.removeEventListener("pointermove", pomakni);
  }, [smanjiPokrete, x, y, sx, sy]);

  return (
    <div ref={ref} aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {/* Lebdeće mrlje - daju život i bez miša (mobitel) */}
      <div className="absolute -top-40 -right-32 w-[40rem] h-[40rem] rounded-full bg-[var(--gold)]/10 blur-3xl animate-[lebdenje_18s_ease-in-out_infinite] motion-reduce:animate-none" />
      <div className="absolute -bottom-48 left-[10%] w-[36rem] h-[36rem] rounded-full bg-sky-400/10 blur-3xl animate-[lebdenje_24s_ease-in-out_infinite_reverse] motion-reduce:animate-none" />

      <motion.div className="absolute inset-0" style={{ background: svjetlo }} />
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: TOCKE,
          backgroundSize: "40px 40px",
          maskImage: maska,
          WebkitMaskImage: maska,
        }}
      />
    </div>
  );
}
