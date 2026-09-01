"use client";

import { useEffect, useState } from "react";

export function HeroGodRaysVideo() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = () => setShowVideo(true);

    // Brief defer so hero text can paint first; poster covers the gap.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(reveal, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(reveal, 400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!showVideo) return null;

  return (
    <video
      suppressHydrationWarning
      poster="/media/god-rays-still.webp"
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className="absolute inset-0 size-full object-cover object-top opacity-[0.54] mix-blend-soft-light motion-reduce:hidden sm:opacity-35 sm:mix-blend-screen"
      dangerouslySetInnerHTML={{
        __html:
          '<source src="/media/god-rays.webm" type="video/webm">' +
          '<source src="/media/god-rays.mp4" type="video/mp4">',
      }}
    />
  );
}
