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

export type Point = { x: number; y: number };

/** Midpoint-quadratic smoothing, the curve the product's `smoothPath` draws. */
export function smoothPath(points: readonly Point[]) {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x},${points[i].y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last.x},${last.y}`;
}

/** The line and the area beneath it, for one set of points. */
export function pricePaths(points: readonly Point[]) {
  const line = smoothPath(points);
  if (!line) return { line: "", area: "" };
  const first = points[0];
  const last = points[points.length - 1];
  return { line, area: `${line} L ${last.x},100 L ${first.x},100 Z` };
}

/**
 * What the animation loop needs to redraw the price line between ticks.
 *
 * `points` holds the settled samples only — the newest one is drawn as the tip,
 * whose position is interpolated every frame.
 */
export type ChartFrame = {
  points: Point[];
  /** Where the tip sits with the tick not yet advanced; what the server draws. */
  tip: Point;
  subtick: number;
  col0: number;
};

type Options = {
  /** Current sub-tick from the reducer. */
  subtick: number;
  subticksPerColumn: number;
  /** Columns the sliding sheet is laid out across (panel columns + 1). */
  worldColumns: number;
  /** Price as a 0-1 fraction of the ladder, 1 = top. */
  priceFraction: number;
  /** Latest chart geometry. Passed by value; the hook holds the ref itself. */
  chart: ChartFrame | null;
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
  chart,
  running,
}: Options) {
  const worldRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  // Stashed in an effect rather than assigned during render: writing a ref
  // while rendering is a side effect, and the compiler rejects it.
  const chartRef = useRef(chart);
  useIsomorphicLayoutEffect(() => {
    chartRef.current = chart;
  });

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

      const value = from.current + (to.current - from.current) * progress;

      const marker = markerRef.current;
      if (marker) marker.style.top = `${(1 - value) * 100}%`;

      // The line's tip is drawn here too, from the very same interpolated
      // value. Left to React it would only move once a tick while the sheet
      // scrolled on underneath, so the line visibly trailed the marker and
      // snapped back to it — the "chasing" this exists to stop.
      const frame = chartRef.current;
      const line = lineRef.current;
      if (frame && line) {
        const tip = {
          // Position of `subtick + progress`, which the sheet's own scroll
          // holds exactly on the NOW line for every value of `progress`.
          x: (((frame.subtick + progress) / subticksPerColumn - frame.col0) / worldColumns) * 100,
          y: (1 - value) * 100,
        };
        const { line: d, area } = pricePaths([...frame.points, tip]);
        line.setAttribute("d", d);
        areaRef.current?.setAttribute("d", area);
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

  return { worldRef, markerRef, lineRef, areaRef };
}
