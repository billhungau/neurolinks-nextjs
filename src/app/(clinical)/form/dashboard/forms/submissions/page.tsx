import Link from "next/link";

const FORMS = [
  { code: "bdii", name: "BDI-II", description: "Depression questionnaire" },
  { code: "bai", name: "BAI", description: "Anxiety questionnaire" },
  { code: "ybocs", name: "Y-BOCS", description: "Obsessive-compulsive symptoms" },
  { code: "pss", name: "PSS", description: "PTSD symptom questionnaire" },
];

export default function SubmissionsHubPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>Questionnaire responses</p>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-.02em" }}>Submissions</h1>
        <p style={{ margin: "8px 0 0", color: "#64748b" }}>Choose a questionnaire to review patient submissions, newest first.</p>
      </header>
      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
        {FORMS.map((form, index) => (
          <Link key={form.code} href={`/form/dashboard/forms/submissions/${form.code}/`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "17px 20px", textDecoration: "none", color: "#0f172a", borderTop: index ? "1px solid #eef2f7" : undefined }}>
            <div><strong>{form.name}</strong><div style={{ marginTop: 3, color: "#64748b", fontSize: 13 }}>{form.description}</div></div>
            <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 13 }}>View submissions →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
