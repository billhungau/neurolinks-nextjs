import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import Link from "next/link";
import { SendQuestionnaireForm } from "./SendQuestionnaireForm";

export const dynamic = "force-dynamic";

const navStyle = {
  padding: "9px 12px",
  border: "1px solid #dbe3ef",
  borderRadius: "9px",
  background: "#fff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "14px",
} as const;

export default async function ClinicianDashboardPage() {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fb", padding: "22px" }}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)", borderRadius: "18px", padding: "20px 22px", color: "#fff", boxShadow: "0 14px 38px rgba(15,23,42,.16)", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: "0 0 5px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", opacity: .76 }}>NeuroLinks Admin</p>
              <h1 style={{ margin: 0, fontSize: "28px", lineHeight: 1.15 }}>Clinical questionnaires</h1>
              <p style={{ margin: "6px 0 0", fontSize: "14px", opacity: .82 }}>{session.email ?? "Authenticated clinician"}</p>
            </div>
            <form action="/form/api/auth/logout/" method="post">
              <button type="submit" style={{ padding: "9px 12px", border: "1px solid rgba(255,255,255,.35)", borderRadius: "9px", background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Sign out</button>
            </form>
          </div>

          <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "18px" }}>
            <Link href="/form/dashboard/" style={{ ...navStyle, background: "#dbeafe", borderColor: "#bfdbfe", color: "#1d4ed8" }}>Send</Link>
            <Link href="/form/dashboard/patients/" style={navStyle}>Patient results</Link>
            <Link href="/form/dashboard/forms/" style={navStyle}>Forms</Link>
            <Link href="/form/dashboard/jotform-sync/" style={navStyle}>Jotform sync</Link>
            <Link href="/form/dashboard/import/" style={navStyle}>Historical migration</Link>
          </nav>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: "18px", alignItems: "start" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 8px 24px rgba(15,23,42,.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "#dbeafe", color: "#2563eb", display: "grid", placeItems: "center", fontSize: "20px", fontWeight: 800 }}>↗</div>
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>Send questionnaire</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>Find a vcita patient, select forms, and create secure links.</p>
              </div>
            </div>
            <SendQuestionnaireForm />
          </div>

          <aside style={{ display: "grid", gap: "12px" }}>
            <Link href="/form/dashboard/patients/" style={{ textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", boxShadow: "0 6px 18px rgba(15,23,42,.04)" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>◫</div>
              <strong style={{ display: "block", marginBottom: "3px" }}>Patient results</strong>
              <span style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.45 }}>Review scores, trends and item-level responses.</span>
            </Link>
            <Link href="/form/dashboard/forms/" style={{ textDecoration: "none", color: "inherit", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", boxShadow: "0 6px 18px rgba(15,23,42,.04)" }}>
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>▤</div>
              <strong style={{ display: "block", marginBottom: "3px" }}>Forms</strong>
              <span style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.45 }}>Edit, preview and manage clinical questionnaires.</span>
            </Link>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "7px" }}>Workflow</div>
              <div style={{ color: "#334155", fontSize: "13px", lineHeight: 1.55 }}>vcita patient → questionnaire link → secure submission → longitudinal results</div>
            </div>
          </aside>
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          main section { grid-template-columns: 1fr !important; }
          main aside { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
        @media (max-width: 620px) {
          main { padding: 12px !important; }
          main aside { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
