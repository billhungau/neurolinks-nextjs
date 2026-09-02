import { existsSync } from "node:fs";
import { join } from "node:path";

export const VIDEO_PATHS = {
  tms: "/media/videos/tms-introduction.mp4",
  ketamine: "/media/videos/ketamine-introduction.mp4",
} as const;

/** Original WordPress files. Used only when local/Blob copies are absent. */
export const LEGACY_WP_VIDEOS = {
  tms: {
    src: "https://neurolinks.ca/wp-content/uploads/2025/05/TMS-FINAL-COPYYYY-JULIE-USE.mp4",
    bytes: 236243496,
  },
  ketamine: {
    src: "https://neurolinks.ca/wp-content/uploads/2025/05/KETAMINE-VIDEO-JULIE-USE.mp4",
    bytes: 205260350,
  },
} as const;

function publicFileExists(publicPath: string): boolean {
  return existsSync(join(process.cwd(), "public", publicPath));
}

/**
 * Prefer Blob/CDN env, then a file in public/, then the live WordPress URL
 * until independent hosting is configured. Do not import this from client
 * components (uses fs).
 */
export function treatmentVideoSrc(kind: "tms" | "ketamine"): string {
  const envName = kind === "tms" ? "NEXT_PUBLIC_TMS_VIDEO_URL" : "NEXT_PUBLIC_KETAMINE_VIDEO_URL";
  const fromEnv = process.env[envName]?.trim();
  if (fromEnv) return fromEnv;
  const local = VIDEO_PATHS[kind];
  if (publicFileExists(local)) return local;
  return LEGACY_WP_VIDEOS[kind].src;
}
