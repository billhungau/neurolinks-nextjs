import Link from "next/link";

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const newTab = href.startsWith("http") || href.endsWith(".pdf");
  const classNames = `text-link ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      <span aria-hidden="true" className="text-link-arrow">
        →
      </span>
    </>
  );
  if (newTab) {
    return (
      <a className={classNames} href={href} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    );
  }
  return (
    <Link className={classNames} href={href}>
      {content}
    </Link>
  );
}
