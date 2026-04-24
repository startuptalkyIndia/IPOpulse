import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  // Admin area — must be signed in as admin
  if (pathname.startsWith("/sup-min/") && pathname !== "/sup-min") {
    if (!req.auth || (role !== "admin" && role !== "superadmin")) {
      const url = new URL("/sup-min", req.nextUrl.origin);
      return Response.redirect(url);
    }
  }

  // User area — must be signed in (any role)
  if (pathname.startsWith("/my/")) {
    if (!req.auth) {
      const url = new URL(`/signin?next=${encodeURIComponent(pathname)}`, req.nextUrl.origin);
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: ["/sup-min/:path*", "/my/:path*"],
};
