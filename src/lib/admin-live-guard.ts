import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Admin gate that re-reads the role from the LIVE admin_users row on every call.
 * The JWT role alone is not enough: a demoted or removed admin keeps a valid
 * token for its whole lifetime (LEARNINGS: "An admin gate must re-read the LIVE user row").
 * The token's role is only a cheap pre-filter; the database decides.
 */
export async function isLiveAdmin(): Promise<boolean> {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return false;
  if (user.role !== "admin" && user.role !== "superadmin") return false;
  const row = await prisma.adminUser.findUnique({ where: { id: user.id }, select: { role: true } });
  return row?.role === "admin" || row?.role === "superadmin";
}
