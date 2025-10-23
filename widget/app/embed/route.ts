// app/embed/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const js = `
    (function() {
      // Prevent multiple injections
      if (window.MyChatWidgetLoaded) return;
      window.MyChatWidgetLoaded = true;

      // Create iframe container
      var iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.bottom = '20px';
      iframe.style.right = '20px';
      iframe.style.width = '350px';
      iframe.style.height = '500px';
      iframe.style.border = 'none';
      iframe.style.zIndex = '999999';
      iframe.style.borderRadius = '35px';
      iframe.src = "http://localhost:3000/widget";
      document.body.appendChild(iframe);
    })();
  `;
  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
