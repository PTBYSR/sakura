"use client";

import Link from "next/link";
import { useEffect } from "react";

// Force dynamic rendering - skip static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        backgroundColor: "#202024",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "8rem",
          fontWeight: "bold",
          margin: "0 0 1rem 0",
          lineHeight: "1",
        }}
      >
        Error
      </h1>
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          margin: "0 0 1rem 0",
        }}
      >
        Something went wrong
      </h2>
      <p
        style={{
          fontSize: "1rem",
          color: "#B0BEC5",
          margin: "0 0 2rem 0",
          maxWidth: "500px",
        }}
      >
        {error?.message || "An unexpected error occurred"}
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px",
            backgroundColor: "#EE66AA",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d1488a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#EE66AA";
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            backgroundColor: "transparent",
            color: "#EE66AA",
            textDecoration: "none",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "0.875rem",
            border: "1px solid #EE66AA",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(238,102,170,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

