"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first enters the viewport.
 *
 * The initial value is `false` everywhere, server included. Deciding it from
 * `typeof IntersectionObserver` instead — true on the server, false in the
 * browser — is a hydration mismatch by construction, and React does not patch
 * attributes up, so the entrance class stayed wrong for the rest of the page's
 * life. Where the observer is genuinely missing (older browsers, JSDOM) the
 * effect below settles it on the first tick instead.
 *
 * With scripting off nothing here runs at all; `@media (scripting: none)` in
 * globals.css holds the finished state so the content is not left hidden.
 */
export function useInView<T extends HTMLElement>(rootMargin = "-15% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      // Deferred, so this is not a synchronous state update inside an effect —
      // that cascades a second render before the first has painted.
      const id = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(id);
    }

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
