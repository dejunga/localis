// Bez baze i Bloba - koristi ga i klijentska komponenta za upload u adminu.

export const MAX_VELICINA = 100 * 1024 * 1024;

export const DOPUSTENI_TIPOVI = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
];

// Za `accept` na input polju - preglednik ne zna uvijek MIME za Office datoteke.
export const DOPUSTENI_NASTAVCI = ".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png";

// Ime za Blob pathname: bez dijakritika, razmaka i znakova koji lome URL. Prikazni naziv ostaje izvoran.
export function sigurnoImeDatoteke(naziv: string): string {
  const ime = naziv
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Za-z0-9._]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ime || "datoteka";
}

export function formatVelicine(bajtovi: number): string {
  const mb = bajtovi / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bajtovi / 1024 / 10) * 10 || 1)} KB`;
}
