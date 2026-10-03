import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import Link from "next/link";
import { SendQuestionnaireForm } from "./SendQuestionnaireForm";

export const dynamic = "force-dynamic";

export default async function ClinicianDashboardPage() {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  return (
    <main style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks</p>
            <h1 style={{ margin: 0, fontSize: "32px" }}>Clinical questionnaires</h1>
            <p style={{ margin: "8px 0 0", color: "#4b5563" }}>{session.email ?? "Authenticated clinician"}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/form/dashboard/patients/" style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", color: "#111827", textDecoration: "none", fontWeight: 700 }}>
              Patient results
            </Link>
            <Link href="/form/dashboard/forms/" style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", color: "#111827", textDecoration: "none", fontWeight: 700 }}>
              Forms
            </Link>
            <Link href="/form/dashboard/jotform-sync/" style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", color: "#111827", textDecoration: "none" }}>
              Jotform sync
            </Link>
            <Link href="/form/dashboard/import/" style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", color: "#111827", textDecoration: "none" }}>
              Historical migration
            </Link>
            <form action="/form/api/auth/logout/" method="post">
              <button type="submit" style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "#fff", cursor: "pointer" }}>Sign out</button>
            </form>
          </div>
        </header>

        <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 30px rgba(17,24,39,.05)" }}>
          <h2 style={{ marginTop: 0 }}>Send questionnaire</h2>
          <p style={{ color: "#4b5563", lineHeight: 1.55 }}>
            Find the patient in vcita. Only a pseudonymized identifier is stored in the clinical questionnaire database.
          </p>
          <SendQuestionnaireForm />
        </section>
      </div>
    </main>
  );
}
