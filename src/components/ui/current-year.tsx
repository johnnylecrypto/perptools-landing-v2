"use client";

import { useEffect, useRef } from "react";

/**
 * The current year, which keeps being current.
 *
 * The page is statically prerendered, so a plain `new Date().getFullYear()` in
 * the markup is evaluated once at build time and then frozen — a footer built
 * in December still claims the old year every day after New Year until someone
 * happens to redeploy.
 *
 * The build year is what the server renders and what the first client render
 * agrees with, so hydration matches. The correction is written to the node
 * afterwards, and only when the year has actually moved on, which is why this
 * does not go through state.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const now = new Date().getFullYear();
    if (ref.current && now !== buildYear) ref.current.textContent = String(now);
  }, [buildYear]);

  return <span ref={ref}>{buildYear}</span>;
}
