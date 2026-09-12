"use client";

import { useEffect } from "react";

export function ReferralScrollReset() {
  useEffect(() => {
    const root = document.querySelector(".physician-referral-experience");
    if (!root) return undefined;

    let frame1 = 0;
    let frame2 = 0;
    let timer = 0;

    const resetScrollAfterSuccess = () => {
      if (!root.querySelector(".ref-form-success")) return;

      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
      window.clearTimeout(timer);

      const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      };

      scrollToTop();
      frame1 = window.requestAnimationFrame(() => {
        scrollToTop();
        frame2 = window.requestAnimationFrame(scrollToTop);
      });
      timer = window.setTimeout(scrollToTop, 120);
    };

    const observer = new MutationObserver(resetScrollAfterSuccess);
    observer.observe(root, { childList: true, subtree: true });
    resetScrollAfterSuccess();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
