"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "localis-cookie-notice";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function isDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {}
  listeners.forEach((listener) => listener());
}

// Obavijest o kolačićima (ZEK / GDPR). Stranica ne postavlja kolačiće, a Vercel
// Analytics radi bez njih, pa nije potrebna privola – dovoljna je diskretna obavijest.
export default function CookieNotice() {
  // Na serveru vraćamo true da se obavijest ne renderira prije hidracije.
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true);

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Obavijest o kolačićima"
      className="fixed bottom-3 left-3 right-3 sm:right-auto z-50 max-w-sm flex items-center gap-3 rounded-md bg-[var(--navy)]/95 px-3 py-2 text-[11px] leading-snug text-gray-300 shadow-lg backdrop-blur-sm"
    >
      <p>
        Ova stranica ne koristi kolačiće za praćenje. Anonimnu statistiku posjeta
        vodimo bez kolačića.{" "}
        <Link
          href="/politika-privatnosti"
          className="text-white underline underline-offset-2 hover:text-[var(--gold-light)]"
        >
          Više
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-sm bg-[var(--gold)] px-2.5 py-1 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--gold-light)]"
      >
        U redu
      </button>
    </div>
  );
}
