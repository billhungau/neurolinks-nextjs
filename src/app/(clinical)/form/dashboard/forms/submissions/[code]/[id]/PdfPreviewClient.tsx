"use client";

import { useEffect, useState } from "react";

export function PdfPreviewClient({ href }: { href: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  async function openPreview() {
    if (loading) return;
    if (pdfUrl) {
      setPdfUrl(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(href, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Could not generate PDF preview.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate PDF preview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "10px 14px",
          border: 0,
          borderRadius: 9,
          background: "#111827",
          color: "#fff",
          fontWeight: 800,
          fontSize: 14,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.72 : 1,
        }}
      >
        {loading ? "Loading PDF…" : pdfUrl ? "Close PDF preview" : "Preview PDF"}
      </button>

      {error ? (
        <div style={{ width: "100%", marginTop: 12, color: "#b91c1c", fontSize: 14, fontWeight: 650 }}>{error}</div>
      ) : null}

      {pdfUrl ? (
        <section style={{ width: "100%", marginTop: 18, border: "1px solid #cbd5e1", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: 13, fontWeight: 800, color: "#334155" }}>PDF preview</div>
          <iframe
            src={pdfUrl}
            title="TMS consent PDF preview"
            style={{ display: "block", width: "100%", height: "78vh", minHeight: 640, border: 0, background: "#f8fafc" }}
          />
        </section>
      ) : null}
    </>
  );
}
