import { bandFor, formatPrice, type Geometry, type Ladder } from "@/lib/prediction-engine";

/**
 * Price ladder. The product prints these over the grid at the left edge, sitting
 * just above each gridline, rather than reserving a column for an axis.
 */
export function PriceLadder({
  geometry,
  ladder,
  decimals,
  font,
}: {
  geometry: Geometry;
  ladder: Ladder;
  decimals: number;
  font: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0"
      style={{ top: geometry.strip, bottom: 0 }}
    >
      {Array.from({ length: geometry.rows }, (_, row) => (
        <span
          key={row}
          style={{ top: `${(row / geometry.rows) * 100}%`, fontSize: font - 1 }}
          className="text-fg/80 absolute left-4 -translate-y-[2px] leading-none tabular-nums"
        >
          {formatPrice(bandFor(row, ladder, geometry.rows).high, decimals)}
        </span>
      ))}
    </div>
  );
}
