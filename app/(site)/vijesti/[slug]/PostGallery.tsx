"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PostImage } from "@/lib/posts";

const PRAG_POTEZA = 50; // px - koliko prstom treba povući za iduću/prethodnu sliku

// Mozaik: prva fotografija velika (2x2), ostale u mreži. Klik otvara pregled preko cijelog
// ekrana sa strelicama, tipkovnicom (← → Esc) i listanjem prstom.
export default function PostGallery({ images }: { images: PostImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const zatvoriRef = useRef<HTMLButtonElement>(null);
  const otvaracRef = useRef<HTMLElement | null>(null);
  const potezRef = useRef<number | null>(null);
  const povucenoRef = useRef(false);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  const otvoreno = active !== null;
  useEffect(() => {
    if (!otvoreno) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    zatvoriRef.current?.focus();
    const otvarac = otvaracRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // Fokus se vraća na sličicu s koje je pregled otvoren.
      otvarac?.focus();
    };
  }, [otvoreno, close, prev, next]);

  if (images.length === 0) return null;

  // Zadnja fotografija se raširi da popuni zadnji red mreže (desktop: 4 stupca, prva zauzima 2x2).
  const n = images.length;
  const ostatakMd = (n + 3) % 4;
  const zadnjaMd = ({ 1: "md:col-span-4", 2: "md:col-span-3", 3: "md:col-span-2" } as Record<number, string>)[ostatakMd] ?? "";
  const zadnjaMob = (n - 1) % 2 === 1 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]";
  const klasa = (i: number) =>
    i === 0
      ? "col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto"
      : i === n - 1
        ? `${zadnjaMob} md:aspect-auto ${zadnjaMd}`
        : "aspect-[4/3] md:aspect-auto";

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 md:auto-rows-[11rem] gap-2 sm:gap-3">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={(e) => {
              otvaracRef.current = e.currentTarget;
              setActive(i);
            }}
            className={`group relative overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 ${klasa(i)}`}
            aria-label={`Otvori fotografiju ${i + 1} od ${images.length}: ${img.alt}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes={i === 0 ? "(max-width: 768px) 100vw, 488px" : "(max-width: 768px) 50vw, 240px"}
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Fotografija ${active + 1} od ${images.length}`}
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200 motion-reduce:animate-none"
          onClick={() => {
            // Klik koji dolazi odmah nakon poteza prstom ne zatvara pregled.
            if (povucenoRef.current) povucenoRef.current = false;
            else close();
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") potezRef.current = e.clientX;
          }}
          onPointerUp={(e) => {
            const pocetak = potezRef.current;
            potezRef.current = null;
            if (pocetak === null) return;
            const pomak = e.clientX - pocetak;
            if (Math.abs(pomak) > PRAG_POTEZA) {
              povucenoRef.current = true;
              (pomak > 0 ? prev : next)();
            }
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white/80 text-sm">
            <span className="tabular-nums">
              {active + 1} / {images.length}
            </span>
            <button
              ref={zatvoriRef}
              type="button"
              onClick={close}
              className="p-2 -mr-2 text-white/80 hover:text-white transition-colors cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              aria-label="Zatvori"
            >
              <X size={28} />
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 md:left-6 z-10 hidden sm:flex size-12 items-center justify-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              aria-label="Prethodna fotografija"
            >
              <ChevronLeft size={28} />
            </button>

            <div className="relative w-[92vw] h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Image
                key={images[active].url}
                src={images[active].url}
                alt={images[active].alt}
                fill
                sizes="92vw"
                className="object-contain select-none animate-in fade-in duration-200 motion-reduce:animate-none"
                draggable={false}
                priority
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 md:right-6 z-10 hidden sm:flex size-12 items-center justify-center rounded-full bg-white/10 text-white/90 hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              aria-label="Sljedeća fotografija"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <p className="px-6 py-4 text-center text-white/80 text-sm text-pretty">
            {images[active].alt}
            <span className="sm:hidden block mt-1 text-white/50">Povucite prstom za iduću fotografiju</span>
          </p>
        </div>
      )}
    </>
  );
}
