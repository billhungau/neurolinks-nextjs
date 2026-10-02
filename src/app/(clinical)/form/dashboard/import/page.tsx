import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { HistoricalBdiImportPortal } from "./HistoricalBdiImportPortal";

export const dynamic = "force-dynamic";

export default async function HistoricalBdiImportPage() {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  return (
    <main style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ marginBottom: "24px" }}>
          <Link href="/form/dashboard/" style={{ color: "#374151" }}>← Back to questionnaire dashboard</Link>
          <p style={{ margin: "18px 0 6px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks</p>
          <h1 style={{ margin: 0, fontSize: "32px" }}>Historical questionnaire import</h1>
          <p style={{ color: "#4b5563", lineHeight: 1.55, maxWidth: "760px" }}>
            Reconcile historical Jotform questionnaire submissions with vcita patients using the same normalized-name matching rules before migration to the clinical database.
          </p>
        </header>

        <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 30px rgba(17,24,39,.05)" }}>
          <HistoricalBdiImportPortal />
        </section>
      </div>
    </main>
  );
}
