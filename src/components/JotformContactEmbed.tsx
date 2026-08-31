"use client";

import Script from "next/script";
import { FormEmbedSkeleton } from "@/components/FormEmbedSkeleton";
import { useJotformEmbed } from "@/components/useJotformEmbed";
import { JOTFORM_CONTACT } from "@/lib/jotform-contact";
import { SITE } from "@/lib/site";

const STATUS = "Loading secure contact form…";

export function JotformContactEmbed() {
  const { iframeReady, slow, waiting, initHandler } = useJotformEmbed({
    iframeId: JOTFORM_CONTACT.iframeId,
    formId: JOTFORM_CONTACT.formId,
    selector: JOTFORM_CONTACT.selector,
    baseUrl: JOTFORM_CONTACT.baseUrl,
  });

  return (
    <div
      className={`form-embed ct-embed${waiting ? " is-waiting" : ""}${iframeReady ? " is-ready" : ""}`}
      aria-busy={waiting && !iframeReady}
    >
      <Script src={JOTFORM_CONTACT.handlerSrc} strategy="afterInteractive" onLoad={initHandler} />
      <p className="form-embed-status" role="status" aria-live="polite">
        {iframeReady ? "Contact form loaded." : STATUS}
      </p>
      <FormEmbedSkeleton variant="contact" />
      <iframe
        id={JOTFORM_CONTACT.iframeId}
        title={JOTFORM_CONTACT.title}
        src={JOTFORM_CONTACT.src}
        allowTransparency
        allow="geolocation; microphone; camera; fullscreen; payment"
        frameBorder={0}
        scrolling="no"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        className="form-embed-frame ct-embed-frame"
      />
      {slow && !iframeReady ? (
        <p className="form-embed-fallback" role="status">
          The contact form is taking longer than expected to load. You can contact the clinic by
          phone at{" "}
          <a href={SITE.phoneHref}>{SITE.phone}</a> or email{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      ) : null}
    </div>
  );
}
