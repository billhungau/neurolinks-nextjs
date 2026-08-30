import { ButtonLink } from "./ButtonLink";
import { Eyebrow } from "./Eyebrow";

export function CtaBand({
  eyebrow,
  title,
  body,
  href,
  label,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="bg-[var(--nl-navy)] px-4 py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl">
        <Eyebrow className="text-[var(--nl-yellow)]">{eyebrow}</Eyebrow>
        <h2 className="mt-4 max-w-2xl font-serif text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight">
          {title}
        </h2>
        <p className="prose-measure mt-4 text-base leading-relaxed text-white/80">{body}</p>
        <div className="mt-8">
          <ButtonLink href={href} variant="accent">
            {label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
