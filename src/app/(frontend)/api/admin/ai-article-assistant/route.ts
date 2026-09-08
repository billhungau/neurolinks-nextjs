import { NextResponse, type NextRequest } from "next/server";
import { head } from "@vercel/blob";
import { parseAssistantRequest } from "@/ai/schemas";
import { runArticleAI, type ArticleSourceFile } from "@/ai/provider";
import { buildSourceFetchPlan, type SourceFetchKind } from "@/ai/source-fetch";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";
export const maxDuration = 240;

const MAX_FILES = 10;
const MAX_TOTAL_SOURCE_BYTES = 20 * 1024 * 1024;

type SourceReadError = Error & {
  status?: number;
  sourceKind?: SourceFetchKind;
  contentType?: string;
};

async function blobBackedPlan(
  filename: string,
  fallbackPlan: ReturnType<typeof buildSourceFetchPlan>,
  requestOrigin: string,
): Promise<ReturnType<typeof buildSourceFetchPlan>> {
  const token = process.env.BLOB_READ_WRITE_TOKEN || "";
  if (!token || fallbackPlan.kind === "vercel-blob" || fallbackPlan.kind === "unsupported-absolute") return fallbackPlan;

  try {
    // Payload 3.88's Vercel Blob adapter stores the final Blob filename back on
    // the upload document after addRandomSuffix is applied. Resolve that exact
    // backing object through the Blob SDK instead of performing a second HTTP
    // request through Payload's authenticated file proxy. The latter can reject
    // a server-to-server replay of the browser session even though the outer AI
    // request is already authenticated.
    const blob = await head(filename, { token });
    if (!blob?.url) return fallbackPlan;

    const plan = buildSourceFetchPlan({
      sourceUrl: blob.url,
      requestOrigin,
      blobToken: token,
    });
    return plan.kind === "vercel-blob" ? plan : fallbackPlan;
  } catch (error) {
    console.error("[ai-article-assistant] could not resolve backing Blob source", {
      filename,
      errorName: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : undefined,
    });
    return fallbackPlan;
  }
}

async function loadSessionFiles(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  sessionId: string,
  requestHeaders: Headers,
  requestOrigin: string,
): Promise<ArticleSourceFile[]> {
  const found = await payload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: MAX_FILES,
    overrideAccess: true,
    sort: "createdAt",
    where: { sessionId: { equals: sessionId } },
  });

  let totalBytes = 0;
  const files: ArticleSourceFile[] = [];
  const cookie = requestHeaders.get("cookie") || "";

  for (const doc of found.docs) {
    const url = typeof doc.url === "string" ? doc.url : "";
    const filename = typeof doc.filename === "string" ? doc.filename : "source-document";
    const mimeType = typeof doc.mimeType === "string" ? doc.mimeType : "application/octet-stream";
    if (!url) continue;

    const fallbackPlan = buildSourceFetchPlan({
      sourceUrl: url,
      requestOrigin,
      cmsCookie: cookie,
      blobToken: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const plan = await blobBackedPlan(filename, fallbackPlan, requestOrigin);

    if (plan.kind === "unsupported-absolute") {
      const readError = new Error("AI_SOURCE_UNTRUSTED_URL") as SourceReadError;
      readError.sourceKind = plan.kind;
      throw readError;
    }

    const response = await fetch(plan.url, {
      cache: "no-store",
      headers: plan.headers,
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const readError = new Error("AI_SOURCE_REDIRECT_BLOCKED") as SourceReadError;
      readError.status = response.status;
      readError.sourceKind = plan.kind;
      readError.contentType = response.headers.get("content-type") || undefined;
      console.error("[ai-article-assistant] blocked temporary source redirect", {
        status: response.status,
        filename,
        sourceKind: plan.kind,
      });
      throw readError;
    }

    if (!response.ok) {
      const readError = new Error("AI_SOURCE_READ_ERROR") as SourceReadError;
      readError.status = response.status;
      readError.sourceKind = plan.kind;
      readError.contentType = response.headers.get("content-type") || undefined;
      console.error("[ai-article-assistant] could not read temporary source", {
        status: response.status,
        filename,
        sourceKind: plan.kind,
        contentType: readError.contentType,
      });
      throw readError;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    totalBytes += bytes.length;
    if (totalBytes > MAX_TOTAL_SOURCE_BYTES) throw new Error("AI_SOURCES_TOO_LARGE");
    files.push({ filename, mimeType, base64: bytes.toString("base64") });
  }

  return files;
}

export async function POST(request: NextRequest) {
  if (!isCmsConfigured()) return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ error: "Sign in to Payload to use the AI Article Assistant." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sourceSession = typeof body.sourceSession === "string" ? body.sourceSession.trim().slice(0, 100) : "";
  let files: ArticleSourceFile[] = [];
  try {
    if (sourceSession) {
      files = await loadSessionFiles(payload, sourceSession, request.headers, request.nextUrl.origin);
      body.sourceFileNames = files.map((file) => file.filename);
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_SOURCE_READ_ERROR";
    if (code === "AI_SOURCES_TOO_LARGE") {
      return NextResponse.json({ error: "The attached source files are too large to process together. Keep the combined source set under 20 MB and try again." }, { status: 413 });
    }
    if (code === "AI_BLOB_NOT_CONFIGURED") {
      return NextResponse.json({ error: "Temporary source storage is not configured correctly." }, { status: 503 });
    }
    if (code === "AI_SOURCE_UNTRUSTED_URL") {
      return NextResponse.json({ error: "A temporary source file points to an unsupported storage location. Remove it and upload it again." }, { status: 502 });
    }

    const readError = error as SourceReadError;
    const diagnostics = [
      typeof readError.status === "number" ? `HTTP ${readError.status}` : null,
      readError.sourceKind ? `source:${readError.sourceKind}` : null,
      readError.contentType ? `content-type:${readError.contentType.split(";")[0]}` : null,
    ].filter(Boolean).join(" · ");

    return NextResponse.json({
      error: `One or more temporary source files could not be read.${diagnostics ? ` ${diagnostics}` : ""}`,
    }, { status: 502 });
  }

  const parsed = parseAssistantRequest(body);
  if (!parsed) return NextResponse.json({ error: "Please provide the required article information." }, { status: 400 });

  try {
    const result = await runArticleAI(parsed, files);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "AI_PROVIDER_ERROR";
    if (code === "AI_NOT_CONFIGURED") return NextResponse.json({ error: "AI Article Assistant is not configured. Add OPENAI_API_KEY on Vercel." }, { status: 503 });
    if (code === "AI_TIMEOUT") return NextResponse.json({ error: "AI generation timed out. Your article was not changed." }, { status: 504 });
    if (code === "AI_INVALID_OUTPUT") return NextResponse.json({ error: "The AI returned an invalid article response. Your article was not changed; please try again." }, { status: 502 });
    console.error("[ai-article-assistant] generation failed", error);
    return NextResponse.json({ error: "AI generation could not be completed. Your existing article has not been changed." }, { status: 502 });
  }
}
