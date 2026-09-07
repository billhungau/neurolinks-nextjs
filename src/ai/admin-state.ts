export function articleAssistantDocumentKey(
  collectionSlug: string | null | undefined,
  documentId: string | number | null | undefined,
  pathname: string,
): string {
  return `${collectionSlug || "insights"}:${documentId ?? "new"}:${pathname}`;
}

export function canApplyGeneratedResult(generatedFor: string, currentDocumentKey: string): boolean {
  return !generatedFor || generatedFor === currentDocumentKey;
}
