import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { calculators, getCalcBySlug } from "@/lib/calculators/configs";
import { CalculatorShell } from "@/components/calculators/CalculatorShell";
import { FaqAccordion } from "@/components/calculators/FaqAccordion";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalcBySlug(slug);
  if (!c) return { title: "Calculator not found" };
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/calculators/${c.slug}` },
    openGraph: { title: c.title, description: c.description, type: "website" },
  };
}

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const config = getCalcBySlug(slug);
  if (!config) notFound();

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: config.title,
    description: config.description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: config.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  };

  const related = config.related
    .map((s) => getCalcBySlug(s))
    .filter(Boolean) as typeof calculators;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/calculators"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> All calculators
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{config.heading}</h1>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl">{config.description}</p>

      <CalculatorShell config={config} />

      {/* Overview SEO copy */}
      <section className="mt-10 card max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          About the {config.shortTitle} Calculator
        </h2>
        {config.overview.map((p, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
            {p}
          </p>
        ))}
      </section>

      {/* FAQ */}
      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {config.shortTitle} — Frequently asked questions
        </h2>
        <FaqAccordion faq={config.faq} />
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Related calculators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/calculators/${r.slug}`}
                className="card hover:border-indigo-300 text-sm"
              >
                <div className="font-semibold text-gray-900">{r.title}</div>
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
