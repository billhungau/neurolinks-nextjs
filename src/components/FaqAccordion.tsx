"use client";

import { useId, useState } from "react";
import type { FaqItem } from "@/content/faqs";

export function FaqAccordion({
  items,
  variant = "default",
}: {
  items: FaqItem[];
  variant?: "default" | "editorial";
}) {
  const base = useId();
  const [open, setOpen] = useState<number | null>(null);
  const editorial = variant === "editorial";

  if (editorial) {
    return (
      <div className="tms-faq">
        {items.map((item) => (
          <EditorialFaqItem key={item.q} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {items.map((item, i) => {
        const panelId = `${base}-panel-${i}`;
        const buttonId = `${base}-btn-${i}`;
        const expanded = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-start justify-between gap-4 py-4 text-left text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3260eb]"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span>{item.q}</span>
                <span aria-hidden="true">{expanded ? "−" : "+"}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className="pb-4 text-sm leading-relaxed text-slate-800"
            >
              {expanded ? <p>{item.a}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EditorialFaqItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <details
      className="tms-faq-item"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="tms-faq-question" aria-expanded={open}>
        <h3>{item.q}</h3>
        <span className="tms-faq-mark" aria-hidden="true" />
      </summary>
      <p className="tms-faq-answer">{item.a}</p>
    </details>
  );
}
