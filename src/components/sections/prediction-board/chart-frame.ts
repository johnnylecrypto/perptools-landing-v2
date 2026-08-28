import type { ChartFrame, Point } from "@/lib/use-world-scroll";
import {
  SUBTICKS_PER_COLUMN,
  firstVisibleColumn,
  priceToFraction,
  type GameState,
  type Geometry,
  type Ladder,
} from "@/lib/prediction-engine";

/** Where the NOW line sits, as a fraction of the panel: fixed, by construction. */
export function nowFraction(geometry: Geometry) {
  return (geometry.nowColumn - 1) / geometry.columns;
}

/**
 * Samples for the visible window, in the SVG's 0-100 coordinate space.
 *
 * Everything settled goes into `points`; the newest sample becomes the tip,
 * which the animation loop re-places every frame.
 */
export function buildChartFrame(
  state: GameState,
  ladder: Ladder,
  geometry: Geometry,
): ChartFrame | null {
  const col0 = firstVisibleColumn(state, geometry);
  const oldest = Math.max(0, col0 * SUBTICKS_PER_COLUMN);
  const worldColumns = geometry.columns + 1;
  const at = (index: number, price: number): Point => ({
    x: ((index / SUBTICKS_PER_COLUMN - col0) / worldColumns) * 100,
    y: (1 - priceToFraction(price, ladder, geometry.rows)) * 100,
  });

  const points: Point[] = [];
  for (let i = oldest; i < state.subtick; i += 1) {
    const price = state.prices[i];
    if (price !== undefined) points.push(at(i, price));
  }

  const newest = state.prices[state.subtick];
  if (points.length < 1 || newest === undefined) return null;
  return { points, tip: at(state.subtick, newest), subtick: state.subtick, col0 };
}
