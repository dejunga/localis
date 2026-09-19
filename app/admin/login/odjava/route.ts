import { NextResponse } from "next/server";
import { obrisiSesiju } from "@/lib/admin/session";

export async function POST(request: Request) {
  await obrisiSesiju();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
