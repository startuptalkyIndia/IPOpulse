'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50">
          <span className="text-3xl font-bold text-rose-500">!</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">
          We hit an unexpected error loading this page. It&apos;s usually temporary — try refreshing.
        </p>
        {error.digest ? (
          <p className="mt-1 text-[11px] text-gray-400">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <Home className="w-3.5 h-3.5" /> Back to home
          </Link>
        </div>
        <a
          href="mailto:support@talkytools.com?subject=IPOpulse%20Error%20Report"
          className="mt-4 inline-block text-sm text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline"
        >
          Report this issue
        </a>
      </div>
    </div>
  );
}
