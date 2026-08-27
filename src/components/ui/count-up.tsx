"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useRevealed } from "@/components/ui/reveal";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const formatter = new Intl.NumberFormat("en-US");
const format = (value: number) => formatter.format(Math.round(value));

/** Fast at first, coasting to a stop — a total settling, not a slot machine. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * A number that counts up to its value when the section is revealed.
 *
 * The final value is what renders on the server, so the page is correct without
 * JavaScript and to anything reading the markup. The client only rewrites it
 * once it knows it can animate, and does so through the DOM node rather than
 * state — going through React would mean either a hydration mismatch or a
 * flash of the real number before it resets to zero.
 */
export function CountUp({
  to,
  from = 0,
  delay = 0,
  duration = 1500,
  className,
}: {
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const revealed = useRevealed();
  const played = useRef(false);

  // Zero it before the user can get here — this section sits well below the
  // fold, so the reset is never seen.
  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node || played.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    node.textContent = format(from);
  }, [from]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !revealed || played.current) return;
    played.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = format(to);
      return;
    }

    let frame = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      node.textContent = format(from + (to - from) * easeOut(t));
      if (t < 1) frame = requestAnimationFrame(run);
    };

    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(run);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [revealed, from, to, delay, duration]);

  return (
    <span ref={ref} className={className}>
      {format(to)}
    </span>
  );
}
