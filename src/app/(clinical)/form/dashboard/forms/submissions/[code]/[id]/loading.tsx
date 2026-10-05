export default function SubmissionDetailLoading() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: 14, marginBottom: 18 }}>← Back to submissions</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ width: 120, height: 12, borderRadius: 6, background: "#e2e8f0", marginBottom: 10 }} />
          <div style={{ width: 280, maxWidth: "70%", height: 34, borderRadius: 8, background: "#e2e8f0", marginBottom: 10 }} />
          <div style={{ width: 220, maxWidth: "55%", height: 16, borderRadius: 8, background: "#e2e8f0" }} />
        </div>
        <p style={{ color: "#475569", margin: "0 0 16px", fontWeight: 700 }}>Loading submission details…</p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 18 }}>
          {[0, 1, 2].map((key) => (
            <div key={key} style={{ height: 78, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12 }} />
          ))}
        </section>
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <div key={key} style={{ height: 64, borderTop: key ? "1px solid #eef2f7" : undefined }} />
          ))}
        </section>
      </div>
    </main>
  );
}
