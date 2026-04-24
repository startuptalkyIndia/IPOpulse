"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-sm text-gray-500">Loading…</div>}>
      <SigninForm />
    </Suspense>
  );
}

function SigninForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/my/watchlist";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sign in</h1>
            <p className="text-xs text-gray-500">Welcome back to IPOpulse</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input w-full" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input w-full" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error ? <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div> : null}
          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="text-xs text-gray-500 text-center mt-4">
          New to IPOpulse? <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-medium">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
