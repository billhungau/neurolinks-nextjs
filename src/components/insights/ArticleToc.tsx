export function ArticleToc({
  headings,
}: {
  headings: { id: string; text: string }[];
}) {
  if (headings.length < 2) return null;
  return (
    <nav className="insights-toc" aria-label="In this article">
      <details open>
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
