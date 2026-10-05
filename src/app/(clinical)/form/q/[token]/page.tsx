import type { Metadata } from "next";
import { resolveQuestionnaireInvitation } from "@/lib/clinical/invitation";
import { Bdi2Form } from "./Bdi2Form";
import { ImportedQuestionnaireForm } from "./ImportedQuestionnaireForm";
import { NativeQuestionnaireForm } from "./NativeQuestionnaireForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questionnaire | NeuroLinks",
  robots: { index: false, follow: false, noarchive: true },
};

type PageProps = { params: Promise<{ token: string }> };

function BrandHeader() {
  return (
    <div className="nl-form-brand">
      <img src="/media/images/New-Logo.png" alt="NeuroLinks Neuropsychiatric Centre" />
    </div>
  );
}

function MessageCard({ title, body }: { title: string; body: string }) {
  return (
    <main className="nl-form-page nl-form-message-page">
      <section className="nl-form-shell nl-message-shell">
        <BrandHeader />
        <div className="nl-form-heading">
          <h1>{title}</h1>
          <p>{body}</p>
        </div>
      </section>
      <style>{formShellStyles}</style>
    </main>
  );
}

function QuestionnaireShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="nl-form-page">
      <section className="nl-form-shell">
        <BrandHeader />
        <div className="nl-form-heading">
          <h1>{title}</h1>
        </div>
        {children}
      </section>
      <style>{formShellStyles}</style>
    </main>
  );
}

const formShellStyles = `
  .nl-form-page{min-height:100vh;padding:34px 18px 72px;background:linear-gradient(180deg,#f5f8fc 0%,#f8fafc 45%,#eef4f8 100%);color:#10233f;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-sizing:border-box}
  .nl-form-message-page{display:grid;place-items:center}
  .nl-form-shell{width:100%;max-width:900px;margin:0 auto;background:rgba(255,255,255,.98);border:1px solid #dce5ef;border-radius:22px;padding:34px 38px 38px;box-sizing:border-box;box-shadow:0 18px 55px rgba(15,35,63,.08)}
  .nl-message-shell{max-width:700px}
  .nl-form-brand{display:flex;justify-content:center;align-items:center;padding:2px 0 25px;margin-bottom:25px;border-bottom:1px solid #e7edf4}
  .nl-form-brand img{display:block;width:min(300px,68vw);height:auto;max-height:112px;object-fit:contain}
  .nl-form-heading{margin-bottom:27px;text-align:center}
  .nl-form-heading h1{margin:0;color:#112a4b;font-size:clamp(27px,4vw,36px);line-height:1.15;letter-spacing:-.025em;font-weight:750}
  .nl-form-heading p{max-width:600px;margin:13px auto 0;color:#52647a;font-size:15px;line-height:1.65}
  @media(max-width:640px){.nl-form-page{padding:18px 10px 46px}.nl-form-shell{border-radius:16px;padding:24px 18px 26px}.nl-form-brand{padding-bottom:19px;margin-bottom:21px}.nl-form-brand img{width:min(250px,74vw)}.nl-form-heading{margin-bottom:22px}}
`;

export default async function QuestionnaireInvitePage({ params }: PageProps) {
  const { token } = await params;
  const invitation = await resolveQuestionnaireInvitation(token);

  if (invitation.status === "valid" && invitation.questionnaire?.nativeSchema) {
    return <QuestionnaireShell title={invitation.questionnaire.nativeSchema.title}><NativeQuestionnaireForm token={token} schema={invitation.questionnaire.nativeSchema} /></QuestionnaireShell>;
  }

  if (invitation.status === "valid" && invitation.questionnaire?.code === "bdii") {
    return <QuestionnaireShell title="Beck Depression Inventory-II"><Bdi2Form token={token} /></QuestionnaireShell>;
  }

  if (invitation.status === "valid" && invitation.questionnaire?.schema && ["bai", "ybocs", "pss"].includes(invitation.questionnaire.code)) {
    return <QuestionnaireShell title={invitation.questionnaire.name}><ImportedQuestionnaireForm token={token} schema={invitation.questionnaire.schema} /></QuestionnaireShell>;
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
