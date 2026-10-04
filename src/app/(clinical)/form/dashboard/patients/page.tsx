import { PatientResultsPortal } from "./PatientResultsPortal";

export const dynamic = "force-dynamic";

export default function PatientResultsPage() {
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>Longitudinal results</p>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-.02em" }}>Patients</h1>
        <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.5, maxWidth: 760 }}>
          Search a patient to review questionnaire scores, trends, dates, and item-level responses.
        </p>
      </header>
      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
        <PatientResultsPortal />
      </section>
    </main>
  );
}
