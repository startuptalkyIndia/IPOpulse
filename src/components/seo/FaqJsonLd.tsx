/**
 * Render a FAQPage JSON-LD block. Google parses this for rich snippets in
 * search results — questions appear as expandable accordion under your link.
 */
interface QA {
  q: string;
  a: string;
}

export function FaqJsonLd({ items }: { items: QA[] }) {
  if (!items || items.length === 0) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />;
}
