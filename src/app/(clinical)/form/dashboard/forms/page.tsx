import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { FormsPortal } from "./FormsPortal";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  return (
    <main style={{ minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header style={{ marginBottom: "24px" }}>
          <Link href="/form/dashboard/" style={{ color: "#374151" }}>← Back to questionnaire dashboard</Link>
          <p style={{ margin: "18px 0 6px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks</p>
          <h1 style={{ margin: 0, fontSize: "32px" }}>Forms</h1>
          <p style={{ color: "#4b5563", lineHeight: 1.55, maxWidth: "800px" }}>
            Create, edit, preview and publish native clinical questionnaires. Published versions remain immutable so historical results always retain their original form definition.
          </p>
        </header>
        <FormsPortal />
      </div>
    </main>
  );
}
