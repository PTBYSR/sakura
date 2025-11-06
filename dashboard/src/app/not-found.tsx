import Link from "next/link";

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
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "8rem", fontWeight: "bold", margin: "0 0 1rem 0", color: "#333" }}>
        404
      </h1>
      <h2 style={{ fontSize: "2rem", margin: "0 0 1rem 0", color: "#333" }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: "1rem", margin: "0 0 2rem 0", color: "#666" }}>
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#1976d2",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: "500",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}

