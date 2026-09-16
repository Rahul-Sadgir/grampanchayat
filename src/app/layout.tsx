import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#065f46",
};

export const metadata: Metadata = {
  title: "डिजिटल ग्रामपंचायत महापोर्टल (Digital Gram Panchayat Platform)",
  description: "महाराष्ट्र शासन पुरस्कृत डिजिटल ग्रामपंचायत व्यासपीठ - ग्रामस्थांसाठी सर्व शासकीय सेवा, दाखले व योजना एकाच ठिकाणी.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="mr"
      className={`${inter.variable} ${devanagari.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className="min-h-full flex flex-col font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
