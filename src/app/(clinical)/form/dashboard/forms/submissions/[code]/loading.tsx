export default function LoadingQuestionnaireSubmissions() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ color: "#334155", fontSize: 14, marginBottom: 18 }}>← Back to forms</div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ width: 128, height: 14, borderRadius: 7, background: "#e2e8f0", marginBottom: 12 }} />
          <div style={{ width: 290, maxWidth: "75%", height: 34, borderRadius: 9, background: "#e2e8f0", marginBottom: 10 }} />
          <div style={{ width: 220, height: 16, borderRadius: 8, background: "#e2e8f0" }} />
        </div>
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ width: "100%", height: 40, borderRadius: 9, background: "#f1f5f9" }} />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr .5fr .7fr", gap: 18, padding: "17px 16px", borderTop: index ? "1px solid #eef2f7" : undefined }}>
              <div style={{ height: 18, borderRadius: 7, background: "#e2e8f0" }} />
              <div style={{ height: 18, borderRadius: 7, background: "#f1f5f9" }} />
              <div style={{ height: 18, borderRadius: 7, background: "#f1f5f9" }} />
              <div style={{ height: 18, borderRadius: 7, background: "#f1f5f9" }} />
            </div>
          ))}
        </section>
        <p style={{ marginTop: 14, color: "#64748b", fontSize: 14 }}>Loading submissions…</p>
      </div>
    </main>
  );
}
