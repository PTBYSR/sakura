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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
        backgroundColor: "#121212",
        color: "#ffffff",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div>
        <span style={{ fontSize: "6rem", fontWeight: 700, letterSpacing: "0.1em" }}>Error</span>
        <p style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</p>
      </div>
      <p style={{ maxWidth: "420px", lineHeight: 1.6, color: "#cfd8dc" }}>
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem 1.75rem",
            borderRadius: "999px",
            background: "linear-gradient(135deg, #EE66AA 0%, #8a2be2 100%)",
            color: "#ffffff",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.75rem 1.75rem",
            borderRadius: "999px",
            border: "1px solid rgba(238, 102, 170, 0.6)",
            color: "#EE66AA",
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
