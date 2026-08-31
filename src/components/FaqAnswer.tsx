import { Fragment } from "react";
import type { FaqAnswer as FaqAnswerContent } from "@/content/faqs";

export function EvidenceLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a className="evidence-link" href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}

export function FaqAnswerText({ answer }: { answer: FaqAnswerContent }) {
  if (typeof answer === "string") return answer;
  return answer.map((segment, index) =>
    segment.type === "text" ? (
      <Fragment key={index}>{segment.value}</Fragment>
    ) : (
      <EvidenceLink key={index} href={segment.href}>
        {segment.value}
      </EvidenceLink>
    ),
  );
}
