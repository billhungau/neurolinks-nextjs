import { ButtonLink } from "@/components/ButtonLink";
import { Reveal } from "@/components/Reveal";

export type VeteransPathwayStep = {
  index: string;
  title: string;
  body: string;
  icon?: string;
};

type Props = {
  sectionId: string;
  headingId: string;
  eyebrow: string;
  heading: string;
  intro: string;
  steps: readonly VeteransPathwayStep[];
  ctaHref: string;
  ctaLabel: string;
};

function StepIcon({ icon }: { icon?: string }) {
  if (icon === "talk") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M9 12.5h30v20H24l-8 6v-6H9z" />
        <path d="M16 20h16M16 25h10" />
      </svg>
    );
  }

  if (icon === "assess") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="18" cy="18" r="5" />
        <circle cx="31" cy="19" r="4" />
        <path d="M9 35c1.5-6 5-9 9-9s7.5 3 9 9M26 34c1-4.5 3.5-7 7-7 3.1 0 5.4 2 6.5 5.5" />
      </svg>
    );
  }

  if (icon === "authorize") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M14 7h16l7 7v27H14z" />
        <path d="M30 7v8h7M20 23h11M20 29h11" />
        <path d="m20 35 3 3 7-8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 39V19" />
      <path d="M24 25c-7 0-11-4-11-11 7 0 11 4 11 11ZM24 31c7 0 11-4 11-11-7 0-11 4-11 11Z" />
      <path d="M15 40h18" />
    </svg>
  );
}

export function VeteransCarePathway({
  sectionId,
  headingId,
  eyebrow,
  heading,
  intro,
  steps,
  ctaHref,
  ctaLabel,
}: Props) {
  return (
    <section id={sectionId} className="vet-journey vet-anchor-target" aria-labelledby={headingId}>
      <div className="tms-wrap">
        <Reveal className="vet-journey-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId} className="tms-h2 mt-3">{heading}</h2>
          <p className="tms-lede mt-4">{intro}</p>
        </Reveal>

        <Reveal className="vet-journey-map">
          <div className="vet-journey-line" aria-hidden="true" />
          <ol className="vet-journey-steps">
            {steps.map((step) => (
              <li key={step.index} className="vet-journey-step">
                <div className="vet-journey-marker-wrap">
                  <span className="vet-journey-index">{step.index}</span>
                  <span className="vet-journey-icon">
                    <StepIcon icon={step.icon} />
                  </span>
                </div>
                <div className="vet-journey-copy">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="vet-journey-cta">
          <ButtonLink href={ctaHref} variant="accent">{ctaLabel}</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
