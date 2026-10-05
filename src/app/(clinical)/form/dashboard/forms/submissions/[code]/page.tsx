import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { getVcitaClient } from "@/lib/clinical/vcita";
import { patientIdentityRows } from "@/lib/clinical/patient-identity-index";
import { SubmissionTableClient } from "./SubmissionTableClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const VCITA_CONCURRENCY = 8;
const LABELS: Record<string, string> = { bdii: "BDI-II", bai: "BAI", ybocs: "Y-BOCS", pss: "PSS" };

type QuestionnaireRow = { id: string; name: string };
type AssessmentRow = {
  id: string;
  subject_key: string;
  questionnaire_id: string;
  submitted_at: string;
  total_score: number;
  severity: string | null;
};

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Vancouver",
  }).format(new Date(value));
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  async function runWorker() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()));
  return results;
}

export default async function QuestionnaireSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  const { code: rawCode } = await params;
  const { page: rawPage } = await searchParams;
  const code = rawCode.toLowerCase();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const questionnaireRows = await clinicalSupabaseRequest<QuestionnaireRow[]>(
    `questionnaires?select=id,name&code=eq.${encodeURIComponent(code)}&order=version.desc`,
    { method: "GET" },
  );
  const questionnaireIds = questionnaireRows.map((row) => row.id);
  const questionnaireName = LABELS[code] ?? questionnaireRows[0]?.name ?? code.toUpperCase();

  let fetched: AssessmentRow[] = [];
  if (questionnaireIds.length > 0) {
    const idFilter = questionnaireIds.map((id) => `\"${id}\"`).join(",");
    fetched = await clinicalSupabaseRequest<AssessmentRow[]>(
      `assessment_results?select=id,subject_key,questionnaire_id,submitted_at,total_score,severity&questionnaire_id=in.(${encodeURIComponent(idFilter)})&order=submitted_at.desc&offset=${offset}&limit=${PAGE_SIZE + 1}`,
      { method: "GET" },
    );
  }

  const hasNext = fetched.length > PAGE_SIZE;
  const assessments = fetched.slice(0, PAGE_SIZE);

  const subjectKeys = [...new Set(assessments.map((assessment) => assessment.subject_key).filter(Boolean))];
  const identityRows = await patientIdentityRows(subjectKeys);
  const vcitaIdBySubject = new Map(identityRows.map((row) => [row.subject_key, row.vcita_client_id] as const));
  const resolved = await mapWithConcurrency(
    subjectKeys,
    VCITA_CONCURRENCY,
    async (subjectKey) => {
      const vcitaId = vcitaIdBySubject.get(subjectKey);
      if (!vcitaId) return [subjectKey, null] as const;
      try {
        return [subjectKey, await getVcitaClient(vcitaId)] as const;
      } catch {
        return [subjectKey, null] as const;
      }
    },
  );
  const clientBySubjectKey = new Map(resolved);

  const rows = assessments.map((assessment) => {
    const client = clientBySubjectKey.get(assessment.subject_key);
    const patientName = client ? [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client" : "Patient not matched in vcita";
    return {
      id: assessment.id,
      patientName,
      patientEmail: client?.email ?? null,
      submittedLabel: formatSubmittedAt(assessment.submitted_at),
      totalScore: assessment.total_score,
      severity: assessment.severity,
    };
  });

  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header style={{ marginBottom: 22 }}>
          <Link href="/form/dashboard/forms/" style={{ color: "#334155", textDecoration: "none", fontSize: 14 }}>← Back to forms</Link>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>NeuroLinks Admin</p>
              <h1 style={{ margin: 0, fontSize: 30 }}>{questionnaireName} submissions</h1>
              <p style={{ margin: "7px 0 0", color: "#64748b" }}>Newest first · 50 submissions per page</p>
            </div>
            <div style={{ fontSize: 14, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 12px" }}>Page {page}</div>
          </div>
        </header>

        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 8px 26px rgba(15,23,42,.05)", overflow: "hidden" }}>
          {rows.length === 0 ? (
            <div style={{ padding: 28, color: "#64748b" }}>No submissions on this page.</div>
          ) : (
            <SubmissionTableClient code={code} rows={rows} />
          )}
        </section>

        <nav style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16 }} aria-label="Submission pages">
          {page > 1 ? <Link href={`?page=${page - 1}`} style={{ padding: "9px 13px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>← Previous 50</Link> : <span />}
          {hasNext ? <Link href={`?page=${page + 1}`} style={{ padding: "9px 13px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>Next 50 →</Link> : null}
        </nav>
      </div>
    </main>
  );
}
