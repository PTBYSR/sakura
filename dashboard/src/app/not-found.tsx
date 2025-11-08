// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found</title>
        <style dangerouslySetInnerHTML={{__html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            min-height: 100vh; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            gap: 1.5rem; 
            padding: 2rem; 
            background-color: #121212; 
            color: #ffffff; 
            text-align: center; 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          .error-code { font-size: 6rem; font-weight: 700; letter-spacing: 0.1em; }
          .error-title { margin-top: 0.5rem; font-size: 1.5rem; font-weight: 600; }
          .error-message { max-width: 420px; line-height: 1.6; color: #cfd8dc; }
          .home-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.75rem 1.75rem;
            border-radius: 999px;
            background: linear-gradient(135deg, #EE66AA 0%, #8a2be2 100%);
            color: #ffffff;
            font-weight: 600;
            text-decoration: none;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .home-link:hover { transform: scale(1.05); box-shadow: 0 10px 25px rgba(238, 102, 170, 0.3); }
        `}} />
      </head>
      <body>
        <div>
          <span className="error-code">404</span>
          <p className="error-title">Page not found</p>
        </div>
        <p className="error-message">
          The page you are looking for doesn&apos;t exist or has been moved. If you think this is a
          mistake, please contact support.
        </p>
        <a href="/" className="home-link">
          Go back home
        </a>
      </body>
    </html>
  );
}
