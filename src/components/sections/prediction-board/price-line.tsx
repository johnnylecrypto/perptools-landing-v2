import { pricePaths, type ChartFrame } from "@/lib/use-world-scroll";

/**
 * Settled price action, drawn in world coordinates so it scrolls with the grid.
 *
 * React draws only the resting frame — the server's, and whatever is on screen
 * before the loop takes over. The tip, the segment reaching the NOW line, is
 * redrawn by `useWorldScroll` every animation frame from the same interpolated
 * price the marker uses, so the two cannot drift apart.
 */
export function PriceLine({
  frame,
  lineRef,
  areaRef,
}: {
  frame: ChartFrame | null;
  lineRef: React.Ref<SVGPathElement>;
  areaRef: React.Ref<SVGPathElement>;
}) {
  if (!frame) return null;
  const { line, area } = pricePaths([...frame.points, frame.tip]);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <defs>
        <linearGradient id="pt-price-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2BB9F3" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2BB9F3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path ref={areaRef} d={area} fill="url(#pt-price-fill)" />
      <path
        ref={lineRef}
        d={line}
        fill="none"
        stroke="#2BB9F3"
        strokeOpacity="0.65"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
