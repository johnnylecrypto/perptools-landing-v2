import { PointMarker } from "@/components/ui/point-marker";
import type { Geometry } from "@/lib/prediction-engine";
import { nowFraction } from "./chart-frame";

/**
 * The live edge, pinned to the panel rather than the world.
 *
 * Neither the sheet's `transform` nor this marker's `top` is a React style
 * prop. `useWorldScroll` writes both every animation frame, and a style prop
 * would be re-applied on any re-render that happened mid-tick — snapping the
 * board back to where the tick started. That is what made it flash.
 */
export function NowLine({
  geometry,
  markerRef,
}: {
  geometry: Geometry;
  markerRef: React.Ref<HTMLSpanElement>;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[1]"
      style={{ left: `${nowFraction(geometry) * 100}%`, top: geometry.strip, bottom: 0 }}
    >
      <span className="bg-accent/25 absolute inset-y-0 left-0 w-2 -translate-x-1/2 blur-[6px]" />
      <span className="bg-accent/65 absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 shadow-[0_0_10px_--alpha(var(--color-accent)/75%)]" />
      <span className="bg-accent absolute top-[30px] left-1 flex h-6 w-[58px] items-center justify-center rounded-lg text-[13px] leading-none font-semibold text-black shadow-[0_0_8px_--alpha(var(--color-accent)/75%)]">
        Now
      </span>
      {/* `top` is owned by the animation loop, not by React — see below. */}
      <span ref={markerRef} className="absolute -translate-x-1/2 -translate-y-1/2">
        <PointMarker />
      </span>
    </div>
  );
}
