import { Plus_Jakarta_Sans } from "next/font/google";

export const plus = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const baseDarkTheme = {
  fontFamily: plus.style.fontFamily,
  colors: {
    primary: "#f6f6f7",
    secondary: "#EE66AA",
    background: "#202024",
    text: "#ffffff",
    success: { main: "#13DEB9" },
    info: { main: "#539BFF" },
    error: { main: "#FA896B" },
    warning: { main: "#FFAE1F" },
    grey: {
      100: "#F2F6FA",
      200: "#EAEFF4",
      300: "#DFE5EF",
      400: "#7C8FAC",
      500: "#5A6A85",
      600: "#2A3547",
    },
  },
} as const;
