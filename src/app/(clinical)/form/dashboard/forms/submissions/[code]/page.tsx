import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { clinicalSupabaseRequest } from "@/lib/clinical/supabase";
import { listAllVcitaClients } from "@/lib/clinical/vcita";
import { subjectKeyFromVcitaUuid } from "@/lib/clinical/pseudonym";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
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

  const clients = await listAllVcitaClients();
  const clientBySubjectKey = new Map(clients.map((client) => [subjectKeyFromVcitaUuid(client.id), client] as const));

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
          {assessments.length === 0 ? (
            <div style={{ padding: 28, color: "#64748b" }}>No submissions on this page.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <thead><tr style={{ background: "#f8fafc", color: "#64748b", textAlign: "left", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <th style={{ padding: "12px 16px" }}>Patient</th><th style={{ padding: "12px 16px" }}>Submitted</th><th style={{ padding: "12px 16px" }}>Score</th><th style={{ padding: "12px 16px" }}>Severity</th><th style={{ padding: "12px 16px" }}></th>
                </tr></thead>
                <tbody>{assessments.map((assessment) => {
                  const client = clientBySubjectKey.get(assessment.subject_key);
                  const patientName = client ? [client.firstName, client.lastName].filter(Boolean).join(" ") || "Unnamed vcita client" : "Patient not matched in vcita";
                  return <tr key={assessment.id} style={{ borderTop: "1px solid #eef2f7" }}>
                    <td style={{ padding: "14px 16px" }}><div style={{ fontWeight: 750, color: "#0f172a" }}>{patientName}</div>{client?.email ? <div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{client.email}</div> : null}</td>
                    <td style={{ padding: "14px 16px", color: "#334155", whiteSpace: "nowrap" }}>{formatSubmittedAt(assessment.submitted_at)}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 800, fontSize: 16 }}>{assessment.total_score}</td>
                    <td style={{ padding: "14px 16px", color: "#475569" }}>{assessment.severity || "—"}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right" }}><Link href={`/form/dashboard/forms/submissions/${encodeURIComponent(code)}/${assessment.id}/`} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>View details →</Link></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
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
