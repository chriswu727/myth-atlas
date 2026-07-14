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
  title: "寰宇神话志 · Myth Atlas",
  description:
    "收录世界各地的神话、志怪与传说 — A catalog of the world's myths, strange creatures, and legends.",
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
