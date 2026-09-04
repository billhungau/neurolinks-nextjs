export const PATHWAY_DESKTOP_MQ = "(min-width: 1024px)";

export const PATHWAY_DESKTOP_OBSERVER = {
  threshold: 0.35,
  rootMargin: "0px 0px -16% 0px",
} as const;

export const PATHWAY_MOBILE_OBSERVER = {
  threshold: 0.35,
  rootMargin: "0px 0px -12% 0px",
} as const;

export function shouldRevealImmediately({
  reducedMotion,
  observerSupported,
  observerAttachFailed = false,
}: {
  reducedMotion: boolean;
  observerSupported: boolean;
  observerAttachFailed?: boolean;
}) {
  return reducedMotion || !observerSupported || observerAttachFailed;
}

export function shouldSkipPathwayPrepare({
  reducedMotion,
  observerSupported,
}: {
  reducedMotion: boolean;
  observerSupported: boolean;
}) {
  return reducedMotion || !observerSupported;
}
