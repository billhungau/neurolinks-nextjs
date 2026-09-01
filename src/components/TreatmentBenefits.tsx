import { Reveal } from "./Reveal";

function FieldMotif() {
  return (
    <svg
      className="benefit-motif pointer-events-none absolute -right-10 -bottom-16 h-[16rem] w-[16rem]"
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="132" cy="132" r="22" />
        <circle cx="132" cy="132" r="40" />
        <circle cx="132" cy="132" r="58" />
        <circle cx="132" cy="132" r="76" />
        <circle cx="132" cy="132" r="94" />
      </g>
    </svg>
  );
}

function RippleMotif() {
  return (
    <svg
      className="benefit-motif pointer-events-none absolute -right-12 -bottom-14 h-[15.5rem] w-[15.5rem]"
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <ellipse cx="128" cy="128" rx="24" ry="18" />
        <ellipse cx="128" cy="128" rx="44" ry="34" />
        <ellipse cx="128" cy="128" rx="66" ry="50" />
        <ellipse cx="128" cy="128" rx="88" ry="66" />
        <path d="M40 128h176" />
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
          <article className="benefit-card benefit-card-tms benefits-step step-b relative h-full overflow-hidden">
            <FieldMotif />
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
          <article className="benefit-card benefit-card-ketamine benefits-step step-c relative h-full overflow-hidden">
            <RippleMotif />
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

        <p className="benefit-note benefits-step step-d">
          Individual outcomes vary. Treatment is recommended only when clinically appropriate.
          Medication should not be changed without medical guidance.
        </p>
      </Reveal>
    </section>
  );
}
