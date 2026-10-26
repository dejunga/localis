"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Dugi tekst (biografija) skraćen na nekoliko redaka; gumb se pokazuje samo ako je tekst stvarno odrezan.
export default function RasklopivTekst({ tekst, redaka = 4 }: { tekst: string; redaka?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [otvoreno, setOtvoreno] = useState(false);
  const [odrezano, setOdrezano] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !otvoreno) setOdrezano(el.scrollHeight > el.clientHeight + 1);
  }, [otvoreno, tekst]);

  return (
    <div>
      <p
        ref={ref}
        className="text-gray-600 text-sm leading-relaxed text-pretty"
        style={otvoreno ? undefined : { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: redaka, overflow: "hidden" }}
      >
        {tekst}
      </p>
      {(odrezano || otvoreno) && (
        <button
          type="button"
          onClick={() => setOtvoreno((o) => !o)}
          aria-expanded={otvoreno}
          className="mt-2 text-sm font-semibold text-[var(--navy)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--navy-light)]"
        >
          {otvoreno ? "Prikaži manje" : "Pročitajte više"}
        </button>
      )}
    </div>
  );
}
