import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from "payload";

const SKIP_FLAG = "skipAISourceCleanup";

type CleanupPayload = {
  find: (args: Record<string, unknown>) => Promise<{ docs: Array<{ id: string | number }> }>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

function temporarySourcePayload(payload: Payload): CleanupPayload {
  // The temporary collection is new in this migration. Keep the type escape
  // isolated here so preview builds do not require a live database merely to
  // regenerate Payload's collection union before TypeScript can run.
  return payload as unknown as CleanupPayload;
}

async function deleteSessionDocuments(payload: Payload, sessionId: string) {
  const sourcePayload = temporarySourcePayload(payload);
  const docs = await sourcePayload.find({
    collection: "ai-source-documents",
    depth: 0,
    limit: 100,
    overrideAccess: true,
    where: { sessionId: { equals: sessionId } },
  });

  await Promise.all(
    docs.docs.map((doc) =>
      sourcePayload.delete({
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
  await temporarySourcePayload(req.payload).update({
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
