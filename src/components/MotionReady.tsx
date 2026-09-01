"use client";

import { useLayoutEffect } from "react";

export function MotionReady() {
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    document.documentElement.classList.add("motion-ready");
  }, []);

  return null;
}
