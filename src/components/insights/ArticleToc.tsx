export function ArticleToc({
  headings,
}: {
  headings: { id: string; text: string }[];
}) {
  if (headings.length < 2) return null;
  return (
    <nav className="insights-toc" aria-label="In this article">
      <div className="insights-toc-desktop">
        <p className="insights-toc-title">In this article</p>
        <ol>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ol>
      </div>
      <details className="insights-toc-mobile">
        <summary>In this article</summary>
        <ol>
          {headings.map((heading) => (
            <li key={heading.id}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
