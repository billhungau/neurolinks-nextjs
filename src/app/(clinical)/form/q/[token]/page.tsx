import type { Metadata } from "next";
import { resolveQuestionnaireInvitation } from "@/lib/clinical/invitation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questionnaire | NeuroLinks",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

type PageProps = {
  params: Promise<{ token: string }>;
};

function MessageCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
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
        aria-labelledby="questionnaire-heading"
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
        <h1 id="questionnaire-heading" style={{ margin: "0 0 12px", fontSize: "30px" }}>
          {title}
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#4b5563" }}>{body}</p>
      </section>
    </main>
  );
}

export default async function QuestionnaireInvitePage({ params }: PageProps) {
  const { token } = await params;
  const invitation = await resolveQuestionnaireInvitation(token);

  if (invitation.status === "valid" && invitation.questionnaire) {
    return (
      <MessageCard
        title={invitation.questionnaire.name}
        body="Your secure questionnaire link is valid. The questionnaire itself will be added in the next step."
      />
    );
  }

  const copy = {
    not_found: {
      title: "Link not recognized",
      body: "This questionnaire link is invalid. Please use the link provided by NeuroLinks.",
    },
    expired: {
      title: "Link expired",
      body: "This questionnaire link has expired. Please contact NeuroLinks for a new link.",
    },
    completed: {
      title: "Questionnaire already completed",
      body: "This questionnaire link has already been used.",
    },
    revoked: {
      title: "Link no longer active",
      body: "This questionnaire link has been cancelled. Please contact NeuroLinks if you need a new link.",
    },
    inactive: {
      title: "Questionnaire unavailable",
      body: "This questionnaire is not currently available. Please contact NeuroLinks.",
    },
  } as const;

  const message = copy[invitation.status];
  return <MessageCard title={message.title} body={message.body} />;
}
