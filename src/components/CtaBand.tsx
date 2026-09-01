import { ButtonLink } from "./ButtonLink";
import { Eyebrow } from "./Eyebrow";

export function CtaBand({
  eyebrow,
  title,
  body,
  href,
  label,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="bg-[var(--nl-navy)] home-section px-0 text-white">
      <div className="nl-wrap">
        {eyebrow ? <Eyebrow className="text-[var(--nl-yellow)]">{eyebrow}</Eyebrow> : null}
        <h2
          className={`${eyebrow ? "mt-4" : ""} max-w-2xl font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-tight`.trim()}
        >
          {title}
        </h2>
        <p className="prose-measure mt-4 text-base leading-relaxed text-white/80">{body}</p>
        <div className="mt-7">
          <ButtonLink href={href} variant="accent">
            {label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
