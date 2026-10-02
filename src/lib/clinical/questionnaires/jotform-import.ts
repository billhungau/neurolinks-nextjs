import { clinicalSupabaseRequest } from "../supabase";

export const IMPORTED_QUESTIONNAIRES = {
  bai: { name: "Beck Anxiety Inventory", jotformId: "230814782284258", maxScore: 63 },
  ybocs: { name: "Yale-Brown Obsessive Compulsive Scale (Y-BOCS)", jotformId: "221134747183050", maxScore: 40 },
  pss: { name: "PTSD Symptom Scale (PSS)", jotformId: "223175090048048", maxScore: null },
} as const;

export type ImportedQuestionnaireCode = keyof typeof IMPORTED_QUESTIONNAIRES;

type RawQuestion = Record<string, unknown> & {
  qid?: string | number;
  type?: string;
  text?: string;
  order?: string | number;
  options?: string;
  mrows?: string;
  mcolumns?: string;
  inputType?: string;
  required?: string;
};

export type ImportedField =
  | { kind: "display"; qid: string; text: string; order: number }
  | { kind: "radio"; qid: string; text: string; order: number; options: string[]; required: boolean }
  | { kind: "checkbox"; qid: string; text: string; order: number; options: string[]; required: boolean }
  | { kind: "text"; qid: string; text: string; order: number; required: boolean }
  | { kind: "textarea"; qid: string; text: string; order: number; required: boolean }
  | { kind: "matrix_radio"; qid: string; text: string; order: number; rows: string[]; columns: string[]; required: boolean };

export type ImportedQuestionnaireSchema = {
  source: "jotform";
  jotformId: string;
  importedAt: string;
  fields: ImportedField[];
};

function getApiKey() {
  const key = process.env.JOTFORM_API_KEY?.trim();
  if (!key) throw new Error("[clinical-jotform] JOTFORM_API_KEY is not configured.");
  return key;
}

function splitPipe(value: unknown): string[] {
  return typeof value === "string"
    ? value.split("|").map((v) => v.trim()).filter(Boolean)
    : [];
}

function plainText(value: unknown): string {
  return String(value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function isTechnical(text: string, type: string) {
  const normalized = text.trim().toLowerCase();
  if (type === "control_button" || type === "control_pagebreak") return true;
  return [
    "name",
    "full name",
    "total score",
    "obsession score",
    "compulsion score",
    "pss total score",
    "patient link token",
    "submit",
  ].includes(normalized);
}

function normalize(raw: RawQuestion): ImportedField | null {
  const qid = String(raw.qid ?? "");
  const type = String(raw.type ?? "");
  const text = plainText(raw.text);
  const order = Number(raw.order ?? 0);
  const required = String(raw.required ?? "").toLowerCase() === "yes";

  if (!qid || isTechnical(text, type)) return null;

  if (type === "control_text" || type === "control_head") {
    return text ? { kind: "display", qid, text, order } : null;
  }
  if (type === "control_radio") {
    const options = splitPipe(raw.options);
    return text && options.length ? { kind: "radio", qid, text, order, options, required } : null;
  }
  if (type === "control_checkbox") {
    const options = splitPipe(raw.options);
    return text && options.length ? { kind: "checkbox", qid, text, order, options, required } : null;
  }
  if (type === "control_textbox") {
    return text ? { kind: "text", qid, text, order, required } : null;
  }
  if (type === "control_textarea") {
    return text ? { kind: "textarea", qid, text, order, required } : null;
  }
  if (type === "control_matrix") {
    const rows = splitPipe(raw.mrows);
    const columns = splitPipe(raw.mcolumns);
    const inputType = String(raw.inputType ?? "Radio Button").toLowerCase();
    return text && rows.length && columns.length && inputType === "radio button"
      ? { kind: "matrix_radio", qid, text, order, rows, columns, required }
      : null;
  }
  return null;
}

export function isImportedCode(code: string): code is ImportedQuestionnaireCode {
  return code in IMPORTED_QUESTIONNAIRES;
}

export async function fetchImportedSchema(code: ImportedQuestionnaireCode): Promise<ImportedQuestionnaireSchema> {
  const config = IMPORTED_QUESTIONNAIRES[code];
  const url = new URL(`https://api.jotform.com/form/${config.jotformId}/questions`);
  url.searchParams.set("apiKey", getApiKey());

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`[clinical-jotform] HTTP ${response.status}`);

  const payload = (await response.json()) as {
    responseCode?: number;
    content?: Record<string, RawQuestion>;
  };
  if (payload.responseCode !== 200 || !payload.content) {
    throw new Error("[clinical-jotform] Invalid questions response.");
  }

  const fields = Object.values(payload.content)
    .map(normalize)
    .filter((field): field is ImportedField => Boolean(field))
    .sort((a, b) => a.order - b.order);

  if (!fields.length) throw new Error("[clinical-jotform] No supported fields found.");

  return {
    source: "jotform",
    jotformId: config.jotformId,
    importedAt: new Date().toISOString(),
    fields,
  };
}

export async function ensureImportedQuestionnaire(code: ImportedQuestionnaireCode) {
  const config = IMPORTED_QUESTIONNAIRES[code];
  const schema = await fetchImportedSchema(code);
  let maxScore: number | null = config.maxScore;

  if (code === "pss") {
    const matrix = schema.fields.find((field) => field.kind === "matrix_radio");
    if (matrix?.kind === "matrix_radio") maxScore = matrix.rows.length * 3;
  }

  await clinicalSupabaseRequest<unknown>("questionnaires?on_conflict=code,version", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: JSON.stringify({
      code,
      version: 1,
      name: config.name,
      max_score: maxScore,
      active: true,
      metadata: {
        short_name: code === "ybocs" ? "Y-BOCS" : code.toUpperCase(),
        source: "jotform",
        jotform_form_id: config.jotformId,
        schema,
      },
    }),
  });
}

function numericPrefix(value: string): number | null {
  const match = value.trim().match(/^([0-9]+)(?:[.\s]|$)/);
  return match ? Number(match[1]) : null;
}

export function scoreImportedQuestionnaire(
  code: ImportedQuestionnaireCode,
  schema: ImportedQuestionnaireSchema,
  answers: Record<string, unknown>,
) {
  let total = 0;
  const clinicalFlags: Record<string, unknown> = {};
  const ybocsScores: number[] = [];

  for (const field of schema.fields) {
    if (field.kind === "radio") {
      const selected = String(answers[field.qid] ?? "");
      const optionIndex = field.options.indexOf(selected);
      if (field.required && optionIndex < 0) throw new Error("Incomplete response.");
      if (optionIndex < 0) continue;

      if (code === "ybocs") {
        total += optionIndex;
        ybocsScores.push(optionIndex);
      } else {
        const score = numericPrefix(selected);
        if (score !== null) total += score;
      }
    }

    if (field.kind === "matrix_radio") {
      field.rows.forEach((_, rowIndex) => {
        const selected = String(answers[`${field.qid}:${rowIndex}`] ?? "");
        const columnIndex = field.columns.indexOf(selected);
        if (field.required && columnIndex < 0) throw new Error("Incomplete response.");
        if (columnIndex < 0) return;
        total += numericPrefix(selected) ?? columnIndex;
      });
    }
  }

  if (code === "ybocs") {
    clinicalFlags.obsession_score = ybocsScores.slice(0, 5).reduce((a, b) => a + b, 0);
    clinicalFlags.compulsion_score = ybocsScores.slice(5, 10).reduce((a, b) => a + b, 0);
  }

  return { total, severity: null as string | null, clinicalFlags };
}
