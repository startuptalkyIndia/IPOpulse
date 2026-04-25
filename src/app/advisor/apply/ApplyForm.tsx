"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ApplyForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await fetch("/api/advisor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fd.get("fullName"),
          phone: fd.get("phone"),
          city: fd.get("city"),
          experience: fd.get("experience"),
          upiId: fd.get("upiId"),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Application failed. Please try again.");
        return;
      }
      router.push("/advisor/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label className="label" htmlFor="fullName">Full name *</label>
        <input id="fullName" name="fullName" required className="input w-full" placeholder="As on PAN" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="phone">Phone *</label>
          <input id="phone" name="phone" required type="tel" pattern="[0-9]{10}" className="input w-full" placeholder="10-digit mobile" />
        </div>
        <div>
          <label className="label" htmlFor="city">City *</label>
          <input id="city" name="city" required className="input w-full" placeholder="e.g., Mumbai" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="experience">Relevant experience (optional)</label>
        <textarea id="experience" name="experience" rows={3} className="input w-full" placeholder="Anything that helps us approve faster — distribution, finance background, prior commissions, audience size..." />
      </div>
      <div>
        <label className="label" htmlFor="upiId">UPI ID for payouts (optional, can be added later)</label>
        <input id="upiId" name="upiId" className="input w-full" placeholder="yourname@upi" />
      </div>

      {error ? <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div> : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Submitting..." : "Submit application"}
      </button>
      <p className="text-[11px] text-gray-400 text-center">
        By applying, you agree to our <a href="/terms" className="underline">terms</a>. No exclusivity, no commitment.
      </p>
    </form>
  );
}
