"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { JOTFORM_REFERRAL } from "@/lib/jotform-referral";

const initializedIframes = new Set<string>();

export function JotformReferralEmbed() {
  const [iframeReady, setIframeReady] = useState(false);
  const [slow, setSlow] = useState(false);
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
    initHandler();
    if (typeof window.jotformEmbedHandler === "function") return undefined;
    const id = window.setInterval(() => {
      if (typeof window.jotformEmbedHandler === "function") {
        window.clearInterval(id);
        initHandler();
      }
    }, 50);
    return () => {
      window.clearInterval(id);
      if (!document.getElementById(JOTFORM_REFERRAL.iframeId)) {
        initializedIframes.delete(JOTFORM_REFERRAL.iframeId);
      }
    };
  }, [initHandler]);

  useEffect(() => {
    const iframe = document.getElementById(JOTFORM_REFERRAL.iframeId);
    if (!(iframe instanceof HTMLIFrameElement)) return undefined;

    const markReady = () => setIframeReady(true);
    iframe.addEventListener("load", markReady);

    // React onLoad can miss if the iframe finishes before hydration.
    // A cross-origin document is already present when location.href throws.
    let alreadyLoaded = performance
      .getEntriesByType("resource")
      .some((entry) => entry.name.includes(JOTFORM_REFERRAL.formId));
    try {
      const href = iframe.contentWindow?.location.href ?? "";
      if (href && href !== "about:blank") alreadyLoaded = true;
    } catch {
      alreadyLoaded = true;
    }
    if (alreadyLoaded) markReady();

    const reserved = window.matchMedia("(min-width: 768px)").matches
      ? JOTFORM_REFERRAL.initialMinHeight
      : 950;
    const poll = window.setInterval(() => {
      if (iframe.getBoundingClientRect().height > reserved + 80) {
        markReady();
        window.clearInterval(poll);
      }
    }, 200);

    return () => {
      iframe.removeEventListener("load", markReady);
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    failTimer.current = window.setTimeout(() => {
      setSlow((current) => (iframeReady ? current : true));
    }, 12000);
    return () => window.clearTimeout(failTimer.current);
  }, [iframeReady]);

  return (
    <div className={`ref-embed${iframeReady ? " is-ready" : ""}`} aria-busy={!iframeReady}>
      <Script src={JOTFORM_REFERRAL.handlerSrc} strategy="afterInteractive" onLoad={initHandler} />
      {!iframeReady ? (
        <p className="ref-embed-status" role="status" aria-live="polite">
          Loading referral form…
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
        className="ref-embed-frame"
      />
      {slow && !iframeReady ? (
        <p className="ref-embed-fallback">
          <a href={JOTFORM_REFERRAL.src} rel="noopener noreferrer" target="_blank">
            Open the referral form directly
          </a>
        </p>
      ) : null}
    </div>
  );
}
