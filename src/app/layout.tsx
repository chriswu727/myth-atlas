import type { Metadata } from "next";
import { Cormorant, EB_Garamond, IBM_Plex_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const display = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const body = EB_Garamond({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const cjk = Noto_Serif_SC({
  variable: "--font-cjk",
  weight: ["400", "600", "900"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://myth-atlas.vercel.app"),
  title: "寰宇神话志 · Myth Atlas",
  description:
    "从残卷、神庙与口传深处醒来的寰宇神话志：诸神、异兽、创世与仍在暗处流传的旧梦。",
  openGraph: {
    type: "website",
    title: "寰宇神话志 · Myth Atlas",
    description: "诸神沉默之后，仍有群星、残卷与夜行者记得世界曾如何诞生。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "寰宇神话志 · Myth Atlas" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "寰宇神话志 · Myth Atlas",
    description: "诸神、异兽、创世与仍在暗处流传的旧梦",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${cjk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
