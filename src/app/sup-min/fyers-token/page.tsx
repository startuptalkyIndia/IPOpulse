import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import FyersTokenClient from "./FyersTokenClient";

// Server guard (audit MEDIUM M28): this admin page shipped as a bare client
// component with no server-side auth check. Gate it like the other /sup-min pages.
export default async function FyersTokenPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");
  return <FyersTokenClient />;
}
