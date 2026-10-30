import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { jeAdmin } from "@/lib/admin/session";
import { DOPUSTENI_TIPOVI, MAX_VELICINA } from "@/lib/upitnici/materijali";

// Token za upload materijala iz preglednika ravno u Blob (server action prima najviše 4,5 MB).
// Bez onUploadCompleted: Blob callback nema admin cookie, pa red u bazu upisuje akcija spremiMaterijal.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await jeAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { slug } = await params;
  const body = (await req.json()) as HandleUploadBody;
  try {
    const odgovor = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(`materijali/${slug}/`)) throw new Error("Neispravna putanja.");
        return { allowedContentTypes: DOPUSTENI_TIPOVI, maximumSizeInBytes: MAX_VELICINA, addRandomSuffix: true };
      },
    });
    return NextResponse.json(odgovor);
  } catch (error) {
    console.error(`Materijali ${slug}: token za upload nije izdan.`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
