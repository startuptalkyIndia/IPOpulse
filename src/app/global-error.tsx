"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
          <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "5rem",
              height: "5rem",
              borderRadius: "1rem",
              backgroundColor: "#fee2e2",
              marginBottom: "1.5rem",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
              IPOpulse hit a snag
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
              Something unexpected happened. Our team has been notified.
              {error.digest && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  fontWeight: 500,
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Try again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error renders outside the Next.js App Router; Link is unavailable here */}
              <a
                href="/"
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "white",
                  color: "#374151",
                  fontWeight: 500,
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
