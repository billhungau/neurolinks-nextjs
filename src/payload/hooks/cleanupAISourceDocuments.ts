import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, Payload } from "payload";

const EXPIRED_CLEANUP_LIMIT = 50;

export async function deleteAISourceSession(payload: Payload, sessionId: string) {
  const docs = await payload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    where: { sessionId: { equals: sessionId } },
  });

  for (const doc of docs.docs) {
    await payload.delete({
      collection: "ai-source-documents",
      id: doc.id,
      overrideAccess: true,
    });
  }
}

export async function deleteExpiredAISources(payload: Payload, now = new Date()) {
  const expired = await payload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: EXPIRED_CLEANUP_LIMIT,
    overrideAccess: true,
    where: { expiresAt: { less_than_equal: now.toISOString() } },
  });

  for (const doc of expired.docs) {
    await payload.delete({
      collection: "ai-source-documents",
      id: doc.id,
      overrideAccess: true,
    });
  }
  return expired.docs.length;
}

export const cleanupExpiredAISourcesAfterUpload: CollectionAfterChangeHook = async ({ req, doc }) => {
  try {
    await deleteExpiredAISources(req.payload);
  } catch (error) {
    // Expiry cleanup is a safety net; never make a newly uploaded source fail
    // because cleanup of an unrelated old source encountered a transient error.
    console.error("[ai-source-documents] expired-source cleanup failed", error);
  }
  return doc;
};

/**
 * Publishing must not wait for Blob deletion. Clear the hidden session pointer
 * inside the same Insight write and let the existing seven-day expiry remove
 * the temporary source documents independently.
 */
export const clearAISourceSessionBeforePublish: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data?._status !== "published") return data;
  const sessionId = typeof (data?.aiSourceSession ?? originalDoc?.aiSourceSession) === "string"
    ? String(data?.aiSourceSession ?? originalDoc?.aiSourceSession).trim()
    : "";
  if (!sessionId) return data;
  return { ...data, aiSourceSession: null };
};

export const cleanupAISourcesAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const sessionId = typeof doc?.aiSourceSession === "string" ? doc.aiSourceSession.trim() : "";
  if (sessionId) await deleteAISourceSession(req.payload, sessionId);
  return doc;
};
