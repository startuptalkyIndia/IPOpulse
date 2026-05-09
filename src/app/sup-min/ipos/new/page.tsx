import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { IpoEntryForm } from "./IpoEntryForm";

export const metadata = {
  title: "Add New IPO — Admin",
};

export default async function NewIpoPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "admin" && role !== "superadmin") redirect("/sup-min");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/sup-min/ipos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> IPO Manager
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Add New IPO</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manually create an IPO record. A URL slug is auto-generated from the name.
        Re-submitting the same name updates the existing record.
      </p>

      <IpoEntryForm />
    </div>
  );
}
