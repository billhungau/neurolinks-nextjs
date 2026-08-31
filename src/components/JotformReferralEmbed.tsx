"use client";

import Script from "next/script";
import { FormEmbedSkeleton } from "@/components/FormEmbedSkeleton";
import { useJotformEmbed } from "@/components/useJotformEmbed";
import { JOTFORM_REFERRAL } from "@/lib/jotform-referral";
import { SITE } from "@/lib/site";

const STATUS = "Loading secure referral form…";

export function JotformReferralEmbed() {
  const { iframeReady, slow, initHandler } = useJotformEmbed({
    iframeId: JOTFORM_REFERRAL.iframeId,
    formId: JOTFORM_REFERRAL.formId,
    selector: JOTFORM_REFERRAL.selector,
    baseUrl: JOTFORM_REFERRAL.baseUrl,
  });

  return (
    <div
      className={`form-embed ref-embed${iframeReady ? " is-ready" : ""}`}
      aria-busy={!iframeReady}
    >
      <Script src={JOTFORM_REFERRAL.handlerSrc} strategy="afterInteractive" onLoad={initHandler} />
      <p className="form-embed-status" role="status" aria-live="polite">
        {iframeReady ? "Referral form loaded." : STATUS}
      </p>
      <FormEmbedSkeleton />
      <iframe
        id={JOTFORM_REFERRAL.iframeId}
        title={JOTFORM_REFERRAL.title}
        src={JOTFORM_REFERRAL.src}
        frameBorder={0}
        scrolling="no"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        aria-hidden={!iframeReady}
        className="form-embed-frame ref-embed-frame"
      />
      {slow && !iframeReady ? (
        <p className="form-embed-fallback" role="status">
          The online referral form is taking longer than expected to load. You may{" "}
          <a href={JOTFORM_REFERRAL.pdfUrl} rel="noopener noreferrer" target="_blank">
            download the PDF referral form
          </a>{" "}
          and fax it to <a href={SITE.faxHref}>{SITE.fax}</a>.
        </p>
      ) : null}
    </div>
  );
}
