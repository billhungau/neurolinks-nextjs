export default function ClinicalFormHome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <section
        aria-labelledby="form-heading"
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(17, 24, 39, 0.06)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          NeuroLinks
        </p>
        <h1
          id="form-heading"
          style={{
            margin: "0 0 12px",
            fontSize: "32px",
            lineHeight: 1.2,
          }}
        >
          Secure Questionnaires
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#4b5563",
          }}
        >
          This portal is being prepared for secure clinical questionnaires.
        </p>
      </section>
    </main>
  );
}
