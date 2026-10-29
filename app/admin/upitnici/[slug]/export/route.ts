import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { jeAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { upitniciOdgovori } from "@/lib/db/schema";
import { getSeminar } from "@/lib/edukacije";
import { generirajExcelUpitnika, nazivDatotekeUpitnika } from "@/lib/upitnici/export-excel";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { slug } = await params;
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar) return new NextResponse("Not found", { status: 404 });

  const odgovori = await db
    .select()
    .from(upitniciOdgovori)
    .where(eq(upitniciOdgovori.seminarSlug, slug))
    .orderBy(desc(upitniciOdgovori.createdAt));
  const buffer = await generirajExcelUpitnika(seminar, odgovori);
  const filename = encodeURIComponent(nazivDatotekeUpitnika(seminar));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
