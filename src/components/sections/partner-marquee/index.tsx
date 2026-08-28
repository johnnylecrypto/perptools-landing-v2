"use client";

import { useEffect, useRef } from "react";
import { partners } from "@/content/partners";
import { cn } from "@/lib/utils";
import { PartnerLogo } from "./partner-logo";
import { pickActiveIndex } from "./pick-active-index";

const CENTER_BAND = 0.1;

function applyHighlight(container: HTMLElement, track: HTMLElement) {
  const items = Array.from(track.children) as HTMLElement[];
  const rect = container.getBoundingClientRect();
  const containerCenter = rect.left + rect.width / 2;
  const threshold = rect.width * CENTER_BAND;
  const centers = items.map((el) => {
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2;
  });
  const active = pickActiveIndex(centers, containerCenter, threshold);

  for (let i = 0; i < items.length; i++) {
    if (i === active) {
      items[i]!.setAttribute("data-active", "true");
    } else {
      items[i]!.removeAttribute("data-active");
    }
  }
}

/**
 * Infinite partner strip: the list is rendered twice and translated -50%, so
 * the seam lands exactly on the duplicate. Pauses under reduced motion (the
 * global media query kills the animation). Highlight is whichever item sits
 * nearest the strip's horizontal centre.
 */
export function PartnerMarquee({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const measure = () => applyHighlight(container, track);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduced.matches) {
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    let raf = 0;
    const loop = () => {
      measure();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-20 overflow-hidden sm:h-24", className)}
      aria-label="Backed by"
    >
      <div
        ref={trackRef}
        className="animate-marquee flex h-full w-max items-center gap-4 pl-0 sm:gap-24"
      >
        {[...partners, ...partners].map((partner, index) => (
          <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
        ))}
      </div>

      {/* Edge fades so items dissolve instead of clipping. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(270deg,transparent_0%,--alpha(var(--color-bg-0)/85%)_55%,var(--color-bg-0)_100%)] sm:w-40 lg:w-60" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(90deg,transparent_0%,--alpha(var(--color-bg-0)/85%)_55%,var(--color-bg-0)_100%)] sm:w-40 lg:w-60" />
    </div>
  );
}
