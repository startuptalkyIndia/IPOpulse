export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { User as UserIcon, LogOut } from "lucide-react";

export default async function AccountPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/my/account");

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center gap-2">
        <UserIcon className="w-5 h-5 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
      </div>

      <div className="card">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="text-gray-900 font-medium">{user?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900 font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Member since</dt>
            <dd className="text-gray-900 font-medium">
              {user?.createdAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(user.createdAt) : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className="btn-secondary inline-flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </form>
    </div>
  );
}
