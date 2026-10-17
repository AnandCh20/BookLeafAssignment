import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "BookLeaf Publishing — Author Support & Communication Portal",
  description: "Unified communication and AI-powered ticket management portal for BookLeaf authors and operations team.",
  keywords: "BookLeaf, Publishing, Author Portal, Support, AI Response, Operations"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("bookleaf_theme")||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
