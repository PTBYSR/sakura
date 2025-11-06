"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import Link from "next/link";

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
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <Typography variant="h1" sx={{ fontSize: "8rem", fontWeight: "bold", mb: 2 }}>
          Error
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {error?.message || "An unexpected error occurred"}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={reset}
            sx={{ textTransform: "none" }}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href="/"
            sx={{ textTransform: "none" }}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

