"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { JOTFORM_REFERRAL } from "@/lib/jotform-referral";
import { MEDIA } from "@/lib/media";

const initializedIframes = new Set<string>();

export function JotformReferralEmbed() {
  const [iframeReady, setIframeReady] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const failTimer = useRef<number>(0);

  const initHandler = useCallback(() => {
    if (typeof window.jotformEmbedHandler !== "function") return;
    const iframe = document.getElementById(JOTFORM_REFERRAL.iframeId);
    if (!(iframe instanceof HTMLIFrameElement)) return;
    if (initializedIframes.has(JOTFORM_REFERRAL.iframeId)) return;
    initializedIframes.add(JOTFORM_REFERRAL.iframeId);
    window.jotformEmbedHandler(JOTFORM_REFERRAL.selector, JOTFORM_REFERRAL.baseUrl);
  }, []);

  useEffect(() => {
    if (iframeReady && scriptReady) initHandler();
  }, [iframeReady, scriptReady, initHandler]);

  useEffect(() => {
    failTimer.current = window.setTimeout(() => {
      setFailed((current) => (iframeReady ? current : true));
    }, 18000);
    return () => {
      window.clearTimeout(failTimer.current);
      if (!document.getElementById(JOTFORM_REFERRAL.iframeId)) {
        initializedIframes.delete(JOTFORM_REFERRAL.iframeId);
      }
    };
  }, [iframeReady]);

  if (failed && !iframeReady) {
    return <ReferralEmbedFallback />;
  }

  return (
    <div
      className={`ref-embed${iframeReady ? " is-ready" : ""}`}
      aria-busy={!iframeReady}
    >
      {!iframeReady ? (
        <p className="ref-embed-status" role="status" aria-live="polite">
          Loading the physician referral form.
        </p>
      ) : null}
      <iframe
        id={JOTFORM_REFERRAL.iframeId}
        title={JOTFORM_REFERRAL.title}
        src={JOTFORM_REFERRAL.src}
        frameBorder={0}
        scrolling="no"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setIframeReady(true)}
        onError={() => setFailed(true)}
        className="ref-embed-frame"
      />
      <Script
        src={JOTFORM_REFERRAL.handlerSrc}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
    </div>
  );
}

function ReferralEmbedFallback() {
  return (
    <div className="ref-embed-fallback" role="alert">
      <p>The online referral form could not be loaded.</p>
      <ul>
        <li>
          <a
            href={JOTFORM_REFERRAL.src}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open the referral form directly
          </a>
        </li>
        <li>
          <a href={MEDIA.referralPdf} rel="noopener noreferrer" target="_blank">
            Download the PDF referral form
          </a>
        </li>
        <li>Fax number: 250-739-5530</li>
      </ul>
    </div>
  );
}
