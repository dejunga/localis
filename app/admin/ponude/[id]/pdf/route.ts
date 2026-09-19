import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { jeAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { ponude, prijave } from "@/lib/db/schema";
import { downloadPonudaPdf } from "@/lib/ponude/blob";
import { nazivDatotekePonude } from "@/lib/ponude/format";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const ponudaId = Number(id);
  if (!Number.isInteger(ponudaId)) return new NextResponse("Not found", { status: 404 });
  const [row] = await db
    .select({ pdfUrl: ponude.pdfUrl, broj: ponude.broj, organizacija: prijave.organizacija })
    .from(ponude)
    .innerJoin(prijave, eq(prijave.id, ponude.prijavaId))
    .where(eq(ponude.id, ponudaId));
  if (!row?.pdfUrl) return new NextResponse("Not found", { status: 404 });
  const pdf = await downloadPonudaPdf(row.pdfUrl);
  const filename = encodeURIComponent(nazivDatotekePonude(row.broj, row.organizacija));
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${filename}`,
    },
  });
}
