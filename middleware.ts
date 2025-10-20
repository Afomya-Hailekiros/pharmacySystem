import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/unauthorized"];
const ADMIN_ROUTES = ["/dashboard/admin", "/signup"];
const PHARMACIST_ROUTES = ["/dashboard/pharmacist"];

export function middleware(req: NextRequest) {
  const jwt = req.cookies.get("jwt")?.value; // ✅ match backend cookie name
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  console.log("JWT cookie:", jwt ? "present" : "missing");
  console.log("Role:", role, "Path:", pathname);

  // ✅ Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // ❌ No JWT cookie = redirect to unauthorized
  if (!jwt && (pathname.startsWith("/dashboard") || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ Pharmacist dashboard (pharmacist or admin)
  if (pathname.startsWith("/dashboard/pharmacist")) {
    if (role !== "pharmacist" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // ✅ Admin dashboard (admin only)
  if (pathname.startsWith("/dashboard/admin") || pathname === "/signup") {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signup"],
};
