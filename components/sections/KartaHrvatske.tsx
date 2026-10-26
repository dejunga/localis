"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { JLS, KARTA_VISINA } from "@/lib/karta-jls";

// --gold (oklch(0.72 0.13 75)) preveden u sRGB jer canvas boje miješamo ručno.
const ZLATNA = [212, 152, 56] as const;
const BIJELA = [255, 255, 255] as const;

const DOMET_MISA = 90; // px - koliko daleko od kursora točke svijetle
const DOMET_NATPISA = 26; // px - koliko blizu treba biti točki da se ispiše njen naziv
const RUB = 12; // px - prostor oko karte na canvasu, veći od najvećeg prstena oko točke
const TRAJANJE_VALA = 1100; // ms - val paljenja od Zagreba prema rubovima
const TRAJANJE_TOCKE = 450; // ms - paljenje jedne točke

const ZAGREB = JLS.find(([naziv]) => naziv === "Grad Zagreb")!;

// Karta Hrvatske od 556 točaka - svaka je sjedište jednog grada ili općine.
// Pri učitavanju se pale u valu iz Zagreba; kursor osvjetljava okolne točke i ispisuje
// naziv najbliže. Canvas crta samo dok se nešto mijenja, inače miruje.
export default function KartaHrvatske({ istaknuti }: { istaknuti: string[] }) {
  const omotacRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const natpisRef = useRef<HTMLDivElement>(null);
  const sjajRef = useRef<HTMLDivElement>(null);
  const smanjiPokrete = useReducedMotion();

  useEffect(() => {
    const omotac = omotacRef.current;
    const canvas = canvasRef.current;
    const natpis = natpisRef.current;
    const sjajMisa = sjajRef.current;
    const ctx = canvas?.getContext("2d");
    if (!omotac || !canvas || !natpis || !sjajMisa || !ctx) return;

    const n = JLS.length;
    const sjaj = new Float32Array(n); // 0-1, trenutna osvijetljenost od kursora
    const najdalje = Math.max(...JLS.map(([, x, y]) => Math.hypot(x - ZAGREB[1], y - ZAGREB[2])));
    const kasnjenje = JLS.map(([, x, y]) => (Math.hypot(x - ZAGREB[1], y - ZAGREB[2]) / najdalje) * TRAJANJE_VALA);
    const jeGrad = JLS.map(([naziv]) => naziv.startsWith("Grad "));

    let sirina = 0;
    let visina = 0;
    let mis: { x: number; y: number } | null = null;
    let najbliza = -1;
    const pocetak = smanjiPokrete ? -Infinity : performance.now() + 250;
    let okvir = 0;

    const px = (i: number) => JLS[i][1] * sirina;
    const py = (i: number) => JLS[i][2] * sirina;

    function velicina() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sirina = omotac!.clientWidth;
      visina = sirina * KARTA_VISINA;
      // Canvas je RUB px veći sa svih strana od karte, a ishodište se pomakne za RUB -
      // koordinate točaka ostaju iste, a točke na samom rubu (i prsten oko njih) se ne režu.
      canvas!.width = Math.round((sirina + 2 * RUB) * dpr);
      canvas!.height = Math.round((visina + 2 * RUB) * dpr);
      canvas!.style.width = `${sirina + 2 * RUB}px`;
      canvas!.style.height = `${visina + 2 * RUB}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, RUB * dpr, RUB * dpr);
    }

    function crtaj(sada: number) {
      okvir = 0;
      ctx!.clearRect(-RUB, -RUB, sirina + 2 * RUB, visina + 2 * RUB);
      let jos = false;

      for (let i = 0; i < n; i++) {
        const t = (sada - pocetak - kasnjenje[i]) / TRAJANJE_TOCKE;
        const pojava = t >= 1 ? 1 : t <= 0 ? 0 : 1 - (1 - t) ** 3;
        if (pojava < 1) jos = true;

        const x = px(i);
        const y = py(i);
        let cilj = 0;
        if (mis) {
          const d = Math.hypot(x - mis.x, y - mis.y);
          if (d < DOMET_MISA) cilj = 1 - d / DOMET_MISA;
        }
        if (i === najbliza) cilj = 1;
        const korak = smanjiPokrete ? 1 : 0.18;
        sjaj[i] += (cilj - sjaj[i]) * korak;
        if (Math.abs(cilj - sjaj[i]) > 0.01) jos = true;
        else sjaj[i] = cilj;

        const s = sjaj[i];
        if (pojava === 0) continue;
        const boja = BIJELA.map((b, k) => Math.round(b + (ZLATNA[k] - b) * s));
        const alfa = pojava * (0.42 + 0.58 * s);
        const r = (jeGrad[i] ? 2 : 1.4) * (1 + 0.9 * s) * (0.4 + 0.6 * pojava);
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${boja.join(",")},${alfa})`;
        ctx!.fill();
      }

      if (najbliza >= 0) {
        ctx!.beginPath();
        ctx!.arc(px(najbliza), py(najbliza), 7, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${ZLATNA.join(",")},0.9)`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      }

      if (jos) okvir = requestAnimationFrame(crtaj);
    }

    function zatrazi() {
      if (!okvir) okvir = requestAnimationFrame(crtaj);
    }

    function pomak(e: PointerEvent) {
      const r = omotac!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < -DOMET_MISA || y < -DOMET_MISA || x > sirina + DOMET_MISA || y > visina + DOMET_MISA) {
        if (mis) izlaz();
        return;
      }
      mis = { x, y };
      sjajMisa!.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      sjajMisa!.style.opacity = "1";

      let najbolja = -1;
      let min = DOMET_NATPISA;
      for (let i = 0; i < n; i++) {
        const d = Math.hypot(px(i) - x, py(i) - y);
        if (d < min) {
          min = d;
          najbolja = i;
        }
      }
      if (najbolja !== najbliza) {
        najbliza = najbolja;
        if (najbolja >= 0) {
          natpis!.textContent = JLS[najbolja][0];
          natpis!.style.transform = `translate(${px(najbolja)}px, ${py(najbolja)}px) translate(-50%, calc(-100% - 12px))`;
          natpis!.style.opacity = "1";
        } else {
          natpis!.style.opacity = "0";
        }
      }
      zatrazi();
    }

    function izlaz() {
      mis = null;
      najbliza = -1;
      natpis!.style.opacity = "0";
      sjajMisa!.style.opacity = "0";
      zatrazi();
    }

    velicina();
    zatrazi();
    const ro = new ResizeObserver(() => {
      velicina();
      zatrazi();
    });
    ro.observe(omotac);

    // Miš i olovka prate se cijelim prozorom (svjetlo ulazi u kartu glatko);
    // dodir reagira samo na tap po karti.
    const fini = window.matchMedia("(pointer: fine)").matches;
    if (fini) {
      window.addEventListener("pointermove", pomak, { passive: true });
      document.documentElement.addEventListener("pointerleave", izlaz);
    } else {
      canvas.addEventListener("pointerdown", pomak);
    }

    return () => {
      cancelAnimationFrame(okvir);
      ro.disconnect();
      window.removeEventListener("pointermove", pomak);
      document.documentElement.removeEventListener("pointerleave", izlaz);
      canvas.removeEventListener("pointerdown", pomak);
    };
    // pocetak se namjerno ne resetira pri promjeni smanjiPokrete - val se pušta samo jednom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const oznake = JLS.filter(([naziv]) => istaknuti.includes(naziv));

  return (
    <div ref={omotacRef} className="relative w-full" style={{ aspectRatio: `1 / ${KARTA_VISINA}` }}>
      {/* Sjaj oko kursora je HTML sloj, ne canvas - da se ne reže na rubu karte. */}
      <div
        ref={sjajRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--gold)_18%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300"
      />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Karta Hrvatske sa sjedištima svih 128 gradova i 428 općina"
        className="absolute block"
        style={{ left: -RUB, top: -RUB }}
      />

      {/* Mjesta održanih edukacija - pulsiraju nakon što se karta upali */}
      {oznake.map(([naziv, x, y]) => (
        <div
          key={naziv}
          aria-hidden="true"
          className="pointer-events-none absolute animate-in fade-in duration-700 [animation-delay:1400ms] [animation-fill-mode:both] motion-reduce:animate-none"
          style={{ left: `${x * 100}%`, top: `${(y / KARTA_VISINA) * 100}%` }}
        >
          <span className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-[var(--gold)]" />
          <span className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-[var(--gold)] animate-ping motion-reduce:animate-none" />
          <span className="absolute left-3 -top-2.5 whitespace-nowrap text-xs font-semibold text-[var(--gold)]">
            {naziv.replace(/^Grad /, "")}
          </span>
        </div>
      ))}

      <div
        ref={natpisRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[var(--navy)] shadow-lg opacity-0 transition-opacity duration-150"
      />
    </div>
  );
}
