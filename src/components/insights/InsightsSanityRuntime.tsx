import { draftMode } from "next/headers";
import type { ComponentType } from "react";
import { VisualEditing } from "next-sanity/visual-editing";
import { isSanityConfigured } from "@/sanity/env";
import { SanityLive } from "@/sanity/live";

export async function InsightsSanityRuntime() {
  if (!isSanityConfigured()) return null;
  const { isEnabled } = await draftMode();
  const Live = SanityLive as ComponentType<{ includeDrafts?: boolean }>;
  return (
    <>
      <Live includeDrafts={isEnabled} />
      {isEnabled ? <VisualEditing /> : null}
    </>
  );
}
