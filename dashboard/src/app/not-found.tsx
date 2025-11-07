import Link from "next/link";

export default function NotFound() {
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
        <span style={{ fontSize: "6rem", fontWeight: 700, letterSpacing: "0.1em" }}>404</span>
        <p style={{ marginTop: "0.5rem", fontSize: "1.5rem", fontWeight: 600 }}>Page not found</p>
      </div>
      <p style={{ maxWidth: "420px", lineHeight: 1.6, color: "#cfd8dc" }}>
        The page you are looking for doesn&apos;t exist or has been moved. If you think this is a
        mistake, please contact support.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.75rem 1.75rem",
          borderRadius: "999px",
          background: "linear-gradient(135deg, #EE66AA 0%, #8a2be2 100%)",
          color: "#ffffff",
          fontWeight: 600,
          textDecoration: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        Go back home
      </Link>
    </div>
  );
}
