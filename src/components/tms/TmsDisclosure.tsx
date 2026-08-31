export function TmsDisclosure({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="tms-disclosure">
      <summary>
        <span>{summary}</span>
        <span className="tms-disclosure-mark" aria-hidden="true" />
      </summary>
      <div className="tms-disclosure-body">{children}</div>
    </details>
  );
}
