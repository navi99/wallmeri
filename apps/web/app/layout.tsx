import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wallmeri — Premium Metal Wall Art",
  description:
    "Discover and buy premium metal wall art and posters, shipped across India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${displayFont.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Suspense fallback={<div className="h-16 bg-ink" />}>
            <SiteHeader />
          </Suspense>
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
