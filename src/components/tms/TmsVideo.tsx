"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { MEDIA, WP_VIDEOS } from "@/lib/media";

const subscribe = () => () => {};

export function TmsVideo({
  src = WP_VIDEOS.tms.src,
  poster = MEDIA.tmsPoster,
  label = "TMS introduction video",
}: {
  src?: string;
  poster?: string;
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const enhanced = useSyncExternalStore(subscribe, () => true, () => false);
  const [playing, setPlaying] = useState(false);

  function start() {
    const video = videoRef.current;
    if (!video) return;
    setPlaying(true);
    void video.play();
  }

  return (
    <div className="tms-video">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        controls={!enhanced || playing}
        preload="none"
        poster={poster}
        src={src}
        playsInline
        onPlay={() => setPlaying(true)}
      >
        {label}
      </video>
      {enhanced && !playing ? (
        <button
          type="button"
          className="tms-video-play"
          onClick={start}
          aria-label={`Play ${label}`}
        >
          <span className="tms-video-play-mark" aria-hidden="true" />
          <span>Play video</span>
        </button>
      ) : null}
    </div>
  );
}
