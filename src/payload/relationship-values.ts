export type RelationshipOption = {
  relationTo: string;
  value: string | number;
};

/**
 * Payload's admin relationship inputs use `{ relationTo, value }` options in
 * form state, including monomorphic relationships. Normalize legacy/raw IDs
 * so custom UI fields can safely append a relationship without it being
 * discarded during form serialization.
 */
export function relationshipOptions(
  value: unknown,
  relationTo: string,
): RelationshipOption[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): RelationshipOption[] => {
    if (typeof entry === "string" || typeof entry === "number") {
      return [{ relationTo, value: entry }];
    }
    if (!entry || typeof entry !== "object") return [];

    const item = entry as {
      id?: unknown;
      relationTo?: unknown;
      value?: unknown;
    };
    const itemRelation =
      typeof item.relationTo === "string" ? item.relationTo : relationTo;

    if (typeof item.value === "string" || typeof item.value === "number") {
      return [{ relationTo: itemRelation, value: item.value }];
    }
    if (item.value && typeof item.value === "object") {
      const nested = item.value as { id?: unknown };
      if (typeof nested.id === "string" || typeof nested.id === "number") {
        return [{ relationTo: itemRelation, value: nested.id }];
      }
    }
    if (typeof item.id === "string" || typeof item.id === "number") {
      return [{ relationTo: itemRelation, value: item.id }];
    }
    return [];
  });
}
