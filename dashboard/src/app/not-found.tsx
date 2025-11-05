"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import Link from "next/link";

export default function NotFound() {
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
          404
        </Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          href="/"
          sx={{ textTransform: "none" }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
}

