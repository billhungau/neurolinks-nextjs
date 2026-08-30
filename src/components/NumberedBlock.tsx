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
    <article
      className={`border-t pt-6 ${dark ? "border-white/20" : "border-[var(--nl-navy)]/15"}`}
    >
      <p
        className={`font-serif text-3xl md:text-4xl ${dark ? "text-[var(--nl-yellow)]" : "text-[var(--nl-blue)]"}`}
      >
        {index}
      </p>
      <h3
        className={`mt-3 font-serif text-xl font-semibold md:text-2xl ${dark ? "text-white" : "text-[var(--nl-navy)]"}`}
      >
        {title}
      </h3>
      <p
        className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-white/75" : "text-[var(--nl-muted)]"}`}
      >
        {children}
      </p>
    </article>
  );
}
