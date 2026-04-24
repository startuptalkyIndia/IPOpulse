import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/sup-min/") && pathname !== "/sup-min" && !req.auth) {
    const url = new URL("/sup-min", req.nextUrl.origin);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/sup-min/:path*"],
};
