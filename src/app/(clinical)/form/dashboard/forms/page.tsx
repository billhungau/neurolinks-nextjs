import { FormsPortal } from "./FormsPortal";

export const dynamic = "force-dynamic";

export default function FormsPage() {
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", color: "#64748b" }}>Questionnaire library</p>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-.02em" }}>Forms</h1>
        <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.5, maxWidth: 760 }}>
          Create, edit, publish and review clinical questionnaires.
        </p>
      </header>
      <FormsPortal />
    </main>
  );
}
