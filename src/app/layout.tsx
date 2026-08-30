import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClinicJsonLd } from "@/components/ClinicJsonLd";
import { SkipLink } from "@/components/SkipLink";
import { isSearchIndexable, SITE, siteOrigin } from "@/lib/site";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
    <html lang="en-CA" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans antialiased text-[#111111]">
        <SkipLink />
        <ClinicJsonLd />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
