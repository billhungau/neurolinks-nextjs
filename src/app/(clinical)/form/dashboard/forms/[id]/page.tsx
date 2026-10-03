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
    <main style={{ minHeight: "100vh", padding: "28px 20px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <header style={{ marginBottom: "20px" }}>
          <Link href="/form/dashboard/forms/" style={{ color: "#374151" }}>← Back to forms</Link>
          <p style={{ margin: "16px 0 5px", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks form builder</p>
          <h1 style={{ margin: 0, fontSize: "30px" }}>Edit questionnaire</h1>
        </header>
        <FormBuilder formId={id} />
      </div>
    </main>
  );
}
