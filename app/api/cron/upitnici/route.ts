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
  // Pauzirano dok ne stigne novi mail nakon edukacije (materijali, nadolazeće edukacije, termin slanja).
  if (process.env.UPITNICI_SLANJE !== "da") {
    console.log("Upitnici cron: slanje pauzirano.");
    return NextResponse.json({ poslano: 0, greske: 0, pauzirano: true });
  }
  const rezultat = await posaljiUpitnike();
  console.log(`Upitnici cron: poslano ${rezultat.poslano}, greške ${rezultat.greske}.`);
  return NextResponse.json(rezultat);
}
