import { NextResponse } from "next/server";
import { getMaterijal, presignedPreuzimanje, provjeriKljucMaterijala } from "@/lib/upitnici/materijali";

// Preuzimanje materijala: provjeri ključ iz maila, zatim preusmjeri na kratkotrajni Blob URL.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const kljuc = new URL(req.url).searchParams.get("k");
  const broj = Number(id);
  if (!Number.isInteger(broj) || broj <= 0 || !(await provjeriKljucMaterijala(slug, kljuc))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const materijal = await getMaterijal(broj, slug);
  if (!materijal) return new NextResponse("Not found", { status: 404 });

  const url = await presignedPreuzimanje(materijal.pathname);
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store" } });
}
