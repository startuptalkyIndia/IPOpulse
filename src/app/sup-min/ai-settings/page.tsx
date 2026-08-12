import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AiSettingsClient from "./AiSettingsClient";

// Server guard (matches kite-token / fyers-token pattern): this page flips
// which AI billing path the whole product uses, so session alone isn't enough.
export default async function AiSettingsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");
  return <AiSettingsClient />;
}
