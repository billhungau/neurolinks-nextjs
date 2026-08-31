import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "accent" | "on-dark";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className: extra = "" }: Props) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--nl-radius)] px-6 py-2.5 text-sm font-semibold tracking-wide no-underline transition-colors duration-[var(--nl-duration)] ease-[var(--nl-ease)]";
  const styles =
    variant === "accent"
      ? "bg-[var(--nl-yellow)] text-[var(--nl-navy)] hover:bg-[var(--nl-yellow-hover)]"
      : variant === "on-dark"
        ? "border border-white/70 text-white hover:bg-white/10"
        : variant === "ghost"
          ? "border border-[var(--nl-navy)]/25 text-[var(--nl-navy)] hover:border-[var(--nl-navy)]"
          : "bg-[var(--nl-navy)] text-white hover:bg-[var(--nl-navy-deep)]";
  const className = `${base} ${styles} ${extra}`.trim();
  const newTab = href.startsWith("http") || href.endsWith(".pdf");
  const native = newTab || href.startsWith("tel:") || href.startsWith("mailto:");
  if (native) {
    return (
      <a
        className={className}
        href={href}
        {...(newTab ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}
