import './global.css'

// Root layout - no MUI providers needed since we're using Tailwind
// MUI components will use MUIProviders wrapper when needed
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
