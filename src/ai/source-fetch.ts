export type SourceFetchKind = "relative" | "same-origin" | "payload-proxy" | "vercel-blob" | "unsupported-absolute";

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

const AI_SOURCE_PROXY_PREFIX = "/payload-api/ai-source-documents/file/";

export function isTrustedVercelBlobHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
  return normalized === "blob.vercel-storage.com" || normalized.endsWith(".blob.vercel-storage.com");
}

export function buildSourceFetchPlan({
  sourceUrl,
  requestOrigin,
  cmsCookie = "",
  blobToken = "",
}: BuildSourceFetchPlanArgs): SourceFetchPlan {
  const origin = new URL(requestOrigin);
  const isAbsolute = sourceUrl.startsWith("http://") || sourceUrl.startsWith("https://");

  if (!isAbsolute) {
    const resolved = new URL(sourceUrl, origin);
    return {
      url: resolved.toString(),
      kind: "relative",
      headers: cmsCookie ? { cookie: cmsCookie } : undefined,
    };
  }

  const parsed = new URL(sourceUrl);

  if (parsed.origin === origin.origin) {
    return {
      url: parsed.toString(),
      kind: "same-origin",
      headers: cmsCookie ? { cookie: cmsCookie } : undefined,
    };
  }

  // Payload may expand the relative source proxy URL using its configured
  // serverURL, which can be the stable staging host while the editor is running
  // on a unique PR Preview host. The browser session cookie belongs to the PR
  // host, so do not fetch the configured host. Rebase only the known internal
  // AI-source proxy pathname onto the current request origin instead. This also
  // prevents credentials from ever being sent to the hostname in doc.url.
  if (parsed.pathname.startsWith(AI_SOURCE_PROXY_PREFIX)) {
    const rebased = new URL(`${parsed.pathname}${parsed.search}`, origin);
    return {
      url: rebased.toString(),
      kind: "payload-proxy",
      headers: cmsCookie ? { cookie: cmsCookie } : undefined,
    };
  }

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
