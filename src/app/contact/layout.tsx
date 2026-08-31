import type { ReactNode } from "react";

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://form.jotform.com" />
      <link rel="preconnect" href="https://cdn.jotfor.ms" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://form.jotform.com" />
      <link rel="dns-prefetch" href="https://cdn.jotfor.ms" />
      {children}
    </>
  );
}
