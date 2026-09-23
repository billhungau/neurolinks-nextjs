import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import type { ReactNode } from "react";
import { AnchorOffset } from "@/components/AnchorOffset";
import { ClinicJsonLd } from "@/components/ClinicJsonLd";
import { MotionReady } from "@/components/MotionReady";
import { SkipLink } from "@/components/SkipLink";
import { DEFAULT_OG_IMAGE, pageRobots } from "@/lib/seo";
import {
  googleSiteVerification,
  PRODUCTION_ORIGIN,
  productionUrl,
  SITE,
} from "@/lib/site";
import "./globals.css";

const display = localFont({
  src: "./fonts/source-serif-4-latin.woff2",
  variable: "--font-display",
  weight: "600 700",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  preload: true,
});

const body = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-body",
  weight: "400 700",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

const defaultImage = {
  url: productionUrl(DEFAULT_OG_IMAGE.path),
  width: DEFAULT_OG_IMAGE.width,
  height: DEFAULT_OG_IMAGE.height,
  alt: DEFAULT_OG_IMAGE.alt,
  type: "image/jpeg",
};

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_ORIGIN),
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "300x300" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  title: {
    default: `${SITE.name} – ${SITE.tagline}`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.tagline,
  robots: pageRobots(),
  openGraph: {
    siteName: SITE.name,
    locale: "en_CA",
    type: "website",
    images: [defaultImage],
  },
  twitter: {
    card: "summary_large_image",
    images: [defaultImage.url],
  },
  verification: googleSiteVerification()
    ? { google: googleSiteVerification() }
    : undefined,
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en-CA" className={`${display.variable} ${body.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans antialiased text-[#111111]">
        <Script
          id="nl-js"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js","nl-instant-scroll");`,
          }}
        />
        <SkipLink />
        <AnchorOffset />
        <ClinicJsonLd />
        <MotionReady />
        {children}
      </body>
    </html>
  );
}
