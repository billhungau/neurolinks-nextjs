import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from "payload";

const SKIP_FLAG = "skipAISourceCleanup";

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

export const cleanupAISourcesAfterPublish: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.[SKIP_FLAG]) return doc;
  if (doc?._status !== "published") return doc;
  const sessionId = typeof doc?.aiSourceSession === "string" ? doc.aiSourceSession.trim() : "";
  if (!sessionId) return doc;

  await deleteAISourceSession(req.payload, sessionId);
  await req.payload.update({
    collection: "insights",
    id: doc.id,
    data: { aiSourceSession: null },
    depth: 0,
    overrideAccess: true,
    context: { [SKIP_FLAG]: true },
  });

  return doc;
};

export const cleanupAISourcesAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const sessionId = typeof doc?.aiSourceSession === "string" ? doc.aiSourceSession.trim() : "";
  if (sessionId) await deleteAISourceSession(req.payload, sessionId);
  return doc;
};
