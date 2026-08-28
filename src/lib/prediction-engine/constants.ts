/**
 * Seconds one column represents. The live product offers 3/5/9s
 * (`ALLOWED_TIME_STEPS`) and defaults to 3, which is what the demo uses.
 */
export const SECONDS_PER_COLUMN = 3;

/**
 * Price samples per grid column.
 *
 * Render resolution, not pace: a column always lasts `SECONDS_PER_COLUMN`
 * whatever this is set to. Finer samples make the scroll smooth and keep the
 * price line from moving in visible hops.
 */
export const SUBTICKS_PER_COLUMN = 12;

/**
 * Wall-clock duration of one sample, derived so a column takes exactly the
 * number of seconds the axis labels claim it does. The board therefore steps
 * one column every 3s, and "+3s" on the axis really is three seconds away.
 */
export const SUBTICK_MS = (SECONDS_PER_COLUMN * 1000) / SUBTICKS_PER_COLUMN;

/** Seconds covered by one price sample. */
export const SECONDS_PER_SUBTICK = SECONDS_PER_COLUMN / SUBTICKS_PER_COLUMN;

/** Points stake presets, verbatim from the product's `STAKE_OPTIONS`. */
export const STAKE_STEPS = [0.1, 0.5, 1, 2, 5, 10] as const;

/** Matches the product's per-day points top-up cap. */
export const STARTING_BALANCE = 100;
