import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";

function WaveMotif() {
  return (
    <svg
      className="benefit-motif pointer-events-none absolute inset-y-0 right-0 h-full w-[min(42%,18rem)]"
      viewBox="0 0 280 220"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.15">
        <path d="M20 36c42 18 78-16 122 0s78-16 138 0" />
        <path d="M8 68c46 20 86-18 132 0s86-18 148 0" />
        <path d="M0 100c50 22 92-20 142 0s92-20 158 0" />
        <path d="M16 132c44 18 82-16 128 0s82-16 144 0" />
        <path d="M28 164c40 16 74-14 116 0s74-14 132 0" />
      </g>
    </svg>
  );
}

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
    <section className="benefits bg-[var(--nl-cream)] px-5 py-16 md:px-4 md:py-[4.5rem]">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <Eyebrow>Treatment benefits</Eyebrow>
          <h2 className="mt-3 max-w-3xl font-serif text-[clamp(1.85rem,3.6vw,3rem)] font-semibold leading-tight text-[var(--nl-navy)]">
            What these treatments can offer
          </h2>
          <p className="prose-measure mt-4 leading-relaxed text-[var(--nl-muted)]">
            TMS and ketamine offer different potential benefits. Treatment begins with psychiatric
            assessment and is recommended only when clinically appropriate.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:mt-10 md:gap-6">
          <Reveal delayMs={80}>
            <article className="benefit-card benefit-card-shared relative overflow-hidden">
              <WaveMotif />
              <div className="benefit-card-grid">
                <div className="benefit-rail">
                  <p className="benefit-label text-[var(--nl-yellow)]">Applies to both treatments</p>
                  <p className="benefit-num text-[var(--nl-yellow)]" aria-hidden="true">
                    01
                  </p>
                </div>
                <div className="benefit-copy">
                  <h3 className="benefit-title text-white">
                    Psychiatrist-led assessment and careful monitoring
                  </h3>
                  <p className="benefit-body text-white/90">
                    Before either treatment is recommended, a psychiatrist reviews your diagnosis,
                    treatment history and relevant medical factors. Treatment response, tolerability
                    and safety are monitored throughout care, with recommendations adjusted according
                    to clinical progress and individual needs.
                  </p>
                </div>
              </div>
            </article>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            <Reveal className="h-full" delayMs={160}>
              <article className="benefit-card benefit-card-tms relative h-full overflow-hidden">
                <FieldMotif />
                <div className="benefit-card-grid">
                  <div className="benefit-rail">
                    <p className="benefit-label text-[var(--nl-blue)]">TMS</p>
                    <p className="benefit-num text-[var(--nl-blue)]" aria-hidden="true">
                      02
                    </p>
                  </div>
                  <div className="benefit-copy">
                    <h3 className="benefit-title text-[var(--nl-navy)]">
                      An effective, non-invasive option
                    </h3>
                    <p className="benefit-body text-[var(--nl-muted)]">
                      For people whose depression has not improved sufficiently with antidepressants,
                      TMS can be more effective than trying another conventional medication. TMS is
                      non-invasive, requires no anesthesia and is generally well tolerated.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
            <Reveal className="h-full" delayMs={220}>
              <article className="benefit-card benefit-card-ketamine relative h-full overflow-hidden">
                <RippleMotif />
                <div className="benefit-card-grid">
                  <div className="benefit-rail">
                    <p className="benefit-label text-[var(--nl-yellow-hover)]">Ketamine</p>
                    <p className="benefit-num text-[var(--nl-yellow-hover)]" aria-hidden="true">
                      03
                    </p>
                  </div>
                  <div className="benefit-copy">
                    <h3 className="benefit-title text-[var(--nl-navy)]">
                      Improvement may begin within hours or days
                    </h3>
                    <p className="benefit-body text-[var(--nl-muted)]">
                      Ketamine can reduce depressive symptoms within hours to days in some
                      people—considerably faster than conventional antidepressants. Ketamine is
                      administered in a controlled clinical setting with medical supervision.
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>

          <Reveal delayMs={280}>
            <aside className="benefit-funding" aria-labelledby="funding-heading">
              <h3 id="funding-heading" className="benefit-title text-[var(--nl-navy)]">
                Assessment and treatment funding
              </h3>
              <div className="benefit-funding-cols">
                <div>
                  <h4 className="benefit-label text-[var(--nl-blue)]">MSP-covered assessment</h4>
                  <p className="benefit-body mt-3 text-[var(--nl-muted)]">
                    Psychiatric assessment is covered by MSP for eligible BC residents when referral
                    requirements are met.
                  </p>
                </div>
                <div>
                  <h4 className="benefit-label text-[var(--nl-blue)]">TMS funding</h4>
                  <p className="benefit-body mt-3 text-[var(--nl-muted)]">
                    TMS funding may be available to eligible patients through Veterans Affairs
                    Canada, WorkSafeBC and other third-party programs. Approval depends on the
                    patient&apos;s eligibility and the requirements of the individual funding
                    program.
                  </p>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>

        <Reveal delayMs={340}>
          <p className="benefit-note">
            Individual outcomes vary. Treatment is recommended only when clinically appropriate.
            Medication should not be changed without medical guidance.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

