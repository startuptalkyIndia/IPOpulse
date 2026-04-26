import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Code, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Embed IPOpulse on your blog or website — free GMP widget",
  description:
    "Embed live IPO GMP, subscription status, and allotment data on your blog or website. One iframe tag, free, no API key needed.",
  alternates: { canonical: "/embed" },
};

const snippet = `<iframe
  src="https://ipopulse.talkytools.com/embed/gmp"
  width="560"
  height="380"
  frameborder="0"
  scrolling="no"
  style="border:1px solid #e5e7eb;border-radius:8px;max-width:100%"
  title="Live IPO GMP — IPOpulse"
></iframe>`;

export default function EmbedPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Embed IPOpulse on your site</h1>
        </div>
        <p className="text-sm text-gray-600 max-w-3xl">
          Free, lightweight iframe widgets for finfluencers, finance bloggers, and broker review sites. Live GMP +
          IPO data, refreshed every page load. No API key, no signup.
        </p>
      </div>

      {/* Live preview */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-2">Live preview</h2>
        <div className="card p-0 overflow-hidden bg-gray-50 flex justify-center py-6">
          <iframe
            src="/embed/gmp"
            width="560"
            height="380"
            frameBorder="0"
            scrolling="no"
            title="Live IPO GMP"
            style={{ border: "1px solid #e5e7eb", borderRadius: 8, maxWidth: "100%" }}
          />
        </div>
      </section>

      {/* Snippet */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Code className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-gray-900">Copy + paste this HTML</h2>
        </div>
        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs font-mono whitespace-pre">
          {snippet}
        </pre>
        <p className="text-xs text-gray-500 mt-2">
          Works in WordPress (HTML block), Ghost, Notion-style sites, plain HTML, Substack — anywhere &lt;iframe&gt; is allowed.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-2">FAQ</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-900">Is it really free?</h3>
            <p className="text-gray-600 mt-1">Yes — free forever. We track usage anonymously to size capacity, and clicks from the widget go to IPOpulse with a `utm_source=embed` tag for our own analytics. We never collect your visitors&apos; data.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">How fresh is the data?</h3>
            <p className="text-gray-600 mt-1">GMP updates whenever our editor logs a new entry (typically 2-3 times daily during live IPOs). Subscription status updates 4× during an IPO window. The widget reads the latest each time someone loads your page.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Can I customize it?</h3>
            <p className="text-gray-600 mt-1">For now, the design is fixed (clean, branded, fast). If you want a custom widget — different theme, different filter — drop us a line at <Link className="underline" href="/contact">Contact</Link>.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Are backlinks allowed?</h3>
            <p className="text-gray-600 mt-1">Welcomed. Each row links to the IPO page on IPOpulse, with a small &quot;Powered by IPOpulse&quot; footer. Removing the footer is fine for non-commercial use; please keep it for monetized sites.</p>
          </div>
        </div>
      </section>

      <div className="card bg-indigo-50 border-indigo-100">
        <p className="text-sm text-indigo-900 leading-relaxed">
          <strong>Are you a finfluencer or finance blogger?</strong> Email{" "}
          <a className="underline" href="mailto:hello@ipopulse.talkytools.com">hello@ipopulse.talkytools.com</a> and
          we&apos;ll consider building you a custom-themed widget or featuring you in our content roundup.
        </p>
      </div>
    </div>
  );
}
