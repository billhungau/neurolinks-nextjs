import { Fragment } from "react";
import type {
  FaqAnswer as FaqAnswerContent,
  FaqBlock,
  FaqCompareRow,
  FaqRich,
} from "@/content/faqs";
import { isStructuredFaqAnswer } from "@/content/faqs";

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

function FaqSegments({ segments }: { segments: FaqRich }) {
  return segments.map((segment, index) => {
    if (segment.type === "text") {
      return <Fragment key={index}>{segment.value}</Fragment>;
    }
    if (segment.type === "strong") {
      return <strong key={index}>{segment.value}</strong>;
    }
    return (
      <EvidenceLink key={index} href={segment.href}>
        {segment.value}
      </EvidenceLink>
    );
  });
}

function FaqCompareTable({ rows }: { rows: FaqCompareRow[] }) {
  return (
    <table className="tms-faq-compare">
      <caption className="sr-only">Comparison of TMS and ECT</caption>
      <thead>
        <tr>
          <th scope="col">Feature</th>
          <th scope="col">TMS</th>
          <th scope="col">ECT</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.feature}>
            <th scope="row">{row.feature}</th>
            <td>
              <span className="tms-faq-compare-key" aria-hidden="true">
                TMS
              </span>
              <span className="tms-faq-compare-value">{row.tms}</span>
            </td>
            <td>
              <span className="tms-faq-compare-key" aria-hidden="true">
                ECT
              </span>
              <span className="tms-faq-compare-value">{row.ect || "—"}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FaqBlockView({ block }: { block: FaqBlock }) {
  if (block.type === "p") {
    return (
      <p>
        <FaqSegments segments={block.content} />
      </p>
    );
  }
  if (block.type === "label") {
    return <h4 className="tms-faq-label">{block.value}</h4>;
  }
  if (block.type === "ul") {
    return (
      <ul className="tms-faq-list">
        {block.items.map((item, index) => (
          <li key={index}>
            <FaqSegments segments={item} />
          </li>
        ))}
      </ul>
    );
  }
  return <FaqCompareTable rows={block.rows} />;
}

export function FaqAnswerText({ answer }: { answer: FaqAnswerContent }) {
  if (typeof answer === "string") {
    return <p>{answer}</p>;
  }
  if (isStructuredFaqAnswer(answer)) {
    return (
      <>
        {answer.map((block, index) => (
          <FaqBlockView key={index} block={block} />
        ))}
      </>
    );
  }
  return (
    <p>
      <FaqSegments segments={answer} />
    </p>
  );
}
