"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { SUBTICK_MS } from "@/lib/prediction-engine";

/**
 * How far the sheet is slid left, as a fraction of its own width.
 *
 * `subtick % subticksPerColumn` resets at every column boundary, at the same
 * moment the sheet's content is re-based one column left. The two cancel
 * exactly — see the continuity test — which is what makes the seam invisible.
 */
export function sheetOffset(
  subtick: number,
  subticksPerColumn: number,
  worldColumns: number,
  progress: number,
) {
  const within = (subtick % subticksPerColumn) + progress;
  return within / (worldColumns * subticksPerColumn);
}

/** `useLayoutEffect` warns when a client component is prerendered on the server. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Options = {
  /** Current sub-tick from the reducer. */
  subtick: number;
  subticksPerColumn: number;
  /** Columns the sliding sheet is laid out across (panel columns + 1). */
  worldColumns: number;
  /** Price as a 0-1 fraction of the ladder, 1 = top. */
  priceFraction: number;
  /** False while paused or off-screen; the loop idles rather than spinning. */
  running: boolean;
};

/**
 * Drives the board's continuous motion.
 *
 * The reducer advances in discrete sub-ticks. This interpolates between them on
 * an animation frame and writes `transform` / `top` straight to the nodes, so
 * the sheet scrolls and the marker tracks at display rate while React re-renders
 * only once per sub-tick — the 200-odd cells underneath are never touched.
 *
 * Returns refs to attach to the sliding world and to the price marker.
 */
export function useWorldScroll({
  subtick,
  subticksPerColumn,
  worldColumns,
  priceFraction,
  running,
}: Options) {
  const worldRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);

  const tickAt = useRef(0);
  const subtickRef = useRef(subtick);
  // Marker eases from where it was to where the new sample put it.
  const from = useRef(priceFraction);
  const to = useRef(priceFraction);

  const write = useCallback(
    (progress: number) => {
      const world = worldRef.current;
      if (world) {
        // Position inside the current column, in sub-ticks, as a fraction of the
        // whole sheet. At a column boundary this resets to ~0 at the same moment
        // the content shifts one column left, so the two cancel exactly and the
        // seam is invisible.
        const fraction = sheetOffset(subtickRef.current, subticksPerColumn, worldColumns, progress);
        world.style.transform = `translateX(${-fraction * 100}%)`;
      }

      const marker = markerRef.current;
      if (marker) {
        const value = from.current + (to.current - from.current) * progress;
        marker.style.top = `${(1 - value) * 100}%`;
      }
    },
    [subticksPerColumn, worldColumns],
  );

  // Land the new offset in the same commit as the content that moved: a frame
  // where the grid has shifted but the transform has not would show a jump.
  useIsomorphicLayoutEffect(() => {
    subtickRef.current = subtick;
    tickAt.current = performance.now();
    from.current = to.current;
    to.current = priceFraction;
    write(0);
  }, [subtick, priceFraction, write]);

  useEffect(() => {
    if (!running) return;
    // Resuming after a pause: without this the first frame would see a long
    // elapsed time and snap straight to the end of the interpolation.
    tickAt.current = performance.now();

    let frame = 0;
    const loop = (now: number) => {
      write(Math.min(1, (now - tickAt.current) / SUBTICK_MS));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, write]);

  return { worldRef, markerRef };
}
