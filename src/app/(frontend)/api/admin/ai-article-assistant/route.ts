import { NextResponse, type NextRequest } from "next/server";
import { parseAssistantRequest } from "@/ai/schemas";
import { runArticleAI, type ArticleSourceFile } from "@/ai/provider";
import { getPayloadClient, isCmsConfigured } from "@/lib/payload/client";

export const runtime = "nodejs";
export const maxDuration = 240;

const MAX_FILES = 5;
// Vercel Functions have a 4.5 MB request-body ceiling. Leave headroom for
// multipart boundaries and the JSON request so uploads fail clearly here
// rather than as an opaque platform 413.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

async function parseRequest(request: NextRequest): Promise<{ body: unknown; files: ArticleSourceFile[] }> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return { body: await request.json(), files: [] };
  }

  const form = await request.formData();
  const requestJson = form.get("request");
  if (typeof requestJson !== "string") throw new Error("INVALID_REQUEST");
  const rawFiles = form.getAll("files").filter((entry): entry is File => entry instanceof File);
  if (rawFiles.length > MAX_FILES) throw new Error("TOO_MANY_FILES");

  let totalBytes = 0;
  const files: ArticleSourceFile[] = [];
  for (const file of rawFiles) {
    if (file.size > MAX_FILE_BYTES) throw new Error("FILE_TOO_LARGE");
    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_FILE_BYTES) throw new Error("FILES_TOO_LARGE");
    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_FILE_TYPES.has(mimeType)) throw new Error("UNSUPPORTED_FILE_TYPE");
    const bytes = Buffer.from(await file.arrayBuffer());
    files.push({ filename: file.name.slice(0, 180), mimeType, base64: bytes.toString("base64") });
  }

  const body = JSON.parse(requestJson) as Record<string, unknown>;
  body.sourceFileNames = files.map((file) => file.filename);
  return { body, files };
}

export async function POST(request: NextRequest) {
  if (!isCmsConfigured()) return NextResponse.json({ error: "CMS is not configured." }, { status: 503 });

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return NextResponse.json({ error: "Sign in to Payload to use the AI Article Assistant." }, { status: 401 });

  let body: unknown;
  let files: ArticleSourceFile[] = [];
  try {
    const parsedRequest = await parseRequest(request);
    body = parsedRequest.body;
    files = parsedRequest.files;
  } catch (error) {
    const code = error instanceof Error ? error.message : "INVALID_REQUEST";
    if (code === "TOO_MANY_FILES") return NextResponse.json({ error: `Attach up to ${MAX_FILES} source files at a time.` }, { status: 413 });
    if (code === "FILE_TOO_LARGE") return NextResponse.json({ error: "Each source file must be smaller than 4 MB in the current uploader." }, { status: 413 });
    if (code === "FILES_TOO_LARGE") return NextResponse.json({ error: "Source files must total less than 4 MB in the current uploader. Add fewer or smaller files and try again." }, { status: 413 });
    if (code === "UNSUPPORTED_FILE_TYPE") return NextResponse.json({ error: "Supported source files are PDF, TXT, Markdown, DOC and DOCX." }, { status: 415 });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
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
    if (code === "AI_FILE_UPLOAD_ERROR") return NextResponse.json({ error: "The source file could not be uploaded to the AI provider. Your article was not changed." }, { status: 502 });
    if (code === "AI_INVALID_OUTPUT") return NextResponse.json({ error: "The AI returned an invalid article response. Your article was not changed; please try again." }, { status: 502 });
    console.error("[ai-article-assistant] generation failed", error);
    return NextResponse.json({ error: "AI generation could not be completed. Your existing article has not been changed." }, { status: 502 });
  }
}
