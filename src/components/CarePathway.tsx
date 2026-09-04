import { ButtonLink } from "@/components/ButtonLink";
import { HomeForwardMotion } from "@/components/HomeForwardMotion";
import { Reveal } from "@/components/Reveal";

export type CarePathwayIcon = "talk" | "assess" | "path" | "authorize" | "follow";

export type CarePathwayStep = {
  index: string;
  title: string;
  body: string;
  icon: CarePathwayIcon;
};

/**
 * Four-step navy pathway with the rising rail. The rail gradient id is static
 * because a page carries at most one pathway.
 */
const RAIL_GRADIENT_ID = "home-forward-line";

function PathwayIcon({ name }: { name: CarePathwayIcon }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "talk") {
    return (
      <svg {...common}>
        <path d="M4.5 15.2V7.8A2.3 2.3 0 0 1 6.8 5.5h7.4A2.3 2.3 0 0 1 16.5 7.8v5.2a2.3 2.3 0 0 1-2.3 2.3H9.2L4.5 18.4z" />
        <path d="M16.4 9.2h.8A2.3 2.3 0 0 1 19.5 11.5v5.1l-3.1-2.1H11.8" />
      </svg>
    );
  }
  if (name === "assess") {
    return (
      <svg {...common}>
        <path d="M8 4.5H5.5V7" />
        <path d="M16 4.5h2.5V7" />
        <path d="M8 19.5H5.5V17" />
        <path d="M16 19.5h2.5V17" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }
  if (name === "path") {
    return (
      <svg {...common}>
        <path d="M6 19.2c0-4.2 2.4-6.2 6-6.2" />
        <path d="M12 13c3.6 0 6-2 6-6.2" />
        <circle cx="6" cy="19.2" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="18" cy="6.8" r="1.35" fill="currentColor" stroke="none" />
        <circle cx="12" cy="13" r="1.45" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "authorize") {
    return (
      <svg {...common}>
        <path d="M7.4 4.5h6.3l3.9 3.9v11.1H7.4z" />
        <path d="M13.4 4.6v3.9h3.9" />
        <path d="M9.9 14.1l1.9 1.9 3.4-4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M7.2 9.2A5.1 5.1 0 0 1 16.6 8.4L18 6.8v4.4h-4.4" />
      <path d="M16.8 14.8A5.1 5.1 0 0 1 7.4 15.6L6 17.2v-4.4h4.4" />
    </svg>
  );
}

export function CarePathway({
  headingId,
  heading,
  intro,
  steps,
  ctaHref,
  ctaLabel,
}: {
  headingId: string;
  heading: string;
  intro: string;
  steps: readonly CarePathwayStep[];
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section className="home-section home-forward text-white" aria-labelledby={headingId}>
      <div className="nl-wrap">
        <Reveal>
          <h2 id={headingId} className="home-h2 max-w-3xl">
            {heading}
          </h2>
          <p className="home-forward-lede">{intro}</p>
        </Reveal>
        <HomeForwardMotion>
          <svg
            className="home-forward-rail-svg"
            viewBox="0 0 1000 84"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={RAIL_GRADIENT_ID} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6f9c96" />
                <stop offset="1" stopColor="#e8b923" />
              </linearGradient>
            </defs>
            <path
              d="M0 50.4 C 280 46, 720 32, 1000 27.2"
              fill="none"
              pathLength={1}
              stroke={`url(#${RAIL_GRADIENT_ID})`}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <ol className="home-forward-list">
            {steps.map((step) => (
              <li key={step.index} className="home-forward-item">
                <span className="home-forward-node" aria-hidden="true">
                  <PathwayIcon name={step.icon} />
                </span>
                <div className="home-forward-copy">
                  <p className="home-forward-step">Step {step.index}</p>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </HomeForwardMotion>
        <div className="home-forward-foot">
          <ButtonLink href={ctaHref} variant="accent" className="home-forward-cta">
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
