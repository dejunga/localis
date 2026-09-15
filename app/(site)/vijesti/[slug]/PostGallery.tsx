"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PostImage } from "@/lib/posts";

export default function PostGallery({ images }: { images: PostImage[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            aria-label={`Otvori sliku ${i + 1} od ${images.length}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 256px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[active].alt}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Zatvori"
          >
            <X size={28} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 md:left-6 z-10 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Prethodna slika"
          >
            <ChevronLeft size={36} />
          </button>

          <div
            className="relative w-[92vw] h-[82vh] max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active].url}
              alt={images[active].alt}
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 md:right-6 z-10 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Sljedeća slika"
          >
            <ChevronRight size={36} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
            {active + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
