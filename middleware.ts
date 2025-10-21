import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Public pages accessible by everyone
const PUBLIC_ROUTES = ["/", "/login", "/unauthorized"];

// ✅ Dashboard and signup routes
const ADMIN_ROUTES = ["/dashboard/admin", "/signup"];
const PHARMACIST_ROUTES = ["/dashboard/pharmacist"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read cookies
  const jwt = req.cookies.get("jwt")?.value;
  const role = req.cookies.get("role")?.value?.trim().toLowerCase();

  console.log("JWT cookie:", jwt ? "present" : "missing");
  console.log("Role:", role, "Path:", pathname);

  // 1️⃣ Allow public pages
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // 2️⃣ If no JWT, redirect to unauthorized
  if (!jwt) return NextResponse.redirect(new URL("/unauthorized", req.url));

  // 3️⃣ Admin routes
  if (
    pathname.startsWith("/dashboard/admin") || 
    pathname === "/signup"
  ) {
    if (role === "admin") return NextResponse.next();
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 4️⃣ Pharmacist routes
  if (pathname.startsWith("/dashboard/pharmacist")) {
    if (role === "pharmacist" || role === "admin") return NextResponse.next();
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 5️⃣ Catch-all for unknown routes
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

// ✅ Apply middleware to all dashboard and signup routes
export const config = {
  matcher: ["/dashboard/:path*", "/signup"],
};
