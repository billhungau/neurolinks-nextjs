import Link from "next/link";
import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { FormBuilder } from "./FormBuilder";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function FormEditorPage({ params }: Props) {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");
  const { id } = await params;

  return (
    <main style={{ minHeight: "100vh", padding: "18px 18px 32px", background: "#f7f9fc" }}>
      <div style={{ maxWidth: "1540px", margin: "0 auto" }}>
        <header style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <Link href="/form/dashboard/forms/" style={{ color: "#657083", fontSize: "13px", textDecoration: "none" }}>← Forms</Link>
            <div style={{ marginTop: "7px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#8b95a5" }}>NeuroLinks Form Builder</div>
          </div>
        </header>
        <FormBuilder formId={id} />
      </div>
    </main>
  );
}
