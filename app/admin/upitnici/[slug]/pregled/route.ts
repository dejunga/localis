import { NextResponse } from "next/server";
import { jeAdmin } from "@/lib/admin/session";
import { getSeminar } from "@/lib/edukacije";
import { QR_CID } from "@/lib/upitnici/mail-nakon";
import { danasZagreb, getSlanje, pripremiMail } from "@/lib/upitnici/slanje";

// Pregled maila nakon edukacije u adminu (iframe) - isti renderer kao slanje, QR inline umjesto cid:.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { slug } = await params;
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar) return new NextResponse("Not found", { status: 404 });

  // Bez zadanog termina pregled pokazuje rok kao da mail ide danas (kao "Pošalji sada").
  const m = await pripremiMail(seminar, (await getSlanje(slug)) ?? danasZagreb(new Date()));
  const html = m.html.replace(`cid:${QR_CID}`, `data:image/png;base64,${m.qrPng.toString("base64")}`);
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
