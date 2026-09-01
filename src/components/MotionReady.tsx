"use client";

import { useLayoutEffect } from "react";

export function MotionReady() {
  useLayoutEffect(() => {
    document.documentElement.classList.add("motion-ready");
  }, []);

  return null;
}
