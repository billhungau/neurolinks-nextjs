import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "accent";
};

export function ButtonLink({ href, children, variant = "primary" }: Props) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded px-5 py-2.5 text-sm font-semibold no-underline";
  const styles =
    variant === "primary"
      ? "bg-[#3260eb] text-white hover:bg-[#2448b8]"
      : variant === "accent"
        ? "bg-[#e8b923] text-[#1a2744] hover:bg-[#d4a017]"
        : "border border-slate-300 text-slate-800 hover:bg-slate-50";
  return (
    <Link className={`${base} ${styles}`} href={href}>
      {children}
    </Link>
  );
}
