import { priceCell, realisedSigma } from "@/lib/prediction-pricer";
import { SECONDS_PER_COLUMN, SECONDS_PER_SUBTICK } from "./constants";
import { bandFor, type Ladder } from "./ladder";
// Type-only, so the pair does not become a runtime import cycle.
import type { GameState } from "./state";

/**
 * Typical per-second volatility for these pairs, from the product's
 * `SIGMA_DEAD_ZONE_THRESHOLD_DEFAULT`.
 */
const DEFAULT_SIGMA = 4.5e-5;

/** Samples before a measured sigma is trusted at all, and before it is trusted fully. */
const SIGMA_MIN_SAMPLES = 12;
const SIGMA_FULL_SAMPLES = 60;

/**
 * Volatility the pricer works from, per second.
 *
 * A session opens with no history, and a measured sigma of zero would price
 * every cell at the floor multiplier. So the default carries the board at the
 * start and the measured value fades in as samples arrive, which keeps the
 * multipliers from stepping when the estimate takes over.
 */
export function sigmaOf(state: Pick<GameState, "prices">) {
  const measured = realisedSigma(state.prices, SECONDS_PER_SUBTICK);
  const samples = state.prices.length;
  if (measured <= 0 || samples < SIGMA_MIN_SAMPLES) return DEFAULT_SIGMA;

  const weight = Math.min(
    1,
    (samples - SIGMA_MIN_SAMPLES) / (SIGMA_FULL_SAMPLES - SIGMA_MIN_SAMPLES),
  );
  return DEFAULT_SIGMA * (1 - weight) + measured * weight;
}

/**
 * What a cell pays, from the product's analytical P(touch) pricer.
 *
 * Price depends on both how far the band sits from spot and how long until the
 * window opens, so the same row gets cheaper further out — the behaviour the
 * live board has.
 */
export function multiplierFor(
  row: number,
  columnsAhead: number,
  currentPrice: number,
  sigmaPerSec: number,
  ladder: Ladder,
  rows: number,
) {
  const { high, low } = bandFor(row, ladder, rows);
  return priceCell({
    timeToStartSec: columnsAhead * SECONDS_PER_COLUMN,
    timeStepSec: SECONDS_PER_COLUMN,
    currentPrice,
    cellLow: low,
    cellHigh: high,
    sigmaPerSec,
  });
}

/** One decimal and an `x`, as the live board prints it. */
export function formatMultiplier(multiplier: number) {
  return `${multiplier.toFixed(1)}x`;
}
