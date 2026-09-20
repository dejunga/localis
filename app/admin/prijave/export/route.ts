import { NextResponse } from "next/server";
import { jeAdmin } from "@/lib/admin/session";
import { getSeminar } from "@/lib/edukacije";
import {
  generirajExcel,
  nazivDatoteke,
  redoviZaExport,
  type SeminarZaExport,
} from "@/lib/prijave/export-excel";
import { ucitajPrijave } from "@/lib/prijave/ucitaj";

// Excel za računovodstvo: jedna edukacija, samo prijave s poslanom ponudom.
export async function GET(req: Request) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const slug = new URL(req.url).searchParams.get("edukacija");
  if (!slug) return new NextResponse("Nedostaje edukacija", { status: 400 });
  const seminar = await getSeminar(slug);
  if (!seminar) return new NextResponse("Not found", { status: 404 });
  if (!seminar.ponuda) return new NextResponse("Edukacija nema definiranu ponudu", { status: 400 });

  const prijave = await ucitajPrijave({ seminarSlug: slug, status: "ponuda_poslana" });
  const buffer = await generirajExcel(seminar as SeminarZaExport, redoviZaExport(prijave));
  const filename = encodeURIComponent(nazivDatoteke(seminar as SeminarZaExport));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
