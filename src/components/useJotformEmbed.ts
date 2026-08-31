"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const initializedIframes = new Set<string>();
const readyIframes = new Set<string>();
const emptySubscribe = () => () => {};

function useClientFlag() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type Options = {
  iframeId: string;
  formId: string;
  selector: string;
  baseUrl: string;
  timeoutMs?: number;
};

export function useJotformEmbed({
  iframeId,
  formId,
  selector,
  baseUrl,
  timeoutMs = 8000,
}: Options) {
  const [iframeReady, setIframeReady] = useState(() => readyIframes.has(iframeId));
  const [slow, setSlow] = useState(false);
  const waiting = useClientFlag();

  const markReady = useCallback(() => {
    readyIframes.add(iframeId);
    setIframeReady(true);
  }, [iframeId]);

  const initHandler = useCallback(() => {
    if (typeof window.jotformEmbedHandler !== "function") return;
    const iframe = document.getElementById(iframeId);
    if (!(iframe instanceof HTMLIFrameElement)) return;
    if (initializedIframes.has(iframeId)) return;
    initializedIframes.add(iframeId);
    window.jotformEmbedHandler(selector, baseUrl);
  }, [baseUrl, iframeId, selector]);

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
      if (!document.getElementById(iframeId)) {
        initializedIframes.delete(iframeId);
      }
    };
  }, [iframeId, initHandler]);

  useEffect(() => {
    const iframe = document.getElementById(iframeId);
    if (!(iframe instanceof HTMLIFrameElement)) return undefined;

    let settle: number | undefined;
    const onLoad = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(markReady, 450);
    };
    iframe.addEventListener("load", onLoad);

    const already = performance
      .getEntriesByType("resource")
      .some((entry) => entry.name.includes(formId) && entry.duration > 0);
    if (already) onLoad();

    const startHeight = iframe.getBoundingClientRect().height;
    const poll = window.setInterval(() => {
      const height = iframe.getBoundingClientRect().height;
      if (height > startHeight + 40) {
        markReady();
        window.clearInterval(poll);
      }
    }, 250);

    return () => {
      iframe.removeEventListener("load", onLoad);
      window.clearTimeout(settle);
      window.clearInterval(poll);
    };
  }, [formId, iframeId, markReady]);

  useEffect(() => {
    if (iframeReady) return undefined;
    const id = window.setTimeout(() => setSlow(true), timeoutMs);
    return () => window.clearTimeout(id);
  }, [iframeReady, timeoutMs]);

  return { iframeReady, slow, waiting, initHandler, markReady };
}
