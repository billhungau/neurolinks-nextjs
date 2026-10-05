import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";

export const dynamic = "force-dynamic";

type MatterField = {
  uid: string;
  name: string;
  type: string | null;
};

function collectMatterFields(value: unknown, out: MatterField[], seen = new Set<string>()) {
  if (Array.isArray(value)) {
    for (const item of value) collectMatterFields(item, out, seen);
    return;
  }
  if (!value || typeof value !== "object") return;

  const obj = value as Record<string, unknown>;
  const objectType = String(obj.object_type ?? obj.objectType ?? "").toLowerCase();
  const uid = String(obj.uid ?? obj.id ?? "").trim();

  if (objectType === "matter" && uid && !seen.has(uid)) {
    const name = String(
      obj.name ??
      obj.label ??
      obj.title ??
      obj.display_name ??
      obj.field_name ??
      uid,
    ).trim();
    const type = String(obj.field_type ?? obj.type ?? obj.data_type ?? "").trim() || null;
    seen.add(uid);
    out.push({ uid, name, type });
  }

  for (const nested of Object.values(obj)) {
    if (nested && typeof nested === "object") collectMatterFields(nested, out, seen);
  }
}

async function loadMatterFields(): Promise<{ fields: MatterField[]; error: string | null }> {
  const token = process.env.VCITA_API_TOKEN?.trim();
  if (!token) return { fields: [], error: "VCITA_API_TOKEN is not configured." };

  try {
    const response = await fetch("https://api.vcita.biz/platform/v1/fields", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { fields: [], error: `vcita returned HTTP ${response.status}.` };
    }

    const json = await response.json() as unknown;
    const fields: MatterField[] = [];
    collectMatterFields(json, fields);
    fields.sort((a, b) => a.name.localeCompare(b.name));
    return { fields, error: null };
  } catch {
    return { fields: [], error: "Could not retrieve vcita field definitions." };
  }
}

export default async function VcitaFieldsPage() {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");

  const { fields, error } = await loadMatterFields();

  return (
    <main style={{ maxWidth: 980, margin: "0 auto" }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: "0 0 6px", color: "#64748b", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".04em" }}>Admin</p>
        <h1 style={{ margin: 0, fontSize: 30 }}>vcita Matter fields</h1>
        <p style={{ margin: "8px 0 0", color: "#475569", lineHeight: 1.55 }}>
          Server-side lookup of vcita Matter custom fields. The API token is never sent to the browser.
        </p>
      </header>

      <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20 }}>
        {error ? (
          <div role="alert" style={{ padding: 14, borderRadius: 10, background: "#fef2f2", color: "#991b1b" }}>
            {error}
          </div>
        ) : fields.length === 0 ? (
          <div style={{ padding: 14, borderRadius: 10, background: "#f8fafc", color: "#475569" }}>
            No Matter fields were returned. If you just created a field in vcita, refresh this page after a few seconds.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #e2e8f0" }}>Field</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #e2e8f0" }}>UID</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #e2e8f0" }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.uid}>
                    <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", fontWeight: 700 }}>{field.name}</td>
                    <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9" }}><code>{field.uid}</code></td>
                    <td style={{ padding: "11px 8px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{field.type ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
