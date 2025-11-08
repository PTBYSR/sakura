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
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-[#121212] text-white text-center">
      <div>
        <span className="text-[6rem] font-bold tracking-wider">Error</span>
        <p className="mt-2 text-2xl font-semibold">Something went wrong</p>
      </div>
      <p className="max-w-md leading-relaxed text-gray-300">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-gradient-to-r from-sakura-500 to-sakura-600 text-white font-semibold border-none cursor-pointer transition-all duration-200 hover:from-sakura-600 hover:to-sakura-700 hover:scale-105 hover:shadow-lg hover:shadow-sakura-500/50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 focus:ring-offset-dark-bg"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full border-2 border-sakura-500/80 text-sakura-500 font-semibold no-underline transition-all duration-200 hover:bg-sakura-500/10 hover:border-sakura-600 hover:scale-105 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-sakura-500 focus:ring-offset-2 focus:ring-offset-dark-bg"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

