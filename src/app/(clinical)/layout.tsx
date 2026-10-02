import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Secure Questionnaires | NeuroLinks",
  description: "Secure NeuroLinks clinical questionnaire portal.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
    },
  },
};

export default function ClinicalLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#f7f8fa",
          color: "#111827",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
