import { NextResponse, type NextRequest } from "next/server";
import { createLocalReq } from "payload";
import { MAX_AI_SOURCE_FILE_BYTES, MAX_AI_SOURCE_FILES, normalizedSourceMimeType } from "@/ai/source-files";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";

const SOURCE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function sourceDoc(doc: { id: string | number; filename?: string | null; mimeType?: string | null; filesize?: number | null }) {
  return { id: doc.id, filename: doc.filename ?? undefined, mimeType: doc.mimeType ?? undefined, filesize: doc.filesize ?? undefined };
}

function sanitizedUploadError(error: unknown) {
  const details: string[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 4 || value == null) return;
    if (typeof value === "string") {
      const text = value.trim();
      if (text && text.length <= 300) details.push(text);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    for (const key of ["name", "message", "cause", "code", "status", "statusCode", "data", "errors"]) {
      if (key in record) visit(record[key], depth + 1);
    }
  };
  visit(error);
  return [...new Set(details)]
    .filter((text) => !/^(Error|APIError|FileUploadError)$/i.test(text))
    .slice(0, 4);
}

async function authenticate(request: NextRequest) {
  if (!isCmsConfigured()) return { error: NextResponse.json({ error: "CMS is not configured." }, { status: 503 }) } as const;
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return { error: NextResponse.json({ error: "Sign in to Payload to manage AI source documents." }, { status: 401 }) } as const;

  // Local API upload operations need a PayloadRequest so upload/storage hooks,
  // request context, and authenticated user state are threaded exactly as they
  // are for normal Payload REST operations. A bare payload.create() is not
  // equivalent for upload collections backed by cloud-storage adapters.
  const req = await createLocalReq({
    user,
    req: {
      headers: request.headers,
      url: request.url,
    },
  }, payload);

  return { payload, req } as const;
}

function sessionFromPayload(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  try {
    const parsed = JSON.parse(value) as { sessionId?: unknown };
    return typeof parsed.sessionId === "string" ? parsed.sessionId.trim() : "";
  } catch {
    return "";
  }
}

function sessionFromWhere(request: NextRequest): string {
  return request.nextUrl.searchParams.get("where[sessionId][equals]")?.trim() || "";
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;
  const sessionId = sessionFromWhere(request);
  if (!sessionId) return NextResponse.json({ docs: [] });

  const found = await auth.payload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: MAX_AI_SOURCE_FILES,
    overrideAccess: false,
    req: auth.req,
    sort: "createdAt",
    user: auth.req.user,
    where: { sessionId: { equals: sessionId } },
  });
  return NextResponse.json({ docs: found.docs.map(sourceDoc) });
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if ("error" in auth) return auth.error;

  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: "Invalid multipart upload." }, { status: 400 }); }

  const file = form.get("file");
  const sessionId = sessionFromPayload(form.get("_payload"));
  if (!(file instanceof File)) return NextResponse.json({ error: "A source file is required." }, { status: 400 });
  if (!sessionId || sessionId.length > 100) return NextResponse.json({ error: "A valid source session is required." }, { status: 400 });
  if (file.size > MAX_AI_SOURCE_FILE_BYTES) return NextResponse.json({ error: "Source files must be 4 MB or smaller." }, { status: 413 });

  const mimeType = normalizedSourceMimeType(file.name, file.type);
  if (!mimeType) return NextResponse.json({ error: "Unsupported source file type." }, { status: 415 });

  try {
    const data = Buffer.from(await file.arrayBuffer());
    const created = await auth.payload.create({
      collection: "ai-source-documents",
      data: {
        sessionId,
        expiresAt: new Date(Date.now() + SOURCE_RETENTION_MS).toISOString(),
      },
      file: {
        data,
        mimetype: mimeType,
        name: file.name,
        size: data.length,
      },
      overrideAccess: false,
      req: auth.req,
      user: auth.req.user,
    });
    return NextResponse.json({ doc: sourceDoc(created) }, { status: 201 });
  } catch (error) {
    const details = sanitizedUploadError(error);
    const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const message = details.join(" · ") || "Source upload failed.";
    console.error("[ai-source-documents] upload failed", {
      filename: file.name,
      mimeType,
      size: file.size,
      blobConfigured,
      errorName: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : undefined,
      cause: error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined,
    });
    return NextResponse.json({
      error: `${message} · storage:${blobConfigured ? "blob" : "local-fallback"}`,
    }, { status: 500 });
  }
}
