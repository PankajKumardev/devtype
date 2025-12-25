import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const siteUrl = "https://devtype.pankajk.tech";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DevType - Master Your Coding Speed",
    template: "%s | DevType",
  },
  description: "Practice typing with real code snippets. Improve your WPM and accuracy typing code in TypeScript, JavaScript, Python, Rust, Go, Java, and C++.",
  keywords: [
    "typing test",
    "coding typing test",
    "programming",
    "WPM",
    "typing speed",
    "developer tools",
    "code practice",
    "monkeytype for coders",
    "typing practice",
    "keyboard speed",
  ],
  authors: [{ name: "Pankaj Kumar", url: "https://github.com/PankajKumardev" }],
  creator: "Pankaj Kumar",
  publisher: "Pankaj Kumar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DevType",
    title: "DevType - Master Your Coding Speed",
    description: "Practice typing with real code snippets. Improve your WPM and accuracy with TypeScript, JavaScript, Python, Rust, Go, Java, and C++.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "DevType - Typing Speed Test for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevType - Master Your Coding Speed",
    description: "Practice typing with real code snippets. Improve your WPM and accuracy.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@pankajkumardev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
