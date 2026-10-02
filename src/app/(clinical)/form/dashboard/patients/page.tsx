import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { PatientResultsPortal } from "./PatientResultsPortal";

export const dynamic = "force-dynamic";

export default async function PatientResultsPage() {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  return (
    <main style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ marginBottom: "24px" }}>
          <Link href="/form/dashboard/" style={{ color: "#374151" }}>← Back to questionnaire dashboard</Link>
          <p style={{ margin: "18px 0 6px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks</p>
          <h1 style={{ margin: 0, fontSize: "32px" }}>Patient questionnaire results</h1>
          <p style={{ color: "#4b5563", lineHeight: 1.55, maxWidth: "800px" }}>
            Search a patient to review longitudinal BDI-II, BAI, Y-BOCS, and PSS results, score trends, assessment dates, and individual item responses.
          </p>
        </header>

        <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 30px rgba(17,24,39,.05)" }}>
          <PatientResultsPortal />
        </section>
      </div>
    </main>
  );
}
