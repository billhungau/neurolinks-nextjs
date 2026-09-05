import { doiHref, formatReference } from "@/lib/insights";

type EvidenceValue = {
  studyType?: string;
  population?: string;
  mainFinding?: string;
  limitation?: string;
  doi?: string;
  url?: string;
};

export function EvidenceSummary({ value }: { value: EvidenceValue }) {
  const link = value.url || doiHref(value.doi);
  return (
    <aside className="insights-evidence">
      <p className="insights-box-label">Evidence summary</p>
      <dl>
        {value.studyType ? (
          <div>
            <dt>Study type</dt>
            <dd>{value.studyType}</dd>
          </div>
        ) : null}
        {value.population ? (
          <div>
            <dt>Population</dt>
            <dd>{value.population}</dd>
          </div>
        ) : null}
        {value.mainFinding ? (
          <div>
            <dt>Main finding</dt>
            <dd>{value.mainFinding}</dd>
          </div>
        ) : null}
        {value.limitation ? (
          <div>
            <dt>Important limitation</dt>
            <dd>{value.limitation}</dd>
          </div>
        ) : null}
      </dl>
      {link ? (
        <p>
          <a href={link} rel="noopener noreferrer" target="_blank">
            {value.doi ? `doi:${value.doi.replace(/^https?:\/\/doi.org\//i, "")}` : "Publication"}
          </a>
        </p>
      ) : null}
    </aside>
  );
}

type VacValue = {
  heading?: string;
  suitability: string;
  funding: string;
  preauthorization: string;
  availability: string;
};

export function VacCoverageNote({ value }: { value: VacValue }) {
  return (
    <aside className="insights-vac">
      <p className="insights-box-label">{value.heading || "Coverage and authorization"}</p>
      <dl>
        <div>
          <dt>Clinical suitability</dt>
          <dd>{value.suitability}</dd>
        </div>
        <div>
          <dt>Funding eligibility</dt>
          <dd>{value.funding}</dd>
        </div>
        <div>
          <dt>Preauthorization</dt>
          <dd>{value.preauthorization}</dd>
        </div>
        <div>
          <dt>Treatment availability</dt>
          <dd>{value.availability}</dd>
        </div>
      </dl>
      <p className="insights-vac-note">
        Authorization and payment depend on eligibility and the requirements of the funding
        program. They are not guaranteed.
      </p>
    </aside>
  );
}

type TimelineValue = {
  heading?: string;
  intro?: string;
  steps?: { title: string; body?: string }[];
};

export function ProcessTimeline({ value }: { value: TimelineValue }) {
  const steps = value.steps ?? [];
  return (
    <section className="insights-timeline" aria-label={value.heading || "Process"}>
      {value.heading ? <h2 className="insights-h2">{value.heading}</h2> : null}
      {value.intro ? <p>{value.intro}</p> : null}
      <ol>
        {steps.map((step, index) => (
          <li key={step.title}>
            <p className="insights-timeline-index">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="insights-h3">{step.title}</h3>
            {step.body ? <p>{step.body}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

type TableValue = {
  caption?: string;
  columns?: string[];
  rows?: { heading: string; cells?: string[] }[];
  footnote?: string;
};

export function ComparisonTable({ value }: { value: TableValue }) {
  const columns = value.columns ?? [];
  const rows = value.rows ?? [];
  const captionId = "insights-compare-caption";
  return (
    <div className="insights-compare">
      {value.caption ? (
        <p id={captionId} className="insights-compare-caption">
          {value.caption}
        </p>
      ) : null}
      <div className="insights-compare-table-wrap">
        <table className="insights-compare-table" aria-describedby={value.caption ? captionId : undefined}>
          <thead>
            <tr>
              <th scope="col">Consideration</th>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.heading}>
                <th scope="row">{row.heading}</th>
                {(row.cells ?? []).map((cell, index) => (
                  <td key={`${row.heading}-${columns[index] || index}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="insights-compare-cards">
        {columns.map((column, columnIndex) => (
          <li key={column}>
            <article>
              <h3>{column}</h3>
              <dl>
                {rows.map((row) => (
                  <div key={row.heading}>
                    <dt>{row.heading}</dt>
                    <dd>{row.cells?.[columnIndex] || "—"}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </li>
        ))}
      </ul>
      {value.footnote ? <p className="insights-compare-note">{value.footnote}</p> : null}
    </div>
  );
}

type Source = {
  title: string;
  authors?: string | null;
  publisher?: string | null;
  year?: number | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  pubmedUrl?: string | null;
  url?: string | null;
};

export function ReferencesList({
  heading = "References",
  sources,
}: {
  heading?: string | null;
  sources?: Source[] | null;
}) {
  if (!sources?.length) return null;
  return (
    <section className="insights-references" aria-labelledby="insights-references-heading">
      <h2 id="insights-references-heading" className="insights-h2">
        {heading || "References"}
      </h2>
      <ol>
        {sources.map((source, index) => {
          const href = source.pubmedUrl || doiHref(source.doi) || source.url;
          return (
            <li key={`${source.title}-${index}`} id={`reference-${index + 1}`}>
              <cite>{formatReference(source)}</cite>
              {href ? (
                <>
                  {" "}
                  <a href={href} rel="noopener noreferrer" target="_blank">
                    Source
                  </a>
                </>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
