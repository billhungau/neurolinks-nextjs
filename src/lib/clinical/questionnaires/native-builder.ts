import { BDI2_INSTRUCTIONS, BDI2_ITEMS, BDI2_NAME } from "./bdii-definition";

export type NativeOption = {
  id: string;
  label: string;
  score: number;
};

export type NativeField =
  | { kind: "paragraph"; id: string; text: string }
  | { kind: "pagebreak"; id: string }
  | { kind: "single"; id: string; label: string; required: boolean; options: NativeOption[] }
  | { kind: "multiple"; id: string; label: string; required: boolean; options: NativeOption[] }
  | { kind: "matrix"; id: string; label: string; required: boolean; rows: Array<{ id: string; label: string }>; columns: NativeOption[] };

export type SeverityBand = {
  min: number;
  max: number;
  label: string;
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

export function scoreNativeQuestionnaire(schema: NativeQuestionnaireSchema, answers: Record<string, unknown>) {
  let total = 0;

  for (const field of schema.fields) {
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
  }

  const severity = schema.scoring.severityBands.find((band) => total >= band.min && total <= band.max)?.label ?? null;
  return { total, severity, clinicalFlags: {}, storedAnswers: answers };
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
