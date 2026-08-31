"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { MEDIA, WP_VIDEOS } from "@/lib/media";

const subscribe = () => () => {};

export function TmsVideo() {
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
        poster={MEDIA.tmsPoster}
        src={WP_VIDEOS.tms.src}
        playsInline
        onPlay={() => setPlaying(true)}
      >
        TMS introduction video
      </video>
      {enhanced && !playing ? (
        <button
          type="button"
          className="tms-video-play"
          onClick={start}
          aria-label="Play TMS introduction video"
        >
          <span className="tms-video-play-mark" aria-hidden="true" />
          <span>Play video</span>
        </button>
      ) : null}
    </div>
  );
}
