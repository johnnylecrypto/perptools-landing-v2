"use client";

import { useEffect, useRef, useState } from "react";
import { RevealContext } from "@/components/ui/reveal-context";
import { cn } from "@/lib/utils";

/**
 * Plays a section's entrance once, when it scrolls into view.
 *
 * Adds `is-in` to its own element; the staging is CSS keyed off that class.
 * Children are untouched, so a server-rendered section stays server-rendered —
 * only the trigger is client code.
 */
export function Reveal({
  className,
  threshold = 0.22,
  children,
}: {
  className?: string;
  threshold?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      node.classList.add("is-in");
      // Deferred so this is not a synchronous state update inside an effect,
      // which would cascade a second render before the first has painted.
      const id = window.setTimeout(() => setRevealed(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        node.classList.add("is-in");
        setRevealed(true);
        // Once. An entrance that replays on every scroll-past is a tic.
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <RevealContext.Provider value={revealed}>
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    </RevealContext.Provider>
  );
}
