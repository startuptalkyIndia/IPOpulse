export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { affiliates } from "@/lib/affiliates";
import { financeProducts } from "@/lib/finance-products";
import { ProductLinkCard } from "./ProductLinkCard";

export default async function AdvisorProductsPage() {
  if (!(await isFeatureEnabled("advisor.enabled"))) notFound();
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/advisor/products");

  const advisor = await prisma.advisor.findUnique({ where: { userId } });
  if (!advisor) redirect("/advisor/apply");
  if (advisor.status !== "approved") redirect("/advisor/dashboard");

  const refCode = advisor.refCode;

  const tabs = [
    { href: "/advisor/dashboard", label: "Dashboard" },
    { href: "/advisor/products", label: "My links", active: true },
    { href: "/advisor/wallet", label: "Wallet" },
  ];

  // Combine top affiliates + finance products
  const items = [
    ...Object.values(affiliates).map((a) => ({
      slug: a.slug,
      name: a.name,
      category: a.category,
      payoutInr: a.payoutInr,
      url: a.url,
    })),
    ...financeProducts.map((p) => ({
      slug: p.slug,
      name: `${p.brand} — ${p.productName}`,
      category: p.category,
      payoutInr: p.payoutInr,
      url: p.ctaUrl,
    })),
  ].sort((a, b) => b.payoutInr - a.payoutInr);

  const grouped = items.reduce<Record<string, typeof items>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-1 md:gap-4 overflow-x-auto pt-5 pb-0 border-b border-gray-200">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`text-sm px-3 py-2.5 ${t.active ? "text-indigo-600 border-b-2 border-indigo-600 -mb-px font-semibold" : "text-gray-600 hover:text-indigo-600"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Your product links</h1>
          <p className="text-sm text-gray-500">
            Each link below already includes your code <code className="bg-indigo-50 text-indigo-700 px-1 rounded">{refCode}</code> — copy and share.
          </p>
        </div>

        {Object.entries(grouped).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">{cat.replace("-", " ")}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {list.map((p) => (
                <ProductLinkCard
                  key={p.slug}
                  slug={p.slug}
                  name={p.name}
                  payoutInr={p.payoutInr}
                  advisorShareInr={Math.round(p.payoutInr * (Number(advisor.commissionPercent) / 100))}
                  refCode={refCode}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
