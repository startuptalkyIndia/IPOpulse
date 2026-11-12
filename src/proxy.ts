// NOTE (audit IP-12): this is the SINGLE middleware reference. Next 16 loads
// `proxy.ts` as the request middleware (live check 2026-11-12: /my/watchlist ->
// 302 /signin, /sup-min/users -> 302 /sup-min). It is named proxy.ts (not
// middleware.ts) because a root middleware.ts crashes the Next 16 standalone build
// (see Dockerfile). Per-route server guards (auth() + role check) stay as the
// second layer. A divergent duplicate at repo root was deleted.
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
