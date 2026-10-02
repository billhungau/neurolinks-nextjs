import { clinicalSupabaseRequest } from "../supabase";
import {
  BDI2_CODE,
  BDI2_ITEMS,
  BDI2_MAX_SCORE,
  BDI2_NAME,
  BDI2_VERSION,
  getBdi2OptionById,
} from "./bdii-definition";

export type StoredBdi2Answer = {
  optionId: string;
  score: number;
};

export function scoreBdi2Selections(selections: Record<string, string>) {
  const storedAnswers: Record<string, StoredBdi2Answer> = {};
  const scoreAnswers: Record<string, number> = {};

  for (const item of BDI2_ITEMS) {
    const optionId = selections[item.key];
    if (typeof optionId !== "string") {
      throw new Error("[bdii] Invalid or incomplete answers.");
    }

    const match = getBdi2OptionById(item.key, optionId);
    if (!match) {
      throw new Error("[bdii] Invalid or incomplete answers.");
    }

    storedAnswers[item.key] = {
      optionId,
      score: match.option.value,
    };
    scoreAnswers[item.key] = match.option.value;
  }

  const scored = scoreBdi2(scoreAnswers);
  return {
    ...scored,
    storedAnswers,
    scoreAnswers,
  };
}

export function scoreBdi2(answers: Record<string, number>) {
  const values = BDI2_ITEMS.map((item) => answers[item.key]);
  if (values.some((value) => !Number.isInteger(value) || value < 0 || value > 3)) {
    throw new Error("[bdii] Invalid or incomplete answers.");
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const severity =
    total <= 13 ? "minimal" :
    total <= 19 ? "mild" :
    total <= 28 ? "moderate" : "severe";

  return {
    total,
    severity,
    clinicalFlags: {
      bdii_item9_positive: answers.q9 > 0,
      bdii_item9_score: answers.q9,
    },
  };
}

export async function ensureBdi2Registry(): Promise<void> {
  await clinicalSupabaseRequest<unknown>(
    "questionnaires?on_conflict=code,version",
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify({
        code: BDI2_CODE,
        version: BDI2_VERSION,
        name: BDI2_NAME,
        max_score: BDI2_MAX_SCORE,
        active: true,
        metadata: { short_name: "BDI-II", scoring_type: "sum" },
      }),
    },
  );

  await clinicalSupabaseRequest<unknown>(
    "questionnaires?code=eq.phq9&active=eq.true",
    {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({ active: false }),
    },
  );
}
