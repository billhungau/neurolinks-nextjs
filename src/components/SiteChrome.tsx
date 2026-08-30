import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteChrome({
  children,
  overlayHeader = false,
}: {
  children: React.ReactNode;
  /** Float the mobile header over a full-bleed hero instead of sitting above it. */
  overlayHeader?: boolean;
}) {
  return (
    <>
      <SiteHeader overlay={overlayHeader} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
