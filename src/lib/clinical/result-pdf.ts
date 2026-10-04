export type QuestionnairePdfItem = {
  label: string;
  answer: string;
  score: number | null;
};

export type QuestionnairePdfData = {
  questionnaireName: string;
  questionnaireCode: string;
  patientName: string;
  patientEmail?: string | null;
  submittedAt: string;
  totalScore: number;
  severity?: string | null;
  obsessionScore?: number | null;
  compulsionScore?: number | null;
  items: QuestionnairePdfItem[];
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN_X = 54;
const TOP_Y = 738;
const BOTTOM_Y = 56;
const TEXT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E\n]/g, "?");
}

function escapePdfText(value: string) {
  return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(value: string, fontSize = 10, width = TEXT_WIDTH) {
  const normalized = ascii(value).replace(/\s+/g, " ").trim();
  if (!normalized) return [""];
  const approxCharWidth = fontSize * 0.52;
  const maxChars = Math.max(20, Math.floor(width / approxCharWidth));
  const words = normalized.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    if (word.length <= maxChars) {
      line = word;
      continue;
    }
    for (let i = 0; i < word.length; i += maxChars) {
      const chunk = word.slice(i, i + maxChars);
      if (chunk.length === maxChars) lines.push(chunk);
      else line = chunk;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Vancouver",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

type PdfPage = { operations: string[] };

function textOp(text: string, x: number, y: number, size: number, bold = false) {
  return `BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`;
}

export function createQuestionnaireResultPdf(data: QuestionnairePdfData): Uint8Array {
  const pages: PdfPage[] = [{ operations: [] }];
  let page = pages[0];
  let y = TOP_Y;

  function newPage() {
    page = { operations: [] };
    pages.push(page);
    y = TOP_Y;
  }

  function ensureSpace(height: number) {
    if (y - height < BOTTOM_Y) newPage();
  }

  function addText(text: string, options: { size?: number; bold?: boolean; gapAfter?: number; indent?: number } = {}) {
    const size = options.size ?? 10;
    const lineHeight = size * 1.35;
    const indent = options.indent ?? 0;
    const lines = wrapText(text, size, TEXT_WIDTH - indent);
    ensureSpace(lines.length * lineHeight + (options.gapAfter ?? 0));
    for (const line of lines) {
      page.operations.push(textOp(line, MARGIN_X + indent, y, size, options.bold));
      y -= lineHeight;
    }
    y -= options.gapAfter ?? 0;
  }

  addText("NeuroLinks", { size: 16, bold: true, gapAfter: 2 });
  addText("Questionnaire result", { size: 9, gapAfter: 14 });
  addText(data.questionnaireName, { size: 17, bold: true, gapAfter: 10 });
  addText(`Patient: ${data.patientName}`, { size: 11, bold: true, gapAfter: 2 });
  if (data.patientEmail) addText(`Email: ${data.patientEmail}`, { size: 9, gapAfter: 2 });
  addText(`Submitted: ${formatDate(data.submittedAt)}`, { size: 9, gapAfter: 12 });

  const summaryParts = [`Total score: ${data.totalScore}`];
  if (data.severity) summaryParts.push(`Severity: ${data.severity}`);
  if (data.questionnaireCode === "ybocs") {
    if (data.obsessionScore !== null && data.obsessionScore !== undefined) summaryParts.push(`Obsession: ${data.obsessionScore}`);
    if (data.compulsionScore !== null && data.compulsionScore !== undefined) summaryParts.push(`Compulsion: ${data.compulsionScore}`);
  }
  addText(summaryParts.join("   |   "), { size: 11, bold: true, gapAfter: 16 });
  addText("Item responses and scores", { size: 13, bold: true, gapAfter: 8 });

  if (!data.items.length) {
    addText("Item-level questionnaire definition is unavailable for this submission.", { size: 10 });
  } else {
    data.items.forEach((item, index) => {
      const labelLines = wrapText(`${index + 1}. ${item.label}`, 10, TEXT_WIDTH - 54);
      const answerLines = wrapText(item.answer || "-", 9, TEXT_WIDTH - 54);
      const needed = labelLines.length * 13.5 + answerLines.length * 12.2 + 12;
      ensureSpace(needed);
      for (const line of labelLines) {
        page.operations.push(textOp(line, MARGIN_X, y, 10, true));
        y -= 13.5;
      }
      for (const line of answerLines) {
        page.operations.push(textOp(line, MARGIN_X + 12, y, 9, false));
        y -= 12.2;
      }
      const scoreText = item.score === null ? "Score: -" : `Score: ${item.score}`;
      page.operations.push(textOp(scoreText, PAGE_WIDTH - MARGIN_X - 72, y + 12.2, 9, true));
      y -= 8;
    });
  }

  const totalPages = pages.length;
  pages.forEach((pdfPage, index) => {
    pdfPage.operations.push(textOp(`Confidential clinical record - Page ${index + 1} of ${totalPages}`, MARGIN_X, 32, 8, false));
  });

  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  const pageRefs: string[] = [];
  pages.forEach((pdfPage, index) => {
    const pageObjectNumber = 5 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageRefs.push(`${pageObjectNumber} 0 R`);
    const content = `${pdfPage.operations.join("\n")}\n`;
    objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] = `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}endstream`;
  });
  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n%NeuroLinks\n";
  const offsets: number[] = [0];
  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, "ascii");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return new Uint8Array(Buffer.from(pdf, "ascii"));
}
