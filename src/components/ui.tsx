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
      className={`mx-auto max-w-6xl scroll-mt-24 px-4 py-12 ${className}`}
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
