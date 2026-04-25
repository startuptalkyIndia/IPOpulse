import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { affiliates } from "@/lib/affiliates";
import { financeProducts } from "@/lib/finance-products";

/**
 * Click tracker + redirector.
 *
 * Pattern: GET /r/{slug}?adv=CODE → records advisor click, sets cookie,
 * forwards to partner URL.
 *
 * Anyone (including logged-out users) can land here. We attribute the click
 * to the advisor whose code is in the URL, regardless of who's viewing.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const advCode = url.searchParams.get("adv") ?? "";

  // Find product URL (affiliate registry first, then finance products)
  const aff = affiliates[slug];
  const fin = financeProducts.find((p) => p.slug === slug);
  const targetUrl = aff?.url ?? fin?.ctaUrl;
  const category = aff?.category ?? fin?.category ?? null;

  if (!targetUrl) {
    return NextResponse.redirect(new URL("/", url.origin), 302);
  }

  // Track click against advisor (best-effort, never blocks redirect)
  if (advCode) {
    try {
      const advisor = await prisma.advisor.findUnique({ where: { refCode: advCode } });
      if (advisor && advisor.status === "approved") {
        await prisma.advisorClick.create({
          data: {
            advisorId: advisor.id,
            productSlug: slug,
            productCategory: category,
            ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
            userAgent: request.headers.get("user-agent") ?? null,
          },
        });
      }
    } catch {
      // Don't break the redirect on tracking errors
    }
  }

  const res = NextResponse.redirect(targetUrl, 302);
  if (advCode) {
    // 30-day attribution cookie
    res.cookies.set("ipopulse_adv", advCode, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
  }
  return res;
}
