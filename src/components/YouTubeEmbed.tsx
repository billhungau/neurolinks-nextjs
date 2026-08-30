"use client";

import { useState } from "react";

export function YouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [active, setActive] = useState(false);
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (!active) {
    return (
      <button
        type="button"
        className="relative mt-4 aspect-video w-full overflow-hidden rounded bg-slate-900 text-left"
        onClick={() => setActive(true)}
        aria-label={`Play video: ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- YouTube poster is remote */}
        <img src={poster} alt="" className="h-full w-full object-cover opacity-80" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded bg-white px-4 py-2 text-sm font-semibold text-[#1a2744]">
            Play video
          </span>
        </span>
      </button>
    );
  }

  return (
    <iframe
      className="mt-4 aspect-video w-full rounded"
      title={title}
      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
    />
  );
}
