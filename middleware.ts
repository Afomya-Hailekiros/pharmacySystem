import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/unauthorized"];
const ADMIN_ROUTES = ["/dashboard/admin", "/signup"];
const PHARMACIST_ROUTES = ["/dashboard/pharmacist"];

export function middleware(req: any) {
  const token = req.cookies.get("jwt")?.value; // ✅ match backend cookie name
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  // ✅ allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  // ❌ block dashboard/signup if no token
  if (!token && (pathname.startsWith("/dashboard") || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ✅ pharmacist access (pharmacist or admin)
  if (pathname.startsWith("/dashboard/pharmacist")) {
    if (role !== "pharmacist" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // ✅ admin access (admin only)
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
