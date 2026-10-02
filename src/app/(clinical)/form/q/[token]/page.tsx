import type { Metadata } from "next";
import { resolveQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { Bdi2Form } from "./Bdi2Form";
import { ImportedQuestionnaireForm } from "./ImportedQuestionnaireForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questionnaire | NeuroLinks",
  robots: { index: false, follow: false, noarchive: true },
};

type PageProps = { params: Promise<{ token: string }> };

function MessageCard({ title, body }: { title: string; body: string }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
      <section style={{ width: "100%", maxWidth: "700px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 30px rgba(17,24,39,.06)" }}>
        <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>NeuroLinks</p>
        <h1 style={{ margin: "0 0 12px", fontSize: "30px" }}>{title}</h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#4b5563" }}>{body}</p>
      </section>
    </main>
  );
}

export default async function QuestionnaireInvitePage({ params }: PageProps) {
  const { token } = await params;
  const invitation = await resolveQuestionnaireInvitation(token);

  if (invitation.status === "valid" && invitation.questionnaire?.code === "bdii") {
    return (
      <main style={{ minHeight: "100vh", padding: "28px 18px 60px" }}>
        <section style={{ maxWidth: "760px", margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 30px rgba(17,24,39,.05)" }}>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks</p>
          <h1 style={{ margin: "0 0 24px", fontSize: "32px" }}>Beck Depression Inventory-II</h1>
          <Bdi2Form token={token} />
        </section>
      </main>
    );
  }

  if (
    invitation.status === "valid" &&
    invitation.questionnaire?.schema &&
    ["bai", "ybocs", "pss"].includes(invitation.questionnaire.code)
  ) {
    return (
      <main style={{ minHeight: "100vh", padding: "28px 18px 60px" }}>
        <section style={{ maxWidth: "820px", margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 30px rgba(17,24,39,.05)" }}>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>NeuroLinks</p>
          <h1 style={{ margin: "0 0 24px", fontSize: "32px" }}>{invitation.questionnaire.name}</h1>
          <ImportedQuestionnaireForm token={token} schema={invitation.questionnaire.schema} />
        </section>
      </main>
    );
  }

  if (invitation.status === "valid") {
    return <MessageCard title="Questionnaire unavailable" body="This questionnaire is not currently available. Please contact NeuroLinks." />;
  }

  const copy = {
    not_found: ["Link not recognized", "This questionnaire link is invalid. Please use the link provided by NeuroLinks."],
    expired: ["Link expired", "This questionnaire link has expired. Please contact NeuroLinks for a new link."],
    completed: ["Questionnaire already completed", "This questionnaire link has already been used."],
    revoked: ["Link no longer active", "This questionnaire link has been cancelled. Please contact NeuroLinks if you need a new link."],
    inactive: ["Questionnaire unavailable", "This questionnaire is not currently available. Please contact NeuroLinks."],
  } as const;

  const [title, body] = copy[invitation.status];
  return <MessageCard title={title} body={body} />;
}
