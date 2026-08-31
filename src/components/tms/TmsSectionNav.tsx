"use client";

import { useEffect, useState } from "react";

export const TMS_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-tms-works", label: "How it works" },
  { id: "conditions", label: "Conditions" },
  { id: "eligibility", label: "Eligibility" },
  { id: "coverage", label: "Coverage" },
  { id: "faqs", label: "FAQs" },
] as const;

export function TmsSectionNav() {
  const [active, setActive] = useState<string>(TMS_SECTIONS[0].id);

  useEffect(() => {
    const nodes = TMS_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    if (nodes.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.4],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="tms-subnav" aria-label="On this page">
      <div className="tms-subnav-inner">
        {TMS_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={active === section.id ? "is-active" : undefined}
            aria-current={active === section.id ? "location" : undefined}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
