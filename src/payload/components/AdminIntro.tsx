import { PATIENT_INFORMATION_WARNING } from "../../lib/insights";

/**
 * A short standing reminder above the admin navigation. It replaces the
 * separate editorial-guidance screen the previous CMS needed, and keeps the
 * two rules that matter most in front of the editor at all times.
 */
export function AdminIntro() {
  return (
    <aside
      style={{
        margin: "0 0 1.25rem",
        padding: "0.85rem 1rem",
        borderRadius: "0.375rem",
        background: "var(--theme-elevation-50)",
        borderLeft: "3px solid #e8b923",
        fontSize: "0.8125rem",
        lineHeight: 1.5,
      }}
    >
      <strong style={{ display: "block", marginBottom: "0.35rem" }}>
        Insights → Create New → Write → Preview → Publish
      </strong>
      <span style={{ color: "var(--theme-elevation-650)" }}>
        {PATIENT_INFORMATION_WARNING} Avoid miracle, cure, revolutionary or guaranteed
        language, and never imply that coverage is automatic.
      </span>
    </aside>
  );
}
