import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AnchorOffset } from "@/components/AnchorOffset";
import { ClinicJsonLd } from "@/components/ClinicJsonLd";
import { SkipLink } from "@/components/SkipLink";
import { isSearchIndexable, SITE, siteOrigin } from "@/lib/site";
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

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} – ${SITE.tagline}`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.tagline,
  metadataBase: new URL(siteOrigin()),
  robots: isSearchIndexable()
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noarchive: true,
          nosnippet: true,
        },
      },
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
