type Diagram = "vacPathway" | "symptomOverlap" | "neuralMotif";

export function NeuralMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 360"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="nl-path-a" x1="40" y1="40" x2="600" y2="320" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3d5a8c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#6f9c96" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path
        d="M48 220C120 120 170 96 250 140C330 184 360 250 430 210C500 170 540 90 596 70"
        stroke="url(#nl-path-a)"
        strokeWidth="1.2"
      />
      <path
        d="M36 150C110 180 190 240 280 200C370 160 410 80 500 110C560 130 590 190 612 240"
        stroke="#1a2744"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <path
        d="M80 80C140 130 210 150 260 110C330 58 390 40 470 88C530 124 560 200 590 280"
        stroke="#8eaa7e"
        strokeOpacity="0.28"
        strokeWidth="1"
      />
      {[
        [250, 140],
        [430, 210],
        [280, 200],
        [500, 110],
        [260, 110],
        [470, 88],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" fill="#1a2744" fillOpacity="0.35" />
      ))}
    </svg>
  );
}

function VacPathwayGraphic() {
  const steps = ["Conversation", "Assessment", "Documentation", "Decision"];
  return (
    <svg viewBox="0 0 720 160" fill="none" role="img" aria-label="Four-step VAC authorization pathway">
      <title>VAC authorization pathway</title>
      <path d="M48 80H672" stroke="#6f9c96" strokeOpacity="0.45" strokeWidth="1.5" />
      {steps.map((label, index) => {
        const x = 48 + index * 208;
        return (
          <g key={label}>
            <circle cx={x} cy={80} r="18" fill="#f4f0e8" stroke="#2f6b4f" strokeWidth="1.25" />
            <text x={x} y={85} textAnchor="middle" fill="#1a2744" fontSize="13" fontWeight="600">
              {index + 1}
            </text>
            <text x={x} y={124} textAnchor="middle" fill="#1a2744" fontSize="13">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SymptomOverlapGraphic() {
  return (
    <svg
      viewBox="0 0 640 320"
      fill="none"
      role="img"
      aria-labelledby="insights-overlap-title insights-overlap-desc"
    >
      <title id="insights-overlap-title">Overlapping symptoms that may be present together</title>
      <desc id="insights-overlap-desc">
        Depression, trauma-related symptoms, anxiety, sleep disturbance and functional impairment
        can overlap. This diagram does not imply equal treatment evidence for each condition.
      </desc>
      <circle cx="250" cy="150" r="92" stroke="#3d5a8c" strokeWidth="1.25" fill="#3d5a8c" fillOpacity="0.06" />
      <circle cx="360" cy="150" r="92" stroke="#6f9c96" strokeWidth="1.25" fill="#6f9c96" fillOpacity="0.06" />
      <circle cx="305" cy="220" r="92" stroke="#8eaa7e" strokeWidth="1.25" fill="#8eaa7e" fillOpacity="0.06" />
      <text x="200" y="108" fill="#1a2744" fontSize="13">
        Depression
      </text>
      <text x="372" y="108" fill="#1a2744" fontSize="13">
        Trauma-related
      </text>
      <text x="268" y="268" fill="#1a2744" fontSize="13">
        Anxiety
      </text>
      <text x="268" y="168" fill="#1a2744" fontSize="12">
        Sleep
      </text>
      <text x="246" y="188" fill="#1a2744" fontSize="12">
        Function
      </text>
    </svg>
  );
}

export function EditorialDiagram({
  diagram,
  caption,
}: {
  diagram: Diagram;
  caption?: string | null;
}) {
  return (
    <figure className="insights-diagram">
      {diagram === "vacPathway" ? <VacPathwayGraphic /> : null}
      {diagram === "symptomOverlap" ? <SymptomOverlapGraphic /> : null}
      {diagram === "neuralMotif" ? <NeuralMotif className="insights-diagram-motif" /> : null}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
