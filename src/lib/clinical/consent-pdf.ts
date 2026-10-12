import type { NativeField, NativeQuestionnaireSchema } from "@/lib/clinical/questionnaires/native-builder";
import { isSignatureStrokeData, type SignatureStrokeData } from "@/lib/clinical/signature-strokes";

type ConsentPdfInput = {
  patientName: string;
  patientEmail?: string | null;
  submittedAt: string;
  schema: NativeQuestionnaireSchema;
  answers: Record<string, unknown>;
};

type RenderBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "field"; label: string; answer: string }
  | { kind: "signature"; label: string; signature: SignatureStrokeData }
  | { kind: "pagebreak" };

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\n]/g, "?");
}

function esc(value: string) {
  return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function htmlToPlain(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wrap(value: string, max = 92) {
  const paragraphs = ascii(value).split(/\n+/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    if (!words.length) {
      if (lines.length && lines[lines.length - 1] !== "") lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      if (!line) line = word;
      else if (`${line} ${word}`.length <= max) line += ` ${word}`;
      else { lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    lines.push("");
  }
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.length ? lines : [""];
}

function text(font: "F1" | "F2", size: number, x: number, y: number, value: string) {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${esc(value)}) Tj ET`;
}

function line(x1: number, y1: number, x2: number, y2: number, gray = 0.86) {
  return `${gray} G 0.7 w ${x1} ${y1} m ${x2} ${y2} l S 0 G`;
}

function signatureCommands(signature: SignatureStrokeData, x: number, topY: number, width = 360, height = 82) {
  const out: string[] = ["0 G 1.15 w 1 J 1 j"];
  for (const stroke of signature.strokes) {
    if (!stroke.length) continue;
    const first = stroke[0];
    out.push(`${(x + first.x * width).toFixed(2)} ${(topY - first.y * height).toFixed(2)} m`);
    for (let index = 1; index < stroke.length; index += 1) {
      const point = stroke[index];
      out.push(`${(x + point.x * width).toFixed(2)} ${(topY - point.y * height).toFixed(2)} l`);
    }
    if (stroke.length > 1) out.push("S");
  }
  out.push("0 G");
  return out.join("\n");
}

function fieldAnswer(field: Exclude<NativeField, { kind: "paragraph" | "pagebreak" }>, answers: Record<string, unknown>) {
  if (field.kind === "single") {
    const selected = String(answers[field.id] ?? "");
    return field.options.find((option) => option.id === selected)?.label ?? selected;
  }
  if (field.kind === "multiple") {
    const selected = Array.isArray(answers[field.id]) ? (answers[field.id] as unknown[]).map(String) : [];
    return selected.map((id) => field.options.find((option) => option.id === id)?.label ?? id).join(", ");
  }
  if (field.kind === "matrix") {
    return field.rows.map((row) => {
      const selected = String(answers[`${field.id}:${row.id}`] ?? "");
      const label = field.columns.find((option) => option.id === selected)?.label ?? selected;
      return `${row.label}: ${label || "-"}`;
    }).join("\n");
  }
  return String(answers[field.id] ?? "").trim();
}

function blocksFromSchema(schema: NativeQuestionnaireSchema, answers: Record<string, unknown>): RenderBlock[] {
  const blocks: RenderBlock[] = [];
  for (const field of schema.fields) {
    if (field.kind === "pagebreak") {
      blocks.push({ kind: "pagebreak" });
      continue;
    }
    if (field.kind === "paragraph") {
      const source = field.richText?.trim() ? htmlToPlain(field.richText) : field.text;
      if (source.trim()) blocks.push({ kind: "paragraph", text: source.trim() });
      continue;
    }
    if (field.id === "patient_signature") {
      const value = answers[field.id];
      if (isSignatureStrokeData(value)) blocks.push({ kind: "signature", label: field.label, signature: value });
      else blocks.push({ kind: "field", label: field.label, answer: "Signature unavailable" });
      continue;
    }
    blocks.push({ kind: "field", label: field.label, answer: fieldAnswer(field, answers) || "-" });
  }
  return blocks;
}

function renderPages(input: ConsentPdfInput) {
  const pages: string[][] = [[]];
  let page = pages[0];
  let y = 760;
  const newPage = () => { page = []; pages.push(page); y = 760; };
  const ensure = (height: number) => { if (y - height < 55) newPage(); };

  page.push(text("F2", 18, 48, y, input.schema.patientFacingName || input.schema.title || "Consent Form"));
  y -= 24;
  page.push(text("F1", 9.5, 48, y, `Patient: ${input.patientName}`)); y -= 14;
  if (input.patientEmail) { page.push(text("F1", 9, 48, y, `Email: ${input.patientEmail}`)); y -= 13; }
  page.push(text("F1", 9, 48, y, `Submitted: ${input.submittedAt}`)); y -= 17;
  page.push(line(48, y, 548, y)); y -= 18;

  for (const block of blocksFromSchema(input.schema, input.answers)) {
    if (block.kind === "pagebreak") { if (page.length) newPage(); continue; }
    if (block.kind === "paragraph") {
      const lines = wrap(block.text, 92);
      for (const row of lines) {
        ensure(14);
        if (!row) { y -= 7; continue; }
        page.push(text("F1", 9.4, 48, y, row)); y -= 12.5;
      }
      y -= 8;
      continue;
    }
    if (block.kind === "signature") {
      ensure(120);
      page.push(text("F2", 9.5, 48, y, block.label)); y -= 10;
      page.push(line(58, y - 86, 430, y - 86, 0.9));
      page.push(signatureCommands(block.signature, 62, y - 3));
      y -= 100;
      continue;
    }
    const labelLines = wrap(block.label, 78);
    const answerLines = wrap(block.answer, 88);
    ensure((labelLines.length + answerLines.length) * 13 + 16);
    for (const row of labelLines) { page.push(text("F2", 9.5, 48, y, row)); y -= 12.5; }
    for (const row of answerLines) { page.push(text("F1", 9.2, 58, y, row)); y -= 12; }
    y -= 4;
    page.push(line(48, y, 548, y, 0.92)); y -= 12;
  }

  return pages;
}

export function buildConsentPdf(input: ConsentPdfInput): Uint8Array {
  const pages = renderPages(input);
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  const pageRefs: number[] = [];
  let objectNo = 5;
  pages.forEach((commands, index) => {
    commands.push(text("F1", 8, 48, 28, `NeuroLinks  |  Page ${index + 1} of ${pages.length}`));
    const pageNo = objectNo++;
    const contentNo = objectNo++;
    pageRefs.push(pageNo);
    const stream = commands.join("\n");
    objects[contentNo] = `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`;
    objects[pageNo] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNo} 0 R >>`;
  });
  objects[2] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`;

  let pdf = "%PDF-1.4\n%NLNK\n";
  const offsets: number[] = [0];
  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, "ascii");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Uint8Array(Buffer.from(pdf, "ascii"));
}
