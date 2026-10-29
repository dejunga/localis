import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { jeAdmin } from "@/lib/admin/session";
import { getSeminar } from "@/lib/edukacije";
import { upitnikUrl } from "@/lib/upitnici/slanje";

// QR za slajd i kartice s imenima - jedan po edukaciji, isti za sve polaznike.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { slug } = await params;
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar) return new NextResponse("Not found", { status: 404 });

  const png = await QRCode.toBuffer(upitnikUrl(seminar.slug), {
    width: 1200,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="upitnik-${seminar.slug}.png"`,
    },
  });
}
