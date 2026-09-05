import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { AnchorOffset } from "@/components/AnchorOffset";
import { ClinicJsonLd } from "@/components/ClinicJsonLd";
import { MotionReady } from "@/components/MotionReady";
import { InsightsSanityRuntime } from "@/components/insights/InsightsSanityRuntime";
import { SkipLink } from "@/components/SkipLink";
import { DEFAULT_OG_IMAGE, pageRobots } from "@/lib/seo";
import {
  googleSiteVerification,
  PRODUCTION_ORIGIN,
  productionUrl,
  SITE,
} from "@/lib/site";
import "./globals.css";

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: "normal",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: "normal",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const defaultImage = {
  url: productionUrl(DEFAULT_OG_IMAGE.path),
  width: DEFAULT_OG_IMAGE.width,
  height: DEFAULT_OG_IMAGE.height,
  alt: DEFAULT_OG_IMAGE.alt,
  type: "image/jpeg",
};

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_ORIGIN),
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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        <InsightsSanityRuntime />
        {children}
      </body>
    </html>
  );
}
