import { STAKE_STEPS, STARTING_BALANCE, SUBTICKS_PER_COLUMN } from "./constants";
import { stepRng } from "./rng";
import type { Geometry } from "./geometry";
import type { Market } from "./market";
import { bandFor, clampToLadder, ladderOf, nextPrice, recentre, rowForPrice } from "./ladder";
import { multiplierFor, sigmaOf } from "./payouts";
import { applyGolden, isGoldenCell } from "./golden";
import {
  LOST_VISIBLE_SUBTICKS,
  WIN_VISIBLE_SUBTICKS,
  didTouch,
  rowOf,
  type Bet,
  type BetStatus,
} from "./bets";
import { roundPoints } from "./format";

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
  const currentCol = Math.floor(subtick / SUBTICKS_PER_COLUMN);
  const settledThrough = currentCol - 1;

  let balance = state.balance;
  let streak = state.streak;
  let pnl = state.pnl;
  let result: Result | null = state.result;
  let settled = false;

  const settle = (bet: Bet, won: boolean) => {
    settled = true;
    const payout = won ? roundPoints(bet.stake * bet.multiplier) : 0;
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
      resolvedRow: rowForPrice((bet.priceLow + bet.priceHigh) / 2, ladder, geometry.rows),
    };
  };

  const bets = state.bets.map((bet) => {
    if (bet.status !== "pending") return bet;
    // The window has not opened yet.
    if (bet.column > currentCol) return bet;

    if (didTouch(prices, bet.column, bet.priceLow, bet.priceHigh, subtick)) {
      return settle(bet, true);
    }

    // Window closed with no touch.
    if (bet.column <= settledThrough) return settle(bet, false);

    return bet;
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
          resolvedRow: null,
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
