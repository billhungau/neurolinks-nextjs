import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuestionnaireRow = {
  code: string;
  version: number;
  name: string;
  max_score: number | null;
  active: boolean;
};

export async function GET() {
  try {
    const rows = await clinicalSupabaseRequest<QuestionnaireRow[]>(
      "questionnaires?select=code,version,name,max_score,active&code=eq.phq9&version=eq.1&limit=1",
      { method: "GET" },
    );

    const phq9 = rows?.[0] ?? null;

    return Response.json(
      {
        ok: Boolean(phq9),
        database: "reachable",
        phq9,
      },
      {
        status: phq9 ? 200 : 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    const diagnostic =
      error instanceof Error ? error.message : "[clinical-health] Unknown error.";

    return Response.json(
      {
        ok: false,
        database: "unreachable",
        diagnostic,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      },
    );
  }
}
