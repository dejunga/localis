"use client";

import { useOptimistic, useTransition } from "react";
import { oznaciPlaceno } from "./[id]/actions";

// Kvačica se mijenja odmah; ako spremanje ne uspije, vraća se na stanje iz baze.
export default function PlacenoKvacica({
  prijavaId,
  placeno,
  oznaka,
}: {
  prijavaId: number;
  placeno: boolean;
  oznaka?: string;
}) {
  const [pending, start] = useTransition();
  const [prikaz, setPrikaz] = useOptimistic(placeno);

  return (
    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={prikaz}
        disabled={pending}
        aria-label={oznaka ? undefined : "Plaćeno"}
        onChange={(e) => {
          const novo = e.target.checked;
          start(async () => {
            setPrikaz(novo);
            await oznaciPlaceno(prijavaId, novo);
          });
        }}
        className="h-4 w-4 accent-[var(--navy)] disabled:opacity-60"
      />
      {oznaka}
    </label>
  );
}
