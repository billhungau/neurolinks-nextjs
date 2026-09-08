import { NextResponse, type NextRequest } from "next/server";
import { MAX_AI_SOURCE_FILE_BYTES, MAX_AI_SOURCE_FILES, normalizedSourceMimeType } from "@/ai/source-files";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";

const SOURCE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function sourceDoc(doc: { id: string | number; filename?: string | null; mimeType?: string | null; filesize?: number | null }) {
  return { id: doc.id, filename: doc.filename ?? undefined, mimeType: doc.mimeType ?? undefined, filesize: doc.filesize ?? undefined };
}

async function authenticate(request: NextRequest) {
  if (!isCmsConfigured()) return { error: NextResponse.json({ error: "CMS is not configured." }, { status: 503 }) } as const;
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return { error: NextResponse.json({ error: "Sign in to Payload to manage AI source documents." }, { status: 401 }) } as const;
  return { payload, user } as const;
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

  // Authentication above is the security gate for this dedicated private route.
  // Using Local API with overrideAccess=true avoids re-running collection access
  // without the original REST request context, which caused authenticated users
  // to receive 403 from the temporary source collection.
  const found = await auth.payload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: MAX_AI_SOURCE_FILES,
    overrideAccess: true,
    sort: "createdAt",
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
        // Although the collection has a runtime defaultValue, Payload's generated
        // create type correctly treats this required field as required input.
        expiresAt: new Date(Date.now() + SOURCE_RETENTION_MS).toISOString(),
      },
      file: {
        data,
        mimetype: mimeType,
        name: file.name,
        size: data.length,
      },
      overrideAccess: true,
    });
    return NextResponse.json({ doc: sourceDoc(created) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Source upload failed.";
    console.error("[ai-source-documents] upload failed", { filename: file.name, mimeType, size: file.size, message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
