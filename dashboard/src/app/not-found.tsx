import Link from "next/link";

// Force dynamic rendering - skip static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NotFound() {
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
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
        404
      </h1>
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "600",
          margin: "0 0 1rem 0",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "1rem",
          color: "#B0BEC5",
          margin: "0 0 2rem 0",
          maxWidth: "500px",
        }}
      >
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "10px 24px",
          backgroundColor: "#EE66AA",
          color: "#ffffff",
          textDecoration: "none",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "0.875rem",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}

