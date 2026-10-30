import { createHmac } from "node:crypto";
import { del, issueSignedToken, presignUrl } from "@vercel/blob";
import { and, asc, eq } from "drizzle-orm";
import { jednakoKonstantno } from "@/lib/admin/token";
import { db } from "@/lib/db";
import { upitniciMaterijali, type UpitnikMaterijal } from "@/lib/db/schema";
import { SITE_URL } from "./mail-nakon";

// Materijali s edukacije: privatni Blob + javna stranica /materijali/<slug>?k=<ključ>.
// Ključ se ne sprema - izvodi se iz sluga i tajne, pa ga zna samo onaj tko je dobio mail.

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

const TRAJANJE_PREUZIMANJA_MS = 10 * 60 * 1000;

function tajna(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET nije postavljen ili je prekratak.");
  return s;
}

export async function kljucMaterijala(slug: string): Promise<string> {
  return createHmac("sha256", tajna()).update(`materijali:${slug}`).digest("base64url").slice(0, 22);
}

export async function provjeriKljucMaterijala(slug: string, kljuc: string | null): Promise<boolean> {
  if (!kljuc) return false;
  return jednakoKonstantno(await kljucMaterijala(slug), kljuc);
}

export async function materijaliUrl(slug: string): Promise<string> {
  return `${SITE_URL}/materijali/${slug}?k=${await kljucMaterijala(slug)}`;
}

// Ime za Blob pathname: bez dijakritika, razmaka i znakova koji lome URL. Prikazni naziv ostaje izvoran.
export function sigurnoImeDatoteke(naziv: string): string {
  const ime = naziv
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"))
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ime || "datoteka";
}

export function formatVelicine(bajtovi: number): string {
  const mb = bajtovi / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bajtovi / 1024 / 10) * 10 || 1)} KB`;
}

export async function getMaterijali(slug: string): Promise<UpitnikMaterijal[]> {
  return db
    .select()
    .from(upitniciMaterijali)
    .where(eq(upitniciMaterijali.seminarSlug, slug))
    .orderBy(asc(upitniciMaterijali.createdAt));
}

export async function getMaterijal(id: number, slug: string): Promise<UpitnikMaterijal | null> {
  const [m] = await db
    .select()
    .from(upitniciMaterijali)
    .where(and(eq(upitniciMaterijali.id, id), eq(upitniciMaterijali.seminarSlug, slug)));
  return m ?? null;
}

// Kratkotrajni URL ravno na Blob - funkcija ne prenosi bajtove, pa veličina datoteke nije ograničena.
export async function presignedPreuzimanje(pathname: string): Promise<string> {
  const validUntil = Date.now() + TRAJANJE_PREUZIMANJA_MS;
  const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
  const { presignedUrl } = await presignUrl(token, { operation: "get", pathname, access: "private", validUntil });
  return presignedUrl;
}

export async function obrisiMaterijal(id: number, slug: string): Promise<void> {
  const m = await getMaterijal(id, slug);
  if (!m) return;
  await del(m.blobUrl);
  await db.delete(upitniciMaterijali).where(eq(upitniciMaterijali.id, id));
}
