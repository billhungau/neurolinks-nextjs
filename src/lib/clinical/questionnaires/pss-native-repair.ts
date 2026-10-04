import type { NativeQuestionnaireSchema } from "./native-builder";

const PSS_SYMPTOM_ROWS = [
  "Having upsetting thought or images about the traumatic event that come into your head when you did not want them to",
  "Having bad dreams or nightmares about the traumatic event",
  "Reliving the traumatic event (acting as if it were happening again)",
  "Feeling emotionally upset when you are reminded of the traumatic event",
  "Experiencing physical reactions when reminded of the traumatic event (sweating, increased heart rate)",
  "Trying not to think or talk about the traumatic event",
  "Trying to avoid activities or people that remind you of the traumatic event",
  "Not being able to remember an important part of the traumatic event",
  "Having much less interest or participating much less often in important activities",
  "Feeling distant or cut off from the people around you",
  "Feeling emotionally numb (unable to cry or have loving feelings)",
  "Feeling as if your future hopes or plans will not come true",
  "Having trouble falling or staying asleep",
  "Feeling irritable or having fits of anger",
  "Having trouble concentrating",
  "Being overly alert",
  "Being jumpy or easily startled",
] as const;

const PSS_INSTRUCTIONS =
  "Below is a list of problems that people sometimes have after experiencing a traumatic event. Please rate on a scale from 0-3 how much or how often these following things have occurred to you in the last two weeks:\n\n0. Not at all\n1. Once per week or less / a little bit / once in a while\n2. 2 to 4 times per week / somewhat / half the time\n3. 3 to 5 or more times per week / very much / almost always";

export function ensurePssSymptomMatrix(schema: NativeQuestionnaireSchema): NativeQuestionnaireSchema {
  const existing = schema.fields.find(
    (field) => field.kind === "matrix" && field.rows.length >= 17,
  );
  if (existing) return schema;

  const fields = [...schema.fields];
  const pageBreakIndex = fields.findLastIndex((field) => field.kind === "pagebreak");
  let insertAt = pageBreakIndex >= 0 ? pageBreakIndex + 1 : fields.length;

  // Keep the explanatory text immediately after the page break ahead of the matrix.
  while (insertAt < fields.length && fields[insertAt]?.kind === "paragraph") insertAt += 1;

  const hasInstructions = fields.some(
    (field) => field.kind === "paragraph" && field.text.toLowerCase().includes("rate on a scale from 0-3"),
  );

  const additions = [
    ...(!hasInstructions
      ? [{ kind: "paragraph" as const, id: "pss_symptom_instructions", text: PSS_INSTRUCTIONS }]
      : []),
    {
      kind: "matrix" as const,
      id: "pss_symptom_matrix",
      label: "PTSD symptoms",
      required: true,
      rows: PSS_SYMPTOM_ROWS.map((label, index) => ({ id: `symptom_${index + 1}`, label })),
      columns: [0, 1, 2, 3].map((score) => ({
        id: `pss_score_${score}`,
        label: String(score),
        score,
      })),
    },
  ];

  fields.splice(insertAt, 0, ...additions);
  return { ...schema, fields };
}
