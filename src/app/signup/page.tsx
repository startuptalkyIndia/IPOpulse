"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Signup failed");
      setPending(false);
      return;
    }
    const sign = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (sign?.error) {
      setError("Sign-in after signup failed. Please try signing in.");
      return;
    }
    router.push("/my/watchlist");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Create your IPOpulse account</h1>
            <p className="text-xs text-gray-500">Save IPOs, track allotments, get alerts</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Name (optional)</label>
            <input id="name" type="text" className="input w-full" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input w-full" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password (min 8 chars)</label>
            <input id="password" type="password" className="input w-full" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
          {error ? <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div> : null}
          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-xs text-gray-500 text-center mt-4">
          Already have an account? <Link href="/signin" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
