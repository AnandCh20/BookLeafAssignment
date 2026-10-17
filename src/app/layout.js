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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
