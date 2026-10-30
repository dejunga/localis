import { NextResponse } from "next/server";
import { jednakoKonstantno } from "@/lib/admin/token";
import { posaljiUpitnike } from "@/lib/upitnici/slanje";

// Mailovi idu jedan po jedan; posaljiUpitnike prestaje uzimati nove prije ovog limita.
export const maxDuration = 300;

// Vercel cron (vercel.json) šalje "Authorization: Bearer $CRON_SECRET". Bez tajne ruta ne radi ništa.
export async function GET(req: Request) {
  const tajna = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!tajna || !jednakoKonstantno(auth, `Bearer ${tajna}`)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // Šalje samo edukacijama kojima je Marija u adminu zadala datum slanja.
  const rezultat = await posaljiUpitnike();
  console.log(`Upitnici cron: poslano ${rezultat.poslano}, greške ${rezultat.greske}.`);
  return NextResponse.json(rezultat);
}
