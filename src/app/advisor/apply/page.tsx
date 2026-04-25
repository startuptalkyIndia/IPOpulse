export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { ApplyForm } from "./ApplyForm";

export default async function AdvisorApplyPage() {
  if (!(await isFeatureEnabled("advisor.enabled"))) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/signin?next=/advisor/apply");

  const existing = await prisma.advisor.findUnique({ where: { userId } });
  if (existing && existing.status !== "rejected") {
    redirect("/advisor/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/become-an-advisor" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> About the advisor program
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Briefcase className="w-6 h-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Apply to become an IPOpulse Advisor</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Tell us a bit about yourself. We approve applications within 24-48 hours.
      </p>

      <ApplyForm />
    </div>
  );
}
