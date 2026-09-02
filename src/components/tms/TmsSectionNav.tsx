"use client";

import { useEffect, useLayoutEffect, useState } from "react";

export type SectionLink = { id: string; label: string };

export const TMS_SECTIONS: SectionLink[] = [
  { id: "overview", label: "Overview" },
  { id: "how-tms-works", label: "How it works" },
  { id: "conditions", label: "Conditions" },
  { id: "eligibility", label: "Eligibility" },
  { id: "coverage", label: "Coverage" },
  { id: "faqs", label: "FAQs" },
];

export function TmsSectionNav({
  sections = TMS_SECTIONS,
}: {
  sections?: readonly SectionLink[];
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useLayoutEffect(() => {
    document.documentElement.classList.add("has-tms-subnav");
    return () => {
      document.documentElement.classList.remove("has-tms-subnav");
    };
  }, []);

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
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
  }, [sections]);

  return (
    <nav className="tms-subnav" aria-label="On this page">
      <div className="tms-subnav-inner">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(event) => {
              if (window.location.hash !== `#${section.id}`) return;
              event.preventDefault();
              document.getElementById(section.id)?.scrollIntoView();
            }}
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
