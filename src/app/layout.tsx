import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { TopProgressBar } from "@/components/public/TopProgressBar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#065f46",
};

export const metadata: Metadata = {
  title: "ग्रामपंचायत कोमलवाडी (Gram Panchayat Komalwadi) - अधिकृत ई-प्रशासन पोर्टल",
  description: "मु. कोमलवाडी, पो. वडांगळी, ता. सिन्नर, जि. नाशिक, महाराष्ट्र - ग्रामस्थांसाठी सर्व शासकीय सेवा, दाखले व योजना एकाच ठिकाणी.",
  icons: {
    icon: [
      { url: "/images/grampanchayat-emblem.webp", type: "image/webp" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/images/emblem-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/images/emblem-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="mr"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&family=Mukta:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900"
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
