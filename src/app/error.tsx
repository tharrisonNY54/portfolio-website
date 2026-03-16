"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)]">
      <div className="glass rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          {error.message}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-medium hover:bg-white/5 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
