import { Reveal } from "./Reveal";

function FieldMotif() {
  return (
    <svg
      className="benefit-motif"
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="168" cy="168" r="16" />
        <circle cx="168" cy="168" r="30" />
        <circle cx="168" cy="168" r="46" />
        <circle cx="168" cy="168" r="62" />
        <circle cx="168" cy="168" r="78" />
      </g>
    </svg>
  );
}

function RippleMotif() {
  return (
    <svg
      className="benefit-motif"
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <ellipse cx="166" cy="166" rx="16" ry="12" />
        <ellipse cx="166" cy="166" rx="30" ry="22" />
        <ellipse cx="166" cy="166" rx="46" ry="34" />
        <ellipse cx="166" cy="166" rx="62" ry="46" />
        <path d="M88 166h176" />
      </g>
    </svg>
  );
}

export function TreatmentBenefits() {
  return (
    <section className="benefits bg-[var(--nl-cream)] home-section">
      <Reveal className="benefits-seq nl-wrap">
        <div className="benefits-step step-a">
          <h2 className="home-h2 max-w-3xl text-[var(--nl-navy)]">
            What these treatments can offer
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            TMS and ketamine offer different potential benefits. Treatment begins with psychiatric
            assessment and is recommended only when clinically appropriate.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-2 md:items-stretch md:gap-6">
          <article className="benefit-card benefit-card-tms benefits-step step-b relative h-full">
            <div className="benefit-motif-clip" aria-hidden="true">
              <FieldMotif />
            </div>
            <div className="benefit-copy">
              <h3 className="benefit-title text-[var(--nl-navy)]">
                TMS: an effective, non-invasive option
              </h3>
              <p className="benefit-body text-[var(--nl-muted)]">
                For people whose depression has not improved sufficiently with antidepressants,
                TMS can be more effective than trying another conventional medication. TMS is
                non-invasive, requires no anesthesia and is generally well tolerated.
              </p>
            </div>
          </article>
          <article className="benefit-card benefit-card-ketamine benefits-step step-c relative h-full">
            <div className="benefit-motif-clip" aria-hidden="true">
              <RippleMotif />
            </div>
            <div className="benefit-copy">
              <h3 className="benefit-title text-[var(--nl-navy)]">
                Ketamine: improvement may begin within hours or days
              </h3>
              <p className="benefit-body text-[var(--nl-muted)]">
                Ketamine can reduce depressive symptoms within hours to days in some
                people—considerably faster than conventional antidepressants. Ketamine is
                administered in a controlled clinical setting with medical supervision.
              </p>
            </div>
          </article>
        </div>
      </Reveal>
    </section>
  );
}
