/**
 * Pure game logic for the Tap Predictions demo board.
 *
 * Nothing in here touches React or the DOM: the board is a deterministic state
 * machine driven by a seeded PRNG, so the server and the client render an
 * identical first frame and the whole thing stays unit-testable.
 *
 * Coordinates: `row` 0 is the top (highest) price band, `column` counts absolute
 * time from session start. Each column holds `SUBTICKS_PER_COLUMN` price
 * samples, which is what gives the line a finer resolution than the grid.
 */

export * from "./constants";
export * from "./rng";
export * from "./geometry";
export * from "./market";
export * from "./ladder";
export * from "./payouts";
export * from "./golden";
export * from "./bets";
export * from "./state";
export * from "./format";
