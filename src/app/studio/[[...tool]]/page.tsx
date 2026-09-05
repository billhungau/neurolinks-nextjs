import type { Metadata } from "next";
import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";
import { pageRobots } from "@/lib/seo";
import { isSanityConfigured } from "@/sanity/env";
import { StudioApp } from "./StudioApp";

export const dynamic = "force-dynamic";
export const viewport = studioViewport;

export const metadata: Metadata = {
  ...studioMetadata,
  title: { absolute: "NeuroLinks Insights Studio" },
  robots: pageRobots({ index: false, follow: false }),
};

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <main id="main-content" className="nl-wrap py-20" tabIndex={-1}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--nl-navy)]">
          Insights Studio is not connected
        </h1>
        <p className="mt-4 max-w-xl text-[1.03125rem] leading-[1.7] text-[var(--nl-muted)]">
          Add Sanity project identifiers to the environment, then reload this page. Editors
          authenticate with Sanity. See <code>docs/INSIGHTS-SANITY-SETUP.md</code> for the
          remaining account-owner steps.
        </p>
      </main>
    );
  }

  return <StudioApp />;
}
