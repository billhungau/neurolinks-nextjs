export function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-[var(--site-max)] nl-anchor-section px-[var(--nl-gutter)] py-12 ${className}`}
    >
      {children}
    </section>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <article className="overflow-hidden rounded border border-slate-200 bg-white">
      {children}
    </article>
  );
}
