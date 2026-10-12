const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3",
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function plainTextToRichHtml(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function sanitizeRichHtml(value: string) {
  if (!value) return "";
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-zA-Z0-9]+)(?:\s[^>]*)?>/g, (match, rawTag: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      const closing = /^<\//.test(match);
      if (tag === "br") return closing ? "" : "<br>";
      return closing ? `</${tag}>` : `<${tag}>`;
    });
}

export function richHtmlToPlainText(value: string) {
  return sanitizeRichHtml(value)
    .replace(/<br>/gi, "\n")
    .replace(/<\/(p|h2|h3|li)>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
