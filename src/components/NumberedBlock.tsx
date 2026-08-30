export function NumberedBlock({
  index,
  title,
  children,
  tone = "light",
}: {
  index: string;
  title: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <article>
      <p
        className={`text-xs font-semibold tracking-[0.16em] ${
          dark ? "text-[var(--nl-yellow)]" : "text-[var(--nl-blue)]"
        }`}
      >
        {index}
      </p>
      <h3
        className={`mt-3 font-serif text-xl font-semibold md:text-[1.35rem] ${
          dark ? "text-white" : "text-[var(--nl-navy)]"
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-3 text-[0.95rem] leading-relaxed ${
          dark ? "text-white/75" : "text-[var(--nl-muted)]"
        }`}
      >
        {children}
      </p>
    </article>
  );
}
