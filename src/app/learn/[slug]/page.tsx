import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, CalendarDays } from "lucide-react";
import { articles, getArticle, getRelatedArticles } from "@/lib/learn-articles";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqAccordion } from "@/components/calculators/FaqAccordion";
import { RelatedPages } from "@/components/seo/RelatedPages";

interface Props {
  params: Promise<{ slug: string }>;
}

const BASE = "https://ipopulse.talkytools.com";

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} — IPOpulse Learn`,
    description: article.description,
    alternates: { canonical: `/learn/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `${BASE}/learn/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(slug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "IPOpulse",
      url: BASE,
    },
    publisher: {
      "@type": "Organization",
      name: "IPOpulse",
      url: BASE,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE}/learn/${article.slug}`,
    },
  };

  const faqJsonLd =
    article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumbs
          trail={[
            { label: "Home", href: "/" },
            { label: "Learn", href: "/learn" },
            { label: article.title },
          ]}
        />

        {/* Article header */}
        <header className="mt-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
            {article.title}
          </h1>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{article.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime} min read
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>
        </header>

        {/* Article content */}
        <article
          className="prose prose-sm max-w-none text-gray-700
            prose-h2:text-lg prose-h2:font-semibold prose-h2:text-gray-900 prose-h2:mt-8 prose-h2:mb-3
            prose-p:leading-relaxed prose-p:mb-4
            prose-ul:pl-5 prose-ul:mb-4
            prose-li:mb-1.5 prose-li:text-gray-700
            prose-strong:text-gray-900 prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Divider */}
        <hr className="my-10 border-gray-200" />

        {/* FAQ */}
        {article.faq.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <FaqAccordion faq={article.faq} />
          </section>
        )}

        {/* Related articles */}
        {related.length > 0 && (
          <RelatedPages
            title="Related Articles"
            items={related.map((a) => ({
              href: `/learn/${a.slug}`,
              title: a.title,
              desc: a.description,
            }))}
          />
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link href="/learn" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Back to Learning Hub
          </Link>
        </div>
      </div>
    </>
  );
}
