"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { JOTFORM_CONTACT } from "@/lib/jotform-contact";

const initializedIframes = new Set<string>();
const readyIframes = new Set<string>();

export function JotformContactEmbed() {
  const [iframeReady, setIframeReady] = useState(() => readyIframes.has(JOTFORM_CONTACT.iframeId));
  const [slow, setSlow] = useState(false);
  const failTimer = useRef<number>(0);

  const markReady = useCallback(() => {
    readyIframes.add(JOTFORM_CONTACT.iframeId);
    setIframeReady(true);
  }, []);

  const initHandler = useCallback(() => {
    if (typeof window.jotformEmbedHandler !== "function") return;
    const iframe = document.getElementById(JOTFORM_CONTACT.iframeId);
    if (!(iframe instanceof HTMLIFrameElement)) return;
    if (initializedIframes.has(JOTFORM_CONTACT.iframeId)) return;
    initializedIframes.add(JOTFORM_CONTACT.iframeId);
    window.jotformEmbedHandler(JOTFORM_CONTACT.selector, JOTFORM_CONTACT.baseUrl);
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
      if (!document.getElementById(JOTFORM_CONTACT.iframeId)) {
        initializedIframes.delete(JOTFORM_CONTACT.iframeId);
      }
    };
  }, [initHandler]);

  useEffect(() => {
    const iframe = document.getElementById(JOTFORM_CONTACT.iframeId);
    if (!(iframe instanceof HTMLIFrameElement)) return undefined;

    iframe.addEventListener("load", markReady);

    let alreadyLoaded = performance
      .getEntriesByType("resource")
      .some((entry) => entry.name.includes(JOTFORM_CONTACT.formId));
    try {
      const href = iframe.contentWindow?.location.href ?? "";
      if (href && href !== "about:blank") alreadyLoaded = true;
    } catch {
      alreadyLoaded = true;
    }
    if (alreadyLoaded) queueMicrotask(markReady);

    const reserved = window.matchMedia("(min-width: 768px)").matches
      ? JOTFORM_CONTACT.initialMinHeight
      : JOTFORM_CONTACT.mobileMinHeight;
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
  }, [markReady]);

  useEffect(() => {
    failTimer.current = window.setTimeout(() => {
      setSlow((current) => (iframeReady ? current : true));
    }, 12000);
    return () => window.clearTimeout(failTimer.current);
  }, [iframeReady]);

  return (
    <div className={`ct-embed${iframeReady ? " is-ready" : ""}`} aria-busy={!iframeReady}>
      <Script
        src={JOTFORM_CONTACT.handlerSrc}
        strategy="afterInteractive"
        onLoad={() => {
          initHandler();
          markReady();
        }}
      />
      {!iframeReady ? (
        <p className="ct-embed-status" role="status" aria-live="polite">
          Loading secure contact form…
        </p>
      ) : null}
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
        onLoad={markReady}
        className="ct-embed-frame"
      />
      {slow && !iframeReady ? (
        <p className="ct-embed-fallback">
          <a href={JOTFORM_CONTACT.src} rel="noopener noreferrer" target="_blank">
            Open the contact form directly
          </a>
        </p>
      ) : null}
    </div>
  );
}
