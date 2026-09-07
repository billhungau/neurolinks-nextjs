export const MAX_AI_SOURCE_FILES = 10;
export const MAX_AI_SOURCE_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_AI_SOURCE_TOTAL_BYTES = 20 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const AI_SOURCE_ACCEPT = [
  ".pdf",
  ".txt",
  ".md",
  ".doc",
  ".docx",
  ...Object.values(MIME_BY_EXTENSION),
].join(",");

export function sourceExtension(filename: string): string {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

export function normalizedSourceMimeType(filename: string, browserType?: string | null): string | null {
  const byExtension = MIME_BY_EXTENSION[sourceExtension(filename)];
  if (!byExtension) return null;
  const normalizedBrowserType = browserType?.trim().toLowerCase();
  if (!normalizedBrowserType || normalizedBrowserType === "application/octet-stream") return byExtension;
  return Object.values(MIME_BY_EXTENSION).includes(normalizedBrowserType) ? normalizedBrowserType : byExtension;
}

export function validateSourceSelection(
  existingBytes: number,
  files: Array<Pick<File, "name" | "size" | "type">>,
): string | null {
  if (files.length > MAX_AI_SOURCE_FILES) return `Use up to ${MAX_AI_SOURCE_FILES} source files for one article.`;
  let total = existingBytes;
  for (const file of files) {
    if (!normalizedSourceMimeType(file.name, file.type)) return `${file.name} is not a supported source file.`;
    if (file.size > MAX_AI_SOURCE_FILE_BYTES) return `${file.name} is larger than 4 MB. Split or compress that source file before uploading.`;
    total += file.size;
  }
  if (total > MAX_AI_SOURCE_TOTAL_BYTES) return "Keep the combined source set under 20 MB.";
  return null;
}

export function sourceFileDataUrl(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}

export function uploadProgressPercent(fileIndex: number, fileFraction: number, totalFiles: number): number {
  if (totalFiles <= 0) return 30;
  const fraction = Math.max(0, Math.min(1, fileFraction));
  return Math.min(30, Math.round(((fileIndex + fraction) / totalFiles) * 30));
}

export function nextEstimatedGenerationProgress(value: number): number {
  if (value < 40) return 40;
  if (value < 75) return Math.min(75, value + 2);
  if (value < 90) return Math.min(90, value + 1);
  return Math.min(90, value);
}
