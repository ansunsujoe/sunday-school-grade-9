import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

// Optimistic check only: pages and server actions still verify the user
// against the database through lib/dal.ts.
export default async function proxy(req: NextRequest) {
  const isLogin = req.nextUrl.pathname === "/login";
  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  // Images in public/ (like the clan logos) are fetched without a login cookie.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
