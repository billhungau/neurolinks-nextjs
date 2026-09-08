import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  MAX_AI_SOURCE_FILES,
  MAX_AI_SOURCE_TOTAL_BYTES,
  nextEstimatedGenerationProgress,
  normalizedSourceMimeType,
  sourceFileDataUrl,
  sourceUploadFailureMessage,
  uploadProgressPercent,
  validateSourceSelection,
} from "./source-files.ts";
import { isValidDoi, normalizeDoi } from "../lib/doi.ts";

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(here, relative), "utf8");

const insightCollection = read("../payload/collections/Insights.ts");
const sourceCollection = read("../payload/collections/AISourceDocuments.ts");
const cleanupHooks = read("../payload/hooks/cleanupAISourceDocuments.ts");
const migration = read("../payload/migrations/20260907_060000_ai_sources.ts");
const payloadTypes = read("../payload-types.ts");
const assistantComponent = read("../payload/components/AIArticleAssistant.tsx");
const aiRoute = read("../app/(frontend)/api/admin/ai-article-assistant/route.ts");
const doiRoute = read("../app/(frontend)/api/admin/reference-by-doi/route.ts");
const provider = read("provider.ts");
const vercelBuild = read("../../scripts/vercel-build.mjs");

test("Payload schema, generated types and migration all include AI source state", () => {
  assert.match(insightCollection, /name: "aiSourceSession"/);
  assert.match(sourceCollection, /slug: "ai-source-documents"/);
  assert.match(sourceCollection, /name: "sessionId"/);
  assert.match(sourceCollection, /name: "expiresAt"/);
  assert.match(payloadTypes, /'ai-source-documents': AiSourceDocument/);
  assert.match(payloadTypes, /aiSourceSession\?: string \| null/);
  assert.match(migration, /ADD COLUMN "ai_source_session"/);
  assert.match(migration, /CREATE TABLE "ai_source_documents"/);
  assert.match(migration, /"session_id" varchar NOT NULL/);
  assert.match(migration, /"expires_at" timestamp\(3\) with time zone NOT NULL/);
  assert.match(migration, /ai_source_documents_session_id_idx/);
  assert.match(migration, /ai_source_documents_expires_at_idx/);
});

test("AI source cleanup is scoped to temporary source documents", () => {
  assert.match(cleanupHooks, /collection: "ai-source-documents"/);
  assert.match(cleanupHooks, /cleanupAISourcesAfterDelete/);
  assert.match(cleanupHooks, /expiresAt: \{ less_than_equal:/);
  assert.doesNotMatch(cleanupHooks, /collection: "media"/);
});

test("publishing does not wait for Blob deletion", () => {
  assert.match(insightCollection, /beforeChange: \[clearAISourceSessionBeforePublish\]/);
  assert.match(insightCollection, /afterChange: \[revalidateInsight\]/);
  assert.doesNotMatch(insightCollection, /cleanupAISourcesAfterPublish/);
  assert.match(cleanupHooks, /clearAISourceSessionBeforePublish/);
  assert.match(cleanupHooks, /aiSourceSession: null/);
  assert.doesNotMatch(cleanupHooks, /post-publish source cleanup failed/);
});

test("expired temporary sources remain the independent publish-cleanup fallback", () => {
  assert.match(cleanupHooks, /seven-day expiry/);
  assert.match(cleanupHooks, /deleteExpiredAISources/);
  assert.match(cleanupHooks, /cleanupExpiredAISourcesAfterUpload/);
});

test("source MIME normalization accepts supported extensions despite blank or generic browser types", () => {
  assert.equal(normalizedSourceMimeType("paper.pdf", ""), "application/pdf");
  assert.equal(normalizedSourceMimeType("paper.PDF", "application/octet-stream"), "application/pdf");
  assert.equal(normalizedSourceMimeType("notes.md", "text/plain"), "text/plain");
  assert.equal(normalizedSourceMimeType("draft.docx", ""), "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(normalizedSourceMimeType("malware.exe", "application/octet-stream"), null);
});

test("source selection supports 1, 3 and 10 files and rejects the 11th or excessive total bytes", () => {
  const source = (name: string, size = 1024) => ({ name, size, type: "application/pdf" });
  assert.equal(validateSourceSelection(0, [source("1.pdf")]), null);
  assert.equal(validateSourceSelection(0, [source("1.pdf"), source("2.pdf"), source("3.pdf")]), null);
  assert.equal(validateSourceSelection(0, Array.from({ length: MAX_AI_SOURCE_FILES }, (_, i) => source(`${i}.pdf`))), null);
  assert.match(validateSourceSelection(0, Array.from({ length: MAX_AI_SOURCE_FILES + 1 }, (_, i) => source(`${i}.pdf`))) || "", /up to 10/);
  assert.match(validateSourceSelection(MAX_AI_SOURCE_TOTAL_BYTES, [source("extra.pdf")]) || "", /under 20 MB/);
});

test("Payload source-upload failures expose HTTP status and nested validation/storage messages", () => {
  const validation = sourceUploadFailureMessage(
    "paper.pdf",
    400,
    JSON.stringify({ errors: [{ name: "ValidationError", data: [{ field: "sessionId", message: "This field is required." }] }] }),
  );
  assert.match(validation, /HTTP 400/);
  assert.match(validation, /sessionId/);
  assert.match(validation, /This field is required/);

  const storage = sourceUploadFailureMessage(
    "paper.pdf",
    500,
    JSON.stringify({ error: { name: "BlobError", message: "Vercel Blob: token is missing" } }),
  );
  assert.match(storage, /HTTP 500/);
  assert.match(storage, /Vercel Blob: token is missing/);

  assert.equal(sourceUploadFailureMessage("paper.pdf", 0, ""), "Could not upload paper.pdf (network error).");
  assert.match(sourceUploadFailureMessage("paper.pdf", 500, "<html>Internal Server Error</html>"), /HTTP 500/);
});

test("source uploader preserves Payload multipart conventions and has bounded failure handling", () => {
  assert.match(assistantComponent, /form\.append\("file", normalizedFile\)/);
  assert.match(assistantComponent, /form\.append\("_payload", JSON\.stringify\(\{ sessionId \}\)\)/);
  assert.match(assistantComponent, /xhr\.withCredentials = true/);
  assert.match(assistantComponent, /xhr\.timeout = 45_000/);
  assert.match(assistantComponent, /sourceUploadFailureMessage\(file\.name, xhr\.status, xhr\.responseText\)/);
  assert.doesNotMatch(assistantComponent, /updateField\("_status"/);
});

test("progress has measured upload stages and estimated generation never reaches completion", () => {
  assert.equal(uploadProgressPercent(0, 0, 3), 0);
  assert.equal(uploadProgressPercent(2, 1, 3), 30);
  let value = 40;
  for (let i = 0; i < 200; i += 1) value = nextEstimatedGenerationProgress(value);
  assert.equal(value, 90);
  assert.ok(value < 100);
  assert.match(assistantComponent, /Validating and formatting response/);
  assert.match(assistantComponent, /setProgress\(100\)/);
});

test("OpenAI source inputs use documented data URI file_data and support multiple files", () => {
  assert.equal(sourceFileDataUrl("application/pdf", "YWJj"), "data:application/pdf;base64,YWJj");
  assert.match(provider, /type: "input_file" as const/);
  assert.match(provider, /files\.map\(\(file\) =>/);
  assert.match(provider, /filename: file\.filename/);
  assert.match(provider, /file_data: sourceFileDataUrl\(file\.mimeType, file\.base64\)/);
  assert.match(provider, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.doesNotMatch(provider, /\/v1\/files/);
});

test("source retrieval resolves backing Blob objects without exposing credentials", () => {
  assert.match(aiRoute, /import \{ head \} from "@vercel\/blob"/);
  assert.match(aiRoute, /head\(filename, \{ token \}\)/);
  assert.match(aiRoute, /blobBackedPlan/);
  assert.match(aiRoute, /plan\.kind === "vercel-blob"/);
  assert.doesNotMatch(aiRoute, /console\.log\([^\n]*BLOB_READ_WRITE_TOKEN/);
  assert.doesNotMatch(aiRoute, /NextResponse\.json\([^\n]*BLOB_READ_WRITE_TOKEN/);
});

test("source retrieval failures and timeout/invalid-output errors remain explicit and non-mutating", () => {
  assert.match(aiRoute, /AI_SOURCE_READ_ERROR/);
  assert.match(aiRoute, /AI_SOURCES_TOO_LARGE/);
  assert.match(aiRoute, /AI_TIMEOUT/);
  assert.match(aiRoute, /AI_INVALID_OUTPUT/);
  assert.match(aiRoute, /Your existing article has not been changed/);
});

test("AI apply safety ties results to document identity, always confirms full replacement and uses semantic lists", () => {
  assert.match(assistantComponent, /useDocumentInfo/);
  assert.match(assistantComponent, /currentDocumentKey/);
  assert.match(assistantComponent, /generatedForPath !== currentDocumentKey/);
  assert.match(assistantComponent, /window\.confirm/);
  assert.match(assistantComponent, /type: "list"/);
  assert.match(assistantComponent, /type: "listitem"/);
  assert.doesNotMatch(assistantComponent, /paragraphNode\(`•/);
  assert.doesNotMatch(assistantComponent, /updateField\("_status"/);
});

test("DOI normalization is canonical and DOI workflow is authenticated, deduplicated and Crossref-backed", () => {
  assert.equal(normalizeDoi("https://doi.org/10.1000/ABC. "), "10.1000/abc");
  assert.equal(normalizeDoi("doi: 10.1234/Test"), "10.1234/test");
  assert.equal(isValidDoi("10.1234/test"), true);
  assert.equal(isValidDoi("not-a-doi"), false);
  assert.match(doiRoute, /payload\.auth/);
  assert.match(doiRoute, /collection: "references"/);
  assert.match(doiRoute, /api\.crossref\.org\/works/);
  assert.match(doiRoute, /docs\.find\(\(reference\) => normalizeDoi\(reference\.doi\) === doi\)/);
});

test("Preview builds do not run migrations and production requires DATABASE_URL", () => {
  assert.match(vercelBuild, /isProduction/);
  assert.match(vercelBuild, /DATABASE_URL is required for production migrations/);
  assert.match(vercelBuild, /Production deployment: running committed Payload migrations/);
  assert.match(vercelBuild, /skipping database migrations/);
  assert.doesNotMatch(vercelBuild, /generate:types/);
});
