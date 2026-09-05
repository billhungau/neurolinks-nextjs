"use client";

export function EditorialGuidance() {
  return (
    <div
      style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
        color: "#1c2438",
        lineHeight: 1.65,
      }}
    >
      <p style={{ letterSpacing: "0.16em", textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 600, color: "#3d5a8c" }}>
        NeuroLinks Insights
      </p>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 600, color: "#1a2744" }}>
        Editorial guidance
      </h1>
      <p>
        Write as an experienced psychiatrist explaining difficult choices clearly. The public
        impression should be: this clinic understands the evidence, explains it honestly and can
        help the reader make sense of their options.
      </p>
      <h2>Tone</h2>
      <ul>
        <li>Calm, direct and compassionate</li>
        <li>Evidence-informed and clinically precise</li>
        <li>Hopeful without promising results</li>
        <li>Comfortable acknowledging uncertainty</li>
      </ul>
      <h2>Preferred style</h2>
      <blockquote style={{ margin: "1rem 0", paddingLeft: "1rem", borderLeft: "3px solid #e8b923" }}>
        When medication and psychotherapy have not provided enough improvement, TMS may offer
        another evidence-based treatment approach without medication-related sedation.
      </blockquote>
      <h2>Do not use</h2>
      <ul>
        <li>Miracle, cure, revolutionary, guaranteed</li>
        <li>Works when everything else has failed</li>
        <li>Transform your life</li>
        <li>Unqualified superiority claims</li>
        <li>Language that implies equal evidence across all diagnoses</li>
        <li>Language that implies coverage is automatic</li>
      </ul>
      <h2>Evidence and comparison</h2>
      <p>
        When findings come from indirect comparisons rather than head-to-head randomized trials,
        say so in the visible article. Do not turn evidence summaries into promotional statistics.
      </p>
      <h2>VAC and coverage</h2>
      <p>
        Distinguish clinical suitability, funding eligibility, preauthorization and treatment
        availability. Do not imply that VAC endorsement, authorization or payment is guaranteed.
        Do not use the VAC logo without confirmed permission.
      </p>
      <h2>Patient information</h2>
      <p>
        Do not enter identifiable patient information into article content, images, captions or
        editorial notes. Use clinic photography already in the website, or original diagrams.
      </p>
      <h2>Publishing</h2>
      <p>
        Keep unfinished articles as Sanity drafts. Do not publish until medical content and
        references have been reviewed. Public Insights stays hidden until{" "}
        <code>NEXT_PUBLIC_INSIGHTS_ENABLED=true</code> and at least one complete article is
        published.
      </p>
    </div>
  );
}
