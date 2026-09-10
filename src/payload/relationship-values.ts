export type RelationshipID = string | number;

/**
 * Payload stores monomorphic relationship values as raw IDs in form state.
 * The relationship input only wraps them as `{ relationTo, value }` options
 * for display. Normalize any option-shaped legacy values before appending.
 */
export function relationshipIds(value: unknown): RelationshipID[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): RelationshipID[] => {
    if (typeof entry === "string" || typeof entry === "number") {
      return [entry];
    }
    if (!entry || typeof entry !== "object") return [];

    const item = entry as {
      id?: unknown;
      relationTo?: unknown;
      value?: unknown;
    };
    if (typeof item.value === "string" || typeof item.value === "number") {
      return [item.value];
    }
    if (item.value && typeof item.value === "object") {
      const nested = item.value as { id?: unknown };
      if (typeof nested.id === "string" || typeof nested.id === "number") {
        return [nested.id];
      }
    }
    if (typeof item.id === "string" || typeof item.id === "number") {
      return [item.id];
    }
    return [];
  });
}
