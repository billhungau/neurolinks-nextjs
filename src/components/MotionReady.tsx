"use client";

import { useEffect } from "react";

export function MotionReady() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
  }, []);

  return null;
}
