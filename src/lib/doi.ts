export function normalizeDoi(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .replace(/[\s.,;]+$/g, "")
    .trim()
    .toLowerCase();
}

export function isValidDoi(value: string): boolean {
  return /^10\.\d{4,9}\/\S+$/i.test(value);
}
