"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "./google-analytics";

/** Loads GA only after the user engages or after a long idle timeout. */
export function DeferredGoogleAnalytics() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    const activate = () => setReady(true);
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

    for (const event of events) {
      window.addEventListener(event, activate, { once: true, passive: true });
    }

    const timer = window.setTimeout(activate, 10_000);
    return () => {
      for (const event of events) {
        window.removeEventListener(event, activate);
      }
      window.clearTimeout(timer);
    };
  }, [ready]);

  if (!ready) return null;
  return <GoogleAnalytics />;
}
