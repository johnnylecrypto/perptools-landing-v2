import { SUBTICKS_PER_COLUMN, SUBTICK_MS } from "./constants";
import { rowForPrice, type Ladder } from "./ladder";

/** Mirrors the product's `PositionStatus`. */
export type BetStatus = "pending" | "won" | "lost";

export type Bet = {
  id: number;
  /**
   * Price band staked on, in dollars.
   *
   * Absolute, not a row index: the ladder shifts under the price as the market
   * moves, and a bet must keep meaning the same prices when it does. The row it
   * draws on is derived from this against the ladder of the moment.
   */
  priceLow: number;
  priceHigh: number;
  /** Absolute column the bet settles on. */
  column: number;
  stake: number;
  multiplier: number;
  status: BetStatus;
  /** Gross return; 0 when the band was missed. */
  payout: number;
  /** Taps stacked on this cell; 2+ renders as the product's "doubled" card. */
  betCount: number;
  golden: boolean;
  /** Sub-tick the bet settled on, so the UI can time the fade-out. */
  resolvedAt: number | null;
  /** Row index frozen at settlement so the card does not jump while it fades. */
  resolvedRow: number | null;
};

/**
 * Sub-ticks a settled bet stays on the board — the budget the win/loss
 * animations run inside, so these track `--animate-win-vanish` (900ms hold +
 * 300ms shrink). The loss fade finishes in 800ms but the row is held the
 * product's full 1600ms, which the settlement tests lean on. Shorten either
 * one below its animation and the cell is torn out of the DOM mid-flight.
 */
export const WIN_VISIBLE_SUBTICKS = Math.round(1400 / SUBTICK_MS);
export const LOST_VISIBLE_SUBTICKS = Math.round(1600 / SUBTICK_MS);

/** Row a bet draws on against the ladder of the moment. */
export function rowOf(bet: Pick<Bet, "priceLow" | "priceHigh">, ladder: Ladder, rows: number) {
  return rowForPrice((bet.priceLow + bet.priceHigh) / 2, ladder, rows);
}

/** Row to paint the bet on; settled bets keep the row they had at resolution. */
export function displayRow(
  bet: Pick<Bet, "priceLow" | "priceHigh" | "resolvedRow">,
  ladder: Ladder,
  rows: number,
) {
  return bet.resolvedRow ?? rowOf(bet, ladder, rows);
}

/**
 * Whether the price path crossed the band while `column` was open.
 *
 * Checks the swept segment between consecutive samples, not just the samples
 * themselves, so a fast move straight through a thin band still counts as a
 * touch — which is what "price touches the band" means on the real product.
 */
export function didTouch(
  prices: readonly number[],
  column: number,
  low: number,
  high: number,
  /** Latest sub-tick to inspect; defaults to the end of the column window. */
  upToSubtick?: number,
) {
  const first = column * SUBTICKS_PER_COLUMN;
  const columnLast = first + SUBTICKS_PER_COLUMN - 1;
  const last = upToSubtick === undefined ? columnLast : Math.min(columnLast, upToSubtick);
  if (last < first) return false;

  // Start one sample early so the segment entering the column is swept too.
  for (let i = Math.max(1, first); i <= last; i += 1) {
    const a = prices[i - 1];
    const b = prices[i];
    if (a === undefined || b === undefined) break;
    if (Math.min(a, b) <= high && Math.max(a, b) >= low) return true;
  }
  return false;
}
