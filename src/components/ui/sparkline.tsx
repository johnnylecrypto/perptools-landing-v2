import { cn } from "@/lib/utils";

export type SparklineProps = {
  /** Series values normalised to 0-1, plotted left to right. */
  points: readonly number[];
  /** Line colour; the fill is derived from it. */
  color?: string;
  /** Draws a marker on the last point. */
  marker?: boolean;
  /** Custom marker artwork; defaults to a plain ring. */
  markerIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Area chart used behind the points balance and on the prediction board.
 *
 * The path is drawn in a 0-100 box stretched with `preserveAspectRatio="none"`,
 * so it fills any container; `vector-effect` keeps the stroke 1px regardless of
 * how far it is stretched. The end marker sits outside the SVG so it stays
 * round instead of being squashed with the viewBox.
 */
export function Sparkline({
  points,
  color = "#2BB9F3",
  marker = false,
  markerIcon,
  className,
  style,
}: SparklineProps) {
  if (points.length < 2) return null;

  const step = 100 / (points.length - 1);
  const toY = (value: number) => (1 - value) * 100;
  const line = points.map((value, i) => `${i * step},${toY(value)}`).join(" ");
  const last = points[points.length - 1];
  // Unique per series, so two charts on one page cannot share a <defs> id.
  // A module-level counter or `useId` would need a client component; this stays
  // deterministic and server-renderable.
  const fillId = `pt-spark-${hash(`${color}:${points.join(",")}`)}`;

  return (
    <div className={cn("relative", className)} style={style}>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="size-full overflow-visible"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${line} 100,100`} fill={`url(#${fillId})`} />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {marker ? (
        <span
          aria-hidden
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: "100%", top: `${toY(last)}%` }}
        >
          {markerIcon ?? (
            <span
              className="block size-[13px] rounded-full border-[2px] bg-[#051E32]"
              style={{ borderColor: color }}
            />
          )}
        </span>
      ) : null}
    </div>
  );
}

/** FNV-1a, base36 — short and stable across renders. */
function hash(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
