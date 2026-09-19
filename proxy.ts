import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, provjeriToken } from "@/lib/admin/token";

// Optimistična provjera sesije za /admin/* - stvarna zaštita je u zahtijevajAdmina()
// u svakoj server komponenti/akciji.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const ok = await provjeriToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
