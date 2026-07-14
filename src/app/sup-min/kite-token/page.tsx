import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import KiteTokenClient from "./KiteTokenClient";

// Server guard (audit MEDIUM M28): this admin page shipped as a bare client
// component with no server-side auth check. Gate it like the other /sup-min pages.
export default async function KiteTokenPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");
  return <KiteTokenClient />;
}
