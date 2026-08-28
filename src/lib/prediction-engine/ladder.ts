import { SUBTICKS_PER_COLUMN } from "./constants";
import { PRICE_STEP_RATIO } from "./market";

export type Ladder = { anchor: number; band: number };

export function ladderOf(anchor: number): Ladder {
  return { anchor, band: anchor * PRICE_STEP_RATIO };
}

/**
 * Keep the ladder under the price.
 *
 * Shifts by whole bands only, and only once the price is within two rows of an
 * edge, so the grid holds still through ordinary chop and steps exactly one row
 * when the market actually trends.
 */
export function recentre(anchor: number, price: number, rows: number) {
  const { band } = ladderOf(anchor);
  const drift = (price - anchor) / band;
  const limit = rows / 2 - 2;
  if (Math.abs(drift) <= limit) return anchor;
  const steps = Math.trunc(Math.abs(drift) - limit) + 1;
  return anchor + Math.sign(drift) * steps * band;
}

/**
 * Per-sample shock, sized so price drifts roughly one band per column — enough
 * to make far bands a real gamble without the line looking like noise.
 *
 * Scaled by `sqrt(1 / SUBTICKS_PER_COLUMN)` so variance *per column* — and so
 * the realised sigma the pricer reads — is independent of how finely the column
 * is sampled. Changing the render resolution must not move the multipliers.
 */
export function volatilityOf(ladder: Ladder) {
  return ladder.band * 1.6 * Math.sqrt(4 / SUBTICKS_PER_COLUMN);
}

/**
 * Pull back toward the anchor price so the walk cannot wander off the ladder.
 *
 * Per *sample*, so it scales inversely with the sampling rate — otherwise
 * sampling more finely would drag the price toward the anchor harder per second
 * and the far bands would stop being reachable.
 */
const REVERSION = 0.02 * (4 / SUBTICKS_PER_COLUMN);

export function nextPrice(previous: number, ladder: Ladder, random: number) {
  const drift = (ladder.anchor - previous) * REVERSION;
  const shock = (random - 0.5) * volatilityOf(ladder);
  return previous + drift + shock;
}

export function priceWindow(ladder: Ladder, rows: number) {
  const half = (rows * ladder.band) / 2;
  return { top: ladder.anchor + half, bottom: ladder.anchor - half };
}

/** Highest and lowest price still inside `row`. */
export function bandFor(row: number, ladder: Ladder, rows: number) {
  const { top } = priceWindow(ladder, rows);
  const high = top - row * ladder.band;
  return { high, low: high - ladder.band };
}

/**
 * Row containing `price`, clamped to the ladder.
 *
 * The epsilon matters: band edges are computed as `price ± rows * band / 2`, and
 * that round-trip loses enough precision that a price sitting exactly on a
 * boundary (the anchor price, most visibly) floors to the row below.
 */
export function rowForPrice(price: number, ladder: Ladder, rows: number) {
  const { top } = priceWindow(ladder, rows);
  const row = Math.floor((top - price) / ladder.band + 1e-9);
  return Math.min(rows - 1, Math.max(0, row));
}

/** Price as a 0-1 fraction of the ladder, 1 = top. Used to plot the line. */
export function priceToFraction(price: number, ladder: Ladder, rows: number) {
  const { top, bottom } = priceWindow(ladder, rows);
  return (price - bottom) / (top - bottom);
}

/** Keep the walk on the ladder, a sliver inside the outermost bands. */
export function clampToLadder(price: number, ladder: Ladder, rows: number) {
  const { top, bottom } = priceWindow(ladder, rows);
  const margin = ladder.band * 0.2;
  return Math.min(top - margin, Math.max(bottom + margin, price));
}
