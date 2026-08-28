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

import { priceCell, realisedSigma } from "@/lib/prediction-pricer";

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

// --- deterministic randomness ----------------------------------------------

/**
 * One mulberry32 step. Returns the next seed alongside the value so callers can
 * thread the generator through reducer state instead of holding a closure.
 */
export function stepRng(state: number): { seed: number; value: number } {
  const seed = (state + 0x6d2b79f5) >>> 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { seed, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}

// --- geometry ---------------------------------------------------------------

export type Geometry = {
  /** Visible grid columns. */
  columns: number;
  /** Price bands. */
  rows: number;
  /** 1-based visible column carrying the NOW playhead. */
  nowColumn: number;
  /**
   * Columns after the playhead that stay locked, mirroring the product's
   * `UNLOCK_TILES_AFTER`. Betting opens at `currentColumn + lockAhead`.
   */
  lockAhead: number;
  /** Type size inside a cell. */
  font: number;
  /** Height of the time strip above the grid. */
  strip: number;
};

/**
 * Cells stay square and the columns divide the available width, so the column
 * count sets the cell size and the row count then sets the board's height.
 *
 * Every board is quartered, which is what puts each region where it belongs:
 *
 *   |  chart  |  transit  |        multipliers        |
 *   0%       25%         50%                        100%
 *
 * `columns` is divisible by 4, the playhead sits on `columns / 4 + 1` (25%),
 * and `lockAhead` is another quarter of the columns so betting opens at 50%.
 * The middle quarter is the run-up: a staked cell crosses it on its way to the
 * NOW line, where it meets the chart and settles. Desktop keeps the design
 * file's 16 rows of squares.
 *
 * The phone board halves that instead: the mobile design gives the chart the
 * left 50% and the multiplier grid the right 50%, so the playhead sits on
 * `columns / 2 + 1` with a single locked column as the run-up. Six columns
 * across the card's inner width keeps a cell near the design's 49.5px square.
 */
export const geometries = {
  // The phone strip is double height: at this type size the labels need the
  // breathing room the desktop board gets from its wider columns.
  phone: { columns: 6, rows: 7, nowColumn: 4, lockAhead: 1, font: 8, strip: 27 },
  tablet: { columns: 20, rows: 12, nowColumn: 6, lockAhead: 5, font: 9, strip: 13.5 },
  desktop: { columns: 28, rows: 16, nowColumn: 8, lockAhead: 7, font: 10.5, strip: 13.5 },
} satisfies Record<string, Geometry>;

export type GeometryName = keyof typeof geometries;

// --- markets ----------------------------------------------------------------

export type Market = {
  symbol: string;
  change: string;
  /** 12x12 coin mark. */
  logo: string;
  /** Binance symbol the live feed subscribes to, e.g. "BTCUSDT". */
  stream: string;
  /** Fallback level: what the server renders, and what a blocked feed uses. */
  price: number;
  /** Decimals shown on the price ladder. */
  decimals: number;
};

/**
 * Row height in dollars: 0.01% of price, the product's `PRICE_STEP_RATIO`.
 * One source of truth for cell shape, exactly as `getBasePriceStep` does it.
 */
export const PRICE_STEP_RATIO = 0.0001;

/**
 * The price ladder: the level it is centred on and the dollar height of a row.
 *
 * Derived from a live anchor rather than a fixed number, because the whole
 * ladder only spans `rows * 0.01%` of price — 0.16% over 16 rows — and a real
 * market walks out of that in under a minute.
 */
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

// --- price <-> row ----------------------------------------------------------

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

// --- payouts ----------------------------------------------------------------

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

// --- golden cells -----------------------------------------------------------

/** Verbatim from the product's `GOLDEN_CELL`. */
export const GOLDEN_CELL = { bonus: 2, maxMultiplier: 15 } as const;

/** Roughly one golden cell every this many columns. */
const GOLDEN_EVERY = 7;

/** Cheap integer hash, so the golden cell is a pure function of its column. */
function hash32(value: number) {
  let h = Math.imul(value ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Row carrying the golden cell in `column`, or null.
 *
 * The live board is told where the golden cube is over the wire; the demo
 * derives it from the column index instead, which keeps it deterministic and
 * needs no extra state.
 */
export function goldenRowFor(column: number, rows: number): number | null {
  const h = hash32(column);
  if (h % GOLDEN_EVERY !== 0) return null;
  return (h >>> 8) % rows;
}

export function isGoldenCell(row: number, column: number, rows: number) {
  return goldenRowFor(column, rows) === row;
}

/** Golden bonus: doubled, capped, and never below the base rate. */
export function applyGolden(multiplier: number) {
  return Math.max(multiplier, Math.min(multiplier * GOLDEN_CELL.bonus, GOLDEN_CELL.maxMultiplier));
}

// --- bets -------------------------------------------------------------------

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
};

/** Sub-ticks a settled bet stays on the board, mirroring the product's timings. */
export const WIN_VISIBLE_SUBTICKS = Math.round(7000 / SUBTICK_MS);
export const LOST_VISIBLE_SUBTICKS = Math.round(1600 / SUBTICK_MS);

/** Row a bet draws on against the ladder of the moment. */
export function rowOf(bet: Pick<Bet, "priceLow" | "priceHigh">, ladder: Ladder, rows: number) {
  return rowForPrice((bet.priceLow + bet.priceHigh) / 2, ladder, rows);
}

/**
 * Whether the price path crossed the band while `column` was open.
 *
 * Checks the swept segment between consecutive samples, not just the samples
 * themselves, so a fast move straight through a thin band still counts as a
 * touch — which is what "price touches the band" means on the real product.
 */
export function didTouch(prices: readonly number[], column: number, low: number, high: number) {
  const first = column * SUBTICKS_PER_COLUMN;
  const last = first + SUBTICKS_PER_COLUMN - 1;

  // Start one sample early so the segment entering the column is swept too.
  for (let i = Math.max(1, first); i <= last; i += 1) {
    const a = prices[i - 1];
    const b = prices[i];
    if (a === undefined || b === undefined) break;
    if (Math.min(a, b) <= high && Math.max(a, b) >= low) return true;
  }
  return false;
}

// --- state ------------------------------------------------------------------

export type Result = {
  betId: number;
  status: Exclude<BetStatus, "pending">;
  /** Net change to the balance: winnings minus the stake, or minus the stake. */
  delta: number;
  multiplier: number;
};

export type GameState = {
  /** Price per absolute sub-tick. Index 0 is session start. */
  prices: number[];
  /** Absolute sub-tick count; the playhead sits at the newest sample. */
  subtick: number;
  /** Price the ladder is centred on; follows the market as it trends. */
  anchor: number;
  /** True once a real quote has arrived and the walk has been switched off. */
  live: boolean;
  seed: number;
  balance: number;
  stake: number;
  bets: Bet[];
  taps: number;
  streak: number;
  pnl: number;
  /** Most recent settlement, for the toast and the live region. */
  result: Result | null;
  nextBetId: number;
};

export function currentColumn(state: Pick<GameState, "subtick">) {
  return Math.floor(state.subtick / SUBTICKS_PER_COLUMN);
}

/** First absolute column still open for a bet. */
export function firstPlayableColumn(state: Pick<GameState, "subtick">, geometry: Geometry) {
  return currentColumn(state) + geometry.lockAhead;
}

/** Leftmost absolute column currently on screen. */
export function firstVisibleColumn(state: Pick<GameState, "subtick">, geometry: Geometry) {
  return currentColumn(state) - (geometry.nowColumn - 1);
}

/**
 * Seeded opening position: enough history to fill the columns left of the
 * playhead, so the board never starts empty.
 */
/**
 * Opening position: one sample at the anchor, and nothing behind it.
 *
 * The board deliberately starts with no history. A pre-generated past would be
 * a fabricated price record sitting next to real quotes, and it would be the
 * same fabricated record on every visit. Instead the line begins as a point on
 * the NOW marker and trails out to the left as real time passes, filling the
 * chart quarter after `nowColumn` columns.
 */
export function createGame(
  market: Market,
  geometry: Geometry,
  seed = 0x5eed,
  anchor = market.price,
): GameState {
  return {
    prices: [anchor],
    subtick: 0,
    anchor,
    live: false,
    seed,
    balance: STARTING_BALANCE,
    stake: STAKE_STEPS[2],
    bets: [],
    taps: 0,
    streak: 0,
    pnl: 0,
    result: null,
    nextBetId: 1,
  };
}

export type Action =
  | { type: "tick"; market: Market; geometry: Geometry; quote: number | null }
  | { type: "bet"; row: number; column: number; market: Market; geometry: Geometry }
  | { type: "stake"; direction: 1 | -1 }
  | { type: "dismissResult" }
  /** Re-seat the board on a real quote, the first time the feed delivers one. */
  | { type: "anchor"; market: Market; geometry: Geometry; price: number }
  | { type: "reset"; market: Market; geometry: Geometry; seed?: number };

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "tick":
      return tick(state, action.market, action.geometry, action.quote);

    case "bet":
      return placeBet(state, action.row, action.column, action.market, action.geometry);

    case "stake": {
      const index = STAKE_STEPS.indexOf(state.stake as (typeof STAKE_STEPS)[number]);
      const next = Math.min(STAKE_STEPS.length - 1, Math.max(0, index + action.direction));
      return { ...state, stake: STAKE_STEPS[next] };
    }

    case "dismissResult":
      return state.result ? { ...state, result: null } : state;

    case "anchor": {
      // Keep what the player has done; only the price world is replaced.
      const fresh = createGame(action.market, action.geometry, state.seed, action.price);
      return {
        ...fresh,
        live: true,
        balance: state.balance,
        stake: state.stake,
        taps: state.taps,
        streak: state.streak,
        pnl: state.pnl,
        nextBetId: state.nextBetId,
        subtick: state.subtick,
        // Bets are priced in dollars around the old level, so they cannot
        // survive the jump to a real one.
        bets: [],
      };
    }

    case "reset":
      return createGame(action.market, action.geometry, action.seed);
  }
}

function tick(
  state: GameState,
  market: Market,
  geometry: Geometry,
  quote: number | null,
): GameState {
  const ladder = ladderOf(state.anchor);
  const step = stepRng(state.seed);
  const previous = state.prices[state.prices.length - 1] ?? state.anchor;

  // A real quote is taken as-is and the ladder moves to keep it in view. Only
  // when the feed has nothing do we fall back to the seeded walk, which is
  // instead clamped so it cannot leave the ladder.
  const price =
    quote !== null && quote > 0
      ? quote
      : clampToLadder(nextPrice(previous, ladder, step.value), ladder, geometry.rows);
  const anchor =
    quote !== null && quote > 0 ? recentre(state.anchor, price, geometry.rows) : state.anchor;

  const prices = [...state.prices, price];
  const subtick = state.subtick + 1;
  const settledThrough = Math.floor(subtick / SUBTICKS_PER_COLUMN) - 1;

  let balance = state.balance;
  let streak = state.streak;
  let pnl = state.pnl;
  let result: Result | null = state.result;
  let settled = false;

  const bets = state.bets.map((bet) => {
    if (bet.status !== "pending" || bet.column > settledThrough) return bet;

    settled = true;
    const won = didTouch(prices, bet.column, bet.priceLow, bet.priceHigh);
    const payout = won ? roundPoints(bet.stake * bet.multiplier) : 0;
    // The stake left the balance when the bet was placed, so only the gross
    // return comes back; the net move is what the toast reports.
    balance = roundPoints(balance + payout);
    pnl = roundPoints(pnl + payout - bet.stake);
    streak = won ? streak + 1 : 0;
    result = {
      betId: bet.id,
      status: won ? "won" : "lost",
      delta: payout - bet.stake,
      multiplier: bet.multiplier,
    };

    return {
      ...bet,
      status: won ? ("won" as const) : ("lost" as const),
      payout,
      resolvedAt: subtick,
    };
  });

  // A settled bet lingers on its own clock rather than until it scrolls off:
  // the product holds a win for 5s plus a 2s fade, and fades a miss over 1.6s.
  const oldest = firstVisibleColumn({ subtick }, geometry) - 1;
  const source = settled ? bets : state.bets;
  const kept = source.filter((bet) => {
    if (bet.resolvedAt !== null) {
      const age = subtick - bet.resolvedAt;
      return age <= (bet.status === "won" ? WIN_VISIBLE_SUBTICKS : LOST_VISIBLE_SUBTICKS);
    }
    return bet.column >= oldest;
  });
  // Reuse the previous array when nothing changed, so a memoised grid can skip
  // re-rendering on the ticks between settlements.
  const nextBets = !settled && kept.length === state.bets.length ? state.bets : kept;

  return {
    ...state,
    prices,
    subtick,
    anchor,
    live: state.live || (quote !== null && quote > 0),
    seed: step.seed,
    balance,
    streak,
    pnl,
    result,
    bets: nextBets,
  };
}

function placeBet(
  state: GameState,
  row: number,
  column: number,
  market: Market,
  geometry: Geometry,
): GameState {
  if (column < firstPlayableColumn(state, geometry)) return state;
  if (column > firstVisibleColumn(state, geometry) + geometry.columns - 1) return state;
  if (row < 0 || row >= geometry.rows) return state;
  if (state.stake > state.balance) return state;

  const ladder = ladderOf(state.anchor);
  const price = state.prices[state.prices.length - 1] ?? state.anchor;
  const golden = isGoldenCell(row, column, geometry.rows);
  // The rate is locked in at placement, exactly as the live product does.
  const base = multiplierFor(
    row,
    column - currentColumn(state),
    price,
    sigmaOf(state),
    ladder,
    geometry.rows,
  );
  const multiplier = golden ? applyGolden(base) : base;
  // Freeze the band in dollars, so the ladder can move afterwards.
  const { low, high } = bandFor(row, ladder, geometry.rows);

  const existing = state.bets.find(
    (bet) =>
      bet.column === column &&
      bet.status === "pending" &&
      rowOf(bet, ladder, geometry.rows) === row,
  );

  // Tapping a cell you already hold stacks onto it rather than being rejected:
  // stakes add up and the rate becomes the stake-weighted average, which is how
  // the product merges positions sharing a cell.
  const bets: Bet[] = existing
    ? state.bets.map((bet) =>
        bet === existing
          ? {
              ...bet,
              stake: roundPoints(bet.stake + state.stake),
              multiplier:
                (bet.stake * bet.multiplier + state.stake * multiplier) / (bet.stake + state.stake),
              betCount: bet.betCount + 1,
            }
          : bet,
      )
    : [
        ...state.bets,
        {
          id: state.nextBetId,
          priceLow: low,
          priceHigh: high,
          column,
          stake: state.stake,
          multiplier,
          status: "pending",
          payout: 0,
          betCount: 1,
          golden,
          resolvedAt: null,
        },
      ];

  return {
    ...state,
    balance: roundPoints(state.balance - state.stake),
    taps: state.taps + 1,
    nextBetId: existing ? state.nextBetId : state.nextBetId + 1,
    bets,
  };
}

// --- formatting -------------------------------------------------------------

/** Fixed locale so server and client markup match. */
const priceFormatters = new Map<number, Intl.NumberFormat>();

export function formatPrice(value: number, decimals: number) {
  let formatter = priceFormatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    priceFormatters.set(decimals, formatter);
  }
  return `$${formatter.format(value)}`;
}

/** Points carry two decimals; stakes start at 0.1. */
export function roundPoints(value: number) {
  return Math.round(value * 100) / 100;
}

const pointsFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPoints(value: number) {
  return pointsFormatter.format(roundPoints(value));
}

export function formatSigned(value: number) {
  return `${value >= 0 ? "+" : "-"}${formatPoints(Math.abs(value))}`;
}

/** Time-axis label for a visible column offset from the playhead. */
export function timeLabel(offsetColumns: number) {
  const seconds = offsetColumns * SECONDS_PER_COLUMN;
  return `${seconds >= 0 ? "+" : ""}${seconds}s`;
}
