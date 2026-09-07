import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from "payload";

const SKIP_FLAG = "skipAISourceCleanup";

async function deleteSessionDocuments(payload: Payload, sessionId: string) {
  const docs = await payload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    where: { sessionId: { equals: sessionId } },
  });

  await Promise.all(
    docs.docs.map((doc) =>
      payload.delete({
        collection: "ai-source-documents",
        id: doc.id,
        overrideAccess: true,
      }),
    ),
  );
}

export const cleanupAISourcesAfterPublish: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (context?.[SKIP_FLAG]) return doc;
  if (doc?._status !== "published") return doc;
  const sessionId = typeof doc?.aiSourceSession === "string" ? doc.aiSourceSession.trim() : "";
  if (!sessionId) return doc;

  await deleteSessionDocuments(req.payload, sessionId);
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
  if (sessionId) await deleteSessionDocuments(req.payload, sessionId);
  return doc;
};
