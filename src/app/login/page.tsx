import { redirect } from "next/navigation";

// /login is an alias for /signin — canonical page is /signin
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; next?: string }>;
}) {
  return searchParams.then(({ redirect: r, next }) => {
    const dest = r ?? next;
    redirect(dest ? `/signin?next=${encodeURIComponent(dest)}` : "/signin");
  });
}
