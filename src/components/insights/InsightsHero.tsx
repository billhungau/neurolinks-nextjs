import { NeuralMotif } from "./EditorialDiagram";
import { INSIGHTS_EYEBROW } from "@/lib/insights";

export function InsightsHero({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  return (
    <section className="insights-hero">
      <div className="nl-wrap insights-hero-inner">
        <div className="insights-hero-copy">
          <p className="eyebrow">{INSIGHTS_EYEBROW}</p>
          <h1>{heading}</h1>
          <p className="insights-hero-lede">{body}</p>
        </div>
        <div className="insights-hero-motif" aria-hidden="true">
          <NeuralMotif />
        </div>
      </div>
    </section>
  );
}
