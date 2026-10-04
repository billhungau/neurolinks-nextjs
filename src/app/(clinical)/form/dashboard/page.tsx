import { SendQuestionnaireForm } from "./SendQuestionnaireForm";

export const dynamic = "force-dynamic";

export default function ClinicianDashboardPage() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>Clinical questionnaires</p>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-.02em" }}>Send questionnaires</h1>
        <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 15 }}>Find a vcita patient, select the forms you need, and create secure questionnaire links.</p>
      </header>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
        <SendQuestionnaireForm />
      </section>
    </main>
  );
}
