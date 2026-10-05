"use client";

import { useRouter } from "next/navigation";

export function BackToSubmissions({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function goBack() {
    // This detail page is normally reached from the already-rendered submissions
    // list. Returning through browser/Next navigation history lets the App Router
    // restore that cached list (including client-side filter/scroll state) instead
    // of deliberately navigating to the list URL and requesting it again.
    const sameOriginReferrer = (() => {
      try {
        return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
      } catch {
        return false;
      }
    })();

    if (sameOriginReferrer && window.history.length > 1) {
      router.back();
      return;
    }

    // Direct links/bookmarks have no useful list entry in history.
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      style={{
        border: 0,
        background: "transparent",
        color: "#334155",
        padding: 0,
        font: "inherit",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      ← Back to submissions
    </button>
  );
}
