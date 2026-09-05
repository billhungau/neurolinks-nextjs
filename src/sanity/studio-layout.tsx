"use client";

import type { LayoutProps } from "sanity";
import { PATIENT_INFORMATION_WARNING } from "@/lib/insights";

export function StudioBannerLayout(props: LayoutProps) {
  return (
    <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <p
        role="note"
        style={{
          margin: 0,
          padding: "0.75rem 1.25rem",
          background: "#f4f0e8",
          color: "#1a2744",
          borderBottom: "1px solid rgb(26 39 68 / 0.12)",
          fontSize: "0.875rem",
          lineHeight: 1.45,
          fontWeight: 600,
        }}
      >
        {PATIENT_INFORMATION_WARNING}
      </p>
      <div style={{ minHeight: 0, flex: 1 }}>{props.renderDefault(props)}</div>
    </div>
  );
}
