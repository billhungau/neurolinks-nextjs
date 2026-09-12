"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { MEDIA } from "@/lib/media";

const subscribe = () => () => {};

export function TmsVideo({
  src = "/media/videos/tms-introduction.mp4",
  poster = MEDIA.tmsPoster,
  label = "TMS introduction video",
}: {
  src?: string;
  poster?: string;
  label?: string;
}) {
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        closeRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      modalVideoRef.current?.pause();
      triggerRef.current?.focus();
    };
  }, [open]);

  function openVideo() {
    setOpen(true);
  }

  function closeVideo() {
    setOpen(false);
  }

  const modal = open ? (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(8,18,35,0.72)] p-4 backdrop-blur-[5px] sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeVideo();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative w-full max-w-[68rem]"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={closeVideo}
          aria-label={`Close ${label}`}
          className="absolute -top-12 right-0 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/20 text-3xl font-light leading-none text-white transition hover:bg-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="overflow-hidden rounded-xl bg-black shadow-[0_24px_80px_rgba(0,0,0,0.38)] ring-1 ring-white/15">
          <video
            ref={modalVideoRef}
            className="block aspect-video max-h-[80svh] w-full bg-black object-contain"
            controls
            autoPlay
            preload="metadata"
            poster={poster}
            src={src}
            playsInline
          >
            {label}
          </video>
        </div>
      </div>
    </div>
  ) : null;

  if (!enhanced) {
    return (
      <div className="tms-video">
        <video
          className="h-full w-full object-cover"
          controls
          preload="none"
          poster={poster}
          src={src}
          playsInline
        >
          {label}
        </video>
      </div>
    );
  }

  return (
    <>
      <div className="tms-video">
        <video
          className="pointer-events-none h-full w-full object-cover"
          preload="none"
          poster={poster}
          playsInline
          aria-hidden="true"
        />
        <button
          ref={triggerRef}
          type="button"
          className="tms-video-play"
          onClick={openVideo}
          aria-label={`Play ${label}`}
          aria-haspopup="dialog"
        >
          <span className="tms-video-play-mark" aria-hidden="true" />
          <span>Play video</span>
        </button>
      </div>
      {typeof document !== "undefined" && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
