// Tailwind is now the styling system. Export a minimal theme placeholder to satisfy legacy imports.
export type Theme = {
  palette: {
    primary: { main: string };
    secondary: { main: string };
    error: { main: string };
  };
};

const theme: Theme = {
  palette: {
    primary: { main: "#556cd6" },
    secondary: { main: "#19857b" },
    error: { main: "#ff5252" },
  },
};

export default theme;
