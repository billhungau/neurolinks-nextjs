import assert from "node:assert/strict";
import test from "node:test";
import { buildSourceFetchPlan, isTrustedVercelBlobHostname } from "./source-fetch.ts";

test("relative Payload source forwards CMS cookie but not Blob credentials", () => {
  const plan = buildSourceFetchPlan({
    sourceUrl: "/payload-api/ai-source-documents/file/test.txt",
    requestOrigin: "https://preview.example.vercel.app",
    cmsCookie: "payload-token=abc",
    blobToken: "blob-secret",
  });

  assert.equal(plan.kind, "relative");
  assert.equal(plan.url, "https://preview.example.vercel.app/payload-api/ai-source-documents/file/test.txt");
  assert.deepEqual(plan.headers, { cookie: "payload-token=abc" });
  assert.equal(plan.headers?.Authorization, undefined);
});

test("trusted Vercel Blob source gets bearer token but no CMS cookie", () => {
  const plan = buildSourceFetchPlan({
    sourceUrl: "https://abc123.public.blob.vercel-storage.com/test.txt",
    requestOrigin: "https://preview.example.vercel.app",
    cmsCookie: "payload-token=abc",
    blobToken: "blob-secret",
  });

  assert.equal(plan.kind, "vercel-blob");
  assert.deepEqual(plan.headers, { Authorization: "Bearer blob-secret" });
  assert.equal(plan.headers?.cookie, undefined);
});

test("Vercel Blob root hostname is trusted", () => {
  const plan = buildSourceFetchPlan({
    sourceUrl: "https://blob.vercel-storage.com/test.txt",
    requestOrigin: "https://preview.example.vercel.app",
    cmsCookie: "payload-token=abc",
    blobToken: "blob-secret",
  });

  assert.equal(plan.kind, "vercel-blob");
  assert.deepEqual(plan.headers, { Authorization: "Bearer blob-secret" });
});

test("missing Blob token fails closed for a Vercel Blob source", () => {
  assert.throws(() => buildSourceFetchPlan({
    sourceUrl: "https://abc123.private.blob.vercel-storage.com/test.pdf",
    requestOrigin: "https://preview.example.vercel.app",
  }), /AI_BLOB_NOT_CONFIGURED/);
});

test("arbitrary absolute URL never receives credentials", () => {
  const plan = buildSourceFetchPlan({
    sourceUrl: "https://example.com/source.pdf",
    requestOrigin: "https://preview.example.vercel.app",
    cmsCookie: "payload-token=abc",
    blobToken: "blob-secret",
  });

  assert.equal(plan.kind, "unsupported-absolute");
  assert.equal(plan.headers, undefined);
});

test("malformed absolute URL fails safely", () => {
  assert.throws(() => buildSourceFetchPlan({
    sourceUrl: "https://%",
    requestOrigin: "https://preview.example.vercel.app",
    blobToken: "blob-secret",
  }));
});

test("Vercel Blob hostname check is suffix-safe", () => {
  assert.equal(isTrustedVercelBlobHostname("abc.blob.vercel-storage.com"), true);
  assert.equal(isTrustedVercelBlobHostname("ABC.BLOB.VERCEL-STORAGE.COM."), true);
  assert.equal(isTrustedVercelBlobHostname("blob.vercel-storage.com"), true);
  assert.equal(isTrustedVercelBlobHostname("abc.blob.vercel-storage.com.evil.example"), false);
  assert.equal(isTrustedVercelBlobHostname("evilblob.vercel-storage.com"), false);
});
