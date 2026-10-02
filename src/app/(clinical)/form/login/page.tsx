import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ClinicianLoginPage({ searchParams }: PageProps) {
  const session = await getClinicianSession();
  if (session) redirect("/form/dashboard/");

  const { error } = await searchParams;

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(17, 24, 39, 0.06)",
        }}
      >
        <p style={{ margin: "0 0 8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", fontSize: "14px" }}>
          NeuroLinks
        </p>
        <h1 style={{ margin: "0 0 8px", fontSize: "30px" }}>Clinician sign in</h1>
        <p style={{ margin: "0 0 24px", color: "#4b5563", lineHeight: 1.5 }}>
          Sign in with a clinician account from the clinical Supabase project.
        </p>

        {error ? (
          <p role="alert" style={{ padding: "12px", borderRadius: "8px", background: "#fef2f2", marginBottom: "16px" }}>
            Sign-in failed. Check the email and password and try again.
          </p>
        ) : null}

        <form action="/form/api/auth/login/" method="post">
          <label style={{ display: "block", marginBottom: "16px" }}>
            <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Email</span>
            <input name="email" type="email" required autoComplete="username" style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
          </label>
          <label style={{ display: "block", marginBottom: "20px" }}>
            <span style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>Password</span>
            <input name="password" type="password" required autoComplete="current-password" style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d1d5db", borderRadius: "8px" }} />
          </label>
          <button type="submit" style={{ width: "100%", padding: "12px 16px", border: 0, borderRadius: "8px", fontWeight: 700, cursor: "pointer", background: "#111827", color: "#fff" }}>
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
