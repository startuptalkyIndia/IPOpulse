import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Admin routes — require admin or superadmin role
  if (pathname.startsWith("/sup-min/") && pathname !== "/sup-min") {
    const role = (req.auth?.user as { role?: string } | undefined)?.role;
    if (role !== "admin" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/sup-min", req.url));
    }
  }

  // User dashboard routes — require any authenticated user
  if (pathname.startsWith("/dashboard/") || pathname === "/dashboard") {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  // Alert API routes — require any authenticated user
  if (pathname.startsWith("/api/alerts")) {
    if (!req.auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // My pages — require any authenticated user
  if (pathname.startsWith("/my/")) {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/sup-min/:path+",
    "/dashboard/:path*",
    "/my/:path+",
    "/api/alerts/:path*",
    "/api/alerts",
  ],
};
