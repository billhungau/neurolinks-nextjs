export type SourceFetchKind = "relative" | "vercel-blob" | "unsupported-absolute";

export type SourceFetchPlan = {
  url: string;
  kind: SourceFetchKind;
  headers?: Record<string, string>;
};

export type BuildSourceFetchPlanArgs = {
  sourceUrl: string;
  requestOrigin: string;
  cmsCookie?: string;
  blobToken?: string;
};

export function isTrustedVercelBlobHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  return normalized.endsWith(".blob.vercel-storage.com") && normalized !== "blob.vercel-storage.com";
}

export function buildSourceFetchPlan({
  sourceUrl,
  requestOrigin,
  cmsCookie = "",
  blobToken = "",
}: BuildSourceFetchPlanArgs): SourceFetchPlan {
  const isAbsolute = sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://");

  if (!isAbsolute) {
    const resolved = new URL(sourceUrl, requestOrigin);
    return {
      url: resolved.toString(),
      kind: "relative",
      headers: cmsCookie ? { cookie: cmsCookie } : undefined,
    };
  }

  const parsed = new URL(sourceUrl);
  if (!isTrustedVercelBlobHostname(parsed.hostname)) {
    return { url: parsed.toString(), kind: "unsupported-absolute" };
  }

  if (!blobToken) throw new Error("AI_BLOB_NOT_CONFIGURED");

  return {
    url: parsed.toString(),
    kind: "vercel-blob",
    headers: { Authorization: `Bearer ${blobToken}` },
  };
}
