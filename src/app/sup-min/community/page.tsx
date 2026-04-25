export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Ban } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ModerationActions } from "./ModerationActions";

export default async function CommunityModerationPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  const recent = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, email: true, name: true, banned: true } } },
  });

  const totalUsers = await prisma.user.count();
  const totalComments = await prisma.comment.count();
  const totalPolls = await prisma.ipoPoll.count();
  const bannedUsers = await prisma.user.count({ where: { banned: true } });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/sup-min/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Community moderation</h1>
      <p className="text-sm text-gray-500 mb-6">Review recent comments. Delete spam or ban abusive users.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Users" value={totalUsers} />
        <Stat label="Comments" value={totalComments} />
        <Stat label="Poll votes" value={totalPolls} />
        <Stat label="Banned users" value={bannedUsers} tone="danger" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-3 py-3">When</th>
              <th className="px-3 py-3">Author</th>
              <th className="px-3 py-3">Where</th>
              <th className="px-3 py-3">Comment</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 text-xs text-gray-500">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(c.createdAt)}
                </td>
                <td className="px-3 py-3 text-xs">
                  <div className="font-medium text-gray-900">{c.user.name ?? c.user.email.split("@")[0]}</div>
                  <div className="text-gray-400">{c.user.email}</div>
                  {c.user.banned ? <span className="badge badge-error">banned</span> : null}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {c.targetType}/{c.targetSlug}
                </td>
                <td className="px-3 py-3 text-xs text-gray-700 max-w-md">
                  <div className="line-clamp-3">{c.body}</div>
                </td>
                <td className="px-3 py-3 text-right">
                  <ModerationActions commentId={c.id} userId={c.userId} userBanned={c.user.banned} />
                </td>
              </tr>
            ))}
            {recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center text-sm text-gray-500">
                  No comments yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "danger" }) {
  return (
    <div className="card">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-bold tabular-nums mt-0.5 ${tone === "danger" ? "text-red-600" : "text-indigo-700"}`}>{value}</div>
    </div>
  );
}
