"use client";

import { useEffect, useRef, useState } from "react";

const PLAY_EVENT = "nl:explainer-play";
const YT_ORIGIN = "https://www.youtube-nocookie.com";

export function ExplainerVideo({
  videoId,
  poster,
  title,
  playLabel,
  watchLabel = "Watch explainer",
}: {
  videoId: string;
  poster: string;
  title: string;
  playLabel: string;
  watchLabel?: string;
}) {
  const [active, setActive] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  useEffect(() => {
    const onPlay = (event: Event) => {
      const otherId = (event as CustomEvent<string>).detail;
      if (otherId === videoId) return;
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        YT_ORIGIN,
      );
    };
    window.addEventListener(PLAY_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_EVENT, onPlay);
  }, [videoId]);

  function start() {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: videoId }));
    setActive(true);
  }

  return (
    <div className="explainer-video">
      <div className="tms-video explainer-video-frame">
        {active ? (
          <iframe
            ref={iframeRef}
            className="explainer-video-player"
            title={title}
            src={`${YT_ORIGIN}/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <>
            {/* Poster is the original 16:9 WordPress cover; next/image is unnecessary for this overlay. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt="" className="explainer-video-poster" />
            <button
              type="button"
              className="tms-video-play"
              onClick={start}
              aria-label={playLabel}
            >
              <span className="tms-video-play-mark" aria-hidden="true" />
              <span>Play video</span>
            </button>
          </>
        )}
      </div>
      <p className="explainer-video-caption">
        <span aria-hidden="true">
          {watchLabel} · ≈1:30
        </span>
        <span className="sr-only">
          {watchLabel}, approximately 1 minute 30 seconds
        </span>
      </p>
      {active ? (
        <p className="explainer-video-fallback">
          <a href={watchUrl} rel="noopener noreferrer" target="_blank">
            Open on YouTube
          </a>{" "}
          if the player does not load.
        </p>
      ) : null}
    </div>
  );
}
