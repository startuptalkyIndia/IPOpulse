import type { Metadata } from "next";

// Private super-admin console (login + all admin children) — never index.
// Without this segment layout, /sup-min and its children inherited the root
// layout's index,follow and were crawlable (child-route-escape bug, LESSON-114).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SupMinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
