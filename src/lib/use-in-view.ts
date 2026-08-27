"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first enters the viewport. Falls back to `true`
 * where IntersectionObserver is unavailable (older browsers, JSDOM) so content
 * is never stuck in its hidden state.
 */
export function useInView<T extends HTMLElement>(rootMargin = "-15% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
