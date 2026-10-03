import { BDI2_INSTRUCTIONS, BDI2_ITEMS, BDI2_NAME } from "./bdii-definition";
import type {
  ImportedField,
  ImportedQuestionnaireCode,
  ImportedQuestionnaireSchema,
} from "./jotform-import";

export type NativeOption = {
  id: string;
  label: string;
  score: number;
};

export type NativeField =
  | { kind: "paragraph"; id: string; text: string }
  | { kind: "pagebreak"; id: string }
  | { kind: "text"; id: string; label: string; required: boolean; placeholder?: string }
  | { kind: "textarea"; id: string; label: string; required: boolean; placeholder?: string }
  | { kind: "single"; id: string; label: string; required: boolean; options: NativeOption[] }
  | { kind: "multiple"; id: string; label: string; required: boolean; options: NativeOption[] }
  | { kind: "matrix"; id: string; label: string; required: boolean; rows: Array<{ id: string; label: string }>; columns: NativeOption[] };

export type SeverityBand = {
  min: number;
  max: number;
  label: string;
};

export type NativeSubscale = {
  key: string;
  label: string;
  fieldIds: string[];
};

export type NativeQuestionnaireSchema = {
  source: "native";
  title: string;
  patientFacingName: string;
  description: string;
  fields: NativeField[];
  scoring: {
    method: "sum";
    severityBands: SeverityBand[];
    subscales?: NativeSubscale[];
  };
};

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40) || "field";
}

function numericPrefix(value: string): number | null {
  const match = value.trim().match(/^([0-9]+)(?:[.\s]|$)/);
  return match ? Number(match[1]) : null;
}

function importedOptionScore(code: ImportedQuestionnaireCode, label: string, index: number, scored: boolean) {
  if (!scored) return 0;
  if (code === "ybocs") return index;
  return numericPrefix(label) ?? index;
}

function importedOption(id: string, label: string, score: number): NativeOption {
  return { id, label, score };
}

export function blankNativeSchema(title = "Untitled questionnaire"): NativeQuestionnaireSchema {
  return {
    source: "native",
    title,
    patientFacingName: title,
    description: "",
    fields: [],
    scoring: { method: "sum", severityBands: [] },
  };
}

export function bdi2NativeSchema(): NativeQuestionnaireSchema {
  return {
    source: "native",
    title: BDI2_NAME,
    patientFacingName: "Depression questionnaire",
    description: BDI2_INSTRUCTIONS,
    fields: [
      { kind: "paragraph", id: "instructions", text: BDI2_INSTRUCTIONS },
      ...BDI2_ITEMS.map((item) => ({
        kind: "single" as const,
        id: item.key,
        label: item.title,
        required: true,
        options: item.options.map((option, index) => ({
          id: `${item.key}_${index}`,
          label: option.label,
          score: option.value,
        })),
      })),
    ],
    scoring: {
      method: "sum",
      severityBands: [
        { min: 0, max: 13, label: "Minimal" },
        { min: 14, max: 19, label: "Mild" },
        { min: 20, max: 28, label: "Moderate" },
        { min: 29, max: 63, label: "Severe" },
      ],
    },
  };
}

function convertImportedField(code: ImportedQuestionnaireCode, field: ImportedField): NativeField[] {
  const id = `jf_${field.qid}`;

  if (field.kind === "display") return [{ kind: "paragraph", id, text: field.text }];
  if (field.kind === "pagebreak") return [{ kind: "pagebreak", id }];
  if (field.kind === "text") return [{ kind: "text", id, label: field.text, required: field.required }];
  if (field.kind === "textarea") return [{ kind: "textarea", id, label: field.text, required: field.required }];

  if (field.kind === "radio" || field.kind === "select") {
    const scored = code !== "pss";
    return [{
      kind: "single",
      id,
      label: field.text,
      required: field.required,
      options: field.options.map((label, index) => importedOption(`${id}_o${index}`, label, importedOptionScore(code, label, index, scored))),
    }];
  }

  if (field.kind === "checkbox") {
    return [{
      kind: "multiple",
      id,
      label: field.text,
      required: field.required,
      options: field.options.map((label, index) => importedOption(`${id}_o${index}`, label, code === "pss" ? 0 : (numericPrefix(label) ?? 0))),
    }];
  }

  if (field.kind === "matrix_radio") {
    return [{
      kind: "matrix",
      id,
      label: field.text,
      required: field.required,
      rows: field.rows.map((label, index) => ({ id: `r${index}`, label })),
      columns: field.columns.map((label, index) => importedOption(`${id}_c${index}`, label, importedOptionScore(code, label, index, true))),
    }];
  }

  // Checkbox matrices are uncommon in the current instruments. Represent each
  // row as a separate multiple-choice field so no patient response is lost.
  return field.rows.map((row, rowIndex) => ({
    kind: "multiple" as const,
    id: `${id}_r${rowIndex}`,
    label: `${field.text}${field.text ? " — " : ""}${row}`,
    required: field.required,
    options: field.columns.map((label, columnIndex) => importedOption(`${id}_r${rowIndex}_c${columnIndex}`, label, 0)),
  }));
}

export function nativeSchemaFromImported(
  code: ImportedQuestionnaireCode,
  imported: ImportedQuestionnaireSchema,
  title: string,
): NativeQuestionnaireSchema {
  const fields = imported.fields.flatMap((field) => convertImportedField(code, field));
  const scoredSingles = fields.filter((field): field is Extract<NativeField, { kind: "single" }> =>
    field.kind === "single" && field.options.some((option) => option.score > 0),
  );

  const patientFacingName = code === "bai"
    ? "Anxiety questionnaire"
    : code === "ybocs"
      ? "OCD questionnaire"
      : "PTSD questionnaire";

  const subscales: NativeSubscale[] | undefined = code === "ybocs" && scoredSingles.length >= 10
    ? [
        { key: "obsession_score", label: "Obsession score", fieldIds: scoredSingles.slice(0, 5).map((field) => field.id) },
        { key: "compulsion_score", label: "Compulsion score", fieldIds: scoredSingles.slice(5, 10).map((field) => field.id) },
      ]
    : undefined;

  return {
    source: "native",
    title,
    patientFacingName,
    description: "",
    fields,
    scoring: {
      method: "sum",
      severityBands: [],
      ...(subscales ? { subscales } : {}),
    },
  };
}

function scoredOptions(id: string): NativeOption[] {
  return [0, 1, 2, 3].map((score) => ({
    id: `${id}_${score}`,
    label: `Option ${score + 1}`,
    score,
  }));
}

export function nativeFieldTemplate(kind: NativeField["kind"], index: number): NativeField {
  const id = `${kind}_${Date.now()}_${index}`;
  if (kind === "paragraph") return { kind: "paragraph", id, text: "Instructions" };
  if (kind === "pagebreak") return { kind: "pagebreak", id };
  if (kind === "text") return { kind: "text", id, label: "Short answer", required: false };
  if (kind === "textarea") return { kind: "textarea", id, label: "Long answer", required: false };
  if (kind === "matrix") {
    return {
      kind: "matrix",
      id,
      label: "Matrix question",
      required: true,
      rows: [{ id: `${id}_r1`, label: "Item 1" }],
      columns: [0, 1, 2, 3].map((score) => ({ id: `${id}_c${score}`, label: String(score), score })),
    };
  }
  if (kind === "single") {
    return {
      kind: "single",
      id,
      label: "Question",
      required: true,
      options: scoredOptions(id),
    };
  }
  return {
    kind: "multiple",
    id,
    label: "Question",
    required: true,
    options: scoredOptions(id),
  };
}

function fieldScore(field: NativeField, answers: Record<string, unknown>) {
  let total = 0;
  if (field.kind === "single") {
    const selected = String(answers[field.id] ?? "");
    const option = field.options.find((candidate) => candidate.id === selected);
    if (field.required && !option) throw new Error("Incomplete response.");
    if (option) total += option.score;
  }
  if (field.kind === "multiple") {
    const answerValue = answers[field.id];
    const raw = Array.isArray(answerValue) ? answerValue.map(String) : [];
    if (field.required && raw.length === 0) throw new Error("Incomplete response.");
    for (const selected of raw) {
      const option = field.options.find((candidate) => candidate.id === selected);
      if (option) total += option.score;
    }
  }
  if (field.kind === "matrix") {
    for (const row of field.rows) {
      const selected = String(answers[`${field.id}:${row.id}`] ?? "");
      const option = field.columns.find((candidate) => candidate.id === selected);
      if (field.required && !option) throw new Error("Incomplete response.");
      if (option) total += option.score;
    }
  }
  if (field.kind === "text" || field.kind === "textarea") {
    const value = String(answers[field.id] ?? "").trim();
    if (field.required && !value) throw new Error("Incomplete response.");
  }
  return total;
}

export function scoreNativeQuestionnaire(schema: NativeQuestionnaireSchema, answers: Record<string, unknown>) {
  let total = 0;
  const scoresByField = new Map<string, number>();

  for (const field of schema.fields) {
    const score = fieldScore(field, answers);
    scoresByField.set(field.id, score);
    total += score;
  }

  const clinicalFlags: Record<string, unknown> = {};
  for (const subscale of schema.scoring.subscales ?? []) {
    clinicalFlags[subscale.key] = subscale.fieldIds.reduce((sum, fieldId) => sum + (scoresByField.get(fieldId) ?? 0), 0);
  }

  const severity = schema.scoring.severityBands.find((band) => total >= band.min && total <= band.max)?.label ?? null;
  return { total, severity, clinicalFlags, storedAnswers: answers };
}

export function maxNativeScore(schema: NativeQuestionnaireSchema) {
  let total = 0;
  for (const field of schema.fields) {
    if (field.kind === "single") total += Math.max(0, ...field.options.map((option) => option.score));
    if (field.kind === "multiple") total += field.options.reduce((sum, option) => sum + Math.max(0, option.score), 0);
    if (field.kind === "matrix") total += field.rows.length * Math.max(0, ...field.columns.map((option) => option.score));
  }
  return total;
}

export function sanitizeQuestionnaireCode(value: string) {
  return slug(value).replace(/_/g, "-").slice(0, 50);
}
